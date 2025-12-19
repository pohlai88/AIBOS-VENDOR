# Multi-Tenant Database Setup Guide

**This guide explains how to set up and apply the multi-tenant migrations.**

---

## Prerequisites

- Supabase project configured
- Existing migrations applied (001-010) OR fresh database
- Supabase CLI or access to Supabase Dashboard

---

## Step 1: Apply Multi-Tenant Schema Migration

```bash
# Using Supabase CLI
supabase migration up 000_multi_tenant_schema

# Or apply via SQL Editor in Supabase Dashboard
# Copy contents of: packages/database/supabase/migrations/000_multi_tenant_schema.sql
```

**What this does:**
- Creates `tenants` table
- Creates `company_groups` table
- Adds `tenant_id` to all existing tables
- Adds `company_group_id` to `organizations` table
- Creates helper functions
- Migrates existing data to default tenant

---

## Step 2: Apply Multi-Tenant RLS Policies

```bash
# Using Supabase CLI
supabase migration up 000_multi_tenant_rls

# Or apply via SQL Editor in Supabase Dashboard
# Copy contents of: packages/database/supabase/migrations/000_multi_tenant_rls.sql
```

**What this does:**
- Updates all RLS policies to enforce tenant isolation
- Adds tenant checks to all SELECT, INSERT, UPDATE, DELETE policies
- Maintains service role bypass for admin operations

---

## Step 3: Create Your First Tenant

```sql
-- Create a tenant for your organization
INSERT INTO tenants (name, slug, status, subscription_tier, max_users, max_companies)
VALUES (
  'Your Company Name',
  'your-company-slug',
  'active',
  'enterprise',
  100,
  50
)
RETURNING *;
```

**Note:** Save the tenant `id` - you'll need it for the next steps.

---

## Step 4: Update Existing Organizations

```sql
-- Update existing organizations to use your tenant
UPDATE organizations
SET tenant_id = 'YOUR_TENANT_ID_HERE'
WHERE tenant_id IS NULL;
```

---

## Step 5: Update Existing Users

```sql
-- Users should already have tenant_id set from migration
-- But verify:
SELECT id, email, tenant_id, organization_id
FROM users
WHERE tenant_id IS NULL;

-- If any exist, update them:
UPDATE users u
SET tenant_id = o.tenant_id
FROM organizations o
WHERE u.organization_id = o.id
  AND u.tenant_id IS NULL;
```

---

## Step 6: (Optional) Create Company Groups

```sql
-- Create a company group for related organizations
INSERT INTO company_groups (tenant_id, name, description)
VALUES (
  'YOUR_TENANT_ID',
  'Main Division',
  'Primary company group'
)
RETURNING *;

-- Assign organizations to the group
UPDATE organizations
SET company_group_id = 'COMPANY_GROUP_ID'
WHERE id IN ('ORG_ID_1', 'ORG_ID_2', 'ORG_ID_3');
```

---

## Step 7: Verify Setup

```sql
-- Check tenants
SELECT id, name, slug, status, subscription_tier FROM tenants;

-- Check organizations have tenant_id
SELECT id, name, type, tenant_id, company_group_id 
FROM organizations 
WHERE tenant_id IS NULL; -- Should return 0 rows

-- Check users have tenant_id
SELECT id, email, tenant_id, organization_id 
FROM users 
WHERE tenant_id IS NULL; -- Should return 0 rows

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('tenants', 'company_groups', 'organizations', 'users');
-- All should show rowsecurity = true
```

---

## Step 8: Test Tenant Isolation

```sql
-- As a test user, try to access data from another tenant
-- This should return 0 rows (RLS blocks it)

-- Get a test user's tenant_id
SELECT tenant_id FROM users WHERE email = 'test@example.com';

-- Try to query another tenant's data (should fail)
SELECT * FROM documents 
WHERE tenant_id != (SELECT tenant_id FROM users WHERE email = 'test@example.com');
-- RLS will filter this automatically
```

---

## Troubleshooting

### Issue: "tenant_id is null" errors

**Solution:**
```sql
-- Check for null tenant_ids
SELECT 'organizations' as table_name, COUNT(*) as null_count
FROM organizations WHERE tenant_id IS NULL
UNION ALL
SELECT 'users', COUNT(*) FROM users WHERE tenant_id IS NULL;

-- Fix organizations
UPDATE organizations 
SET tenant_id = (SELECT id FROM tenants WHERE slug = 'default' LIMIT 1)
WHERE tenant_id IS NULL;

-- Fix users
UPDATE users u
SET tenant_id = o.tenant_id
FROM organizations o
WHERE u.organization_id = o.id AND u.tenant_id IS NULL;
```

### Issue: RLS policies not working

**Solution:**
```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'documents';

-- Re-enable RLS if needed
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Check policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'documents';
```

### Issue: Migration fails on existing data

**Solution:**
1. The migration creates a default tenant automatically
2. If migration fails, check for constraint violations
3. Ensure all foreign keys are valid

---

## Next Steps

1. **Update Application Code:**
   - Use `getCurrentTenant()` in API routes
   - Use `getTenantId()` for queries
   - Update signup flow to assign tenant

2. **Create Admin Interface:**
   - Tenant management UI
   - Company group management
   - User assignment

3. **Test Thoroughly:**
   - Test tenant isolation
   - Test company group access
   - Test vendor relationships within tenant

---

## Migration Order

If applying to a fresh database:

1. `001_initial_schema.sql` - Core schema
2. `000_multi_tenant_schema.sql` - Multi-tenant schema (before RLS)
3. `002_rls_policies.sql` - Original RLS (will be updated)
4. `000_multi_tenant_rls.sql` - Multi-tenant RLS (updates policies)
5. `003_notifications.sql` - Notifications (already has tenant_id)
6. ... (other migrations)

**Note:** The multi-tenant migrations are designed to work with existing data and will migrate it automatically.

---

*For questions or issues, see [Multi-Tenant Architecture Documentation](../../docs/architecture/multi-tenant.md)*
