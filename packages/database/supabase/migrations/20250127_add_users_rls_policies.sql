-- Migration: Add RLS Policies to Users Table
-- Date: 2025-01-27
-- Description: Implements Row Level Security policies for the users table
--              to ensure proper multi-tenant isolation and security

-- Enable RLS on users table (idempotent)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (for idempotency)
DROP POLICY IF EXISTS "Users can view own record" ON users;
DROP POLICY IF EXISTS "Users can update own record" ON users;
DROP POLICY IF EXISTS "Service role has full access to users" ON users;
DROP POLICY IF EXISTS "Users can view users in same tenant" ON users;

-- Policy 1: Users can view their own record
CREATE POLICY "Users can view own record"
ON users
FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Users can update their own record
-- Note: Consider restricting which fields can be updated
CREATE POLICY "Users can update own record"
ON users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 3: Service role has full access (for admin operations)
CREATE POLICY "Service role has full access to users"
ON users
FOR ALL
USING ((SELECT auth.role()) = 'service_role')
WITH CHECK ((SELECT auth.role()) = 'service_role');

-- Policy 4: Users can view users in same tenant (for collaboration features)
-- This allows users within the same tenant to see each other
CREATE POLICY "Users can view users in same tenant"
ON users
FOR SELECT
USING (
  tenant_id IN (
    SELECT tenant_id
    FROM users
    WHERE id = auth.uid()
  )
);

-- Add comment for documentation
COMMENT ON POLICY "Users can view own record" ON users IS 
  'Allows users to view their own user record';

COMMENT ON POLICY "Users can update own record" ON users IS 
  'Allows users to update their own user record. Consider adding field-level restrictions.';

COMMENT ON POLICY "Service role has full access to users" ON users IS 
  'Allows service role (admin) to perform all operations on users table';

COMMENT ON POLICY "Users can view users in same tenant" ON users IS 
  'Allows users to view other users within the same tenant for collaboration features';
