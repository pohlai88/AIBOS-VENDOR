-- Migration: Complete CRUD RLS Policies
-- Purpose: Add UPDATE and DELETE policies to complete CRUD coverage
-- Date: 2025-01-27
-- Risk: MEDIUM - Restrictive policies, test thoroughly

-- ============================================================================
-- UPDATE POLICIES
-- ============================================================================

-- Documents: Tenant-scoped updates
DROP POLICY IF EXISTS "users_update_tenant_documents" ON documents;
CREATE POLICY "users_update_tenant_documents"
  ON documents FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Payments: Tenant-scoped updates
DROP POLICY IF EXISTS "users_update_tenant_payments" ON payments;
CREATE POLICY "users_update_tenant_payments"
  ON payments FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Statements: Tenant-scoped updates
DROP POLICY IF EXISTS "users_update_tenant_statements" ON statements;
CREATE POLICY "users_update_tenant_statements"
  ON statements FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Messages: Tenant-scoped updates (sender can update own messages)
DROP POLICY IF EXISTS "users_update_tenant_messages" ON messages;
CREATE POLICY "users_update_tenant_messages"
  ON messages FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
    AND sender_id = auth.uid() -- Only sender can update
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
    AND sender_id = auth.uid() -- Maintain sender constraint
  );

-- Message Threads: Tenant-scoped updates
DROP POLICY IF EXISTS "users_update_tenant_threads" ON message_threads;
CREATE POLICY "users_update_tenant_threads"
  ON message_threads FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Users: Tenant-scoped updates (users can update own record, or admin can update)
DROP POLICY IF EXISTS "users_update_tenant_users" ON users;
CREATE POLICY "users_update_tenant_users"
  ON users FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
    AND (
      id = auth.uid() -- Users can update themselves
      OR EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.tenant_id = users.tenant_id
        AND u.role IN ('admin', 'super_admin') -- Admins can update others
      )
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Organizations: Tenant-scoped updates
DROP POLICY IF EXISTS "users_update_tenant_organizations" ON organizations;
CREATE POLICY "users_update_tenant_organizations"
  ON organizations FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- DELETE POLICIES
-- ============================================================================

-- Notifications: Users can delete own notifications
DROP POLICY IF EXISTS "users_delete_own_notifications" ON notifications;
CREATE POLICY "users_delete_own_notifications"
  ON notifications FOR DELETE
  USING (user_id = auth.uid());

-- Documents: Tenant-scoped deletes
DROP POLICY IF EXISTS "users_delete_tenant_documents" ON documents;
CREATE POLICY "users_delete_tenant_documents"
  ON documents FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Payments: Tenant-scoped deletes (consider soft delete instead)
DROP POLICY IF EXISTS "users_delete_tenant_payments" ON payments;
CREATE POLICY "users_delete_tenant_payments"
  ON payments FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
    -- Consider restricting to admin-only or status-based rules
  );

-- Statements: Tenant-scoped deletes
DROP POLICY IF EXISTS "users_delete_tenant_statements" ON statements;
CREATE POLICY "users_delete_tenant_statements"
  ON statements FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Messages: Tenant-scoped deletes (sender can delete own messages)
DROP POLICY IF EXISTS "users_delete_tenant_messages" ON messages;
CREATE POLICY "users_delete_tenant_messages"
  ON messages FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
    AND sender_id = auth.uid() -- Only sender can delete
  );

-- Message Threads: Tenant-scoped deletes
DROP POLICY IF EXISTS "users_delete_tenant_threads" ON message_threads;
CREATE POLICY "users_delete_tenant_threads"
  ON message_threads FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Users: Tenant-scoped deletes (admin-only, prevent self-delete)
DROP POLICY IF EXISTS "users_delete_tenant_users" ON users;
CREATE POLICY "users_delete_tenant_users"
  ON users FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
    AND id != auth.uid() -- Cannot delete yourself
    AND EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.tenant_id = users.tenant_id
      AND u.role IN ('admin', 'super_admin') -- Only admins can delete
    )
  );

-- Organizations: Tenant-scoped deletes (admin-only)
DROP POLICY IF EXISTS "users_delete_tenant_organizations" ON organizations;
CREATE POLICY "users_delete_tenant_organizations"
  ON organizations FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.tenant_id = organizations.tenant_id
      AND u.role IN ('admin', 'super_admin') -- Only admins can delete
    )
  );
