# Resumable Uploads Guide - TUS Protocol

**Date:** 2025-01-27  
**Status:** ✅ **IMPLEMENTATION READY**

---

## Overview

Supabase Storage supports resumable uploads using the [TUS protocol](https://tus.io/). This is recommended for:
- Files larger than 6MB
- Unstable network connections
- Large file uploads
- Progress tracking requirements

---

## When to Use Resumable Uploads

**✅ Use Resumable Uploads When:**
- File size > 6MB
- Network stability is a concern
- You need upload progress tracking
- Large file uploads are common

**❌ Use Standard Uploads When:**
- File size < 6MB
- Network is stable
- Simple uploads without progress tracking

---

## Implementation

### 1. Install Required Packages

```bash
npm install @uppy/core @uppy/tus @uppy/dashboard
# or
npm install tus-js-client
```

### 2. Using Uppy (Recommended)

**React Example:**
```typescript
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Uppy from "@uppy/core";
import Tus from "@uppy/tus";
import Dashboard from "@uppy/dashboard";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";
import { getTusEndpoint } from "@/lib/storage";

export function FileUploader({ bucketName }: { bucketName: string }) {
  const [uppy] = useState(() => new Uppy());
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const initializeUppy = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const tusEndpoint = getTusEndpoint();

      uppy.use(Tus, {
        endpoint: tusEndpoint,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          authorization: `Bearer ${session?.access_token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        chunkSize: 6 * 1024 * 1024, // 6MB (required)
        allowedMetaFields: [
          "bucketName",
          "objectName",
          "contentType",
          "cacheControl",
          "metadata",
        ],
      });

      uppy.on("file-added", (file) => {
        file.meta = {
          ...file.meta,
          bucketName,
          objectName: file.name,
          contentType: file.type,
        };
      });
    };

    initializeUppy();
  }, [uppy, bucketName]);

  return (
    <div>
      <Dashboard uppy={uppy} inline={true} />
    </div>
  );
}
```

### 3. Using tus-js-client

**JavaScript Example:**
```typescript
import * as tus from "tus-js-client";
import { createClient } from "@supabase/supabase-js";
import { getTusEndpoint } from "@/lib/storage";

async function uploadFileResumable(
  bucketName: string,
  fileName: string,
  file: File
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { session } } = await supabase.auth.getSession();
  const tusEndpoint = getTusEndpoint();

  return new Promise((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: tusEndpoint,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${session?.access_token}`,
        "x-upsert": "true", // Optional: overwrite existing files
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName,
        objectName: fileName,
        contentType: file.type,
        cacheControl: "3600",
      },
      chunkSize: 6 * 1024 * 1024, // 6MB (required, do not change)
      onError: (error) => {
        console.error("Upload failed:", error);
        reject(error);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        console.log(`Upload progress: ${percentage}%`);
      },
      onSuccess: () => {
        console.log("Upload successful:", upload.url);
        resolve(upload.url);
      },
    });

    // Check for previous uploads to resume
    upload.findPreviousUploads().then((previousUploads) => {
      if (previousUploads.length) {
        upload.resumeFromPreviousUpload(previousUploads[0]);
      }
      upload.start();
    });
  });
}
```

---

## Important Configuration

### 1. Direct Storage Hostname

**✅ Use Direct Hostname:**
```
https://{project-id}.storage.supabase.co/storage/v1/upload/resumable
```

**❌ Don't Use:**
```
https://{project-id}.supabase.co/storage/v1/upload/resumable
```

**Why?** Direct hostname provides better performance for large file uploads.

### 2. Chunk Size

**✅ Required:** 6MB chunks
```typescript
chunkSize: 6 * 1024 * 1024 // 6MB - DO NOT CHANGE
```

**Why?** Supabase Storage requires exactly 6MB chunks for optimal performance.

### 3. Metadata Fields

**Required Fields:**
- `bucketName` - Target bucket
- `objectName` - File path/name
- `contentType` - MIME type

**Optional Fields:**
- `cacheControl` - Cache header value
- `metadata` - Custom metadata (JSON string)

---

## Upload URL Expiration

**Important:** Upload URLs expire after 24 hours.

**Best Practice:**
- Complete uploads within 24 hours
- TUS clients automatically handle expiration
- Create new upload URL if previous one expires

---

## Concurrency Handling

**Single Upload URL:**
- Only one client can upload to the same upload URL
- Other clients receive `409 Conflict` error

**Multiple Upload URLs:**
- Multiple clients can upload to same path using different URLs
- First to complete succeeds (unless `x-upsert: true`)
- With `x-upsert: true`, last to complete succeeds

---

## Overwriting Files

**Default Behavior:**
- Returns `400 Asset Already Exists` if file exists

**To Overwrite:**
```typescript
headers: {
  "x-upsert": "true",
}
```

**⚠️ Warning:**
- CDN propagation takes time
- Stale content may be served
- Better to upload to new path

---

## Error Handling

**Common Errors:**

1. **409 Conflict**
   - Another client is uploading to same URL
   - Wait and retry

2. **401 Unauthorized**
   - Token expired
   - Refresh session and retry

3. **413 Payload Too Large**
   - File exceeds bucket limit
   - Check bucket configuration

4. **400 Bad Request**
   - Invalid metadata
   - Check required fields

---

## Best Practices

### ✅ Do:
- Use direct storage hostname
- Set chunk size to 6MB
- Handle upload errors gracefully
- Show progress to users
- Resume failed uploads automatically
- Validate files before upload

### ❌ Don't:
- Change chunk size from 6MB
- Use regular hostname for large files
- Ignore upload errors
- Upload without progress tracking
- Skip file validation

---

## Integration with Storage Helpers

**Helper Function:**
```typescript
import { getTusEndpoint } from "@/lib/storage";

const tusEndpoint = getTusEndpoint();
// Returns: https://{project-id}.storage.supabase.co/storage/v1/upload/resumable
```

**Usage:**
```typescript
uppy.use(Tus, {
  endpoint: getTusEndpoint(),
  // ... other config
});
```

---

## Example: Complete Upload Component

```typescript
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Uppy from "@uppy/core";
import Tus from "@uppy/tus";
import Dashboard from "@uppy/dashboard";
import { getTusEndpoint } from "@/lib/storage";
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";

interface ResumableUploaderProps {
  bucket: string;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

export function ResumableUploader({
  bucket,
  onSuccess,
  onError,
}: ResumableUploaderProps) {
  const [uppy] = useState(() => new Uppy());
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const initializeUppy = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        onError?.(new Error("Not authenticated"));
        return;
      }

      uppy.use(Tus, {
        endpoint: getTusEndpoint(),
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          authorization: `Bearer ${session.access_token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        chunkSize: 6 * 1024 * 1024,
        allowedMetaFields: [
          "bucketName",
          "objectName",
          "contentType",
          "cacheControl",
        ],
      });

      uppy.on("file-added", (file) => {
        file.meta = {
          ...file.meta,
          bucketName: bucket,
          objectName: file.name,
          contentType: file.type,
        };
      });

      uppy.on("upload-success", (file, response) => {
        onSuccess?.(response.uploadURL);
      });

      uppy.on("upload-error", (file, error) => {
        onError?.(error);
      });
    };

    initializeUppy();

    return () => {
      uppy.close();
    };
  }, [uppy, bucket, supabase, onSuccess, onError]);

  return <Dashboard uppy={uppy} inline={true} />;
}
```

---

## Resources

- [Supabase Resumable Uploads Docs](https://supabase.com/docs/guides/storage/uploads/resumable-uploads)
- [TUS Protocol Specification](https://tus.io/)
- [Uppy Documentation](https://uppy.io/)
- [tus-js-client GitHub](https://github.com/tus/tus-js-client)

---

*Last Updated: 2025-01-27*
