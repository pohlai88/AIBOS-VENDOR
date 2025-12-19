-- Organization retention policies table
CREATE TABLE IF NOT EXISTS organization_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('audit_logs', 'user_activity_logs', 'documents', 'messages', 'analytics')),
  retention_days INTEGER NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, resource_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_retention_policies_organization_id ON organization_retention_policies(organization_id);
CREATE INDEX IF NOT EXISTS idx_retention_policies_enabled ON organization_retention_policies(enabled);

-- RLS Policies
ALTER TABLE organization_retention_policies ENABLE ROW LEVEL SECURITY;

-- Users can view retention policies for their organization
CREATE POLICY "Users can view retention policies for their organization"
ON organization_retention_policies FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  )
);

-- Only admins can manage retention policies
CREATE POLICY "Admins can manage retention policies"
ON organization_retention_policies FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'company_admin'
    AND users.organization_id = organization_retention_policies.organization_id
  )
);

-- Add updated_at trigger for organization_retention_policies
CREATE TRIGGER update_retention_policies_updated_at BEFORE UPDATE ON organization_retention_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Additional index for resource_type queries
CREATE INDEX IF NOT EXISTS idx_retention_policies_resource_type ON organization_retention_policies(resource_type);
