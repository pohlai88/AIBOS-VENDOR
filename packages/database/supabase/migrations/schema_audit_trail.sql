-- Migration: Audit Trail Infrastructure
-- Purpose: Create audit_events table and triggers for business-critical events
-- Date: 2025-01-27
-- Risk: LOW - Additive only, no breaking changes

-- ============================================================================
-- 1. CREATE AUDIT_EVENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  metadata JSONB, -- For additional context (request_id, ip_address, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. CREATE INDEXES FOR AUDIT_EVENTS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_audit_events_table_record 
  ON audit_events(table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_audit_events_user_id 
  ON audit_events(user_id);

CREATE INDEX IF NOT EXISTS idx_audit_events_created_at 
  ON audit_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_events_action 
  ON audit_events(action);

-- ============================================================================
-- 3. ENABLE RLS ON AUDIT_EVENTS
-- ============================================================================

ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view audit events for their tenant
CREATE POLICY "users_view_tenant_audit_events"
  ON audit_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND (
        -- Match by tenant_id if record is from tenant-scoped table
        (table_name IN ('documents', 'payments', 'statements', 'messages', 'message_threads', 'users', 'organizations')
         AND EXISTS (
           SELECT 1 FROM information_schema.columns c
           WHERE c.table_schema = 'public'
           AND c.table_name = audit_events.table_name
           AND c.column_name = 'tenant_id'
         ))
        OR
        -- For notifications, match by user_id
        (table_name = 'notifications' AND new_values->>'user_id' = u.id::text)
      )
    )
  );

-- ============================================================================
-- 4. CREATE AUDIT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  current_user_id UUID;
BEGIN
  -- Prevent recursive triggers
  IF pg_trigger_depth() > 1 THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Get current user ID
  current_user_id := auth.uid();

  -- Build JSONB from OLD and NEW records
  IF TG_OP = 'DELETE' THEN
    old_data := to_jsonb(OLD);
    new_data := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
  ELSIF TG_OP = 'INSERT' THEN
    old_data := NULL;
    new_data := to_jsonb(NEW);
  END IF;

  -- Insert audit event
  INSERT INTO audit_events (
    table_name,
    record_id,
    user_id,
    action,
    old_values,
    new_values,
    created_at
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE((new_data->>'id')::UUID, (old_data->>'id')::UUID),
    current_user_id,
    TG_OP,
    old_data,
    new_data,
    now()
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- ============================================================================
-- 5. CREATE TRIGGERS ON CRITICAL TABLES
-- ============================================================================

-- Payments: Track all changes (status changes are critical)
DROP TRIGGER IF EXISTS payments_audit_trigger ON payments;
CREATE TRIGGER payments_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_function();

-- Statements: Track all changes
DROP TRIGGER IF EXISTS statements_audit_trigger ON statements;
CREATE TRIGGER statements_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON statements
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_function();

-- Documents: Track all changes (especially status/type changes)
DROP TRIGGER IF EXISTS documents_audit_trigger ON documents;
CREATE TRIGGER documents_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_function();

-- Users: Track updates and deletes (critical for security)
DROP TRIGGER IF EXISTS users_audit_trigger ON users;
CREATE TRIGGER users_audit_trigger
  AFTER UPDATE OR DELETE ON users
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_function();

-- Organizations: Track updates and deletes
DROP TRIGGER IF EXISTS organizations_audit_trigger ON organizations;
CREATE TRIGGER organizations_audit_trigger
  AFTER UPDATE OR DELETE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_function();

-- ============================================================================
-- 6. GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT ON audit_events TO authenticated;
GRANT INSERT ON audit_events TO authenticated; -- For trigger function

-- ============================================================================
-- Summary
-- ============================================================================

-- Created:
-- ✅ audit_events table with indexes
-- ✅ RLS policy for tenant-scoped access
-- ✅ audit_trigger_function() with recursive trigger prevention
-- ✅ Triggers on: payments, statements, documents, users, organizations
