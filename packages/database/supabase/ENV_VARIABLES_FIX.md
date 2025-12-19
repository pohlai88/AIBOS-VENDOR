# Environment Variables Fix

**Date:** 2025-01-27  
**Issue:** Missing Supabase environment variables  
**Status:** 🔧 **FIXING**

---

## Error Found

**Error Message:**
```
Missing Supabase environment variables. Please check your .env.local file.
```

**Location:** `apps/web/src/lib/supabase/server.ts:14`

---

## Required Environment Variables

**You need to create `apps/web/.env.local` with:**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://vrawceruzokxitybkufk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## Solution

**I'll help you:**
1. Get your Supabase credentials
2. Create/update `.env.local` file
3. Restart dev server

---

**Last Updated:** 2025-01-27  
**Status:** 🔧 **FIXING ENV VARIABLES**
