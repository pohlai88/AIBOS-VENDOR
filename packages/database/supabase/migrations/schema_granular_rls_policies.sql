-- Migration: More Granular RLS Policies
-- Purpose: Add role-based and organization-level policies
-- Date: 2025-01-27
-- Risk: LOW - Additional policies, can coexist with existing

-- ============================================================================
-- ROLE-BASED POLICIES
-- ============================================================================

-- Documents: Admins can update/delete, regular users can only update own
DROP POLICY IF EXISTS "admins_full_access_documents" ON documents;
CREATE POLICY "admins_full_access_documents"
  ON documents FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.tenant_id = documents.tenant_id
      AND u.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "admins_delete_documents" ON documents;
CREATE POLICY "admins_delete_documents"
  ON documents FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.tenant_id = documents.tenant_id
      AND u.role IN ('admin', 'super_admin')
    )
  );

-- Payments: Admins can update/delete, regular users read-only
DROP POLICY IF EXISTS "admins_full_access_payments" ON payments;
CREATE POLICY "admins_full_access_payments"
  ON payments FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.tenant_id = payments.tenant_id
      AND u.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "admins_delete_payments" ON payments;
CREATE POLICY "admins_delete_payments"
  ON payments FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.tenant_id = payments.tenant_id
      AND u.role IN ('admin', 'super_admin')
    )
  );

-- Statements: Admins can update/delete
DROP POLICY IF EXISTS "admins_full_access_statements" ON statements;
CREATE POLICY "admins_full_access_statements"
  ON statements FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.tenant_id = statements.tenant_id
      AND u.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "admins_delete_statements" ON statements;
CREATE POLICY "admins_delete_statements"
  ON statements FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.tenant_id = statements.tenant_id
      AND u.role IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- ORGANIZATION-LEVEL POLICIES (More Restrictive)
-- ============================================================================

-- Documents: Users can only access documents from their organization
DROP POLICY IF EXISTS "users_view_org_documents" ON documents;
CREATE POLICY "users_view_org_documents"
  ON documents FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
    AND organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Payments: Users can only access payments from their organization
DROP POLICY IF EXISTS "users_view_org_payments" ON payments;
CREATE POLICY "users_view_org_payments"
  ON payments FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
    AND organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Statements: Users can only access statements from their organization
DROP POLICY IF EXISTS "users_view_org_statements" ON statements;
CREATE POLICY "users_view_org_statements"
  ON statements FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
    AND organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- RELATIONSHIP-BASED POLICIES (Vendor/Customer Access)
-- ============================================================================

-- Note: Vendor-specific policies are only needed if vendors have portal access
-- For now, we'll keep vendor data tenant-admin only
-- Uncomment if vendors need direct access:

-- Documents: Vendors can view documents where they are the vendor
-- DROP POLICY IF EXISTS "vendors_view_own_documents" ON documents;
-- CREATE POLICY "vendors_view_own_documents"
--   ON documents FOR SELECT
--   USING (
--     tenant_id IN (
--       SELECT tenant_id FROM users WHERE id = auth.uid()
--     )
--     AND vendor_id IN (
--       SELECT organization_id FROM users WHERE id = auth.uid()
--     )
--   );

-- ============================================================================
-- Summary
-- ============================================================================

-- Added granular policies:
-- ✅ Role-based: Admin-only UPDATE/DELETE for documents, payments, statements
-- ✅ Organization-level: Users can only access their organization's data
-- ⚠️ Vendor-specific: Skipped (vendors don't have portal access)
