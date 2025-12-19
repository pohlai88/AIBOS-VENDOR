# Storage System - Deployment Checklist

**Date:** 2025-01-27  
**Status:** ✅ **PRE-DEPLOYMENT VERIFICATION**

---

## Pre-Deployment Checklist

### Phase 1: Environment Configuration ✅

- [ ] **Supabase URL**
  - [ ] Production URL configured: `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] URL format: `https://{project-ref}.supabase.co`
  - [ ] Test connection: `curl https://{project-ref}.supabase.co/rest/v1/`

- [ ] **API Keys**
  - [ ] Anon key configured: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] Service role key secure (server-side only, never exposed)
  - [ ] Keys match production project

- [ ] **Request ID**
  - [ ] Request ID generation working
  - [ ] Request IDs included in responses
  - [ ] Request IDs logged server-side

---

### Phase 2: Database Infrastructure ✅

- [ ] **Buckets Created**
  ```sql
  SELECT id FROM storage.buckets 
  WHERE id IN ('documents', 'message-attachments', 'public-assets');
  -- Expected: 3 rows
  ```

- [ ] **Bucket Constraints Applied**
  ```sql
  SELECT id, file_size_limit, array_length(allowed_mime_types, 1) as mime_count
  FROM storage.buckets
  WHERE id IN ('documents', 'message-attachments', 'public-assets');
  -- Expected: All have file_size_limit and mime_types
  ```

- [ ] **RLS Policies Active**
  ```sql
  SELECT COUNT(*) FROM pg_policies
  WHERE schemaname = 'storage' AND tablename = 'objects';
  -- Expected: 6+ policies
  ```

---

### Phase 3: Infrastructure Layer ✅

- [ ] **Triggers Active**
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

- [ ] **Functions Created**
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

- [ ] **pg_cron Enabled**
  ```sql
  SELECT * FROM pg_extension WHERE extname = 'pg_cron';
  -- Expected: 1 row
  ```

- [ ] **Cron Jobs Scheduled**
  ```sql
  SELECT COUNT(*) FROM cron.job
  WHERE jobname LIKE '%storage%' OR jobname LIKE '%cleanup%';
  -- Expected: 2
  ```

---

### Phase 4: Application Code ✅

- [ ] **API Routes**
  - [ ] `/api/storage/upload` - Returns proper error envelope
  - [ ] `/api/storage/signed-url` - Returns signed URLs
  - [ ] Error handling includes requestId

- [ ] **Hooks**
  - [ ] `useStorage` hook handles all error types
  - [ ] Error messages are user-friendly
  - [ ] Request IDs preserved in errors

- [ ] **Storage Helpers**
  - [ ] Server-side only (not imported client-side)
  - [ ] Error details preserved
  - [ ] Proper error propagation

---

### Phase 5: Testing ✅

- [ ] **Constraint Violation Test**
  - [ ] Upload file > 50MB to `documents` bucket
  - [ ] Expected: `400` with `CONSTRAINT_VIOLATION`
  - [ ] Message: User-friendly, no DB internals

- [ ] **RLS Policy Test**
  - [ ] Upload with wrong tenant user
  - [ ] Expected: `403` with `PERMISSION_DENIED`
  - [ ] No metadata row created

- [ ] **MIME Type Test**
  - [ ] Upload `.exe` to `public-assets` bucket
  - [ ] Expected: `415` with `UNSUPPORTED_MEDIA_TYPE`

- [ ] **Success Test**
  - [ ] Upload valid file
  - [ ] Expected: `200` with file URL
  - [ ] Trigger fires (check app table)

- [ ] **Error Handling Test**
  - [ ] Non-JSON response handling
  - [ ] Abort handling
  - [ ] Offline detection

---

### Phase 6: Monitoring Setup ✅

- [ ] **Health Check Queries**
  - [ ] `check_storage_anomalies()` - No issues
  - [ ] `get_storage_usage_report()` - Reasonable usage

- [ ] **Logging**
  - [ ] Server-side errors logged with requestId
  - [ ] Client-side errors include requestId
  - [ ] Log aggregation configured (if applicable)

- [ ] **Alerts** (Optional)
  - [ ] Storage usage alerts
  - [ ] Anomaly detection alerts
  - [ ] Cron job failure alerts

---

## Post-Deployment Verification

### Immediate Checks (First 24 Hours)

1. **Monitor Error Rates**
   ```sql
   -- Check for constraint violations
   SELECT * FROM check_storage_anomalies()
   WHERE anomaly_type = 'files_exceeding_limit';
   ```

2. **Verify Triggers**
   - Upload test file
   - Verify app table updated
   - Check trigger execution

3. **Verify Cron Jobs**
   ```sql
   -- Check cron job ran
   SELECT * FROM cron.job_run_details
   WHERE jobid IN (SELECT jobid FROM cron.job WHERE jobname LIKE '%storage%')
   ORDER BY start_time DESC
   LIMIT 5;
   ```

---

## Rollback Plan

### If Issues Occur

1. **Disable Triggers** (Temporary)
   ```sql
   ALTER TABLE storage.objects DISABLE TRIGGER on_document_upload;
   ALTER TABLE storage.objects DISABLE TRIGGER on_document_delete;
   ALTER TABLE storage.objects DISABLE TRIGGER on_message_attachment_upload;
   ALTER TABLE storage.objects DISABLE TRIGGER on_avatar_upload;
   ```

2. **Disable Cron Jobs** (Temporary)
   ```sql
   UPDATE cron.job SET active = false
   WHERE jobname LIKE '%storage%' OR jobname LIKE '%cleanup%';
   ```

3. **Revert API Route** (If needed)
   - Revert to previous version
   - Keep RLS policies active
   - Keep bucket constraints active

---

## Success Criteria

✅ **Deployment Successful If:**

- [ ] All health checks pass
- [ ] No anomalies detected
- [ ] Triggers firing correctly
- [ ] Cron jobs running on schedule
- [ ] Error handling working (user-friendly messages)
- [ ] Request IDs present in all responses
- [ ] No security issues (DB internals not exposed)

---

## Next Steps After Deployment

1. **Monitor for 1 week**
   - Daily health checks
   - Review error logs
   - Check storage usage

2. **Optimize if needed**
   - Add indexes if queries slow
   - Adjust cleanup schedules
   - Fine-tune limits

3. **Document for team**
   - Share operational guide
   - Train on error codes
   - Document request ID usage

---

*Deployment Checklist created: 2025-01-27*
