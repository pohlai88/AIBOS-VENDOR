# Auth RLS Policies - Implementation Guide

**Date:** 2025-01-27  
**Status:** ⚠️ **ACTION REQUIRED** - Users table missing RLS policies

---

## Current Status

### ✅ Tables with RLS Policies

| Table | RLS Enabled | Policies Count | Status |
|-------|-------------|----------------|--------|
| `tenants` | ✅ Yes | 3 | ✅ **SECURE** |
| `company_groups` | ✅ Yes | 3 | ✅ **SECURE** |
| `organizations` | ⚠️ Unknown | - | ⚠️ **NEEDS CHECK** |
| `users` | ⚠️ **NO POLICIES** | 0 | ❌ **INSECURE** |

---

## Critical Issue: Users Table Missing RLS Policies

### Current State

The `users` table currently has **NO RLS policies**, which means:
- ❌ Any authenticated user can potentially read all user records
- ❌ No row-level security protection
- ❌ Security risk for multi-tenant architecture

### Required Policies

The following RLS policies should be implemented for the `users` table:

#### 1. Users can view their own record

```sql
CREATE POLICY "Users can view own record"
ON users
FOR SELECT
USING (auth.uid() = id);
```

#### 2. Users can update their own record (limited fields)

```sql
CREATE POLICY "Users can update own record"
ON users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  -- Add field restrictions if needed
);
```

#### 3. Service role has full access (for admin operations)

```sql
CREATE POLICY "Service role has full access to users"
ON users
FOR ALL
USING ((SELECT auth.role()) = 'service_role')
WITH CHECK ((SELECT auth.role()) = 'service_role');
```

#### 4. Users in same tenant can view each other (optional, for collaboration)

```sql
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
```

---

## Implementation Steps

### Step 1: Enable RLS on Users Table

```sql
-- Enable RLS if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

### Step 2: Create Policies

```sql
-- Policy 1: Users can view own record
CREATE POLICY "Users can view own record"
ON users
FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Users can update own record
CREATE POLICY "Users can update own record"
ON users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy 3: Service role access
CREATE POLICY "Service role has full access to users"
ON users
FOR ALL
USING ((SELECT auth.role()) = 'service_role')
WITH CHECK ((SELECT auth.role()) = 'service_role');

-- Policy 4: Same tenant visibility (optional)
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
```

### Step 3: Verify Policies

```sql
-- Check policies
SELECT 
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'users'
ORDER BY policyname;
```

### Step 4: Test Policies

```typescript
// Test with MCP tools
// Use: mcp_supabase_execute_sql to verify policies
```

---

## Migration Script

Create a migration file: `supabase/migrations/XXXX_add_users_rls_policies.sql`

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (for idempotency)
DROP POLICY IF EXISTS "Users can view own record" ON users;
DROP POLICY IF EXISTS "Users can update own record" ON users;
DROP POLICY IF EXISTS "Service role has full access to users" ON users;
DROP POLICY IF EXISTS "Users can view users in same tenant" ON users;

-- Create policies
CREATE POLICY "Users can view own record"
ON users
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own record"
ON users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role has full access to users"
ON users
FOR ALL
USING ((SELECT auth.role()) = 'service_role')
WITH CHECK ((SELECT auth.role()) = 'service_role');

-- Optional: Same tenant visibility
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
```

---

## Verification Using MCP Tools

### 1. Check RLS Status

```typescript
// Use Supabase MCP
mcp_supabase_execute_sql({
  query: `
    SELECT 
      tablename,
      rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename = 'users'
  `
})
```

### 2. List Policies

```typescript
mcp_supabase_execute_sql({
  query: `
    SELECT 
      policyname,
      cmd,
      qual,
      with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'users'
  `
})
```

### 3. Test Policy Enforcement

```typescript
// Test as authenticated user
const supabase = await createClient();
const { data, error } = await supabase
  .from("users")
  .select("*");

// Should only return current user's record
```

---

## Security Considerations

### Multi-Tenant Isolation

The `users` table contains `tenant_id` for multi-tenant isolation. Policies should ensure:
- ✅ Users can only see users in their own tenant
- ✅ Users cannot access other tenants' data
- ✅ Service role can access all data (for admin operations)

### Field-Level Security

Consider restricting which fields users can update:
- ✅ Users should be able to update: `email`, `preferences`
- ❌ Users should NOT be able to update: `role`, `tenant_id`, `organization_id`

### Audit Trail

Consider adding audit logging for user record changes:
- Track who modified user records
- Log changes to sensitive fields
- Monitor policy violations

---

## Related Tables

### Organizations Table

Check if `organizations` table has RLS policies:

```sql
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'organizations';
```

### Recommended Policies for Organizations

```sql
-- Users can view organizations in their tenant
CREATE POLICY "Users can view organizations in tenant"
ON organizations
FOR SELECT
USING (
  tenant_id IN (
    SELECT tenant_id
    FROM users
    WHERE id = auth.uid()
  )
);
```

---

## Next Steps

1. ✅ **IMMEDIATE**: Create migration for users table RLS policies
2. ⚠️ **HIGH**: Verify organizations table has RLS policies
3. ⚠️ **MEDIUM**: Test all policies with MCP tools
4. ⚠️ **LOW**: Add field-level update restrictions
5. ⚠️ **LOW**: Implement audit logging

---

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [RLS Best Practices](./AUTH_MCP_BEST_PRACTICES.md)
- Current Auth Implementation: `apps/web/src/lib/auth.ts`

---

**Last Updated:** 2025-01-27  
**Priority:** 🔴 **CRITICAL** - Security Issue
