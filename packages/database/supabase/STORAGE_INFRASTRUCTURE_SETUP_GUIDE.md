# Storage Infrastructure & Automation Layer - Setup Guide

**Date:** 2025-01-27  
**Status:** ✅ **COMPLETE INFRASTRUCTURE LAYER**

---

## Executive Summary

This guide walks you through implementing the **Infrastructure & Automation Layer** for Supabase Storage. This layer provides:

1. ✅ **Hard Database Constraints** - Defense in depth at the database level
2. ✅ **Event-Driven Automation** - Database triggers for data consistency
3. ✅ **S3 Protocol Compatibility** - Bulk operations and standard tool support
4. ✅ **Automated Maintenance** - pg_cron jobs for storage hygiene

---

## Prerequisites

Before starting, ensure you have:

- ✅ Storage buckets created (`documents`, `message-attachments`, `public-assets`)
- ✅ RLS policies applied (see `STORAGE_POLICIES_VALIDATION_REPORT.md`)
- ✅ Database schema with `documents`, `message_attachments`, `organizations` tables
- ✅ Access to Supabase Dashboard (for pg_cron extension)

---

## Step 1: Apply Hard Database Constraints

### What This Does

Enforces **hard limits** at the database level that cannot be bypassed:
- File size limits per bucket
- Allowed MIME types per bucket

### How to Apply

**Option A: Using Migration File (Recommended)**
```bash
# Apply migration
supabase db push
# Or via Dashboard: SQL Editor -> Run migration file
```

**Option B: Manual SQL**
```sql
-- Run the SQL from STORAGE_INFRASTRUCTURE_LAYER.sql
-- Section 1: Hard Database Constraints
```

### Verify Constraints

```sql
SELECT 
  id,
  name,
  file_size_limit,
  allowed_mime_types,
  CASE 
    WHEN id = 'documents' AND file_size_limit = 52428800 THEN '✅'
    WHEN id = 'message-attachments' AND file_size_limit = 10485760 THEN '✅'
    WHEN id = 'public-assets' AND file_size_limit = 5242880 THEN '✅'
    ELSE '❌'
  END as constraint_status
FROM storage.buckets
WHERE id IN ('documents', 'message-attachments', 'public-assets');
```

**Expected Result:**
- All buckets show ✅ status
- File size limits match expected values
- MIME type arrays are populated

---

## Step 2: Enable Database Triggers

### What This Does

Creates **automatic triggers** that:
- Sync document records when files are uploaded
- Clean up document records when files are deleted
- Update organization avatars when uploaded to public-assets
- Log message attachment uploads (monitoring)

### How to Apply

**Option A: Using Migration File (Recommended)**
```bash
# Migration file includes all triggers
supabase db push
```

**Option B: Manual SQL**
```sql
-- Run Section 2 from STORAGE_INFRASTRUCTURE_LAYER.sql
-- Or use migration file: migrations/011_storage_infrastructure_layer.sql
```

### Verify Triggers

```sql
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'storage'
  AND event_object_table = 'objects'
ORDER BY trigger_name;
```

**Expected Triggers:**
- `on_document_upload` (INSERT)
- `on_document_delete` (DELETE)
- `on_message_attachment_upload` (INSERT)
- `on_avatar_upload` (INSERT)

### Test Triggers

**Test Document Upload:**
```sql
-- Upload a test file via your application
-- Then verify document record was created:
SELECT * FROM documents WHERE file_url LIKE '%test%';
```

**Test Document Delete:**
```sql
-- Delete a test file via your application
-- Then verify document record was removed:
SELECT * FROM documents WHERE file_url = 'deleted-path';
```

---

## Step 3: Enable pg_cron Extension

### What This Does

Enables **scheduled jobs** for:
- Weekly cleanup of orphaned files
- Daily cleanup of incomplete uploads
- Storage usage monitoring

### How to Enable

**Via Supabase Dashboard (Recommended):**

1. Go to **Supabase Dashboard**
2. Navigate to **Database** → **Extensions**
3. Find **"pg_cron"** in the list
4. Click **"Enable"** or toggle it ON
5. Wait for confirmation

**Via SQL (If you have superuser access):**
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

### Verify pg_cron is Enabled

```sql
SELECT * FROM pg_extension WHERE extname = 'pg_cron';
```

**Expected Result:**
- Row returned with `extname = 'pg_cron'`

### Apply Cron Schedules

The migration file (`011_storage_infrastructure_layer.sql`) includes cron schedules that will be created automatically. If you're using the standalone SQL file, uncomment the cron schedule sections.

**Verify Cron Jobs:**
```sql
SELECT * FROM cron.job;
```

**Expected Jobs:**
- `cleanup-orphaned-storage-files` (weekly, Sunday 3 AM)
- `cleanup-incomplete-uploads` (daily, 3 AM)

---

## Step 4: Configure S3 Compatibility

### What This Does

Enables **S3 protocol access** for:
- Bulk file operations
- Standard S3 tool compatibility
- Server-side processing

### How to Configure

1. **Generate S3 Access Keys:**
   - Go to **Supabase Dashboard**
   - Navigate to **Project Settings** → **Storage** → **S3 Access Keys**
   - Click **"Generate new key"**
   - **Save credentials securely** (never commit to git)

2. **Store Credentials:**
   ```bash
   # .env.local (for local development)
   SUPABASE_S3_ACCESS_KEY=your-access-key
   SUPABASE_S3_SECRET_KEY=your-secret-key
   SUPABASE_S3_ENDPOINT=https://your-project-id.supabase.co/storage/v1/s3
   SUPABASE_S3_REGION=us-east-1
   ```

3. **Test Connection:**
   ```bash
   # Using AWS CLI
   aws s3 ls --endpoint-url https://your-project-id.supabase.co/storage/v1/s3
   ```

### See Full Guide

For complete S3 setup instructions, see:
- `STORAGE_S3_COMPATIBILITY_GUIDE.md`

---

## Step 5: Verify Complete Setup

### Run Verification Queries

```sql
-- 1. Verify bucket constraints
SELECT 
  id,
  file_size_limit,
  array_length(allowed_mime_types, 1) as mime_type_count
FROM storage.buckets
WHERE id IN ('documents', 'message-attachments', 'public-assets');

-- 2. Verify triggers
SELECT COUNT(*) as trigger_count
FROM information_schema.triggers
WHERE event_object_schema = 'storage'
  AND event_object_table = 'objects';

-- 3. Verify pg_cron
SELECT COUNT(*) as cron_job_count
FROM cron.job
WHERE jobname LIKE '%storage%' OR jobname LIKE '%cleanup%';

-- 4. Check storage usage
SELECT * FROM get_storage_usage_report();

-- 5. Check for anomalies
SELECT * FROM check_storage_anomalies();
```

### Expected Results

✅ **Bucket Constraints:**
- 3 buckets with correct file size limits
- MIME type arrays populated

✅ **Triggers:**
- 4+ triggers on `storage.objects` table

✅ **Cron Jobs:**
- 2+ scheduled jobs for cleanup

✅ **Storage Usage:**
- Report shows bucket statistics

✅ **Anomalies:**
- No anomalies (or known/acceptable ones)

---

## Step 6: Monitor & Maintain

### Regular Monitoring

**Weekly:**
- Check storage usage report: `SELECT * FROM get_storage_usage_report();`
- Review anomalies: `SELECT * FROM check_storage_anomalies();`
- Verify cron jobs ran: Check Supabase Dashboard → Database → Cron Jobs

**Monthly:**
- Review orphaned file cleanup results
- Check storage growth trends
- Verify constraints are still enforced

### Maintenance Tasks

**Clean Up Orphaned Files (Manual):**
```sql
SELECT * FROM cleanup_orphaned_storage_files();
```

**Check Storage Health:**
```sql
SELECT * FROM check_storage_anomalies();
```

**View Storage Usage:**
```sql
SELECT * FROM get_storage_usage_report();
```

---

## Troubleshooting

### Issue: Bucket Constraints Not Applied

**Symptoms:**
- Verification query shows ❌ status
- File size limits not enforced

**Solution:**
```sql
-- Re-run constraint updates
-- See STORAGE_INFRASTRUCTURE_LAYER.sql Section 1
```

### Issue: Triggers Not Firing

**Symptoms:**
- Document records not syncing
- Avatar URLs not updating

**Solution:**
```sql
-- Check triggers exist
SELECT * FROM information_schema.triggers
WHERE event_object_schema = 'storage';

-- Re-create triggers if missing
-- See STORAGE_INFRASTRUCTURE_LAYER.sql Section 2
```

### Issue: pg_cron Not Working

**Symptoms:**
- Cron jobs not running
- Extension not found

**Solution:**
1. Verify extension is enabled in Dashboard
2. Check cron job status: `SELECT * FROM cron.job;`
3. Check cron job history: `SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;`

### Issue: S3 Connection Fails

**Symptoms:**
- AWS CLI/rclone cannot connect
- "Access Denied" errors

**Solution:**
1. Verify credentials are correct
2. Check endpoint URL format
3. Ensure `forcePathStyle: true` in SDKs
4. See `STORAGE_S3_COMPATIBILITY_GUIDE.md` for details

---

## Quick Reference

### Files

- **Main SQL:** `STORAGE_INFRASTRUCTURE_LAYER.sql`
- **Migration:** `migrations/011_storage_infrastructure_layer.sql`
- **S3 Guide:** `STORAGE_S3_COMPATIBILITY_GUIDE.md`
- **This Guide:** `STORAGE_INFRASTRUCTURE_SETUP_GUIDE.md`

### Key Functions

- `cleanup_orphaned_storage_files()` - Clean up orphaned files
- `cleanup_incomplete_uploads()` - Clean up incomplete uploads
- `get_storage_usage_report()` - Get storage statistics
- `check_storage_anomalies()` - Check for issues

### Key Triggers

- `on_document_upload` - Sync documents on upload
- `on_document_delete` - Clean up on delete
- `on_avatar_upload` - Update avatar URLs
- `on_message_attachment_upload` - Log attachment uploads

### Cron Jobs

- `cleanup-orphaned-storage-files` - Weekly (Sunday 3 AM)
- `cleanup-incomplete-uploads` - Daily (3 AM)

---

## Summary Checklist

- [ ] ✅ Applied hard database constraints
- [ ] ✅ Enabled database triggers
- [ ] ✅ Enabled pg_cron extension
- [ ] ✅ Created cron schedules
- [ ] ✅ Generated S3 access keys
- [ ] ✅ Stored S3 credentials securely
- [ ] ✅ Verified all components working
- [ ] ✅ Set up monitoring

**Status:** Infrastructure layer is now complete and production-ready! 🎉

---

*Guide created: 2025-01-27*
