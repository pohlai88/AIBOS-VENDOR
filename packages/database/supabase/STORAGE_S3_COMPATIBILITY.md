# Supabase Storage S3 Compatibility Guide

**Date:** 2025-01-27  
**Status:** ✅ **S3-COMPATIBLE STORAGE**

---

## Overview

Supabase Storage is **fully S3-compatible**, meaning you can use standard AWS S3 SDKs, tools, and protocols to interact with your storage buckets. This provides powerful capabilities for bulk operations, server-side processing, and interoperability.

---

## Why Use S3 Protocol?

### ✅ Benefits

1. **Bulk Operations**
   - Migrate thousands of files efficiently
   - Use tools like `rclone`, `Cyberduck`, or `aws-cli`
   - Faster than HTTP API for large transfers

2. **Server-Side Reliability**
   - Mature AWS S3 SDKs (more robust than HTTP wrappers)
   - Better error handling and retry logic
   - Optimized for backend processing

3. **Standard Tooling**
   - Use any S3-compatible tool
   - Integrate with existing workflows
   - Leverage ecosystem of S3 tools

4. **Video Processing & Heavy Jobs**
   - Better suited for large file operations
   - Streaming support
   - Multipart upload handling

---

## Getting S3 Credentials

### Step 1: Access Storage Settings

1. Go to **Supabase Dashboard**
2. Navigate to **Project Settings** → **Storage**
3. Scroll to **S3 Access Keys** section

### Step 2: Generate Access Keys

1. Click **"Generate New Key"**
2. **Save credentials securely** (they won't be shown again):
   - Access Key ID
   - Secret Access Key
   - Endpoint URL
   - Region

### Step 3: Store Credentials Securely

**⚠️ Security Best Practices:**
- Store in environment variables (never commit to git)
- Use secrets management (Vault, AWS Secrets Manager, etc.)
- Rotate keys regularly
- Use different keys for different environments

**Example `.env.local`:**
```bash
# S3-Compatible Storage Credentials
SUPABASE_STORAGE_S3_ACCESS_KEY_ID=your_access_key_id
SUPABASE_STORAGE_S3_SECRET_ACCESS_KEY=your_secret_key
SUPABASE_STORAGE_S3_ENDPOINT=https://your-project-id.supabase.co/storage/v1/s3
SUPABASE_STORAGE_S3_REGION=us-east-1
```

---

## S3 Endpoint Configuration

### Endpoint Format

```
https://{project-id}.supabase.co/storage/v1/s3
```

### Region

Supabase Storage uses a default region. Check your project settings for the exact region value (typically `us-east-1` or similar).

---

## Usage Examples

### 1. AWS CLI

**Install AWS CLI:**
```bash
# macOS
brew install awscli

# Linux
sudo apt-get install awscli

# Windows
# Download from AWS website
```

**Configure:**
```bash
aws configure
# AWS Access Key ID: [your-access-key]
# AWS Secret Access Key: [your-secret-key]
# Default region name: [your-region]
# Default output format: json
```

**Create S3 Config:**
```bash
# ~/.aws/config
[profile supabase]
region = us-east-1
output = json

# ~/.aws/credentials
[supabase]
aws_access_key_id = your_access_key_id
aws_secret_access_key = your_secret_key
```

**Use with Endpoint:**
```bash
# List buckets
aws s3 ls --endpoint-url https://your-project-id.supabase.co/storage/v1/s3

# List files in bucket
aws s3 ls s3://documents/ --endpoint-url https://your-project-id.supabase.co/storage/v1/s3

# Upload file
aws s3 cp local-file.pdf s3://documents/path/to/file.pdf \
  --endpoint-url https://your-project-id.supabase.co/storage/v1/s3

# Download file
aws s3 cp s3://documents/path/to/file.pdf ./downloaded-file.pdf \
  --endpoint-url https://your-project-id.supabase.co/storage/v1/s3

# Sync directory
aws s3 sync ./local-folder/ s3://documents/folder/ \
  --endpoint-url https://your-project-id.supabase.co/storage/v1/s3
```

### 2. rclone

**Install rclone:**
```bash
# macOS
brew install rclone

# Linux
curl https://rclone.org/install.sh | sudo bash

# Windows
# Download from rclone.org
```

**Configure:**
```bash
rclone config
# Choose "S3" provider
# Provider: AWS S3
# Access Key ID: [your-access-key]
# Secret Access Key: [your-secret-key]
# Region: [your-region]
# Endpoint: https://your-project-id.supabase.co/storage/v1/s3
# Location constraint: (leave empty)
```

**Use:**
```bash
# List buckets
rclone lsd supabase:

# List files
rclone ls supabase:documents

# Copy file
rclone copy local-file.pdf supabase:documents/path/to/

# Sync directory
rclone sync ./local-folder/ supabase:documents/folder/

# Mount as filesystem (macOS/Linux)
rclone mount supabase:documents /mnt/supabase-storage
```

### 3. Cyberduck

**Setup:**
1. Download [Cyberduck](https://cyberduck.io/)
2. Create new bookmark:
   - **Protocol:** Amazon S3
   - **Server:** `your-project-id.supabase.co`
   - **Path:** `/storage/v1/s3`
   - **Access Key ID:** [your-access-key]
   - **Secret Access Key:** [your-secret-key]
   - **Region:** [your-region]

**Use:**
- Drag and drop files
- Browse buckets like a file system
- Manage files visually

### 4. Node.js (AWS SDK v3)

**Install:**
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**Usage:**
```typescript
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.SUPABASE_STORAGE_S3_REGION,
  endpoint: process.env.SUPABASE_STORAGE_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.SUPABASE_STORAGE_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.SUPABASE_STORAGE_S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true, // Required for Supabase
});

// Upload file
async function uploadFile(bucket: string, key: string, file: Buffer) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: file,
    ContentType: "application/pdf",
  });
  
  await s3Client.send(command);
}

// Generate signed URL
async function getSignedDownloadUrl(bucket: string, key: string) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
```

### 5. Python (boto3)

**Install:**
```bash
pip install boto3
```

**Usage:**
```python
import boto3
from botocore.config import Config

s3_client = boto3.client(
    's3',
    endpoint_url='https://your-project-id.supabase.co/storage/v1/s3',
    aws_access_key_id='your_access_key_id',
    aws_secret_access_key='your_secret_access_key',
    region_name='us-east-1',
    config=Config(signature_version='s3v4')
)

# Upload file
s3_client.upload_file(
    'local-file.pdf',
    'documents',
    'path/to/file.pdf'
)

# Download file
s3_client.download_file(
    'documents',
    'path/to/file.pdf',
    'downloaded-file.pdf'
)

# List files
response = s3_client.list_objects_v2(
    Bucket='documents',
    Prefix='path/to/'
)
```

---

## Use Cases

### 1. Bulk Migration

**Scenario:** Migrate 10,000 files from old storage to Supabase

**Solution:** Use `rclone` or `aws-cli` for efficient bulk transfer

```bash
# Using rclone
rclone copy old-storage:files/ supabase:documents/migrated/ \
  --transfers 10 \
  --checkers 20 \
  --progress
```

### 2. Server-Side Video Processing

**Scenario:** Process uploaded videos server-side

**Solution:** Use AWS S3 SDK for reliable streaming

```typescript
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

// Stream video for processing
const command = new GetObjectCommand({
  Bucket: "documents",
  Key: "video.mp4",
});

const response = await s3Client.send(command);
const stream = response.Body as NodeJS.ReadableStream;

// Process stream
processVideoStream(stream);
```

### 3. Backup & Restore

**Scenario:** Backup all storage files

**Solution:** Use S3 tools for efficient backup

```bash
# Backup entire bucket
aws s3 sync s3://documents/ ./backup/documents/ \
  --endpoint-url https://your-project-id.supabase.co/storage/v1/s3

# Restore from backup
aws s3 sync ./backup/documents/ s3://documents/ \
  --endpoint-url https://your-project-id.supabase.co/storage/v1/s3
```

### 4. Automated File Management

**Scenario:** Automated cleanup or organization

**Solution:** Use S3 SDK in scheduled jobs

```typescript
// Delete old files
const listCommand = new ListObjectsV2Command({
  Bucket: "documents",
  Prefix: "temp/",
});

const objects = await s3Client.send(listCommand);

for (const object of objects.Contents || []) {
  if (object.LastModified < cutoffDate) {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: "documents",
      Key: object.Key!,
    }));
  }
}
```

---

## Important Notes

### ⚠️ Security

- **Never commit S3 credentials to git**
- Store in environment variables or secrets management
- Rotate keys regularly
- Use different keys for different environments

### ⚠️ Path Style

Supabase requires **path-style** URLs (not virtual-hosted style):

```
✅ https://project-id.supabase.co/storage/v1/s3/bucket-name/path
❌ https://bucket-name.project-id.supabase.co/storage/v1/s3/path
```

Most S3 clients support this via `forcePathStyle: true` or similar option.

### ⚠️ RLS Policies

**Important:** S3 protocol operations **still respect RLS policies**. You cannot bypass security by using S3 protocol.

### ⚠️ Rate Limits

Supabase Storage has rate limits. For bulk operations:
- Use appropriate concurrency limits
- Implement retry logic
- Monitor rate limit headers

---

## Troubleshooting

### Issue: "Access Denied"

**Solution:**
- Verify credentials are correct
- Check RLS policies allow access
- Ensure bucket exists and is accessible

### Issue: "Invalid Endpoint"

**Solution:**
- Verify endpoint URL format
- Check project ID is correct
- Ensure path-style URLs are used

### Issue: "Region Mismatch"

**Solution:**
- Check region in Supabase Dashboard
- Use correct region in S3 client config
- Some clients may auto-detect region

---

## Resources

- [Supabase Storage S3 Compatibility](https://supabase.com/docs/guides/storage/s3/compatibility)
- [AWS S3 CLI Documentation](https://docs.aws.amazon.com/cli/latest/reference/s3/)
- [rclone Documentation](https://rclone.org/docs/)
- [boto3 Documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/index.html)

---

*Last Updated: 2025-01-27*
