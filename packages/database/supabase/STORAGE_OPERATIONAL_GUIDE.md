# Storage System - Operational Guide

**Date:** 2025-01-27  
**Status:** ✅ **PRODUCTION-READY OPERATIONAL GUIDE**

---

## Defense-in-Depth Architecture

Your storage system implements a **5-layer defense model**:

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: User Experience (Client Hook)                      │
│ - Client-side validation                                     │
│ - Immediate feedback                                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Logic & Auth (RLS Policies)                        │
│ - Row Level Security                                         │
│ - Tenant isolation                                           │
│ - Permission checks                                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Infrastructure (Hard DB Constraints) ⚡          │
│ - File size limits (database-enforced)                      │
│ - MIME type whitelist (database-enforced)                   │
│ - Physical backstop (cannot be bypassed)                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: Automation (Database Triggers)                    │
│ - Auto-sync storage → app tables                            │
│ - Auto-cleanup on delete                                    │
│ - Avatar URL updates                                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 5: Maintenance (pg_cron)                              │
│ - Weekly orphaned file cleanup                              │
│ - Daily incomplete upload cleanup                          │
│ - Self-healing system                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational SQL Commands

### Health Monitoring

**Check for Anomalies:**
```sql
-- Detects files exceeding limits, invalid MIME types, orphaned files
SELECT * FROM check_storage_anomalies();
```

**View Storage Usage:**
```sql
-- Get usage statistics by bucket
SELECT * FROM get_storage_usage_report();
```

**Expected Output:**
```
bucket_id           | file_count | total_size_bytes | total_size_mb | oldest_file          | newest_file
--------------------|------------|------------------|---------------|----------------------|----------------------
documents           | 150        | 52428800         | 50.00         | 2025-01-01 10:00:00 | 2025-01-27 15:30:00
message-attachments | 45         | 10485760         | 10.00         | 2025-01-05 08:00:00 | 2025-01-27 14:20:00
public-assets       | 12         | 2621440          | 2.50          | 2025-01-10 12:00:00 | 2025-01-27 16:00:00
```

---

### Manual Maintenance

**Clean Orphaned Files (Manual):**
```sql
-- Returns count of deleted files per bucket
SELECT * FROM cleanup_orphaned_storage_files();
```

**Clean Incomplete Uploads:**
```sql
-- Returns count of deleted incomplete uploads
SELECT cleanup_incomplete_uploads();
```

**⚠️ Warning:** These functions DELETE files. Test in development first!

---

### Configuration Management

**View Bucket Constraints:**
```sql
SELECT 
  id,
  name,
  public,
  file_size_limit,
  array_length(allowed_mime_types, 1) as mime_type_count,
  allowed_mime_types
FROM storage.buckets
WHERE id IN ('documents', 'message-attachments', 'public-assets')
ORDER BY id;
```

**Update File Size Limit:**
```sql
-- Example: Increase documents bucket to 100MB
UPDATE storage.buckets
SET file_size_limit = 104857600  -- 100MB
WHERE id = 'documents';
```

**Update Allowed MIME Types:**
```sql
-- Example: Add Excel files to documents bucket
UPDATE storage.buckets
SET allowed_mime_types = array_append(
  allowed_mime_types,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
)
WHERE id = 'documents';
```

---

### Trigger Management

**View Active Triggers:**
```sql
SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'storage'
  AND event_object_table = 'objects'
  AND trigger_name IN (
    'on_document_upload',
    'on_document_delete',
    'on_message_attachment_upload',
    'on_avatar_upload'
  )
ORDER BY trigger_name;
```

**Disable Trigger (Maintenance):**
```sql
-- Temporarily disable trigger
ALTER TABLE storage.objects DISABLE TRIGGER on_document_upload;
```

**Re-enable Trigger:**
```sql
ALTER TABLE storage.objects ENABLE TRIGGER on_document_upload;
```

---

### Cron Job Management

**View Scheduled Jobs:**
```sql
SELECT 
  jobid,
  jobname,
  schedule,
  active,
  command
FROM cron.job
WHERE jobname LIKE '%storage%' OR jobname LIKE '%cleanup%'
ORDER BY jobid;
```

**View Job Execution History:**
```sql
SELECT 
  jobid,
  runid,
  job_pid,
  database,
  username,
  command,
  status,
  return_message,
  start_time,
  end_time
FROM cron.job_run_details
WHERE jobid IN (
  SELECT jobid FROM cron.job 
  WHERE jobname LIKE '%storage%' OR jobname LIKE '%cleanup%'
)
ORDER BY start_time DESC
LIMIT 20;
```

**Manually Run Cron Job:**
```sql
-- Run cleanup job immediately (for testing)
SELECT cron.run_job(
  (SELECT jobid FROM cron.job WHERE jobname = 'cleanup-orphaned-storage-files')
);
```

---

## Pre-Deployment Checklist

### ✅ Environment Configuration

- [ ] **Supabase URL:** Verify `NEXT_PUBLIC_SUPABASE_URL` in production
- [ ] **Anon Key:** Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` in production
- [ ] **Service Role Key:** Verify server-side key is secure (never exposed)
- [ ] **Request ID:** Verify request ID generation works in production

### ✅ Bucket Verification

- [ ] **Bucket Existence:** Verify all 3 buckets exist in production
  ```sql
  SELECT id FROM storage.buckets 
  WHERE id IN ('documents', 'message-attachments', 'public-assets');
  ```

- [ ] **Bucket Constraints:** Verify constraints are applied
  ```sql
  SELECT id, file_size_limit, allowed_mime_types
  FROM storage.buckets
  WHERE id IN ('documents', 'message-attachments', 'public-assets');
  ```

- [ ] **RLS Policies:** Verify policies are active
  ```sql
  SELECT policyname, cmd, qual
  FROM pg_policies
  WHERE schemaname = 'storage' AND tablename = 'objects';
  ```

### ✅ Infrastructure Verification

- [ ] **Triggers:** Verify all 4 triggers are active
  ```sql
  SELECT COUNT(*) FROM information_schema.triggers
  WHERE event_object_schema = 'storage'
    AND event_object_table = 'objects'
    AND trigger_name IN (
      'on_document_upload',
      'on_document_delete',
      'on_message_attachment_upload',
      'on_avatar_upload'
    );
  -- Expected: 4
  ```

- [ ] **pg_cron Extension:** Verify extension is enabled
  ```sql
  SELECT * FROM pg_extension WHERE extname = 'pg_cron';
  -- Expected: 1 row
  ```

- [ ] **Cron Jobs:** Verify jobs are scheduled
  ```sql
  SELECT COUNT(*) FROM cron.job
  WHERE jobname LIKE '%storage%' OR jobname LIKE '%cleanup%';
  -- Expected: 2
  ```

- [ ] **Functions:** Verify all 8 functions exist
  ```sql
  SELECT COUNT(*) FROM information_schema.routines
  WHERE routine_schema = 'public'
    AND routine_name IN (
      'sync_document_on_upload',
      'cleanup_document_on_delete',
      'log_message_attachment_upload',
      'update_organization_avatar',
      'cleanup_orphaned_storage_files',
      'cleanup_incomplete_uploads',
      'get_storage_usage_report',
      'check_storage_anomalies'
    );
  -- Expected: 8
  ```

---

## Production Monitoring

### Daily Checks

**Morning Health Check:**
```sql
-- Quick health check
SELECT 
  'Anomalies' as check_type,
  COUNT(*) as issue_count
FROM check_storage_anomalies()

UNION ALL

SELECT 
  'Storage Usage' as check_type,
  COUNT(*) as bucket_count
FROM get_storage_usage_report();
```

### Weekly Reviews

**Storage Usage Review:**
```sql
SELECT * FROM get_storage_usage_report();
```

**Anomaly Review:**
```sql
SELECT * FROM check_storage_anomalies();
```

**Cron Job Status:**
```sql
SELECT 
  jobname,
  schedule,
  active,
  (SELECT COUNT(*) FROM cron.job_run_details 
   WHERE jobid = j.jobid 
   AND start_time > NOW() - INTERVAL '7 days') as runs_last_week
FROM cron.job j
WHERE jobname LIKE '%storage%' OR jobname LIKE '%cleanup%';
```

---

## Troubleshooting

### Issue: Upload Fails with Constraint Error

**Symptoms:**
- Error code: `CONSTRAINT_VIOLATION`
- Status: `400`

**Diagnosis:**
```sql
-- Check bucket constraints
SELECT id, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'documents';  -- Replace with actual bucket
```

**Solution:**
- Verify file size is within limit
- Verify MIME type is in allowed list
- Check client-side validation is working

---

### Issue: Upload Fails with Permission Error

**Symptoms:**
- Error code: `PERMISSION_DENIED`
- Status: `403`

**Diagnosis:**
```sql
-- Check RLS policies
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%upload%';
```

**Solution:**
- Verify user has correct tenant_id
- Verify user has correct organization_id
- Check RLS policy conditions

---

### Issue: Cron Jobs Not Running

**Symptoms:**
- No cleanup happening
- Orphaned files accumulating

**Diagnosis:**
```sql
-- Check extension
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- Check jobs
SELECT jobid, jobname, schedule, active
FROM cron.job
WHERE jobname LIKE '%storage%';

-- Check recent runs
SELECT * FROM cron.job_run_details
WHERE jobid IN (SELECT jobid FROM cron.job WHERE jobname LIKE '%storage%')
ORDER BY start_time DESC
LIMIT 10;
```

**Solution:**
1. Enable pg_cron in Dashboard → Database → Extensions
2. Verify jobs are active (`active = true`)
3. Check job execution history for errors

---

### Issue: Trigger Not Firing

**Symptoms:**
- Files uploaded but app tables not updated
- Avatar URLs not updating

**Diagnosis:**
```sql
-- Check trigger exists
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE event_object_schema = 'storage'
  AND event_object_table = 'objects'
  AND trigger_name = 'on_document_upload';  -- Replace with actual trigger

-- Check trigger is enabled
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgname = 'on_document_upload';
-- tgenabled: 'O' = enabled, 'D' = disabled
```

**Solution:**
- Re-enable trigger if disabled
- Check trigger function for errors
- Verify path structure matches trigger expectations

---

## Performance Optimization

### Index Recommendations

**Storage Objects Table:**
```sql
-- Index for bucket_id lookups
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_id 
ON storage.objects(bucket_id);

-- Index for created_at (cleanup queries)
CREATE INDEX IF NOT EXISTS idx_storage_objects_created_at 
ON storage.objects(created_at);

-- Index for name lookups (file path searches)
CREATE INDEX IF NOT EXISTS idx_storage_objects_name 
ON storage.objects(name);
```

### Query Optimization

**Slow Cleanup Queries:**
```sql
-- If cleanup is slow, add index on metadata->>'size'
CREATE INDEX IF NOT EXISTS idx_storage_objects_size 
ON storage.objects((metadata->>'size')::bigint);
```

---

## Security Best Practices

### ✅ Implemented

- ✅ Hard database constraints (cannot be bypassed)
- ✅ RLS policies (tenant isolation)
- ✅ Server-side uploads only
- ✅ Signed URLs for private files
- ✅ Error messages don't expose DB internals
- ✅ Request ID correlation

### 🔒 Additional Recommendations

**Rate Limiting:**
- Consider adding rate limits per user/organization
- Use Supabase Edge Functions or middleware

**Audit Logging:**
- Log all uploads/deletes with user_id, timestamp
- Track storage usage per tenant

**Backup Strategy:**
- Regular backups of storage.objects table
- Backup file metadata (not files themselves - use Supabase backup)

---

## Quick Reference

### Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `CONSTRAINT_VIOLATION` | 400 | File size/type violation |
| `PERMISSION_DENIED` | 403 | RLS policy violation |
| `AUTHENTICATION_REQUIRED` | 401 | Not authenticated |
| `CONFLICT` | 409 | Duplicate file path |
| `PAYLOAD_TOO_LARGE` | 413 | File too large |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | Invalid MIME type |

### Bucket Limits

| Bucket | Size Limit | MIME Types |
|--------|------------|------------|
| `documents` | 50MB | 11 types |
| `message-attachments` | 10MB | 5 types |
| `public-assets` | 5MB | 5 image types |

---

## Support & Escalation

### When to Escalate

**Escalate if:**
- Anomalies persist after cleanup
- Storage usage growing unexpectedly
- Cron jobs failing repeatedly
- Trigger errors in logs

### Debugging with Request ID

**Client Error:**
```typescript
// User reports error with requestId
const requestId = "1706284800000-a1b2c3d4";
```

**Server Log Search:**
```sql
-- Search logs for requestId (if you have log table)
SELECT * FROM logs
WHERE request_id = '1706284800000-a1b2c3d4'
ORDER BY created_at;
```

---

*Operational Guide created: 2025-01-27*
