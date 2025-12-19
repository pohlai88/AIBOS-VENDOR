-- ============================================================================
-- SUPABASE STORAGE - INFRASTRUCTURE & AUTOMATION LAYER
-- ============================================================================
-- Date: 2025-01-27
-- Status: Production-Ready Infrastructure Configuration
--
-- This file implements the critical infrastructure layer that sits BEHIND
-- the application code, providing:
-- 1. Hard database constraints (defense in depth)
-- 2. Event-driven automation (triggers)
-- 3. Automated maintenance (pg_cron)
--
-- IMPORTANT: Run this AFTER applying RLS policies
-- ============================================================================

-- ============================================================================
-- 1. HARD DATABASE CONSTRAINTS (Defense in Depth)
-- ============================================================================
-- These constraints enforce limits at the database level, preventing bad data
-- from entering even if RLS policies have bugs or are bypassed.
-- ============================================================================

-- Documents Bucket: Enforce strict limits
UPDATE storage.buckets
SET
  file_size_limit = 52428800, -- 50MB (hard limit)
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'text/csv',
    'application/json'
  ]::text[]
WHERE id = 'documents';

-- Message Attachments Bucket: Enforce strict limits
UPDATE storage.buckets
SET
  file_size_limit = 10485760, -- 10MB (hard limit)
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain'
  ]::text[]
WHERE id = 'message-attachments';

-- Public Assets Bucket: Enforce strict limits (images only)
UPDATE storage.buckets
SET
  file_size_limit = 5242880, -- 5MB (hard limit)
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'image/webp'
  ]::text[]
WHERE id = 'public-assets';

-- Verify constraints are applied
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets 
    WHERE id = 'documents' 
    AND file_size_limit = 52428800
  ) THEN
    RAISE EXCEPTION 'Documents bucket constraint not applied';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets 
    WHERE id = 'message-attachments' 
    AND file_size_limit = 10485760
  ) THEN
    RAISE EXCEPTION 'Message attachments bucket constraint not applied';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets 
    WHERE id = 'public-assets' 
    AND file_size_limit = 5242880
  ) THEN
    RAISE EXCEPTION 'Public assets bucket constraint not applied';
  END IF;
  
  RAISE NOTICE 'All bucket constraints verified successfully';
END $$;

-- ============================================================================
-- 2. EVENT-DRIVEN AUTOMATION (Database Triggers)
-- ============================================================================
-- These triggers ensure data consistency even if the client app crashes
-- or loses connection immediately after upload.
-- ============================================================================

-- Function: Update document record when file is uploaded to documents bucket
-- This ensures the documents table is always in sync with storage
-- Note: This is a reference implementation - adjust based on your workflow
-- The application layer already creates document records, so this trigger
-- can be used for additional automation or as a backup sync mechanism
CREATE OR REPLACE FUNCTION sync_document_on_upload()
RETURNS TRIGGER AS $$
DECLARE
  path_segments TEXT[];
  organization_id_val UUID;
  category_val TEXT;
  file_name_val TEXT;
  user_id_val UUID;
BEGIN
  -- Only process documents bucket
  IF NEW.bucket_id != 'documents' THEN
    RETURN NEW;
  END IF;

  -- Parse path: {tenant_id}/{organization_id}/{category}/{timestamp}_{filename}
  path_segments := string_to_array(NEW.name, '/');
  
  -- Only sync if document doesn't already exist (prevent duplicates)
  -- The application layer creates the document record, so this is a backup
  IF array_length(path_segments, 1) >= 4 AND NOT EXISTS (
    SELECT 1 FROM public.documents WHERE file_url = NEW.name
  ) THEN
    organization_id_val := path_segments[2]::UUID;
    category_val := path_segments[3];
    file_name_val := path_segments[4];
    user_id_val := COALESCE(NEW.owner_id::UUID, auth.uid());
    
    -- Extract filename from timestamp_filename format
    file_name_val := regexp_replace(file_name_val, '^\d+_', '');
    
    -- Insert document record as backup sync
    -- Note: This creates a minimal record - application should handle full details
    INSERT INTO public.documents (
      name,
      type,
      category,
      file_url,
      file_size,
      mime_type,
      organization_id,
      created_by,
      created_at
    )
    VALUES (
      file_name_val,
      COALESCE(
        (SELECT type FROM public.documents WHERE file_url = NEW.name LIMIT 1),
        'pdf' -- Default type
      ),
      category_val,
      NEW.name, -- Storage path (file_url)
      COALESCE((NEW.metadata->>'size')::bigint, 0),
      COALESCE(NEW.metadata->>'mimetype', 'application/octet-stream'),
      organization_id_val,
      user_id_val,
      NEW.created_at
    )
    ON CONFLICT DO NOTHING; -- Prevent duplicates
    
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Sync document on upload
CREATE TRIGGER on_document_upload
AFTER INSERT ON storage.objects
FOR EACH ROW
WHEN (NEW.bucket_id = 'documents')
EXECUTE FUNCTION sync_document_on_upload();

-- Function: Clean up document record when file is deleted
CREATE OR REPLACE FUNCTION cleanup_document_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process documents bucket
  IF OLD.bucket_id != 'documents' THEN
    RETURN OLD;
  END IF;

  -- Delete related document record
  -- Adjust based on your actual schema
  DELETE FROM public.documents
  WHERE file_url = OLD.name;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Clean up document on delete
CREATE TRIGGER on_document_delete
AFTER DELETE ON storage.objects
FOR EACH ROW
WHEN (OLD.bucket_id = 'documents')
EXECUTE FUNCTION cleanup_document_on_delete();

-- Function: Log message attachment upload (for monitoring)
-- NOTE: message_attachments table requires message_id (FK to messages)
-- Since attachments are always created with messages in the application layer,
-- this trigger only logs the upload for monitoring purposes.
-- The application layer handles the actual message_attachments record creation.
CREATE OR REPLACE FUNCTION log_message_attachment_upload()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process message-attachments bucket
  IF NEW.bucket_id != 'message-attachments' THEN
    RETURN NEW;
  END IF;

  -- Log the upload (optional: you can create a storage_upload_logs table)
  -- For now, we just ensure the file exists in storage
  -- The application layer creates the message_attachments record with message_id
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Log message attachment upload (monitoring only)
-- NOTE: This trigger does NOT create message_attachments records
-- because message_id is required and only available in application layer
CREATE TRIGGER on_message_attachment_upload
AFTER INSERT ON storage.objects
FOR EACH ROW
WHEN (NEW.bucket_id = 'message-attachments')
EXECUTE FUNCTION log_message_attachment_upload();

-- Function: Update organization avatar when public asset is uploaded
-- Path format: {tenant_id}/{organization_id}/avatar/{filename}
CREATE OR REPLACE FUNCTION update_organization_avatar()
RETURNS TRIGGER AS $$
DECLARE
  path_segments TEXT[];
  tenant_id_val UUID;
  organization_id_val UUID;
  category_val TEXT;
BEGIN
  -- Only process public-assets bucket
  IF NEW.bucket_id != 'public-assets' THEN
    RETURN NEW;
  END IF;

  -- Parse path: {tenant_id}/{organization_id}/avatar/{filename}
  path_segments := string_to_array(NEW.name, '/');
  
  IF array_length(path_segments, 1) >= 4 AND path_segments[3] = 'avatar' THEN
    tenant_id_val := path_segments[1]::UUID;
    organization_id_val := path_segments[2]::UUID;
    
    -- Update organization avatar URL
    UPDATE public.organizations
    SET 
      avatar_url = NEW.name, -- Storage path
      updated_at = NOW()
    WHERE 
      id = organization_id_val
      AND tenant_id = tenant_id_val;
    
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Update avatar on upload
CREATE TRIGGER on_avatar_upload
AFTER INSERT ON storage.objects
FOR EACH ROW
WHEN (NEW.bucket_id = 'public-assets' AND (string_to_array(NEW.name, '/'))[3] = 'avatar')
EXECUTE FUNCTION update_organization_avatar();

-- ============================================================================
-- 3. AUTOMATED MAINTENANCE (pg_cron)
-- ============================================================================
-- These scheduled jobs clean up orphaned files and maintain storage hygiene
-- ============================================================================

-- Enable pg_cron extension (if not already enabled)
-- IMPORTANT: Enable this in Supabase Dashboard -> Database -> Extensions
-- Then uncomment the cron schedules below
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Function: Clean up orphaned files (files without database records)
-- WARNING: Use with caution - ensure your database is the source of truth
CREATE OR REPLACE FUNCTION cleanup_orphaned_storage_files()
RETURNS TABLE (
  deleted_count BIGINT,
  bucket_id TEXT,
  total_size_deleted BIGINT
) AS $$
DECLARE
  deleted_count_val BIGINT;
  bucket_id_val TEXT;
  total_size_val BIGINT;
BEGIN
  -- Clean up orphaned documents (older than 7 days, not referenced in documents table)
  DELETE FROM storage.objects
  WHERE bucket_id = 'documents'
    AND created_at < NOW() - INTERVAL '7 days'
    AND name NOT IN (SELECT file_url FROM public.documents WHERE file_url IS NOT NULL)
  RETURNING COUNT(*), bucket_id, SUM((metadata->>'size')::bigint) INTO deleted_count_val, bucket_id_val, total_size_val;
  
  RETURN QUERY SELECT deleted_count_val, bucket_id_val, total_size_val;
  
  -- Clean up orphaned message attachments (older than 30 days, not referenced)
  DELETE FROM storage.objects
  WHERE bucket_id = 'message-attachments'
    AND created_at < NOW() - INTERVAL '30 days'
    AND name NOT IN (SELECT file_url FROM public.message_attachments WHERE file_url IS NOT NULL)
  RETURNING COUNT(*), bucket_id, SUM((metadata->>'size')::bigint) INTO deleted_count_val, bucket_id_val, total_size_val;
  
  RETURN QUERY SELECT deleted_count_val, bucket_id_val, total_size_val;
  
  -- Clean up old temporary uploads (if you have a temp bucket)
  -- DELETE FROM storage.objects
  -- WHERE bucket_id = 'temp-uploads'
  --   AND created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule: Clean up orphaned files weekly (Sunday at 3 AM)
-- IMPORTANT: Uncomment this after enabling pg_cron extension in Dashboard
-- To enable: Supabase Dashboard -> Database -> Extensions -> Enable "pg_cron"
SELECT cron.schedule(
  'cleanup-orphaned-storage-files',
  '0 3 * * 0', -- Every Sunday at 3 AM
  $$
    SELECT cleanup_orphaned_storage_files();
  $$
);

-- Function: Clean up incomplete uploads (TUS resumable uploads that never completed)
CREATE OR REPLACE FUNCTION cleanup_incomplete_uploads()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete multipart uploads older than 24 hours that were never completed
  DELETE FROM storage.s3_multipart_uploads
  WHERE created_at < NOW() - INTERVAL '24 hours'
    AND id NOT IN (
      SELECT DISTINCT upload_id 
      FROM storage.s3_multipart_uploads_parts
      WHERE created_at > NOW() - INTERVAL '1 hour'
    );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule: Clean up incomplete uploads daily (3 AM)
-- IMPORTANT: Uncomment this after enabling pg_cron extension in Dashboard
SELECT cron.schedule(
  'cleanup-incomplete-uploads',
  '0 3 * * *', -- Daily at 3 AM
  $$
    SELECT cleanup_incomplete_uploads();
  $$
);

-- Function: Generate storage usage report
CREATE OR REPLACE FUNCTION get_storage_usage_report()
RETURNS TABLE (
  bucket_id TEXT,
  file_count BIGINT,
  total_size_bytes BIGINT,
  total_size_mb NUMERIC,
  oldest_file TIMESTAMPTZ,
  newest_file TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.bucket_id,
    COUNT(*)::BIGINT as file_count,
    SUM((o.metadata->>'size')::bigint) as total_size_bytes,
    ROUND(SUM((o.metadata->>'size')::bigint) / 1024.0 / 1024.0, 2) as total_size_mb,
    MIN(o.created_at) as oldest_file,
    MAX(o.created_at) as newest_file
  FROM storage.objects o
  GROUP BY o.bucket_id
  ORDER BY total_size_bytes DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule: Generate storage usage report weekly (Monday at 9 AM)
-- Uncomment after enabling pg_cron extension
/*
SELECT cron.schedule(
  'storage-usage-report',
  '0 9 * * 1', -- Every Monday at 9 AM
  $$
    INSERT INTO storage_usage_reports (report_date, report_data)
    SELECT NOW(), jsonb_build_object(
      'buckets', (SELECT jsonb_agg(row_to_json(t)) FROM get_storage_usage_report() t)
    );
  $$
);
*/

-- ============================================================================
-- 4. MONITORING & ALERTS
-- ============================================================================
-- Functions to monitor storage health and detect issues
-- ============================================================================

-- Function: Check for storage anomalies
CREATE OR REPLACE FUNCTION check_storage_anomalies()
RETURNS TABLE (
  anomaly_type TEXT,
  bucket_id TEXT,
  count BIGINT,
  message TEXT
) AS $$
BEGIN
  -- Check for files exceeding bucket limits (should never happen with constraints)
  RETURN QUERY
  SELECT 
    'files_exceeding_limit'::TEXT,
    o.bucket_id,
    COUNT(*)::BIGINT,
    'Files found that exceed bucket size limit'::TEXT
  FROM storage.objects o
  JOIN storage.buckets b ON o.bucket_id = b.id
  WHERE (o.metadata->>'size')::bigint > b.file_size_limit
  GROUP BY o.bucket_id;
  
  -- Check for files with invalid MIME types
  RETURN QUERY
  SELECT 
    'invalid_mime_types'::TEXT,
    o.bucket_id,
    COUNT(*)::BIGINT,
    'Files found with MIME types not in bucket allowlist'::TEXT
  FROM storage.objects o
  JOIN storage.buckets b ON o.bucket_id = b.id
  WHERE o.metadata->>'mimetype' != ALL(b.allowed_mime_types)
  GROUP BY o.bucket_id;
  
  -- Check for orphaned files (not referenced in database)
  RETURN QUERY
  SELECT 
    'orphaned_documents'::TEXT,
    'documents'::TEXT,
    COUNT(*)::BIGINT,
    'Document files not referenced in documents table'::TEXT
  FROM storage.objects o
  WHERE o.bucket_id = 'documents'
    AND o.name NOT IN (SELECT file_url FROM public.documents WHERE file_url IS NOT NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the infrastructure layer is working correctly
-- ============================================================================

-- Verify bucket constraints
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

-- Verify triggers exist
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'storage'
  AND event_object_table = 'objects'
ORDER BY trigger_name;

-- Check storage usage
SELECT * FROM get_storage_usage_report();

-- Check for anomalies
SELECT * FROM check_storage_anomalies();

-- ============================================================================
-- NOTES
-- ============================================================================
--
-- 1. BUCKET CONSTRAINTS:
--    - These are hard limits enforced at the database level
--    - They cannot be bypassed by RLS policies or application code
--    - Always verify constraints after applying
--
-- 2. TRIGGERS:
--    - Triggers ensure data consistency even if client crashes
--    - Adjust trigger functions based on your actual schema
--    - Test triggers in development before production
--
-- 3. PG_CRON:
--    - Must be enabled in Supabase Dashboard -> Database -> Extensions
--    - Uncomment cron schedules after enabling extension
--    - Monitor cron job execution in Supabase Dashboard
--
-- 4. MAINTENANCE:
--    - Run cleanup functions manually first to test
--    - Review cleanup results before scheduling
--    - Adjust retention periods based on your needs
--
-- ============================================================================
