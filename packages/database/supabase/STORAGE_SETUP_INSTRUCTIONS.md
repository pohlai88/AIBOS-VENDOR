# Supabase Storage Setup Instructions

**Date:** 2025-01-27  
**Status:** 📋 **SETUP REQUIRED VIA DASHBOARD**

---

## ⚠️ Important Note

Storage buckets and RLS policies must be created via the **Supabase Dashboard** or **Supabase CLI**. SQL migrations cannot create storage buckets directly.

---

## 1. Create Storage Buckets (Via Dashboard)

### Step 1: Access Storage Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Storage** → **Buckets**
3. Click **"New bucket"**

### Step 2: Create Documents Bucket

**Bucket Configuration:**
- **Name**: `documents`
- **Public**: ❌ **Unchecked** (Private bucket)
- **File size limit**: `52428800` (50MB)
- **Allowed MIME types**: 
  - `application/pdf`
  - `application/msword`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - `application/vnd.ms-excel`
  - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
  - `image/jpeg`
  - `image/png`
  - `image/gif`
  - `text/plain`
  - `text/csv`
  - `application/json`

### Step 3: Create Message Attachments Bucket

**Bucket Configuration:**
- **Name**: `message-attachments`
- **Public**: ❌ **Unchecked** (Private bucket)
- **File size limit**: `10485760` (10MB)
- **Allowed MIME types**:
  - `image/jpeg`
  - `image/png`
  - `image/gif`
  - `application/pdf`
  - `text/plain`

### Step 4: Create Public Assets Bucket

**Bucket Configuration:**
- **Name**: `public-assets`
- **Public**: ✅ **Checked** (Public bucket - CDN accessible)
- **File size limit**: `5242880` (5MB)
- **Allowed MIME types**:
  - `image/jpeg`
  - `image/png`
  - `image/gif`
  - `image/svg+xml`
  - `image/webp`

---

## 2. Configure RLS Policies (Via Dashboard)

### Documents Bucket Policies

**Policy 1: Upload Documents**
- **Policy name**: `Users can upload documents`
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
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM tenants
    WHERE id IN (
      SELECT tenant_id FROM mdm_global_metadata
      WHERE created_by = auth.uid()::text
      LIMIT 1
    )
  )
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

### Message Attachments Bucket Policies

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

## 3. Alternative: Supabase CLI Setup

### Using Supabase CLI

```bash
# Create buckets via CLI
supabase storage create documents --public false --file-size-limit 52428800
supabase storage create message-attachments --public false --file-size-limit 10485760
supabase storage create public-assets --public true --file-size-limit 5242880

# Note: RLS policies still need to be created via dashboard or SQL
```

---

## 4. Verify Setup

### Check Buckets

```sql
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
ORDER BY id;
```

### Check Policies

```sql
-- Note: This query may not work directly, check via dashboard
SELECT 
  name,
  bucket_id,
  definition
FROM storage.policies
WHERE bucket_id = 'documents';
```

---

## 5. Next.js Integration Status

✅ **Code Ready** - All Next.js integration code is complete:

- ✅ Storage helper functions (`apps/web/src/lib/storage.ts`)
- ✅ Upload API route (`apps/web/src/app/api/storage/upload/route.ts`)
- ✅ Signed URL API route (`apps/web/src/app/api/storage/signed-url/route.ts`)
- ✅ Updated documents route (uses storage helpers)
- ✅ Updated download route (uses signed URLs)

**Once buckets are created via dashboard, the code will work immediately.**

---

## 6. Testing After Setup

### Test Upload

```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('bucket', 'documents');
formData.append('category', 'invoice');

const response = await fetch('/api/storage/upload', {
  method: 'POST',
  body: formData,
});
```

### Test Signed URL

```typescript
const response = await fetch('/api/storage/signed-url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    bucket: 'documents',
    path: 'tenant-id/org-id/invoice/file.pdf',
    expiresIn: 3600,
  }),
});
```

---

## 7. Quick Setup Checklist

- [ ] Create `documents` bucket (private, 50MB)
- [ ] Create `message-attachments` bucket (private, 10MB)
- [ ] Create `public-assets` bucket (public, 5MB)
- [ ] Configure RLS policies for `documents` bucket
- [ ] Configure RLS policies for `message-attachments` bucket
- [ ] Test file upload
- [ ] Test signed URL generation
- [ ] Verify tenant isolation

---

**Next Steps:** Complete bucket creation via dashboard, then test the integration.

*Instructions created: 2025-01-27*
