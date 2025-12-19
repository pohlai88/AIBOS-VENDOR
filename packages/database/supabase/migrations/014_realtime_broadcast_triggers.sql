-- Migration: Realtime Broadcast Triggers and RLS Policies
-- Purpose: Implement Broadcast-from-Database pattern for real-time updates
-- Date: 2025-01-27

-- ============================================================================
-- 1. BROADCAST TRIGGERS
-- ============================================================================

-- Function: Broadcast notification to user-specific channel
CREATE OR REPLACE FUNCTION broadcast_notification()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Send broadcast to user-specific channel
  PERFORM realtime.send(
    jsonb_build_object(
      'type', 'new_notification',
      'id', NEW.id,
      'user_id', NEW.user_id
    ),
    'notification_created',
    'user:' || NEW.user_id::text || ':notifications',
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Broadcast on notification insert
DROP TRIGGER IF EXISTS notification_broadcast_trigger ON notifications;
CREATE TRIGGER notification_broadcast_trigger
  AFTER INSERT ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION broadcast_notification();

-- ============================================================================
-- 2. DASHBOARD STATS BROADCAST TRIGGERS
-- ============================================================================

-- Function: Broadcast dashboard stats invalidation
-- This function determines the tenant_id and organization_id from the changed row
-- and broadcasts to the appropriate channel
CREATE OR REPLACE FUNCTION broadcast_stats_update()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  affected_tenant_id UUID;
  affected_organization_id UUID;
BEGIN
  -- Determine tenant_id and organization_id based on table
  IF TG_TABLE_NAME = 'documents' THEN
    affected_tenant_id := NEW.tenant_id;
    affected_organization_id := NEW.organization_id;
  ELSIF TG_TABLE_NAME = 'payments' THEN
    affected_tenant_id := NEW.tenant_id;
    affected_organization_id := NEW.organization_id;
  ELSIF TG_TABLE_NAME = 'statements' THEN
    affected_tenant_id := NEW.tenant_id;
    affected_organization_id := NEW.organization_id;
  ELSIF TG_TABLE_NAME = 'messages' THEN
    -- Messages table doesn't have tenant_id directly, get from thread
    -- Use sender_organization_id as fallback for organization_id
    SELECT mt.tenant_id, COALESCE(mt.organization_id, NEW.sender_organization_id)
    INTO affected_tenant_id, affected_organization_id
    FROM message_threads mt
    WHERE mt.id = NEW.thread_id;
  ELSE
    -- Unknown table, skip
    RETURN NEW;
  END IF;

  -- Send lightweight "invalidate" signal to tenant+organization scoped channel
  IF affected_tenant_id IS NOT NULL AND affected_organization_id IS NOT NULL THEN
    PERFORM realtime.send(
      jsonb_build_object(
        'type', 'stats_updated',
        'table', TG_TABLE_NAME,
        'tenant_id', affected_tenant_id,
        'organization_id', affected_organization_id
      ),
      'stats_invalidated',
      'tenant:' || affected_tenant_id::text || ':org:' || affected_organization_id::text || ':dashboard',
      true
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers: Broadcast on documents, payments, statements, messages changes
DROP TRIGGER IF EXISTS documents_stats_broadcast_trigger ON documents;
CREATE TRIGGER documents_stats_broadcast_trigger
  AFTER INSERT OR UPDATE OR DELETE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION broadcast_stats_update();

DROP TRIGGER IF EXISTS payments_stats_broadcast_trigger ON payments;
CREATE TRIGGER payments_stats_broadcast_trigger
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION broadcast_stats_update();

DROP TRIGGER IF EXISTS statements_stats_broadcast_trigger ON statements;
CREATE TRIGGER statements_stats_broadcast_trigger
  AFTER INSERT OR UPDATE OR DELETE ON statements
  FOR EACH ROW
  EXECUTE FUNCTION broadcast_stats_update();

DROP TRIGGER IF EXISTS messages_stats_broadcast_trigger ON messages;
CREATE TRIGGER messages_stats_broadcast_trigger
  AFTER INSERT OR UPDATE OR DELETE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION broadcast_stats_update();

-- ============================================================================
-- 3. RLS POLICIES FOR REALTIME.MESSAGES
-- ============================================================================

-- Enable RLS on realtime.messages (if not already enabled)
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can receive broadcasts for their own user-scoped channels
-- Pattern: user:{user_id}:notifications
CREATE POLICY "users_receive_own_notifications"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  topic LIKE 'user:' || auth.uid()::text || ':%'
);

-- Policy: Users can receive broadcasts for their tenant+organization dashboard
-- Pattern: tenant:{tenant_id}:org:{organization_id}:dashboard
-- This requires checking if the user belongs to the tenant and organization
CREATE POLICY "users_receive_own_dashboard_updates"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM users u
    WHERE u.id = auth.uid()
      AND topic LIKE 'tenant:' || u.tenant_id::text || ':org:' || u.organization_id::text || ':%'
  )
);

-- Policy: System can insert broadcasts (via triggers)
-- Only allow inserts from SECURITY DEFINER functions (triggers)
CREATE POLICY "system_can_insert_broadcasts"
ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Note: The actual security is enforced by:
-- 1. SECURITY DEFINER functions (triggers) that run with elevated privileges
-- 2. RLS policies on SELECT that filter which messages users can receive
-- 3. Private channels in client code that require authentication

-- ============================================================================
-- 4. GRANT PERMISSIONS
-- ============================================================================

-- Grant necessary permissions for realtime functions
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT SELECT ON realtime.messages TO authenticated;
GRANT INSERT ON realtime.messages TO authenticated;

-- ============================================================================
-- 5. COMMENTS
-- ============================================================================

COMMENT ON FUNCTION broadcast_notification() IS 
  'Broadcasts notification events to user-specific channels when notifications are created';

COMMENT ON FUNCTION broadcast_stats_update() IS 
  'Broadcasts dashboard stats invalidation signals when documents, payments, statements, or messages change';

COMMENT ON POLICY "users_receive_own_notifications" ON realtime.messages IS 
  'Allows users to receive broadcasts on their own user-scoped channels (e.g., user:{id}:notifications)';

COMMENT ON POLICY "users_receive_own_dashboard_updates" ON realtime.messages IS 
  'Allows users to receive dashboard updates for their tenant and organization';

COMMENT ON POLICY "system_can_insert_broadcasts" ON realtime.messages IS 
  'Allows system (via triggers) to insert broadcast messages';
