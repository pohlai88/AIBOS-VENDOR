# Production Readiness Checklist

This document verifies production correctness and operability based on Next.js 16 best practices.

## ✅ Verified Production Readiness Items

### 1. Caching Strategy ✅

#### A. `unstable_cache` Status
- ✅ **Current**: Using `unstable_cache` with tag-based invalidation
- ⚠️ **Note**: `unstable_cache` is experimental. Next.js recommends Cache Components + `use cache` directive as the forward path
- 📋 **Backlog**: Migrate hot paths from `unstable_cache` → Cache Components once stable

#### B. Auth/Cookie-Derived Results ✅
- ✅ **Verified**: All cached functions take `tenantId`/`userId` as explicit arguments
- ✅ **Verified**: No cached functions read auth from closure
- ✅ **Pattern**: `getDocuments()` requires `requireAuth()` which provides explicit `tenantId`

**Example:**
```tsx
// ✅ GOOD: Explicit tenantId in cache key
const cacheKey = `documents-${user.tenantId}-${user.organizationId}`

// ❌ BAD: Would read from closure (we don't do this)
const cacheKey = `documents` // Missing tenant isolation
```

#### C. Tag Invalidation Coverage ✅
- ✅ **Verified**: Mutations invalidate all relevant tags:
  - `documents` (general)
  - `documents:tenant:{tenantId}` (tenant-specific)
  - `documents:org:{orgId}` (org-specific)
  - `documents:{id}` (document-specific)
- ✅ **Verified**: Path revalidation for page-level updates
- ✅ **Coverage**: List views, detail views, and stats cards all use same tags

### 2. App Router UX Contract ✅

#### A. `global-error.tsx` Requirements ✅
- ✅ **Verified**: File starts with `'use client'`
- ✅ **Verified**: Includes `<html>` and `<body>` tags
- ✅ **Verified**: Does NOT export `metadata` or `generateMetadata`
- ✅ **Verified**: Renders complete HTML structure

#### B. Expected Errors vs Exceptions ✅
- ✅ **Verified**: Server Actions return structured results for expected errors
- ✅ **Pattern**: Validation errors return `{ success: false, error: string }`
- ✅ **Pattern**: Only truly exceptional cases throw (caught and logged)

**Example:**
```tsx
// ✅ GOOD: Expected error as structured result
if (!id) {
  return { success: false, error: 'Document ID is required' }
}

// ✅ GOOD: Exception caught and logged
try {
  // ... operation
} catch (error) {
  logError('[Server Action] Error', error)
  return { success: false, error: 'Internal server error' }
}
```

### 3. RSC Boundary Hardening ✅

#### A. Server-Only Enforcement ✅
- ✅ **Verified**: All data-fetching modules have `'server-only'` import
- ✅ **Verified**: Server Actions have `'server-only'` import
- ✅ **Verified**: Runtime assertions in critical modules

#### B. Barrel Export Check ✅
- ✅ **Verified**: No `index.ts` barrel exports found in `src/lib/`
- ✅ **Verified**: Direct imports prevent boundary leaks
- ✅ **Pattern**: Explicit imports from specific files

### 4. Observability ✅

#### A. Instrumentation Hook ✅
- ✅ **Created**: `src/instrumentation.ts` for server startup initialization
- ✅ **Created**: `src/lib/observability.ts` with correlation IDs and timing utilities
- ✅ **Ready**: Integration points for Sentry, APM, and log aggregation

#### B. Request Tracing ✅
- ✅ **Implemented**: `getCorrelationId()` for request tracking
- ✅ **Pattern**: Correlation IDs can be added to all Server Actions and Route Handlers
- ✅ **Ready**: Performance timers for DB queries and operations

### 5. Route Segment Configs ✅

#### Critical Routes with Explicit Configs:

**Authenticated Routes (force-dynamic):**
- ✅ `app/(protected)/dashboard/page.tsx` - `dynamic = "force-dynamic"`
- ✅ `app/(protected)/documents/page.tsx` - `dynamic = "force-dynamic"`
- ✅ `app/(protected)/messages/page.tsx` - `dynamic = "force-dynamic"`
- ✅ `app/(protected)/payments/page.tsx` - `dynamic = "force-dynamic"`
- ✅ `app/(protected)/statements/page.tsx` - `dynamic = "force-dynamic"`

**API Routes:**
- ✅ `app/api/documents/route.ts` - Uses `authenticatedRouteConfig`
- ✅ All authenticated API routes use `withAuth()` wrapper with config

**Note**: Public routes can use default caching behavior.

### 6. Security Headers ✅

#### A. Security Headers in `next.config.js` ✅
- ✅ **Verified**: Content-Security-Policy configured
- ✅ **Verified**: Strict-Transport-Security (HSTS)
- ✅ **Verified**: X-Frame-Options: DENY
- ✅ **Verified**: X-Content-Type-Options: nosniff
- ✅ **Verified**: Referrer-Policy configured
- ✅ **Verified**: Permissions-Policy configured

#### B. Rate Limiting ✅
- ✅ **Verified**: Rate limiting implemented in `middleware.ts`
- ✅ **Verified**: Tiered rate limits (public, authenticated, admin)
- ✅ **Verified**: Rate limit headers in responses

### 7. Bundle Discipline ✅

#### A. Server-Only Enforcement ✅
- ✅ **Verified**: Data-fetching functions marked with `'server-only'`
- ✅ **Verified**: Server Actions marked with `'server-only'`
- ✅ **Verified**: No server code in client bundles

#### B. Dynamic Imports ✅
- ✅ **Pattern**: Heavy client components can use `next/dynamic`
- ✅ **Pattern**: Analytics loaded dynamically (non-blocking)
- ✅ **Pattern**: Webhooks triggered asynchronously

## 🧪 Test Plan

### 1. Cross-Tenant Cache Isolation Test
**Test**: Hit same page with two different tenant IDs
**Expected**: No shared data between tenants
**How to Test**:
```bash
# Login as Tenant A, view documents
# Login as Tenant B, view documents
# Verify Tenant B cannot see Tenant A's documents
```

### 2. Tag Invalidation Test
**Test**: Mutate a document and verify all views update
**Expected**: List, detail, and stats all reflect changes without manual refresh
**How to Test**:
1. View documents list
2. Delete a document via Server Action
3. Verify list updates immediately (optimistic)
4. Verify stats card updates after refresh
5. Verify detail page shows 404 for deleted document

### 3. RSC Boundary Test
**Test**: Intentionally import server module in client component
**Expected**: Build/dev error with clear message
**How to Test**:
```tsx
// In a client component, try:
import { getDocuments } from '@/lib/data-fetching'
// Should fail with server-only error
```

### 4. Global Error Test
**Test**: Throw error in root layout
**Expected**: `global-error.tsx` catches and renders
**How to Test**:
```tsx
// Temporarily add to root layout:
throw new Error('Test global error')
// Should render global-error.tsx
```

### 5. Server Action Error Handling Test
**Test**: Trigger validation errors in Server Actions
**Expected**: Structured error responses, not exceptions
**How to Test**:
1. Call `deleteDocument` with invalid ID
2. Verify returns `{ success: false, error: '...' }`
3. Verify no uncaught exceptions

## 📋 Migration Backlog

### High Priority
- [ ] **Cache Components Migration**: Migrate hot paths from `unstable_cache` to Cache Components + `use cache` directive once stable
- [ ] **Correlation IDs**: Add correlation IDs to all Server Actions and Route Handlers
- [ ] **Performance Monitoring**: Add DB query timing to all data-fetching functions

### Medium Priority
- [ ] **Bundle Analysis**: Run `@next/bundle-analyzer` and optimize large dependencies
- [ ] **Route Segment Configs**: Add explicit configs to remaining routes
- [ ] **Error Reporting**: Centralize error reporting for all Server Actions

### Low Priority
- [ ] **SEO Enhancements**: Add `generateMetadata()` to dynamic routes
- [ ] **OpenGraph Images**: Add OG images for shareable pages
- [ ] **Sitemap Enhancement**: Add dynamic routes to sitemap

## 🔒 Security Verification

### Multi-Tenant Isolation ✅
- ✅ All cache keys include `tenantId`
- ✅ All DB queries filter by `tenantId`
- ✅ RLS policies enforce tenant isolation at database level
- ✅ Server Actions verify tenant access before operations

### Input Validation ✅
- ✅ Server Actions validate all inputs
- ✅ Route Handlers use validation utilities
- ✅ Type-safe parameters throughout

### Authorization ✅
- ✅ All authenticated routes check permissions
- ✅ Server Actions verify user can perform action
- ✅ Route Handlers use `withAuth()` wrapper

## 📊 Performance Metrics

### Current Optimizations
- ✅ Request memoization with `cache()`
- ✅ Persistent caching with `unstable_cache()`
- ✅ Tag-based invalidation
- ✅ Optimistic mutations
- ✅ Parallel data fetching
- ✅ Server Components by default

### Monitoring Points
- Request duration (via instrumentation)
- Cache hit rates (future: add metrics)
- DB query performance (via timers)
- Error rates (via Sentry/error tracking)

## 🚀 Deployment Checklist

Before deploying to production:

- [x] All tests pass
- [x] No linter errors
- [x] Security headers configured
- [x] Rate limiting enabled
- [x] Error boundaries in place
- [x] Observability initialized
- [x] Cache invalidation verified
- [x] Multi-tenant isolation verified
- [ ] Load testing completed
- [ ] Monitoring dashboards configured
- [ ] Error alerting configured

---

**Last Updated:** 2025-01-XX  
**Status:** ✅ Production Ready (with noted migration backlog)
