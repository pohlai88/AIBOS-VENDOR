# Supabase Storage - Authentication Recommendation

**Date:** 2025-01-27  
**Status:** ✅ **RECOMMENDATION COMPLETE**

---

## Executive Summary

**✅ Recommendation: Use Supabase Auth Directly + Internal React Hooks**

- **Supabase Auth is REQUIRED** (RLS policies depend on `auth.uid()`)
- **Internal React hooks IMPROVE DX** (consistency, type safety)
- **Hybrid approach is BEST** (secure server + convenient client)

---

## Analysis Results

### ✅ Supabase Auth is Required

**Reason:** All RLS policies use `auth.uid()`

**Verified:**
- ✅ 6/6 storage policies depend on `auth.uid()`
- ✅ Cannot bypass Supabase Auth
- ✅ Database-level security requires it

**Conclusion:** Must use Supabase Auth - no alternative.

---

### ✅ Current Implementation is Secure

**Server-Side Pattern:**
- ✅ Uses `requireAuth()` wrapper
- ✅ API routes handle storage operations
- ✅ No client-side token exposure
- ✅ RLS policies enforced automatically

**Status:** Keep this pattern - it's correct.

---

### ⚠️ Client-Side Needs Standardization

**Current Issues:**
- ⚠️ Direct Supabase client usage in components
- ⚠️ No standardized React hook
- ⚠️ Inconsistent auth pattern

**Solution:** Add internal React hooks for consistency.

---

## Recommended Architecture

### Server-Side (Keep Current) ✅

```
API Routes → requireAuth() → Supabase Auth → RLS Policies
```

**Files:**
- `apps/web/src/lib/auth.ts` - Server-side auth utilities
- `apps/web/src/app/api/storage/upload/route.ts` - Uses `requireAuth()`
- `apps/web/src/app/api/storage/signed-url/route.ts` - Uses `requireAuth()`

**Status:** ✅ No changes needed

---

### Client-Side (Add Hooks) ✅

```
React Components → useAuth() / useStorage() → API Routes → Supabase Auth
```

**New Files:**
- `apps/web/src/hooks/useAuth.ts` - Client-side auth hook ✅ Created
- `apps/web/src/hooks/useStorage.ts` - Client-side storage hook ✅ Created

**Status:** ✅ Hooks created and ready to use

---

## Implementation Status

### ✅ Created

1. **`useAuth` Hook**
   - Client-side authentication state
   - User data management
   - Auth state change listening
   - Error handling

2. **`useStorage` Hook**
   - File upload with progress
   - Signed URL generation
   - Public URL generation
   - Error handling

### ✅ Existing (Keep)

1. **Server-Side Auth**
   - `requireAuth()` function
   - API route authentication
   - RLS policy enforcement

2. **Storage Helpers**
   - Server-side storage functions
   - Image transformations
   - Cache control

---

## Usage Examples

### Client Component with useAuth

```tsx
"use client";

import { useAuth } from "@/hooks/useAuth";

export function MyComponent() {
  const { user, loading, error } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>Not authenticated</div>;

  return <div>Hello {user.email}</div>;
}
```

### Client Component with useStorage

```tsx
"use client";

import { useStorage } from "@/hooks/useStorage";
import { useState } from "react";

export function UploadComponent() {
  const { uploadFile, uploading, progress } = useStorage();
  const [result, setResult] = useState(null);

  const handleUpload = async (file: File) => {
    try {
      const data = await uploadFile("documents", file, {
        category: "invoice",
        onProgress: (p) => console.log(`${p}%`),
      });
      setResult(data);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div>
      {uploading && <div>Uploading... {progress}%</div>}
      <input
        type="file"
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
      />
      {result && <div>Uploaded: {result.fileUrl}</div>}
    </div>
  );
}
```

### Server Component (No Changes)

```tsx
// Server Component - no changes needed
import { getCurrentUser } from "@/lib/auth";

export async function ServerComponent() {
  const user = await getCurrentUser();
  // ... use user data
}
```

---

## Benefits of This Approach

### ✅ Security

- **Server-side auth** - No token exposure
- **RLS enforcement** - Database-level security
- **API route validation** - Additional security layer

### ✅ Developer Experience

- **Consistent API** - Same pattern everywhere
- **Type safety** - Full TypeScript support
- **Easy to use** - Simple React hooks
- **Progress tracking** - Built-in upload progress

### ✅ Maintainability

- **Single source of truth** - Supabase Auth
- **Clear separation** - Server vs client
- **Reusable hooks** - Share across components

---

## Migration Guide

### Step 1: Use New Hooks in New Components

**Start using hooks in new client components:**

```tsx
// New component
import { useAuth } from "@/hooks/useAuth";
import { useStorage } from "@/hooks/useStorage";
```

### Step 2: Gradually Refactor Existing Components (Optional)

**Update existing components to use hooks:**

```tsx
// Before
const supabase = createClient();
const { data: { session } } = await supabase.auth.getSession();

// After
const { user, loading } = useAuth();
```

### Step 3: Keep Server-Side Pattern (No Changes)

**No changes needed to:**
- API routes
- Server components
- Server-side auth utilities

---

## Summary

### ✅ Final Recommendation

**Use Supabase Auth Directly + Internal React Hooks**

**Why:**
1. **Supabase Auth is required** (RLS dependency)
2. **Current server-side is secure** (keep it)
3. **Hooks improve DX** (consistency, type safety)

**What to Do:**
1. ✅ Keep server-side auth (no changes)
2. ✅ Use new hooks in client components
3. ⚠️ Optionally refactor existing components

**Result:**
- ✅ Secure (server-side auth)
- ✅ Convenient (client-side hooks)
- ✅ Consistent (standardized pattern)

---

*Last Updated: 2025-01-27*
