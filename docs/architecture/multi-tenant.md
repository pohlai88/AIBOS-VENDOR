# Multi-Tenant, Multi-Company Architecture

**Date:** 2025-01-27  
**Status:** ✅ Implemented

---

## Overview

The application now supports a **multi-tenant, multi-company architecture** that enables:

1. **Multi-Tenancy**: Complete data isolation between different tenants (SaaS customers)
2. **Company Groups**: Grouping of multiple companies within a tenant (for enterprise customers with subsidiaries)
3. **Vendor Relationships**: Cross-organization relationships within the same tenant

---

## Architecture Layers

### 1. Tenant Layer (Top-Level Isolation)

**Table:** `tenants`

- **Purpose**: Complete data isolation between different SaaS customers
- **Key Fields**:
  - `id`: UUID primary key
  - `slug`: URL-friendly identifier (e.g., "acme-corp")
  - `status`: active, suspended, deleted
  - `subscription_tier`: free, basic, professional, enterprise
  - `max_users`, `max_companies`: Subscription limits
  - `settings`: JSONB for tenant-specific configuration

**Isolation**: All data is isolated by `tenant_id` - users from different tenants cannot access each other's data.

### 2. Company Group Layer (Optional)

**Table:** `company_groups`

- **Purpose**: Group multiple companies within a tenant (for enterprise customers)
- **Key Fields**:
  - `id`: UUID primary key
  - `tenant_id`: Parent tenant
  - `name`: Group name
  - `parent_group_id`: For hierarchical groups (optional)
  - `settings`: JSONB for group-specific configuration

**Use Case**: Enterprise customers with multiple subsidiaries can group them together for shared access.

### 3. Organization Layer

**Table:** `organizations`

- **Purpose**: Individual companies or vendors
- **Key Fields**:
  - `id`: UUID primary key
  - `tenant_id`: **Required** - Tenant that owns this organization
  - `company_group_id`: **Optional** - Company group this organization belongs to
  - `type`: company or vendor
  - `name`: Organization name

**Isolation**: Organizations are isolated by `tenant_id`. Organizations in the same `company_group_id` can share data.

---

## Database Schema

### Core Tables with Tenant Support

All tables now include `tenant_id` for isolation:

- ✅ `tenants` - Tenant definitions
- ✅ `company_groups` - Company group definitions
- ✅ `organizations` - Organizations (with `tenant_id` and optional `company_group_id`)
- ✅ `users` - Users (with `tenant_id`)
- ✅ `documents` - Documents (with `tenant_id`)
- ✅ `statements` - Statements (with `tenant_id`)
- ✅ `transactions` - Transactions (via statements)
- ✅ `payments` - Payments (with `tenant_id`)
- ✅ `message_threads` - Message threads (with `tenant_id`)
- ✅ `messages` - Messages (with `tenant_id`)
- ✅ `message_attachments` - Attachments (with `tenant_id`)
- ✅ `document_access_logs` - Access logs (with `tenant_id`)
- ✅ `vendor_relationships` - Relationships (with `tenant_id`)

---

## Row Level Security (RLS)

All RLS policies enforce tenant isolation:

### Pattern

```sql
-- Example: Users can only view documents in their tenant
CREATE POLICY "Users can view documents in their tenant"
  ON documents FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
  );
```

### Key Principles

1. **Tenant Isolation**: All policies check `tenant_id` matches user's tenant
2. **Service Role Bypass**: Service role has full access (for admin operations)
3. **Company Group Access**: Policies allow access within same company group (where applicable)

---

## Helper Functions

### Database Functions

```sql
-- Get user's tenant_id
get_user_tenant_id(user_id UUID) RETURNS UUID

-- Get user's company group
get_user_company_group_id(user_id UUID) RETURNS UUID

-- Check if user belongs to tenant
user_belongs_to_tenant(user_id UUID, check_tenant_id UUID) RETURNS BOOLEAN

-- Check if organization belongs to tenant
organization_belongs_to_tenant(org_id UUID, check_tenant_id UUID) RETURNS BOOLEAN

-- Get all organizations in user's company group
get_company_group_organizations(user_id UUID) RETURNS TABLE(organization_id UUID)
```

### Next.js Helpers

```typescript
// Get current user's tenant
import { getCurrentTenant } from "@/lib/tenant";
const tenant = await getCurrentTenant();

// Get tenant by slug (for public routes)
import { getTenantBySlug } from "@/lib/tenant";
const tenant = await getTenantBySlug("acme-corp");

// Get current company group
import { getCurrentCompanyGroup } from "@/lib/tenant";
const companyGroup = await getCurrentCompanyGroup();

// Get organizations in company group
import { getCompanyGroupOrganizations } from "@/lib/tenant";
const orgs = await getCompanyGroupOrganizations();

// Check access to organization
import { canAccessOrganization } from "@/lib/tenant";
const hasAccess = await canAccessOrganization(orgId);
```

---

## Usage Examples

### 1. Creating a Tenant

```typescript
// In an admin API route
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();

const { data: tenant, error } = await supabase
  .from("tenants")
  .insert({
    name: "Acme Corporation",
    slug: "acme-corp",
    status: "active",
    subscription_tier: "enterprise",
    max_users: 100,
    max_companies: 20,
  })
  .select()
  .single();
```

### 2. Creating a Company Group

```typescript
import { getCurrentTenant } from "@/lib/tenant";

const tenant = await getCurrentTenant();
if (!tenant) throw new Error("No tenant");

const { data: group, error } = await supabase
  .from("company_groups")
  .insert({
    tenant_id: tenant.id,
    name: "North America Division",
    description: "All North American subsidiaries",
  })
  .select()
  .single();
```

### 3. Creating an Organization

```typescript
import { getCurrentTenant } from "@/lib/tenant";

const tenant = await getCurrentTenant();
if (!tenant) throw new Error("No tenant");

const { data: org, error } = await supabase
  .from("organizations")
  .insert({
    tenant_id: tenant.id, // Required
    company_group_id: groupId, // Optional
    name: "Acme USA",
    type: "company",
  })
  .select()
  .single();
```

### 4. Querying with Tenant Isolation

```typescript
import { getTenantId } from "@/lib/supabase/tenant-client";

const tenantId = await getTenantId();

// All queries automatically filtered by tenant_id
const { data: documents } = await supabase
  .from("documents")
  .select("*")
  .eq("tenant_id", tenantId) // RLS also enforces this
  .eq("organization_id", user.organizationId);
```

### 5. Checking Access

```typescript
import { canAccessOrganization } from "@/lib/tenant";

// Check if user can access an organization
const hasAccess = await canAccessOrganization(organizationId);

if (!hasAccess) {
  return new Response("Forbidden", { status: 403 });
}
```

---

## Migration Guide

### Applying Migrations

1. **Apply multi-tenant schema migration:**
   ```bash
   # Migration: 000_multi_tenant_schema.sql
   # This adds tenants, company_groups, and tenant_id to all tables
   ```

2. **Apply multi-tenant RLS policies:**
   ```bash
   # Migration: 000_multi_tenant_rls.sql
   # This updates all RLS policies for tenant isolation
   ```

### Data Migration

The migrations automatically:
- Create a default tenant for existing organizations
- Set `tenant_id` on all existing records
- Preserve all existing data

### Post-Migration

1. **Create tenants** for your existing customers
2. **Assign organizations** to tenants
3. **Create company groups** (if needed)
4. **Update user signup** to assign tenant

---

## Security Considerations

### 1. Tenant Isolation

✅ **Enforced at Database Level**: RLS policies prevent cross-tenant access  
✅ **Enforced at Application Level**: Helper functions validate tenant context  
✅ **Service Role**: Only service role can bypass (for admin operations)

### 2. Company Group Access

✅ **Same Tenant Only**: Company groups only work within the same tenant  
✅ **Optional**: Organizations don't need to belong to a company group  
✅ **Hierarchical**: Supports parent-child relationships

### 3. Vendor Relationships

✅ **Tenant Scoped**: Relationships only work within the same tenant  
✅ **RLS Protected**: Policies ensure vendor access is properly scoped

---

## Best Practices

### 1. Always Use Tenant Context

```typescript
// ✅ Good: Get tenant first
const tenant = await getCurrentTenant();
const { data } = await supabase
  .from("documents")
  .select("*")
  .eq("tenant_id", tenant.id);

// ❌ Bad: Missing tenant check
const { data } = await supabase
  .from("documents")
  .select("*");
```

### 2. Validate Access

```typescript
// ✅ Good: Check access before operations
const hasAccess = await canAccessOrganization(orgId);
if (!hasAccess) throw new Error("Forbidden");

// ❌ Bad: Assume access
await supabase.from("documents").insert({ organization_id: orgId });
```

### 3. Use Helper Functions

```typescript
// ✅ Good: Use tenant helpers
import { getTenantId } from "@/lib/supabase/tenant-client";
const tenantId = await getTenantId();

// ❌ Bad: Manual tenant lookup
const { data: user } = await supabase.from("users").select("tenant_id")...
```

---

## API Routes

### Tenant-Aware API Routes

```typescript
// app/api/documents/route.ts
import { getCurrentUser } from "@/lib/auth";
import { getTenantId } from "@/lib/supabase/tenant-client";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const tenantId = await getTenantId();
  const supabase = await createClient();

  // RLS automatically filters by tenant_id
  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("organization_id", user.organizationId);

  return Response.json(documents);
}
```

---

## Testing

### Test Tenant Isolation

```typescript
// Test that users from different tenants cannot access each other's data
const tenant1 = await createTenant({ slug: "tenant-1" });
const tenant2 = await createTenant({ slug: "tenant-2" });

const user1 = await createUser({ tenant_id: tenant1.id });
const user2 = await createUser({ tenant_id: tenant2.id });

// User1 should not see User2's data
const { data } = await supabase
  .from("documents")
  .select("*")
  .eq("tenant_id", tenant1.id);
// Should only return tenant1 documents
```

---

## Troubleshooting

### Issue: "User has no tenant assigned"

**Solution**: Ensure users have `tenant_id` set when created.

```typescript
await supabase.from("users").insert({
  id: authUser.id,
  email: email,
  tenant_id: tenantId, // Required
  organization_id: orgId,
  role: "company_user",
});
```

### Issue: Cross-tenant access

**Solution**: Check RLS policies are applied and tenant_id is set correctly.

```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check tenant_id is set
SELECT id, tenant_id FROM organizations WHERE tenant_id IS NULL;
```

---

## References

- [Migration Files](../../packages/database/supabase/migrations/000_multi_tenant_schema.sql)
- [RLS Policies](../../packages/database/supabase/migrations/000_multi_tenant_rls.sql)
- [Tenant Helpers](../../apps/web/src/lib/tenant.ts)
- [Tenant Client](../../apps/web/src/lib/supabase/tenant-client.ts)

---

*Last updated: 2025-01-27*
