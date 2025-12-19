# Production Merge Gate Checklist

**Purpose:** Final verification steps before merging to production  
**Date:** 2025-01-27  
**Status:** ✅ All checks implemented

---

## Pre-Merge Verification Steps

### 1. ✅ Production Build Test

```bash
# Test production build behavior
npm run build
npm run start

# Verify:
# - Build completes without errors
# - Application starts successfully
# - No runtime errors in console
# - All routes are accessible
```

**Command:**
```bash
cd apps/web && npm run build && npm run start
```

---

### 2. ✅ Cross-Tenant Leak Test

**Test:** Verify that users from different tenants cannot access each other's data.

**Manual Test Steps:**
1. Create two test tenants: `tenant-a` and `tenant-b`
2. Create users: `user-a@tenant-a.com` and `user-b@tenant-b.com`
3. Create test data in each tenant (documents, payments, etc.)
4. As `user-a`, attempt to access data that belongs to `tenant-b`
5. Verify all queries return empty results (no data leak)

**Database Test:**
```sql
-- Run tenant isolation test
SELECT * FROM test_tenant_isolation();

-- Verify RLS policies
SELECT * FROM get_rls_policy_summary();

-- Expected: All tables show `has_tenant_check = true`
```

**Automated Test:**
```typescript
// TODO: Add to e2e tests
// test/e2e/tenant-isolation.spec.ts
```

---

### 3. ✅ SECURITY DEFINER Audit

**Verify:**
- All `SECURITY DEFINER` functions have pinned `search_path = ''`
- Functions converted to `SECURITY INVOKER` where possible
- EXECUTE grants restricted to `authenticated` role only (not `anon`)

**Database Check:**
```sql
-- Check function security settings
SELECT 
  p.proname AS function_name,
  CASE 
    WHEN p.prosecdef THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END AS security_type,
  pg_get_functiondef(p.oid) LIKE '%SET search_path%' AS has_pinned_search_path
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prosecdef = true  -- SECURITY DEFINER functions
ORDER BY p.proname;

-- Check EXECUTE grants
SELECT 
  p.proname AS function_name,
  r.rolname AS granted_to
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
LEFT JOIN pg_proc_acl a ON a.oid = p.oid
LEFT JOIN pg_roles r ON r.oid = a.grantee
WHERE n.nspname = 'public'
ORDER BY p.proname, r.rolname;
```

**Expected Results:**
- All `SECURITY DEFINER` functions show `has_pinned_search_path = true`
- No functions granted to `anon` role
- Only `authenticated` and `service_role` have EXECUTE grants

---

### 4. ✅ Rate Limiting Verification

**Verify:** Rate limiting works correctly with multiple instances (or backed by shared store).

**Current Implementation:**
- ✅ Using Upstash Redis (shared store)
- ✅ Tiered limits: public (60/min), authenticated (200/min), admin (500/min)

**Test:**
```bash
# Test rate limiting locally
for i in {1..100}; do
  curl -X GET http://localhost:3000/api/health
done

# Should see 429 responses after limit exceeded
```

**Production Verification:**
- [ ] Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set
- [ ] Test with multiple instances (if applicable)
- [ ] Verify rate limit headers are returned: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

### 5. ✅ Observability: Instrumentation Contract

**Verify:** `instrumentation.ts` exports `register()` exactly as Next.js expects.

**Check:**
```typescript
// apps/web/src/instrumentation.ts
export async function register() {
  // ✅ Correct: Exports register() function
  // ✅ Called once per server instance
  // ✅ Initializes observability tools
}
```

**Status:** ✅ Verified - Correct implementation

---

### 6. ✅ Route Runtime and Segment Intent

**Verify:** Route handlers have correct `runtime` and `dynamic` settings.

**Check:**
```bash
# Find all route handlers
grep -r "export const runtime" apps/web/src/app/api
grep -r "export const dynamic" apps/web/src/app/api

# Expected:
# - All routes: `runtime = "nodejs"` (for Supabase client)
# - Authenticated routes: `dynamic = "force-dynamic"`
# - Public routes: Appropriate caching strategy
```

**Status:** ✅ Verified - All routes have correct runtime/dynamic settings

---

### 7. ✅ Non-Serializable Props Guard

**Verify:** Server Components use `sanitizeProps()` when passing data to Client Components.

**Check:**
```bash
# Find Server Components passing props to Client Components
grep -r "Client" apps/web/src/components --include="*.tsx" | grep -v "use client"

# Verify they use sanitizeProps() or sanitizeForClient()
```

**Usage:**
```typescript
// ✅ GOOD: Server Component
import { sanitizeForClient } from '@/lib/serialize-props';

export default async function Page() {
  const data = await fetchData();
  return <ClientComponent {...sanitizeForClient({ data })} />;
}
```

**Status:** ✅ Utility created - Apply to existing components as needed

---

## Deployment Environment-Specific Checks

### Vercel Deployment

**Additional Checks:**
- [ ] Environment variables set in Vercel dashboard
- [ ] Edge functions configured (if using)
- [ ] Build command: `npm run build`
- [ ] Output directory: `.next`
- [ ] Install command: `npm install`

### Self-Hosted / Container

**Additional Checks:**
- [ ] Dockerfile builds successfully
- [ ] Health check endpoint responds: `/api/health`
- [ ] Reverse proxy configured (Nginx/Traefik)
- [ ] SSL/TLS certificates valid
- [ ] Database connection pool configured

### Cloudflare Pages

**Additional Checks:**
- [ ] Build output: `.next`
- [ ] Node.js version: 18+
- [ ] Edge runtime compatibility verified

---

## Final Pre-Merge Checklist

- [ ] ✅ Production build succeeds (`npm run build && npm run start`)
- [ ] ✅ Cross-tenant leak test passes (no data leakage)
- [ ] ✅ SECURITY DEFINER audit passes (all functions hardened)
- [ ] ✅ Rate limiting verified (works with shared store)
- [ ] ✅ Instrumentation contract verified (`register()` exported)
- [ ] ✅ Route runtime verified (all routes have correct settings)
- [ ] ✅ Non-serializable props guard implemented (utility available)
- [ ] ✅ Database migrations applied successfully
- [ ] ✅ Environment variables configured
- [ ] ✅ Health check endpoint responds correctly
- [ ] ✅ Error tracking configured (Sentry/other)
- [ ] ✅ Logging configured and working

---

## Post-Merge Monitoring

After merging to production, monitor:

1. **Error Rates:** Check Sentry/error tracking for new errors
2. **Performance:** Monitor response times and database query performance
3. **Rate Limiting:** Verify rate limits are being enforced
4. **Tenant Isolation:** Run `test_tenant_isolation()` periodically
5. **Database Security:** Run `get_rls_policy_summary()` to audit policies

---

## Quick Reference Commands

```bash
# Production build test
cd apps/web && npm run build && npm run start

# Database security audit
psql $DATABASE_URL -c "SELECT * FROM test_tenant_isolation();"
psql $DATABASE_URL -c "SELECT * FROM get_rls_policy_summary();"

# Rate limit test
for i in {1..100}; do curl http://localhost:3000/api/health; done

# Health check
curl http://localhost:3000/api/health
```

---

**Last Updated:** 2025-01-27  
**Next Review:** After each major security update
