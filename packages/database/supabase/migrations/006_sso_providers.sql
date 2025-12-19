-- SSO Providers table
CREATE TABLE IF NOT EXISTS sso_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('saml', 'oauth', 'oidc')),
  enabled BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

-- SSO Requests table (for tracking SSO login attempts)
CREATE TABLE IF NOT EXISTS sso_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES sso_providers(id) ON DELETE CASCADE,
  return_url TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sso_providers_organization_id ON sso_providers(organization_id);
CREATE INDEX IF NOT EXISTS idx_sso_providers_enabled ON sso_providers(enabled);
CREATE INDEX IF NOT EXISTS idx_sso_requests_provider_id ON sso_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_sso_requests_expires_at ON sso_requests(expires_at);

-- RLS Policies
ALTER TABLE sso_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_requests ENABLE ROW LEVEL SECURITY;

-- Users can view SSO providers for their organization
CREATE POLICY "Users can view SSO providers for their organization"
ON sso_providers FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  )
);

-- Only admins can manage SSO providers
CREATE POLICY "Admins can manage SSO providers"
ON sso_providers FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'company_admin'
    AND users.organization_id = sso_providers.organization_id
  )
);

-- System can insert SSO requests (via service role)
CREATE POLICY "System can manage SSO requests"
ON sso_requests FOR ALL
USING (true);

-- Add updated_at trigger for sso_providers
CREATE TRIGGER update_sso_providers_updated_at BEFORE UPDATE ON sso_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
