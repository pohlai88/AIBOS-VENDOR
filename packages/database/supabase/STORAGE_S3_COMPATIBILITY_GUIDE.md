# Supabase Storage S3 Compatibility Guide

**Date:** 2025-01-27  
**Status:** ✅ **S3 PROTOCOL ENABLED**

---

## Executive Summary

Supabase Storage is **100% S3-compatible**, which means you can use standard AWS S3 tools, SDKs, and protocols to manage your storage buckets. This provides powerful capabilities for bulk operations, migrations, and server-side processing that the Supabase JS client cannot efficiently handle.

---

## 1. Why S3 Compatibility Matters

### Use Cases

1. **Bulk Operations**
   - Migrate 10,000+ files from another system
   - Batch upload/download operations
   - Mass file transformations

2. **Server-Side Reliability**
   - Heavy backend jobs (video processing, image optimization)
   - Standard AWS S3 SDKs are more mature/robust than HTTP wrappers
   - Better error handling and retry logic

3. **Standard Tool Compatibility**
   - Use **rclone** to sync buckets like a hard drive
   - Use **Cyberduck** for GUI file management
   - Use **AWS CLI** for command-line operations
   - Use any S3-compatible tool/library

4. **Interoperability**
   - Integrate with existing S3 workflows
   - Use standard S3 libraries in any language
   - Migrate to/from AWS S3 easily

---

## 2. Getting S3 Access Credentials

### Step 1: Generate S3 Access Keys

1. Go to your **Supabase Dashboard**
2. Navigate to **Project Settings** → **Storage** → **S3 Access Keys**
3. Click **"Generate new key"**
4. **Save the credentials securely:**
   - **Access Key ID** (e.g., `AKIAIOSFODNN7EXAMPLE`)
   - **Secret Access Key** (e.g., `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)
   - **Region** (e.g., `us-east-1`)
   - **Endpoint** (e.g., `https://your-project-id.supabase.co/storage/v1/s3`)

### Step 2: Store Credentials Securely

**⚠️ CRITICAL: Never commit these credentials to git!**

Store them in:
- Environment variables (`.env.local` for local development)
- Secret management service (AWS Secrets Manager, Vault, etc.)
- CI/CD secrets (GitHub Secrets, GitLab CI Variables)

---

## 3. S3 Connection Details

### Endpoint Format

```
https://{project-ref}.supabase.co/storage/v1/s3
```

**Example:**
```
https://abcdefghijklmnop.supabase.co/storage/v1/s3
```

### Region

Supabase Storage uses a **single region** per project. Check your project settings for the exact region (typically `us-east-1` or similar).

### Bucket Names

Your buckets are accessible via S3 using their **exact bucket ID**:
- `documents`
- `message-attachments`
- `public-assets`

---

## 4. Using S3-Compatible Tools

### 4.1 AWS CLI

**Install AWS CLI:**
```bash
# macOS
brew install awscli

# Linux
pip install awscli

# Windows
# Download from: https://aws.amazon.com/cli/
```

**Configure credentials:**
```bash
aws configure
# AWS Access Key ID: [your-access-key]
# AWS Secret Access Key: [your-secret-key]
# Default region name: us-east-1
# Default output format: json
```

**Set custom endpoint:**
```bash
# Create ~/.aws/config
[default]
region = us-east-1
s3 =
    endpoint_url = https://your-project-id.supabase.co/storage/v1/s3
```

**Use AWS CLI:**
```bash
# List buckets
aws s3 ls --endpoint-url https://your-project-id.supabase.co/storage/v1/s3

# List files in bucket
aws s3 ls s3://documents/ --endpoint-url https://your-project-id.supabase.co/storage/v1/s3

# Upload file
aws s3 cp file.pdf s3://documents/path/to/file.pdf --endpoint-url https://your-project-id.supabase.co/storage/v1/s3

# Sync directory
aws s3 sync ./local-folder s3://documents/folder/ --endpoint-url https://your-project-id.supabase.co/storage/v1/s3
```

### 4.2 rclone

**Install rclone:**
```bash
# macOS
brew install rclone

# Linux
curl https://rclone.org/install.sh | sudo bash

# Windows
# Download from: https://rclone.org/downloads/
```

**Configure rclone:**
```bash
rclone config
```

**Configuration:**
```
name: supabase-storage
type: s3
provider: Other
access_key_id: [your-access-key]
secret_access_key: [your-secret-key]
region: us-east-1
endpoint: https://your-project-id.supabase.co/storage/v1/s3
```

**Use rclone:**
```bash
# List buckets
rclone lsd supabase-storage:

# List files
rclone ls supabase-storage:documents

# Copy file
rclone copy file.pdf supabase-storage:documents/path/to/

# Sync directory
rclone sync ./local-folder supabase-storage:documents/folder/
```

### 4.3 Cyberduck (GUI)

1. **Download Cyberduck:** https://cyberduck.io/
2. **Create new connection:**
   - Protocol: **S3 (Amazon Simple Storage Service)**
   - Server: `your-project-id.supabase.co`
   - Port: `443`
   - Path: `/storage/v1/s3`
   - Access Key ID: [your-access-key]
   - Secret Access Key: [your-secret-key]
3. **Connect** and browse your buckets like a file system

### 4.4 Node.js (AWS SDK v3)

**Install:**
```bash
npm install @aws-sdk/client-s3
```

**Usage:**
```typescript
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'us-east-1',
  endpoint: 'https://your-project-id.supabase.co/storage/v1/s3',
  credentials: {
    accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY!,
    secretAccessKey: process.env.SUPABASE_S3_SECRET_KEY!,
  },
  forcePathStyle: true, // Required for Supabase
});

// Upload file
const uploadCommand = new PutObjectCommand({
  Bucket: 'documents',
  Key: 'path/to/file.pdf',
  Body: fileBuffer,
  ContentType: 'application/pdf',
});

await s3Client.send(uploadCommand);

// Download file
const getCommand = new GetObjectCommand({
  Bucket: 'documents',
  Key: 'path/to/file.pdf',
});

const response = await s3Client.send(getCommand);
const fileContent = await response.Body?.transformToByteArray();
```

### 4.5 Python (boto3)

**Install:**
```bash
pip install boto3
```

**Usage:**
```python
import boto3
from botocore.client import Config

s3_client = boto3.client(
    's3',
    endpoint_url='https://your-project-id.supabase.co/storage/v1/s3',
    aws_access_key_id=os.getenv('SUPABASE_S3_ACCESS_KEY'),
    aws_secret_access_key=os.getenv('SUPABASE_S3_SECRET_KEY'),
    region_name='us-east-1',
    config=Config(signature_version='s3v4')
)

# Upload file
s3_client.upload_file(
    'local-file.pdf',
    'documents',
    'path/to/file.pdf',
    ExtraArgs={'ContentType': 'application/pdf'}
)

# Download file
s3_client.download_file(
    'documents',
    'path/to/file.pdf',
    'local-file.pdf'
)
```

---

## 5. Bulk Operations Examples

### Migrate Files from Another System

**Using rclone:**
```bash
# Sync from external S3 bucket
rclone sync external-s3:source-bucket supabase-storage:documents/migrated/

# Sync from local directory
rclone sync ./legacy-files supabase-storage:documents/legacy/
```

**Using AWS CLI:**
```bash
# Sync from AWS S3
aws s3 sync s3://source-bucket/ s3://documents/migrated/ \
  --endpoint-url https://your-project-id.supabase.co/storage/v1/s3
```

### Batch Upload with Node.js

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const s3Client = new S3Client({
  endpoint: 'https://your-project-id.supabase.co/storage/v1/s3',
  // ... credentials
});

async function batchUpload(directory: string, bucket: string) {
  const files = await readdir(directory);
  
  for (const file of files) {
    const filePath = join(directory, file);
    const fileContent = await readFile(filePath);
    
    await s3Client.send(new PutObjectCommand({
      Bucket: bucket,
      Key: `uploads/${file}`,
      Body: fileContent,
    }));
    
    console.log(`Uploaded: ${file}`);
  }
}

await batchUpload('./documents', 'documents');
```

---

## 6. Security Best Practices

### 1. **Never Commit Credentials**
- Use environment variables
- Use secret management services
- Rotate keys regularly

### 2. **Use IAM-Style Policies (Future)**
- Supabase may add IAM-style access control
- Limit S3 keys to specific buckets/operations

### 3. **Monitor S3 Access**
- Log all S3 operations
- Alert on unusual activity
- Review access logs regularly

### 4. **Rotate Keys Regularly**
- Generate new keys every 90 days
- Revoke old keys after migration
- Test new keys before revoking old ones

---

## 7. Limitations & Considerations

### Current Limitations

1. **No IAM Policies (Yet)**
   - S3 keys have full access to all buckets
   - Cannot restrict to specific buckets/operations
   - Use with caution in production

2. **Rate Limits**
   - Supabase Storage has rate limits
   - Bulk operations may be throttled
   - Implement retry logic with exponential backoff

3. **Path Style Required**
   - Must use `forcePathStyle: true` in SDKs
   - Virtual-hosted style not supported

### Best Practices

1. **Use for Admin/Bulk Tasks Only**
   - Don't use S3 keys in client applications
   - Use Supabase JS client for normal operations
   - Reserve S3 for backend/admin operations

2. **Implement Retry Logic**
   - Network failures are common
   - Use exponential backoff
   - Log failures for monitoring

3. **Monitor Usage**
   - Track S3 API calls
   - Monitor storage growth
   - Set up alerts for anomalies

---

## 8. Migration Checklist

### Before Migration

- [ ] Generate S3 access keys
- [ ] Store credentials securely
- [ ] Test connection with AWS CLI/rclone
- [ ] Verify bucket access
- [ ] Test upload/download operations

### During Migration

- [ ] Use bulk upload tools (rclone, AWS CLI)
- [ ] Monitor progress
- [ ] Verify file integrity
- [ ] Check file counts match
- [ ] Verify RLS policies still work

### After Migration

- [ ] Verify all files accessible
- [ ] Test application functionality
- [ ] Monitor for errors
- [ ] Review storage usage
- [ ] Update documentation

---

## 9. Troubleshooting

### Connection Issues

**Error: "Invalid endpoint"**
- Verify endpoint URL format
- Check project ID is correct
- Ensure `/storage/v1/s3` path is included

**Error: "Access Denied"**
- Verify access key and secret key
- Check credentials are not expired
- Ensure bucket name is correct

**Error: "Signature mismatch"**
- Verify `forcePathStyle: true` is set
- Check region matches project settings
- Verify credentials are correct

### Performance Issues

**Slow uploads:**
- Use multipart uploads for large files
- Increase concurrency (if tool supports)
- Check network connection

**Rate limiting:**
- Implement exponential backoff
- Reduce concurrency
- Spread operations over time

---

## 10. Quick Reference

### Endpoint
```
https://{project-ref}.supabase.co/storage/v1/s3
```

### Region
Check project settings (typically `us-east-1`)

### Buckets
- `documents`
- `message-attachments`
- `public-assets`

### Required Settings
- `forcePathStyle: true` (in SDKs)
- Path-style URLs (not virtual-hosted)

---

## Summary

✅ **S3 Compatibility Enabled**
- Use standard S3 tools and SDKs
- Bulk operations supported
- Server-side processing enabled
- Standard tool compatibility

**Next Steps:**
1. Generate S3 access keys in Dashboard
2. Store credentials securely
3. Test with AWS CLI or rclone
4. Use for bulk/admin operations only

---

*Guide created: 2025-01-27*
