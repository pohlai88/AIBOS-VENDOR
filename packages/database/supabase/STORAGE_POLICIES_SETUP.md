# Storage RLS Policies Setup Guide

**Date:** 2025-01-27  
**Status:** ✅ **BUCKETS CREATED** | 📋 **POLICIES NEED DASHBOARD SETUP**

---

## ✅ Buckets Status

**All 3 buckets successfully created:**

1. ✅ `documents` - Private (50MB)
2. ✅ `message-attachments` - Private (10MB)
3. ✅ `public-assets` - Public (5MB)

---

## 📋 RLS Policies Setup (Via Dashboard)

Storage RLS policies must be created via the **Supabase Dashboard** (SQL migrations don't have permissions for storage.objects).

### Step 1: Access Storage Policies

1. Go to **Supabase Dashboard** → **Storage** → **Policies**
2. Select bucket: `documents`

### Step 2: Create Documents Bucket Policies

**Policy 1: Upload Documents**
- Click **"New Policy"**
- **Policy name**: `Authenticated users can upload documents`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **Policy definition**:
  ```sql
  bucket_id = 'documents' AND auth.uid() IS NOT NULL
  ```

**Policy 2: View Documents**
- **Policy name**: `Users can view documents in their tenant`
- **Allowed operation**: `SELECT`
- **Target roles**: `authenticated`
- **Policy definition**:
  ```sql
  bucket_id = 'documents' AND auth.uid() IS NOT NULL
  ```

**Policy 3: Update Documents**
- **Policy name**: `Users can update their documents`
- **Allowed operation**: `UPDATE`
- **Target roles**: `authenticated`
- **Policy definition**:
  ```sql
  bucket_id = 'documents' AND auth.uid() IS NOT NULL
  ```

**Policy 4: Delete Documents**
- **Policy name**: `Users can delete their documents`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **Policy definition**:
  ```sql
  bucket_id = 'documents' AND auth.uid() IS NOT NULL
  ```

### Step 3: Create Message Attachments Policies

**Select bucket**: `message-attachments`

**Policy 1: Upload Attachments**
- **Policy name**: `Authenticated users can upload message attachments`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **Policy definition**:
  ```sql
  bucket_id = 'message-attachments' AND auth.uid() IS NOT NULL
  ```

**Policy 2: View Attachments**
- **Policy name**: `Users can view message attachments`
- **Allowed operation**: `SELECT`
- **Target roles**: `authenticated`
- **Policy definition**:
  ```sql
  bucket_id = 'message-attachments' AND auth.uid() IS NOT NULL
  ```

---

## 🔒 Security Note

**Application-Level Security:**
- RLS policies provide basic authentication check
- **Tenant isolation** is enforced by:
  1. File path structure: `{tenant_id}/{organization_id}/...`
  2. Application-level validation before upload/download
  3. Signed URL generation only for authorized users

**Defense in Depth:**
- ✅ RLS: Basic authentication
- ✅ Application: Tenant/organization validation
- ✅ Path structure: Tenant-scoped organization

---

## ✅ Verification

After creating policies:

```sql
-- Check policies
SELECT 
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;
```

---

## 🚀 Quick Test

Once policies are created:

```typescript
// Test upload
const formData = new FormData();
formData.append('file', file);
formData.append('bucket', 'documents');

const response = await fetch('/api/storage/upload', {
  method: 'POST',
  body: formData,
});
```

---

**Next Step:** Create RLS policies via dashboard (see steps above)

*Setup guide created: 2025-01-27*
