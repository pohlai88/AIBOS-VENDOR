# Supabase Storage Best Practices - Complete Implementation Guide

**Date:** 2025-01-27  
**Status:** ✅ **PRODUCTION-READY BEST PRACTICES**

---

## Executive Summary

This document provides a comprehensive guide to implementing Supabase Storage following official best practices from [Supabase Storage Documentation](https://supabase.com/docs/guides/storage). All recommendations are based on Supabase's official documentation and production-ready patterns.

---

## Table of Contents

1. [Bucket Configuration](#1-bucket-configuration)
2. [Row Level Security (RLS) Policies](#2-row-level-security-rls-policies)
3. [File Path Structure](#3-file-path-structure)
4. [Image Optimization](#4-image-optimization)
5. [CDN and Caching](#5-cdn-and-caching)
6. [Resumable Uploads](#6-resumable-uploads)
7. [Security Best Practices](#7-security-best-practices)
8. [Performance Optimization](#8-performance-optimization)
9. [Next.js Integration](#9-nextjs-integration)
10. [Error Handling](#10-error-handling)

---

## 1. Bucket Configuration

### 1.1 Bucket Types

**Current Configuration:**
- ✅ `documents` - Private bucket (50MB limit)
- ✅ `message-attachments` - Private bucket (10MB limit)
- ✅ `public-assets` - Public bucket (5MB limit)

### 1.2 Best Practices

**Private Buckets:**
- Use for sensitive files (documents, user data)
- All operations require authentication
- Access controlled via RLS policies
- Use signed URLs for file access

**Public Buckets:**
- Use only for truly public assets (logos, public images)
- Files are CDN-accessible without authentication
- Still enforce RLS for upload/update/delete operations
- Use public URLs (no signing needed)

**Bucket Configuration:**
```sql
-- Example: Documents bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false, -- Private
  52428800, -- 50MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'text/plain'
  ]::text[]
);
```

**Key Points:**
- ✅ Set appropriate file size limits per bucket
- ✅ Restrict allowed MIME types per bucket
- ✅ Use private buckets by default
- ✅ Only use public buckets when necessary

---

## 2. Row Level Security (RLS) Policies

### 2.1 Policy Structure

**Best Practice:** Enforce tenant/organization isolation at the storage level.

**Path Structure:**
```
{tenant_id}/{organization_id}/{category}/{timestamp}_{filename}
```

### 2.2 Enhanced Policies

See `STORAGE_BEST_PRACTICES_RLS_POLICIES.sql` for complete implementation.

**Key Features:**
- ✅ Tenant isolation enforced via path structure
- ✅ Organization-level access control
- ✅ Helper functions for path validation
- ✅ Indexes for performance optimization

**Policy Pattern:**
```sql
-- Example: Upload policy with tenant isolation
CREATE POLICY "Users can upload documents to their tenant folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid() IS NOT NULL AND
  path_belongs_to_user_tenant(name)
);
```

### 2.3 Required Policies Per Bucket

**Documents Bucket:**
- ✅ INSERT (Upload)
- ✅ SELECT (View)
- ✅ UPDATE (Update)
- ✅ DELETE (Delete)

**Message Attachments Bucket:**
- ✅ INSERT (Upload)
- ✅ SELECT (View)
- ✅ UPDATE (Update)
- ✅ DELETE (Delete)

**Public Assets Bucket:**
- ✅ INSERT (Upload)
- ✅ UPDATE (Update)
- ✅ DELETE (Delete)
- ⚠️ SELECT not needed (bucket is public)

---

## 3. File Path Structure

### 3.1 Best Practice Path Format

```
{tenant_id}/{organization_id}/{category}/{timestamp}_{filename}
```

**Example:**
```
550e8400-e29b-41d4-a716-446655440000/org-123/invoice/1706284800000_invoice.pdf
```

### 3.2 Benefits

- ✅ **Tenant Isolation**: Files organized by tenant
- ✅ **Organization Separation**: Each org has its own folder
- ✅ **Category Organization**: Files grouped by category
- ✅ **Timestamp**: Prevents filename conflicts
- ✅ **Security**: RLS policies can enforce access by path

### 3.3 Implementation

```typescript
import { generateFilePath } from "@/lib/storage";

const filePath = generateFilePath(organizationId, fileName, {
  tenantId: user.tenantId,
  category: "invoice",
  timestamp: true,
});
```

---

## 4. Image Optimization

### 4.1 Image Transformations

**Best Practice:** Use Supabase's built-in image transformation API for on-the-fly optimization.

**Features:**
- ✅ Automatic WebP conversion (when supported)
- ✅ Resize and crop images
- ✅ Quality optimization
- ✅ CDN-optimized delivery

### 4.2 Usage Examples

**Signed URL with Transformation:**
```typescript
import { getSignedUrl } from "@/lib/storage";

const signedUrl = await getSignedUrl("documents", filePath, 3600, {
  width: 800,
  height: 600,
  quality: 80,
  resize: "contain",
});
```

**Public URL with Transformation:**
```typescript
import { getPublicUrl } from "@/lib/storage";

const publicUrl = getPublicUrl("public-assets", filePath, {
  width: 500,
  height: 500,
  quality: 75,
});
```

### 4.3 Transformation Options

- **width**: Integer 1-2500
- **height**: Integer 1-2500
- **quality**: 20-100 (default: 80)
- **resize**: "cover" | "contain" | "fill" (default: "cover")
- **format**: "origin" | "webp" (default: auto)

### 4.4 Next.js Image Component

**Custom Loader:**
```typescript
// supabase-image-loader.js
const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;

export default function supabaseLoader({ src, width, quality }) {
  return `https://${projectId}.supabase.co/storage/v1/render/image/public/${src}?width=${width}&quality=${quality || 75}`;
}
```

**Usage:**
```typescript
import Image from "next/image";

<Image
  src="public-assets/logo.png"
  alt="Logo"
  width={500}
  height={500}
  loader={supabaseLoader}
/>
```

---

## 5. CDN and Caching

### 5.1 Cache Control Headers

**Best Practice:** Set appropriate cache headers based on file type.

**Implementation:**
```typescript
import { getCacheControl } from "@/lib/storage";

const cacheControl = getCacheControl(file.type, isPublic);
// Images (public): "public, max-age=31536000, immutable"
// Images (private): "private, max-age=3600"
// Documents: "private, max-age=3600"
```

### 5.2 CDN Configuration

**Public Buckets:**
- ✅ Automatic CDN distribution
- ✅ Global edge caching
- ✅ High cache hit rates

**Private Buckets:**
- ✅ Signed URLs with expiration
- ✅ Cache signed URLs client-side
- ✅ Respect expiration times

### 5.3 Smart CDN

**Best Practice:** Use Smart CDN for automatic cache revalidation.

**Benefits:**
- ✅ Higher cache hit rates
- ✅ Lower egress costs
- ✅ Better performance

---

## 6. Resumable Uploads

### 6.1 When to Use

**Use resumable uploads when:**
- ✅ Files exceed 6MB
- ✅ Network stability is a concern
- ✅ You need upload progress tracking
- ✅ Large file uploads are common

### 6.2 TUS Protocol

**Best Practice:** Use TUS protocol for resumable uploads.

**Implementation:**
```typescript
import { getTusEndpoint } from "@/lib/storage";
import Tus from "@uppy/tus";

const tusEndpoint = getTusEndpoint(); // Direct storage hostname

uppy.use(Tus, {
  endpoint: tusEndpoint,
  chunkSize: 6 * 1024 * 1024, // 6MB chunks (required)
  retryDelays: [0, 3000, 5000, 10000, 20000],
  headers: {
    authorization: `Bearer ${accessToken}`,
  },
});
```

### 6.3 Direct Storage Hostname

**Best Practice:** Use direct storage hostname for better performance.

**Format:**
```
https://{project-id}.storage.supabase.co/storage/v1/upload/resumable
```

**Instead of:**
```
https://{project-id}.supabase.co/storage/v1/upload/resumable
```

---

## 7. Security Best Practices

### 7.1 File Upload Security

**✅ Server-Side Uploads Only**
- Never upload directly from client
- Always validate on server
- Check file size and type

**✅ File Validation**
```typescript
import { validateFile } from "@/lib/storage";

const validation = validateFile(file, {
  maxSize: 52428800, // 50MB
  allowedTypes: ["application/pdf", "image/jpeg"],
});

if (!validation.valid) {
  throw new Error(validation.error);
}
```

**✅ Path Validation**
- Ensure paths follow structure
- Validate tenant/organization access
- Sanitize filenames

### 7.2 URL Security

**✅ Signed URLs for Private Files**
- Use signed URLs (not public URLs)
- Set appropriate expiration times
- Generate server-side only

**✅ Public URLs Only for Public Assets**
- Only use for public-assets bucket
- Never expose private file URLs

**✅ Expiration Times**
- Default: 1 hour (3600 seconds)
- Adjust based on use case
- Don't set too long (security risk)

### 7.3 Access Control

**✅ RLS Policies**
- Enforce at storage level
- Tenant isolation mandatory
- Organization-level checks

**✅ Application-Level Checks**
- Verify access before generating URLs
- Check document sharing permissions
- Log access attempts

---

## 8. Performance Optimization

### 8.1 File Size Limits

**Current Limits:**
- Documents: 50MB
- Message Attachments: 10MB
- Public Assets: 5MB

**Best Practice:** Set limits based on use case and CDN capabilities.

### 8.2 Image Optimization

**✅ Transform on-the-fly**
- Don't store multiple sizes
- Use transformation API
- Leverage WebP auto-conversion

**✅ Pre-generate Common Sizes**
- For frequently accessed images
- Store optimized versions
- Reduce transformation costs

### 8.3 Listing Optimization

**Best Practice:** Use custom Postgres function for large directories.

**Example:**
```sql
CREATE OR REPLACE FUNCTION list_objects(
    bucketid text,
    prefix text,
    limits int default 100,
    offsets int default 0
) RETURNS TABLE (
    name text,
    id uuid,
    updated_at timestamptz,
    created_at timestamptz,
    last_accessed_at timestamptz,
    metadata jsonb
) AS $$
BEGIN
    RETURN QUERY SELECT
        objects.name,
        objects.id,
        objects.updated_at,
        objects.created_at,
        objects.last_accessed_at,
        objects.metadata
    FROM storage.objects
    WHERE objects.name LIKE prefix || '%'
    AND bucket_id = bucketid
    ORDER BY name ASC
    LIMIT limits
    OFFSET offsets;
END;
$$ LANGUAGE plpgsql STABLE;
```

### 8.4 RLS Performance

**✅ Add Indexes**
```sql
-- Index on bucket_id
CREATE INDEX idx_storage_objects_bucket_id ON storage.objects(bucket_id);

-- Index on name (path)
CREATE INDEX idx_storage_objects_name ON storage.objects(name);

-- Composite index
CREATE INDEX idx_storage_objects_bucket_name ON storage.objects(bucket_id, name);
```

---

## 9. Next.js Integration

### 9.1 Server-Side Operations

**✅ Always Use Server-Side for:**
- File uploads
- Signed URL generation
- File deletion
- Access validation

**Example:**
```typescript
// Server-side upload
import { uploadFile } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  
  await uploadFile({
    bucket: "documents",
    path: filePath,
    file,
    options: {
      cacheControl: getCacheControl(file.type),
      contentType: file.type,
    },
  });
}
```

### 9.2 Client-Side Operations

**✅ Only Use Client-Side for:**
- Public URL generation (public-assets bucket)
- Displaying public images

**Example:**
```typescript
// Client-side public URL
import { getPublicUrl } from "@/lib/storage";

const publicUrl = getPublicUrl("public-assets", filePath, {
  width: 500,
  height: 500,
});
```

### 9.3 API Routes

**✅ Centralized Upload Endpoint:**
- `/api/storage/upload` - Handle all uploads
- Validate files
- Generate secure paths
- Return signed URLs

**✅ Signed URL Endpoint:**
- `/api/storage/signed-url` - Generate signed URLs
- Verify access
- Set expiration
- Return URL

---

## 10. Error Handling

### 10.1 Upload Errors

**✅ Handle Common Errors:**
- File size exceeded
- Invalid file type
- Storage quota exceeded
- Network errors

**Example:**
```typescript
try {
  await uploadFile(config);
} catch (error) {
  if (error.message.includes("File size")) {
    // Handle size error
  } else if (error.message.includes("Invalid")) {
    // Handle type error
  } else {
    // Handle other errors
  }
}
```

### 10.2 URL Generation Errors

**✅ Handle Expired URLs:**
- Regenerate if expired
- Log expiration events
- Provide user feedback

**Example:**
```typescript
try {
  const url = await getSignedUrl(bucket, path, 3600);
} catch (error) {
  // Regenerate or show error
  logError("Signed URL generation failed", error);
}
```

---

## 11. Implementation Checklist

### ✅ Configuration
- [x] Buckets created with proper settings
- [x] RLS policies implemented
- [x] Helper functions created
- [x] Indexes added for performance

### ✅ Code Implementation
- [x] Storage helper functions
- [x] Image transformation support
- [x] Cache control helpers
- [x] File validation
- [x] Path generation

### ✅ API Routes
- [x] Upload endpoint
- [x] Signed URL endpoint
- [x] Error handling
- [x] Access validation

### ✅ Documentation
- [x] Best practices guide
- [x] RLS policies SQL
- [x] Usage examples
- [x] Error handling guide

---

## 12. Migration Guide

### 12.1 Updating Existing Policies

**Step 1:** Review current policies
```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';
```

**Step 2:** Drop old policies (if needed)
```sql
DROP POLICY IF EXISTS "old_policy_name" ON storage.objects;
```

**Step 3:** Create new enhanced policies
```sql
-- Run STORAGE_BEST_PRACTICES_RLS_POLICIES.sql
```

### 12.2 Updating Code

**Step 1:** Update storage helper imports
```typescript
import { getSignedUrl, getPublicUrl, getCacheControl } from "@/lib/storage";
```

**Step 2:** Update upload calls
```typescript
// Add cache control
cacheControl: getCacheControl(file.type, isPublic)
```

**Step 3:** Update URL generation
```typescript
// Add image transformations where applicable
const url = await getSignedUrl(bucket, path, 3600, {
  width: 800,
  quality: 80,
});
```

---

## 13. Monitoring and Maintenance

### 13.1 Storage Usage

**Check Storage Usage:**
```sql
SELECT 
  bucket_id,
  COUNT(*) as file_count,
  SUM((metadata->>'size')::bigint) as total_size_bytes
FROM storage.objects
GROUP BY bucket_id;
```

### 13.2 Policy Performance

**Monitor Policy Execution:**
- Check query performance
- Review index usage
- Optimize slow policies

### 13.3 Regular Tasks

**Monthly:**
- Review storage usage
- Check for orphaned files
- Update file size limits if needed
- Review and update RLS policies

---

## 14. Resources

### 14.1 Official Documentation
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control)
- [Image Transformations](https://supabase.com/docs/guides/storage/serving/image-transformations)
- [Resumable Uploads](https://supabase.com/docs/guides/storage/uploads/resumable-uploads)

### 14.2 Code Examples
- [Storage Helper Functions](../../apps/web/src/lib/storage.ts)
- [Upload API Route](../../apps/web/src/app/api/storage/upload/route.ts)
- [RLS Policies SQL](./STORAGE_BEST_PRACTICES_RLS_POLICIES.sql)

---

## 15. Summary

**✅ Best Practices Implemented:**
- Multi-tenant security with RLS policies
- Image optimization and transformations
- CDN and caching configuration
- Resumable uploads support
- Server-side uploads only
- Signed URLs for private files
- Proper error handling
- Performance optimizations

**🚀 Production Ready:**
All storage functionality follows Supabase best practices and is ready for production use.

---

*Last Updated: 2025-01-27*
