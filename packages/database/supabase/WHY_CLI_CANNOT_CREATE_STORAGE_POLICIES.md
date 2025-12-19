# Why Supabase CLI Cannot Create Storage RLS Policies

**Date:** 2025-01-27  
**Technical Explanation**

---

## 🔍 The Core Issue

### Permission Error

When attempting to create RLS policies on `storage.objects` via SQL migrations (including Supabase CLI), you encounter:

```
ERROR: must be owner of relation objects
```

This happens because:
1. **`storage.objects` is a system table** managed by Supabase's storage service
2. **Regular database users** (including migration users) don't have ownership rights
3. **Only the service role** (or superuser) can modify policies on this table

---

## 🏗️ Architecture Explanation

### How Supabase Storage Works

```
┌─────────────────────────────────────────┐
│   Supabase Storage Service              │
│   (Separate from PostgreSQL)            │
├─────────────────────────────────────────┤
│   • Manages file storage (S3/CDN)       │
│   • Handles uploads/downloads           │
│   • Controls bucket permissions         │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│   PostgreSQL Database                    │
│   (Metadata & RLS)                       │
├─────────────────────────────────────────┤
│   storage.buckets (table)               │
│   storage.objects (table) ← PROTECTED   │
│   RLS policies on storage.objects        │
└─────────────────────────────────────────┘
```

**Key Point:** `storage.objects` is owned by the **storage service**, not your database user.

---

## 🚫 Why CLI Migrations Fail

### 1. **Migration User Permissions**

Supabase CLI migrations run with your **database user** credentials, which:
- ✅ Can create tables, functions, indexes
- ✅ Can create RLS policies on **your tables**
- ❌ **Cannot** create policies on **system tables** like `storage.objects`

### 2. **Security Model**

Supabase intentionally restricts direct access to `storage.objects`:
- Prevents accidental policy changes
- Ensures storage service maintains control
- Requires explicit service role authentication

### 3. **What Actually Happens**

```sql
-- This works in migrations:
CREATE POLICY "test" ON public.my_table FOR SELECT TO authenticated;

-- This FAILS in migrations:
CREATE POLICY "test" ON storage.objects FOR SELECT TO authenticated;
-- ERROR: must be owner of relation objects
```

---

## ✅ What CLI CAN Do

### 1. **Create Storage Buckets** (via config.toml)

```toml
# supabase/config.toml
[storage.buckets.documents]
public = false
file_size_limit = "50MiB"
allowed_mime_types = ["application/pdf", "image/jpeg"]
```

Then run:
```bash
supabase seed buckets  # Creates buckets in local dev
```

**Note:** This works for **local development** but may have limitations in production.

### 2. **Create Buckets via SQL** (with service role)

```sql
-- This CAN work if you have service role access
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('documents', 'documents', false, 52428800);
```

**We successfully did this via Supabase MCP** because the MCP tool has elevated permissions.

### 3. **Create Policies on YOUR Tables**

```sql
-- This works fine:
CREATE POLICY "users_policy" ON public.users FOR SELECT TO authenticated;
```

---

## 🎯 Why Dashboard Works

### Dashboard Uses Service Role

The Supabase Dashboard:
1. Authenticates with **service role key** (elevated permissions)
2. Has **ownership** of `storage.objects` table
3. Can create/modify RLS policies directly

**This is why dashboard setup is required.**

---

## 🔧 Alternative Solutions

### Option 1: Dashboard (Recommended) ✅

**Pros:**
- ✅ Works reliably
- ✅ No permission issues
- ✅ Visual interface
- ✅ Immediate feedback

**Cons:**
- ❌ Manual process
- ❌ Not version-controlled (unless you document it)

**Status:** This is what we're using.

---

### Option 2: Management API

You can use Supabase Management API with service role:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://your-project.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY! // ⚠️ Service role only
)

// Create policy via API (if available)
// Note: Management API may not have direct policy creation endpoints
```

**Limitation:** Management API may not expose policy creation endpoints.

---

### Option 3: SQL Editor with Service Role

1. Go to **SQL Editor** in Dashboard
2. Run policy creation SQL directly
3. Uses service role automatically

**This is essentially the same as Dashboard UI, just via SQL.**

---

### Option 4: Supabase CLI with Service Role (Advanced)

**⚠️ Not Recommended** - Security Risk

You could theoretically:
1. Set `SUPABASE_SERVICE_ROLE_KEY` in environment
2. Use it in migrations
3. **BUT:** This exposes service role key in your codebase (BAD!)

**Why it's bad:**
- Service role bypasses ALL RLS
- Should never be in client code
- Should never be in version control
- Defeats security model

---

## 📊 Comparison Table

| Method | Buckets | Policies | Version Control | Security |
|--------|---------|----------|-----------------|----------|
| **CLI Migrations** | ⚠️ Limited | ❌ No | ✅ Yes | ✅ Safe |
| **Dashboard UI** | ✅ Yes | ✅ Yes | ❌ No | ✅ Safe |
| **SQL Editor** | ✅ Yes | ✅ Yes | ❌ No | ✅ Safe |
| **Management API** | ✅ Yes | ⚠️ Maybe | ✅ Yes | ⚠️ Service role |
| **Service Role in Migrations** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ **DANGEROUS** |

---

## 🎯 Best Practice Recommendation

### Hybrid Approach (What We're Doing)

1. **Buckets:** Create via SQL/MCP (if permissions allow) or Dashboard
   - ✅ We successfully created buckets via MCP
   
2. **Policies:** Create via Dashboard
   - ✅ Secure
   - ✅ Reliable
   - ✅ Documented in guides

3. **Documentation:** Track in version control
   - ✅ `STORAGE_POLICIES_SETUP.md`
   - ✅ `DASHBOARD_RLS_POLICIES_GUIDE.md`
   - ✅ SQL snippets for reference

---

## 🔍 Technical Deep Dive

### Why This Design?

Supabase separates concerns:

1. **Database Layer:** Your tables, your policies
2. **Storage Layer:** System-managed, service-controlled
3. **Security:** Prevents accidental policy changes

This is **intentional architecture**, not a bug.

### The `storage.objects` Table

```sql
-- This table is special:
CREATE TABLE storage.objects (
  id uuid PRIMARY KEY,
  bucket_id text NOT NULL,
  name text NOT NULL,
  owner uuid,
  created_at timestamptz,
  updated_at timestamptz,
  last_accessed_at timestamptz,
  metadata jsonb,
  -- ... more columns
);

-- Ownership (VERIFIED):
SELECT tableowner FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';
-- Result: 'supabase_storage_admin'

-- Your migration user: NO OWNERSHIP RIGHTS
-- Only 'supabase_storage_admin' can create policies
```

---

## ✅ Summary

### Why CLI Can't Do It

1. **Permission limitation:** `storage.objects` is owned by storage service
2. **Security design:** Intentional restriction to prevent accidental changes
3. **Architecture:** Storage is a separate service, not just a database table

### What Works

- ✅ **Dashboard:** Uses service role, has full permissions
- ✅ **SQL Editor:** Same as dashboard, just SQL interface
- ✅ **Buckets via SQL:** Works if you have service role access (we did via MCP)
- ❌ **Policies via CLI migrations:** Blocked by design

### Our Solution

- ✅ Buckets created via Supabase MCP (has service role access)
- ✅ Policies created via Dashboard (documented in guides)
- ✅ All configuration tracked in documentation

---

## 📚 References

- [Supabase Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase CLI Local Development](https://supabase.com/docs/guides/cli/local-development)
- [Storage RLS Policies](https://supabase.com/docs/guides/storage/security/access-control#row-level-security)

---

**Conclusion:** This is a **feature, not a bug**. The restriction ensures storage security and prevents accidental policy changes. Dashboard setup is the recommended approach.

*Document created: 2025-01-27*
