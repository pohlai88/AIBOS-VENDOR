-- Fix missing updated_at triggers and RLS policies for new tables

-- Add updated_at triggers for new tables that need them
-- (Some tables like audit_logs don't need updated_at as they're append-only)

-- SSO Providers: Add updated_at trigger
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sso_providers') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'update_sso_providers_updated_at'
    ) THEN
      CREATE TRIGGER update_sso_providers_updated_at BEFORE UPDATE ON sso_providers
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
  END IF;
END $$;

-- Webhooks: Add updated_at trigger
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'webhooks') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'update_webhooks_updated_at'
    ) THEN
      CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
  END IF;
END $$;

-- Organization Retention Policies: Add updated_at trigger
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'organization_retention_policies') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = 'update_retention_policies_updated_at'
    ) THEN
      CREATE TRIGGER update_retention_policies_updated_at BEFORE UPDATE ON organization_retention_policies
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
  END IF;
END $$;

-- Ensure audit_logs has proper RLS for INSERT (allow service role)
-- Note: audit_logs is append-only, so no UPDATE/DELETE policies needed
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
    -- Drop existing INSERT policy if it exists and recreate
    DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
    
    -- Allow service role to insert (enforced at application level)
    CREATE POLICY "System can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (true);
  END IF;
END $$;

-- Ensure webhooks table has UPDATE trigger for updated_at
-- (Already handled above, but ensure it exists)

-- Ensure sso_providers table has UPDATE trigger for updated_at
-- (Already handled above, but ensure it exists)

-- Add missing indexes for better performance

-- Index for webhook deliveries by event_id (for retry logic)
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_event_id ON webhook_deliveries(event_id);

-- Index for sso_requests cleanup (expired requests)
CREATE INDEX IF NOT EXISTS idx_sso_requests_expires_at ON sso_requests(expires_at) WHERE expires_at < NOW();

-- Index for privacy_consents by policy_version
CREATE INDEX IF NOT EXISTS idx_privacy_consents_policy_version ON privacy_consents(policy_version);

-- Index for organization_retention_policies by resource_type
CREATE INDEX IF NOT EXISTS idx_retention_policies_resource_type ON organization_retention_policies(resource_type);
