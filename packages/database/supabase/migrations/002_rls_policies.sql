-- Enable Row Level Security on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's organization_id
CREATE OR REPLACE FUNCTION get_user_organization_id(user_id UUID)
RETURNS UUID AS $$
  SELECT organization_id FROM users WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to get user's role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM users WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check if user is vendor for organization
CREATE OR REPLACE FUNCTION is_vendor_for_company(vendor_org_id UUID, company_org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM vendor_relationships
    WHERE vendor_id = vendor_org_id
      AND company_id = company_org_id
      AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Organizations policies
CREATE POLICY "Users can view their own organization"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Users policies
CREATE POLICY "Users can view users in their organization"
  ON users FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can view vendors they have relationships with"
  ON users FOR SELECT
  USING (
    organization_id IN (
      SELECT vendor_id FROM vendor_relationships
      WHERE company_id = get_user_organization_id(auth.uid())
        AND status = 'active'
    )
    OR organization_id IN (
      SELECT company_id FROM vendor_relationships
      WHERE vendor_id = get_user_organization_id(auth.uid())
        AND status = 'active'
    )
  );

-- Vendor relationships policies
CREATE POLICY "Users can view relationships for their organization"
  ON vendor_relationships FOR SELECT
  USING (
    company_id = get_user_organization_id(auth.uid())
    OR vendor_id = get_user_organization_id(auth.uid())
  );

CREATE POLICY "Company admins can manage relationships"
  ON vendor_relationships FOR ALL
  USING (
    company_id = get_user_organization_id(auth.uid())
    AND get_user_role(auth.uid()) IN ('company_admin', 'company_user')
  );

-- Documents policies
CREATE POLICY "Users can view documents in their organization"
  ON documents FOR SELECT
  USING (
    organization_id = get_user_organization_id(auth.uid())
  );

CREATE POLICY "Vendors can view shared company documents"
  ON documents FOR SELECT
  USING (
    is_shared = true
    AND organization_id IN (
      SELECT company_id FROM vendor_relationships
      WHERE vendor_id = get_user_organization_id(auth.uid())
        AND status = 'active'
    )
  );

CREATE POLICY "Vendors can view their own documents"
  ON documents FOR SELECT
  USING (
    vendor_id = get_user_organization_id(auth.uid())
  );

CREATE POLICY "Company users can view vendor documents"
  ON documents FOR SELECT
  USING (
    vendor_id IN (
      SELECT vendor_id FROM vendor_relationships
      WHERE company_id = get_user_organization_id(auth.uid())
        AND status = 'active'
    )
  );

CREATE POLICY "Users can create documents in their organization"
  ON documents FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update documents they created"
  ON documents FOR UPDATE
  USING (
    created_by = auth.uid()
    AND organization_id = get_user_organization_id(auth.uid())
  );

CREATE POLICY "Company admins can update any document in their organization"
  ON documents FOR UPDATE
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND get_user_role(auth.uid()) IN ('company_admin', 'company_user')
  );

CREATE POLICY "Users can delete documents they created"
  ON documents FOR DELETE
  USING (
    created_by = auth.uid()
    AND organization_id = get_user_organization_id(auth.uid())
  );

CREATE POLICY "Company admins can delete documents in their organization"
  ON documents FOR DELETE
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND get_user_role(auth.uid()) IN ('company_admin', 'company_user')
  );

-- Statements policies
CREATE POLICY "Users can view statements in their organization"
  ON statements FOR SELECT
  USING (
    organization_id = get_user_organization_id(auth.uid())
  );

CREATE POLICY "Vendors can view shared company statements"
  ON statements FOR SELECT
  USING (
    is_shared = true
    AND organization_id IN (
      SELECT company_id FROM vendor_relationships
      WHERE vendor_id = get_user_organization_id(auth.uid())
        AND status = 'active'
    )
  );

CREATE POLICY "Vendors can view their own statements"
  ON statements FOR SELECT
  USING (
    vendor_id = get_user_organization_id(auth.uid())
  );

CREATE POLICY "Company users can view vendor statements"
  ON statements FOR SELECT
  USING (
    vendor_id IN (
      SELECT vendor_id FROM vendor_relationships
      WHERE company_id = get_user_organization_id(auth.uid())
        AND status = 'active'
    )
  );

CREATE POLICY "Company users can create statements"
  ON statements FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND get_user_role(auth.uid()) IN ('company_admin', 'company_user')
  );

-- Transactions policies
CREATE POLICY "Users can view transactions for accessible statements"
  ON transactions FOR SELECT
  USING (
    statement_id IN (
      SELECT id FROM statements
      WHERE organization_id = get_user_organization_id(auth.uid())
        OR (is_shared = true AND organization_id IN (
          SELECT company_id FROM vendor_relationships
          WHERE vendor_id = get_user_organization_id(auth.uid())
            AND status = 'active'
        ))
        OR vendor_id = get_user_organization_id(auth.uid())
        OR vendor_id IN (
          SELECT vendor_id FROM vendor_relationships
          WHERE company_id = get_user_organization_id(auth.uid())
            AND status = 'active'
        )
    )
  );

CREATE POLICY "Company users can create transactions"
  ON transactions FOR INSERT
  WITH CHECK (
    statement_id IN (
      SELECT id FROM statements
      WHERE organization_id = get_user_organization_id(auth.uid())
    )
    AND get_user_role(auth.uid()) IN ('company_admin', 'company_user')
  );

-- Payments policies
CREATE POLICY "Users can view payments in their organization"
  ON payments FOR SELECT
  USING (
    organization_id = get_user_organization_id(auth.uid())
  );

CREATE POLICY "Vendors can view their own payments"
  ON payments FOR SELECT
  USING (
    vendor_id = get_user_organization_id(auth.uid())
  );

CREATE POLICY "Company users can view vendor payments"
  ON payments FOR SELECT
  USING (
    vendor_id IN (
      SELECT vendor_id FROM vendor_relationships
      WHERE company_id = get_user_organization_id(auth.uid())
        AND status = 'active'
    )
  );

CREATE POLICY "Company users can create payments"
  ON payments FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    AND get_user_role(auth.uid()) IN ('company_admin', 'company_user')
  );

CREATE POLICY "Company users can update payments"
  ON payments FOR UPDATE
  USING (
    organization_id = get_user_organization_id(auth.uid())
    AND get_user_role(auth.uid()) IN ('company_admin', 'company_user')
  );

-- Message threads policies
CREATE POLICY "Users can view threads for their organization"
  ON message_threads FOR SELECT
  USING (
    organization_id = get_user_organization_id(auth.uid())
    OR vendor_id = get_user_organization_id(auth.uid())
  );

CREATE POLICY "Users can create message threads"
  ON message_threads FOR INSERT
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    OR vendor_id = get_user_organization_id(auth.uid())
  );

-- Messages policies
CREATE POLICY "Users can view messages in accessible threads"
  ON messages FOR SELECT
  USING (
    thread_id IN (
      SELECT id FROM message_threads
      WHERE organization_id = get_user_organization_id(auth.uid())
        OR vendor_id = get_user_organization_id(auth.uid())
    )
  );

CREATE POLICY "Users can create messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND sender_organization_id = get_user_organization_id(auth.uid())
    AND thread_id IN (
      SELECT id FROM message_threads
      WHERE organization_id = get_user_organization_id(auth.uid())
        OR vendor_id = get_user_organization_id(auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (sender_id = auth.uid());

-- Message attachments policies
CREATE POLICY "Users can view attachments for accessible messages"
  ON message_attachments FOR SELECT
  USING (
    message_id IN (
      SELECT id FROM messages
      WHERE thread_id IN (
        SELECT id FROM message_threads
        WHERE organization_id = get_user_organization_id(auth.uid())
          OR vendor_id = get_user_organization_id(auth.uid())
      )
    )
  );

CREATE POLICY "Users can create attachments for their messages"
  ON message_attachments FOR INSERT
  WITH CHECK (
    message_id IN (
      SELECT id FROM messages WHERE sender_id = auth.uid()
    )
  );

-- Document access logs policies
CREATE POLICY "Users can view their own access logs"
  ON document_access_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Company admins can view all access logs for their organization"
  ON document_access_logs FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM documents
      WHERE organization_id = get_user_organization_id(auth.uid())
    )
    AND get_user_role(auth.uid()) IN ('company_admin', 'company_user')
  );

CREATE POLICY "System can create access logs"
  ON document_access_logs FOR INSERT
  WITH CHECK (true);

