# Multi-Tenant Quick Start Guide

**Quick reference for implementing multi-tenant features in your code.**

---

## 1. Get Current Tenant

```typescript
import { getCurrentTenant } from "@/lib/tenant";

const tenant = await getCurrentTenant();
if (!tenant) {
  // User not authenticated or no tenant
  return new Response("Unauthorized", { status: 401 });
}

// Use tenant.id, tenant.slug, tenant.subscription_tier, etc.
```

---

## 2. Get Tenant ID (Simple)

```typescript
import { getTenantId } from "@/lib/supabase/tenant-client";

const tenantId = await getTenantId();
// Use in queries
```

---

## 3. Query with Tenant Isolation

```typescript
import { createClient } from "@/lib/supabase/server";
import { getTenantId } from "@/lib/supabase/tenant-client";

const supabase = await createClient();
const tenantId = await getTenantId();

// RLS automatically enforces tenant isolation, but explicit is better
const { data } = await supabase
  .from("documents")
  .select("*")
  .eq("tenant_id", tenantId)
  .eq("organization_id", user.organizationId);
```

---

## 4. Create Resource (Auto Tenant)

```typescript
import { getTenantId } from "@/lib/supabase/tenant-client";
import { getCurrentUser } from "@/lib/auth";

const tenantId = await getTenantId();
const user = await getCurrentUser();

const { data } = await supabase
  .from("documents")
  .insert({
    name: "Invoice.pdf",
    tenant_id: tenantId, // Required
    organization_id: user.organizationId,
    created_by: user.id,
    // ... other fields
  });
```

---

## 5. Check Organization Access

```typescript
import { canAccessOrganization } from "@/lib/tenant";

const hasAccess = await canAccessOrganization(organizationId);
if (!hasAccess) {
  return new Response("Forbidden", { status: 403 });
}
```

---

## 6. Get Company Group Organizations

```typescript
import { getCompanyGroupOrganizations } from "@/lib/tenant";

const orgs = await getCompanyGroupOrganizations();
// Returns all organizations in user's company group (if applicable)
```

---

## 7. User Context (Includes Tenant)

```typescript
import { getCurrentUser } from "@/lib/auth";

const user = await getCurrentUser();
// user.tenantId - User's tenant ID
// user.companyGroupId - User's company group ID (if applicable)
// user.organizationId - User's organization ID
```

---

## 8. API Route Example

```typescript
// app/api/documents/route.ts
import { getCurrentUser } from "@/lib/auth";
import { getTenantId } from "@/lib/supabase/tenant-client";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const tenantId = await getTenantId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("organization_id", user.organizationId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const tenantId = await getTenantId();
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("documents")
    .insert({
      ...body,
      tenant_id: tenantId, // Required
      organization_id: user.organizationId,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}
```

---

## 9. Validate Tenant Access

```typescript
import { validateTenantAccess } from "@/lib/supabase/tenant-client";

// Check if a resource belongs to current tenant
const hasAccess = await validateTenantAccess("documents", documentId);
if (!hasAccess) {
  return new Response("Forbidden", { status: 403 });
}
```

---

## 10. Create Tenant (Admin Only)

```typescript
// app/api/admin/tenants/route.ts
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  // Only admins can create tenants
  const user = await requireRole(["company_admin"]); // Or create super_admin role
  
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("tenants")
    .insert({
      name: body.name,
      slug: body.slug,
      status: "active",
      subscription_tier: body.tier || "free",
      max_users: body.maxUsers || 10,
      max_companies: body.maxCompanies || 5,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data, { status: 201 });
}
```

---

## Common Patterns

### Pattern 1: Tenant-Scoped Query

```typescript
const tenantId = await getTenantId();
const { data } = await supabase
  .from("table_name")
  .select("*")
  .eq("tenant_id", tenantId);
```

### Pattern 2: Organization + Tenant Query

```typescript
const tenantId = await getTenantId();
const user = await getCurrentUser();

const { data } = await supabase
  .from("table_name")
  .select("*")
  .eq("tenant_id", tenantId)
  .eq("organization_id", user.organizationId);
```

### Pattern 3: Company Group Query

```typescript
const user = await getCurrentUser();
const companyGroupOrgs = await getCompanyGroupOrganizations();
const orgIds = companyGroupOrgs.map(o => o.id);

const { data } = await supabase
  .from("table_name")
  .select("*")
  .eq("tenant_id", user.tenantId)
  .in("organization_id", orgIds);
```

---

## Migration Checklist

- [ ] Apply `000_multi_tenant_schema.sql` migration
- [ ] Apply `000_multi_tenant_rls.sql` migration
- [ ] Create tenants for existing customers
- [ ] Update user signup to assign tenant
- [ ] Update API routes to use tenant context
- [ ] Test tenant isolation
- [ ] Update documentation

---

*See [full documentation](./multi-tenant.md) for detailed information.*
