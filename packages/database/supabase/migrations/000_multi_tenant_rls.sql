-- Multi-Tenant RLS Policies
-- This migration adds Row Level Security policies for tenant isolation

-- ============================================================================
-- TENANTS POLICIES
-- ============================================================================

-- Users can only view their own tenant
CREATE POLICY "Users can view their own tenant"
  ON tenants FOR SELECT
  USING (
    id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- Service role has full access (for admin operations)
CREATE POLICY "Service role has full access to tenants"
  ON tenants FOR ALL
  USING ((SELECT auth.role()) = 'service_role');

-- ============================================================================
-- COMPANY GROUPS POLICIES
-- ============================================================================

-- Users can view company groups in their tenant
CREATE POLICY "Users can view company groups in their tenant"
  ON company_groups FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- Company admins can manage company groups in their tenant
CREATE POLICY "Company admins can manage company groups"
  ON company_groups FOR ALL
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('company_admin')
  );

-- Service role has full access
CREATE POLICY "Service role has full access to company groups"
  ON company_groups FOR ALL
  USING ((SELECT auth.role()) = 'service_role');

-- ============================================================================
-- UPDATE ORGANIZATIONS POLICIES (Add tenant isolation)
-- ============================================================================

-- Drop existing policies if they exist (we'll recreate with tenant checks)
DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;
DROP POLICY IF EXISTS "Users can view organizations they have relationships with" ON organizations;

-- Users can view organizations in their tenant
CREATE POLICY "Users can view organizations in their tenant"
  ON organizations FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- Users can view organizations they have vendor relationships with (cross-tenant blocked)
CREATE POLICY "Users can view vendor organizations with relationships"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT vendor_id FROM vendor_relationships
      WHERE company_id = (SELECT organization_id FROM users WHERE id = auth.uid())
        AND status = 'active'
        AND tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    )
    OR id IN (
      SELECT company_id FROM vendor_relationships
      WHERE vendor_id = (SELECT organization_id FROM users WHERE id = auth.uid())
        AND status = 'active'
        AND tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    )
  );

-- Company admins can manage organizations in their tenant
CREATE POLICY "Company admins can manage organizations in their tenant"
  ON organizations FOR ALL
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('company_admin')
  );

-- Service role has full access
CREATE POLICY "Service role has full access to organizations"
  ON organizations FOR ALL
  USING ((SELECT auth.role()) = 'service_role');

-- ============================================================================
-- UPDATE USERS POLICIES (Add tenant isolation)
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view users in their organization" ON users;
DROP POLICY IF EXISTS "Users can view vendors they have relationships with" ON users;

-- Users can view users in their tenant
CREATE POLICY "Users can view users in their tenant"
  ON users FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );

-- Users can view vendors they have relationships with (within same tenant)
CREATE POLICY "Users can view vendor users with relationships"
  ON users FOR SELECT
  USING (
    organization_id IN (
      SELECT vendor_id FROM vendor_relationships
      WHERE company_id = (SELECT organization_id FROM users WHERE id = auth.uid())
        AND status = 'active'
        AND tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    )
    OR organization_id IN (
      SELECT company_id FROM vendor_relationships
      WHERE vendor_id = (SELECT organization_id FROM users WHERE id = auth.uid())
        AND status = 'active'
        AND tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    )
  );

-- Service role has full access
CREATE POLICY "Service role has full access to users"
  ON users FOR ALL
  USING ((SELECT auth.role()) = 'service_role');

-- ============================================================================
-- UPDATE VENDOR RELATIONSHIPS POLICIES (Add tenant isolation)
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view relationships for their organization" ON vendor_relationships;
DROP POLICY IF EXISTS "Company admins can manage relationships" ON vendor_relationships;

-- Users can view relationships in their tenant
CREATE POLICY "Users can view relationships in their tenant"
  ON vendor_relationships FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND (
      company_id = (SELECT organization_id FROM users WHERE id = auth.uid())
      OR vendor_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    )
  );

-- Company admins can manage relationships in their tenant
CREATE POLICY "Company admins can manage relationships in their tenant"
  ON vendor_relationships FOR ALL
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND company_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('company_admin', 'company_user')
  );

-- Service role has full access
CREATE POLICY "Service role has full access to vendor relationships"
  ON vendor_relationships FOR ALL
  USING ((SELECT auth.role()) = 'service_role');

-- ============================================================================
-- UPDATE DOCUMENTS POLICIES (Add tenant isolation)
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view documents in their organization" ON documents;
DROP POLICY IF EXISTS "Vendors can view shared company documents" ON documents;
DROP POLICY IF EXISTS "Users can create documents in their organization" ON documents;
DROP POLICY IF EXISTS "Users can update documents in their organization" ON documents;
DROP POLICY IF EXISTS "Users can delete documents in their organization" ON documents;

-- Users can view documents in their tenant
CREATE POLICY "Users can view documents in their tenant"
  ON documents FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND (
      organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
      OR (
        is_shared = true
        AND organization_id IN (
          SELECT company_id FROM vendor_relationships
          WHERE vendor_id = (SELECT organization_id FROM users WHERE id = auth.uid())
            AND status = 'active'
            AND tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
        )
      )
    )
  );

-- Users can create documents in their organization (same tenant)
CREATE POLICY "Users can create documents in their tenant"
  ON documents FOR INSERT
  WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    AND created_by = auth.uid()
  );

-- Users can update documents in their organization (same tenant)
CREATE POLICY "Users can update documents in their tenant"
  ON documents FOR UPDATE
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  );

-- Users can delete documents in their organization (same tenant)
CREATE POLICY "Users can delete documents in their tenant"
  ON documents FOR DELETE
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  );

-- Service role has full access
CREATE POLICY "Service role has full access to documents"
  ON documents FOR ALL
  USING ((SELECT auth.role()) = 'service_role');

-- ============================================================================
-- UPDATE STATEMENTS POLICIES (Add tenant isolation)
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view statements for their organization" ON statements;
DROP POLICY IF EXISTS "Vendors can view shared company statements" ON statements;
DROP POLICY IF EXISTS "Company admins can manage statements" ON statements;

-- Users can view statements in their tenant
CREATE POLICY "Users can view statements in their tenant"
  ON statements FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND (
      organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
      OR (
        is_shared = true
        AND organization_id IN (
          SELECT company_id FROM vendor_relationships
          WHERE vendor_id = (SELECT organization_id FROM users WHERE id = auth.uid())
            AND status = 'active'
            AND tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
        )
      )
    )
  );

-- Company admins can manage statements in their tenant
CREATE POLICY "Company admins can manage statements in their tenant"
  ON statements FOR ALL
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('company_admin', 'company_user')
  );

-- Service role has full access
CREATE POLICY "Service role has full access to statements"
  ON statements FOR ALL
  USING ((SELECT auth.role()) = 'service_role');

-- ============================================================================
-- UPDATE PAYMENTS POLICIES (Add tenant isolation)
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view payments for their organization" ON payments;
DROP POLICY IF EXISTS "Vendors can view payments from companies" ON payments;
DROP POLICY IF EXISTS "Company admins can manage payments" ON payments;

-- Users can view payments in their tenant
CREATE POLICY "Users can view payments in their tenant"
  ON payments FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND (
      organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
      OR vendor_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    )
  );

-- Company admins can manage payments in their tenant
CREATE POLICY "Company admins can manage payments in their tenant"
  ON payments FOR ALL
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('company_admin', 'company_user')
  );

-- Service role has full access
CREATE POLICY "Service role has full access to payments"
  ON payments FOR ALL
  USING ((SELECT auth.role()) = 'service_role');

-- ============================================================================
-- UPDATE MESSAGE THREADS POLICIES (Add tenant isolation)
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view threads for their organization" ON message_threads;
DROP POLICY IF EXISTS "Users can create threads for their organization" ON message_threads;
DROP POLICY IF EXISTS "Users can update threads for their organization" ON message_threads;

-- Users can view threads in their tenant
CREATE POLICY "Users can view threads in their tenant"
  ON message_threads FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND (
      organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
      OR vendor_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    )
  );

-- Users can create threads in their tenant
CREATE POLICY "Users can create threads in their tenant"
  ON message_threads FOR INSERT
  WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND (
      organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
      OR vendor_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    )
  );

-- Users can update threads in their tenant
CREATE POLICY "Users can update threads in their tenant"
  ON message_threads FOR UPDATE
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND (
      organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
      OR vendor_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    )
  );

-- Service role has full access
CREATE POLICY "Service role has full access to message threads"
  ON message_threads FOR ALL
  USING ((SELECT auth.role()) = 'service_role');

-- ============================================================================
-- UPDATE MESSAGES POLICIES (Add tenant isolation)
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view messages in threads" ON messages;
DROP POLICY IF EXISTS "Users can create messages in threads" ON messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON messages;

-- Users can view messages in their tenant
CREATE POLICY "Users can view messages in their tenant"
  ON messages FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND (
      sender_organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
      OR recipient_organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    )
  );

-- Users can create messages in their tenant
CREATE POLICY "Users can create messages in their tenant"
  ON messages FOR INSERT
  WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND sender_id = auth.uid()
    AND sender_organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
  );

-- Users can update their own messages in their tenant
CREATE POLICY "Users can update their own messages in their tenant"
  ON messages FOR UPDATE
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND sender_id = auth.uid()
  );

-- Service role has full access
CREATE POLICY "Service role has full access to messages"
  ON messages FOR ALL
  USING ((SELECT auth.role()) = 'service_role');

-- ============================================================================
-- UPDATE MESSAGE ATTACHMENTS POLICIES (Add tenant isolation)
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view attachments for messages" ON message_attachments;
DROP POLICY IF EXISTS "Users can create attachments for messages" ON message_attachments;

-- Users can view attachments in their tenant
CREATE POLICY "Users can view attachments in their tenant"
  ON message_attachments FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND message_id IN (
      SELECT id FROM messages
      WHERE tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
        AND (
          sender_organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
          OR recipient_organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
        )
    )
  );

-- Users can create attachments in their tenant
CREATE POLICY "Users can create attachments in their tenant"
  ON message_attachments FOR INSERT
  WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND message_id IN (
      SELECT id FROM messages
      WHERE tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
        AND sender_id = auth.uid()
    )
  );

-- Service role has full access
CREATE POLICY "Service role has full access to message attachments"
  ON message_attachments FOR ALL
  USING ((SELECT auth.role()) = 'service_role');

-- ============================================================================
-- UPDATE DOCUMENT ACCESS LOGS POLICIES (Add tenant isolation)
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view access logs for documents" ON document_access_logs;
DROP POLICY IF EXISTS "System can create access logs" ON document_access_logs;

-- Users can view access logs in their tenant
CREATE POLICY "Users can view access logs in their tenant"
  ON document_access_logs FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND document_id IN (
      SELECT id FROM documents
      WHERE tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
        AND organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    )
  );

-- System can create access logs in their tenant
CREATE POLICY "System can create access logs in their tenant"
  ON document_access_logs FOR INSERT
  WITH CHECK (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
    AND user_id = auth.uid()
  );

-- Service role has full access
CREATE POLICY "Service role has full access to document access logs"
  ON document_access_logs FOR ALL
  USING ((SELECT auth.role()) = 'service_role');

-- ============================================================================
-- TRANSACTIONS POLICIES (Add tenant isolation)
-- ============================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view transactions for statements" ON transactions;

-- Users can view transactions in their tenant
CREATE POLICY "Users can view transactions in their tenant"
  ON transactions FOR SELECT
  USING (
    statement_id IN (
      SELECT id FROM statements
      WHERE tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
        AND (
          organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
          OR (
            is_shared = true
            AND organization_id IN (
              SELECT company_id FROM vendor_relationships
              WHERE vendor_id = (SELECT organization_id FROM users WHERE id = auth.uid())
                AND status = 'active'
                AND tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
            )
          )
        )
    )
  );

-- Company admins can manage transactions in their tenant
CREATE POLICY "Company admins can manage transactions in their tenant"
  ON transactions FOR ALL
  USING (
    statement_id IN (
      SELECT id FROM statements
      WHERE tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
        AND organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    )
    AND (SELECT role FROM users WHERE id = auth.uid()) IN ('company_admin', 'company_user')
  );

-- Service role has full access
CREATE POLICY "Service role has full access to transactions"
  ON transactions FOR ALL
  USING ((SELECT auth.role()) = 'service_role');
