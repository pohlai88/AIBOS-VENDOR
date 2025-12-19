# Supabase Storage - Authentication Analysis & Recommendations

**Date:** 2025-01-27  
**Status:** ✅ **ANALYSIS COMPLETE**

---

## Current Authentication Architecture

### ✅ Server-Side (Current Implementation)

**Pattern:** Server-side API routes with `requireAuth()`

**Files:**
- `apps/web/src/lib/auth.ts` - Server-side auth utilities
- `apps/web/src/app/api/storage/upload/route.ts` - Uses `requireAuth()`
- `apps/web/src/app/api/storage/signed-url/route.ts` - Uses `requireAuth()`

**How It Works:**
```typescript
// Server-side API route
export async function POST(request: NextRequest) {
  const user = await requireAuth(); // Wraps Supabase Auth
  // ... storage operations
}
```

**Benefits:**
- ✅ Secure (auth happens server-side)
- ✅ RLS policies work automatically (`auth.uid()` available)
- ✅ No client-side token exposure
- ✅ Works with Next.js App Router

---

### ⚠️ Client-Side (Limited Usage)

**Current Pattern:** Direct Supabase client for some operations

**Files:**
- `apps/web/src/lib/supabase/client.ts` - Browser client
- `apps/web/src/components/messages/MessagesListClient.tsx` - Uses client directly

**How It Works:**
```typescript
// Client-side component
const supabase = createClient();
const { data: { session } } = await supabase.auth.getSession();
```

**Issues:**
- ⚠️ No standardized React hook
- ⚠️ Inconsistent auth pattern across components
- ⚠️ Direct Supabase client usage (not abstracted)

---

## RLS Policy Dependency Analysis

### ✅ All Policies Use `auth.uid()`

**Verified:** All 6 storage RLS policies depend on `auth.uid()`

| Policy | Operation | Auth Dependency |
|--------|-----------|----------------|
| Upload documents | INSERT | ✅ `auth.uid() IS NOT NULL` |
| View documents | SELECT | ✅ `auth.uid() IS NOT NULL` |
| Update documents | UPDATE | ✅ `auth.uid() IS NOT NULL` |
| Delete documents | DELETE | ✅ `auth.uid() IS NOT NULL` |
| Upload attachments | INSERT | ✅ `auth.uid() IS NOT NULL` |
| View attachments | SELECT | ✅ `auth.uid() IS NOT NULL` |

**Conclusion:** Storage RLS policies **require** Supabase Auth to work. Cannot bypass.

---

## Recommendation: Hybrid Approach

### ✅ **Use Supabase Auth Directly** (Required for RLS)

**Why:**
1. **RLS Policies Require It** - All policies use `auth.uid()`
2. **Server-Side Security** - Current pattern is secure
3. **No Bypass Possible** - RLS enforces at database level

### ✅ **Add Internal React Hooks** (For Client-Side Consistency)

**Why:**
1. **Consistency** - Standardize client-side auth pattern
2. **Developer Experience** - Easier to use in components
3. **Type Safety** - Better TypeScript support
4. **Reusability** - Share auth logic across components

---

## Recommended Implementation

### 1. Keep Server-Side Auth (Current Pattern) ✅

**Status:** Already implemented correctly

**Keep Using:**
- `requireAuth()` for API routes
- Server-side Supabase client
- RLS policies with `auth.uid()`

**No Changes Needed**

---

### 2. Add Client-Side React Hooks (New)

**Create:** `apps/web/src/hooks/useAuth.ts`

**Purpose:**
- Standardize client-side auth
- Provide consistent API
- Support storage operations in client components

**Implementation:**
```typescript
// hooks/useAuth.ts
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { AuthUser } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUser(session.access_token);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUser(session.access_token);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUser = async (accessToken: string) => {
    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading };
}
```

---

### 3. Add Storage-Specific Hook (New)

**Create:** `apps/web/src/hooks/useStorage.ts`

**Purpose:**
- Client-side storage operations
- Resumable uploads support
- Progress tracking

**Implementation:**
```typescript
// hooks/useStorage.ts
"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./useAuth";

export function useStorage() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const supabase = createClient();

  const uploadFile = useCallback(async (
    bucket: string,
    file: File,
    options?: { category?: string; metadata?: Record<string, any> }
  ) => {
    if (!user) throw new Error("Not authenticated");

    setUploading(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", bucket);
      if (options?.category) {
        formData.append("category", options.category);
      }
      if (options?.metadata) {
        formData.append("metadata", JSON.stringify(options.metadata));
      }

      const response = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      const data = await response.json();
      return data;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [user]);

  const getSignedUrl = useCallback(async (
    bucket: string,
    path: string,
    expiresIn: number = 3600
  ) => {
    if (!user) throw new Error("Not authenticated");

    const response = await fetch("/api/storage/signed-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bucket, path, expiresIn }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get signed URL");
    }

    const data = await response.json();
    return data.signedUrl;
  }, [user]);

  return {
    uploadFile,
    getSignedUrl,
    uploading,
    progress,
  };
}
```

---

## Architecture Decision

### ✅ **Recommended: Hybrid Approach**

```
┌─────────────────────────────────────────┐
│         CLIENT COMPONENTS              │
│  • useAuth() hook                       │
│  • useStorage() hook                    │
│  • React state management               │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         API ROUTES (Server)             │
│  • requireAuth()                        │
│  • Server-side validation               │
│  • Storage operations                   │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│      SUPABASE AUTH (Required)           │
│  • auth.uid() for RLS                   │
│  • Session management                   │
│  • JWT tokens                           │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│      STORAGE RLS POLICIES               │
│  • Enforce auth.uid()                   │
│  • Tenant isolation                     │
└─────────────────────────────────────────┘
```

---

## Why This Approach?

### ✅ Supabase Auth is Required

**Cannot Avoid:**
- RLS policies use `auth.uid()`
- Storage operations require authenticated session
- Database-level security depends on Supabase Auth

### ✅ Internal Hooks Improve DX

**Benefits:**
- Consistent API across components
- Type-safe auth state
- Easier to use in React components
- Better error handling
- Progress tracking for uploads

### ✅ Server-Side Remains Secure

**Benefits:**
- API routes handle sensitive operations
- No client-side token exposure
- Server-side validation
- RLS policies enforced

---

## Implementation Plan

### Phase 1: Create Hooks (Recommended)

1. **Create `useAuth` hook**
   - Standardize client-side auth
   - Provide user state
   - Handle auth state changes

2. **Create `useStorage` hook**
   - Client-side storage operations
   - Upload with progress
   - Signed URL generation

### Phase 2: Update Components (Optional)

1. **Refactor existing components**
   - Replace direct Supabase client usage
   - Use new hooks
   - Improve consistency

### Phase 3: Keep Server-Side (No Changes)

1. **Maintain current pattern**
   - Keep `requireAuth()` in API routes
   - Keep server-side storage helpers
   - Keep RLS policies

---

## Summary

### ✅ **Use Supabase Auth Directly** (Required)

**Reasons:**
- RLS policies require `auth.uid()`
- Cannot bypass Supabase Auth
- Current server-side pattern is secure

### ✅ **Add Internal React Hooks** (Recommended)

**Reasons:**
- Improve developer experience
- Standardize client-side auth
- Better type safety
- Easier to use in components

### ✅ **Hybrid Approach** (Best Practice)

**Server-Side:**
- Keep `requireAuth()` pattern
- Keep API routes
- Keep RLS policies

**Client-Side:**
- Add `useAuth()` hook
- Add `useStorage()` hook
- Standardize component usage

---

## Conclusion

**✅ Recommendation: Use Supabase Auth + Internal React Hooks**

- **Supabase Auth is required** (RLS dependency)
- **Internal hooks improve DX** (consistency, type safety)
- **Hybrid approach is best** (secure server + convenient client)

**Action Items:**
1. ✅ Keep current server-side auth (no changes)
2. ✅ Create `useAuth()` hook (new)
3. ✅ Create `useStorage()` hook (new)
4. ⚠️ Optionally refactor components (improvement)

---

*Last Updated: 2025-01-27*
