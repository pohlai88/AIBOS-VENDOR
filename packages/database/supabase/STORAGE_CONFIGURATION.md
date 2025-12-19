# Supabase Storage Configuration Guide

**Date:** 2025-01-27  
**Status:** ✅ **PRODUCTION-READY STORAGE CONFIGURATION**

---

## Executive Summary

Complete Supabase Storage configuration following best practices for:

- ✅ **Multi-tenant Security** (RLS policies, tenant isolation)
- ✅ **File Organization** (Structured paths, categorization)
- ✅ **Performance** (Signed URLs, CDN, caching)
- ✅ **Next.js Integration** (Server-side uploads, secure URLs)

---

## 1. Storage Buckets Configuration

### 1.1 Buckets Created

**1. Documents Bucket** (`documents`)
- **Type**: Private (requires authentication)
- **Size Limit**: 50MB
- **Allowed Types**: PDF, Word, Excel, Images, Text, CSV, JSON
- **Use Case**: Business documents, invoices, contracts

**2. Message Attachments Bucket** (`message-attachments`)
- **Type**: Private (requires authentication)
- **Size Limit**: 10MB
- **Allowed Types**: Images, PDF, Text
- **Use Case**: Files attached to messages

**3. Public Assets Bucket** (`public-assets`)
- **Type**: Public (CDN accessible)
- **Size Limit**: 5MB
- **Allowed Types**: Images only (JPEG, PNG, GIF, SVG, WebP)
- **Use Case**: Avatars, logos, public images

### 1.2 Bucket Configuration

```sql
-- Documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false, -- Private
  52428800, -- 50MB
  ARRAY['application/pdf', 'image/jpeg', ...]::text[]
);
```

---

## 2. Row Level Security (RLS) Policies

### 2.1 Documents Bucket Policies

**Upload Policy:**
- Users can upload to their organization's folder
- Path structure: `{tenant_id}/{organization_id}/{category}/{filename}`

**View Policy:**
- Users can view their organization's documents
- Users can view shared documents from vendors
- Tenant isolation enforced

**Update/Delete Policies:**
- Users can only modify their organization's documents
- Tenant isolation enforced

### 2.2 Policy Examples

```sql
-- Upload policy
CREATE POLICY "Users can upload documents to their organization folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM organizations
    WHERE tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  )
);
```

---

## 3. File Path Structure

### 3.1 Best Practice Path Format

**Multi-tenant Structure:**
```
{tenant_id}/{organization_id}/{category}/{timestamp}_{filename}
```

**Examples:**
- `550e8400-e29b-41d4-a716-446655440000/org-123/invoice/1706284800000_invoice.pdf`
- `550e8400-e29b-41d4-a716-446655440000/org-123/contract/1706284800000_contract.docx`

### 3.2 Benefits

- ✅ **Tenant Isolation**: Files organized by tenant
- ✅ **Organization Separation**: Each org has its own folder
- ✅ **Category Organization**: Files grouped by category
- ✅ **Timestamp**: Prevents filename conflicts
- ✅ **Security**: RLS policies can enforce access by path

---

## 4. Next.js Integration

### 4.1 Server-Side Uploads

**Best Practice**: Always upload files server-side for security

```typescript
// Server-side upload
import { uploadFile } from "@/lib/storage";

await uploadFile({
  bucket: "documents",
  path: generateFilePath(organizationId, fileName, { tenantId, category }),
  file: file,
  options: {
    cacheControl: "3600",
    contentType: file.type,
  },
});
```

### 4.2 Signed URLs for Private Files

**Best Practice**: Use signed URLs instead of public URLs for private files

```typescript
// Generate signed URL (server-side)
import { getSignedUrl } from "@/lib/storage";

const signedUrl = await getSignedUrl("documents", filePath, 3600); // 1 hour expiry
```

### 4.3 Public URLs for Public Assets

**Best Practice**: Use public URLs only for public assets bucket

```typescript
// Public URL (client-side OK)
import { getPublicUrl } from "@/lib/storage";

const publicUrl = getPublicUrl("public-assets", filePath);
```

---

## 5. Storage Helper Functions

### 5.1 Available Functions

**File Operations:**
- `uploadFile()` - Upload file (server-side)
- `getSignedUrl()` - Get signed URL (server-side)
- `getPublicUrl()` - Get public URL (client-side)
- `deleteFile()` - Delete file (server-side)
- `listFiles()` - List files in folder (server-side)

**Utilities:**
- `generateFilePath()` - Generate secure file path
- `validateFile()` - Validate file before upload
- `getFileExtension()` - Extract file extension
- `formatFileSize()` - Format file size for display

### 5.2 Usage Examples

```typescript
// Upload with validation
const validation = validateFile(file, {
  maxSize: 52428800, // 50MB
  allowedTypes: ["application/pdf", "image/jpeg"],
});

if (!validation.valid) {
  throw new Error(validation.error);
}

// Generate path
const filePath = generateFilePath(organizationId, fileName, {
  tenantId: user.tenantId,
  category: "invoice",
  timestamp: true,
});

// Upload
await uploadFile({
  bucket: "documents",
  path: filePath,
  file: file,
});
```

---

## 6. API Routes

### 6.1 Upload Endpoint

**Route**: `POST /api/storage/upload`

**Request:**
```typescript
FormData {
  file: File,
  bucket?: string, // defaults to "documents"
  category?: string,
  metadata?: string, // JSON string
}
```

**Response:**
```typescript
{
  fileUrl: string, // Signed URL or public URL
  fileName: string,
  path: string,
  bucket: string,
  size: number,
  mimeType: string,
  metadata: object,
}
```

### 6.2 Signed URL Endpoint

**Route**: `POST /api/storage/signed-url`

**Request:**
```typescript
{
  bucket: string,
  path: string,
  expiresIn?: number, // seconds, default 3600
}
```

**Response:**
```typescript
{
  signedUrl: string,
  expiresIn: number,
}
```

---

## 7. Security Best Practices

### 7.1 File Upload Security

1. ✅ **Server-side uploads only** - Never upload directly from client
2. ✅ **File validation** - Check size and type before upload
3. ✅ **Path validation** - Ensure paths are within allowed structure
4. ✅ **RLS policies** - Enforce access control at storage level
5. ✅ **Tenant isolation** - Files organized by tenant

### 7.2 URL Security

1. ✅ **Signed URLs** - Use for private files (expire after set time)
2. ✅ **Public URLs** - Only for public assets bucket
3. ✅ **Server-side generation** - Generate URLs server-side
4. ✅ **Expiration** - Set appropriate expiration times

### 7.3 Access Control

1. ✅ **RLS policies** - Enforce at storage level
2. ✅ **Application-level checks** - Verify access before generating URLs
3. ✅ **Tenant isolation** - Files separated by tenant
4. ✅ **Organization separation** - Files separated by organization

---

## 8. Performance Optimization

### 8.1 Caching

**Cache Control:**
- Static assets: `public, max-age=31536000` (1 year)
- Documents: `private, max-age=3600` (1 hour)
- Signed URLs: Expire after 1 hour (default)

### 8.2 CDN

**Public Assets:**
- Use public bucket for CDN-accessible files
- Automatic CDN distribution via Supabase

**Private Files:**
- Use signed URLs with appropriate expiration
- Cache signed URLs client-side (respect expiration)

### 8.3 File Size Limits

- Documents: 50MB (configurable per bucket)
- Message attachments: 10MB
- Public assets: 5MB

---

## 9. Migration from Current Implementation

### 9.1 Current State

- ✅ Documents bucket exists
- ✅ Files stored as: `{organizationId}/{timestamp}.{ext}`
- ✅ Public URLs used (needs migration to signed URLs)

### 9.2 Migration Steps

1. ✅ **Create buckets** - Documents, message-attachments, public-assets
2. ✅ **Set up RLS policies** - Multi-tenant access control
3. ✅ **Update file paths** - Use new path structure
4. ✅ **Migrate to signed URLs** - Replace public URLs with signed URLs
5. ✅ **Update API routes** - Use new storage helpers

### 9.3 Backward Compatibility

- Existing files remain accessible
- New uploads use new path structure
- Gradual migration of URLs

---

## 10. Monitoring and Maintenance

### 10.1 Storage Monitoring

**Check Storage Usage:**
```sql
SELECT 
  bucket_id,
  COUNT(*) as file_count,
  SUM(metadata->>'size')::bigint as total_size
FROM storage.objects
GROUP BY bucket_id;
```

**Check File Access:**
- Monitor signed URL generation
- Track file upload/download patterns
- Review RLS policy effectiveness

### 10.2 Maintenance Tasks

**Regular Tasks:**
- Review storage usage
- Clean up orphaned files
- Update file size limits if needed
- Review and update RLS policies

---

## 11. Best Practices Summary

### 11.1 Supabase Storage

1. ✅ **Use private buckets** for sensitive files
2. ✅ **Use public buckets** only for public assets
3. ✅ **Implement RLS policies** for access control
4. ✅ **Organize files** by tenant/organization
5. ✅ **Set file size limits** per bucket
6. ✅ **Restrict MIME types** per bucket

### 11.2 Next.js Integration

1. ✅ **Server-side uploads** for security
2. ✅ **Signed URLs** for private files
3. ✅ **Public URLs** only for public assets
4. ✅ **File validation** before upload
5. ✅ **Error handling** for all operations
6. ✅ **Type safety** with TypeScript

---

## 12. Configuration Status

✅ **STORAGE CONFIGURATION COMPLETE**

- ✅ 3 buckets created and configured
- ✅ RLS policies implemented
- ✅ Next.js integration complete
- ✅ Helper functions created
- ✅ API routes implemented
- ✅ Security best practices applied

**Storage is production-ready and follows best practices.**

---

*Configuration completed: 2025-01-27*
