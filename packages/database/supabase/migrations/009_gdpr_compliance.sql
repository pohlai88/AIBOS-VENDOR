-- Privacy consents table (for tracking privacy policy acceptance)
CREATE TABLE IF NOT EXISTS privacy_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  policy_version TEXT NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_privacy_consents_user_id ON privacy_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_privacy_consents_accepted_at ON privacy_consents(accepted_at);

-- RLS Policies
ALTER TABLE privacy_consents ENABLE ROW LEVEL SECURITY;

-- Users can view their own consents
CREATE POLICY "Users can view their own consents"
ON privacy_consents FOR SELECT
USING (user_id = auth.uid());

-- Users can insert their own consents
CREATE POLICY "Users can insert their own consents"
ON privacy_consents FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Admins can view all consents for their organization
CREATE POLICY "Admins can view organization consents"
ON privacy_consents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'company_admin'
    AND users.organization_id = (
      SELECT organization_id FROM users WHERE id = privacy_consents.user_id
    )
  )
);

-- Additional index for policy_version queries
CREATE INDEX IF NOT EXISTS idx_privacy_consents_policy_version ON privacy_consents(policy_version);
