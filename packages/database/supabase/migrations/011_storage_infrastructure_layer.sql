-- ============================================================================
-- Migration: Storage Infrastructure & Automation Layer
-- ============================================================================
-- Date: 2025-01-27
-- Description: Implements hard database constraints, triggers, and pg_cron
--              for automated storage maintenance
-- ============================================================================
-- IMPORTANT: Run this AFTER RLS policies are applied
-- ============================================================================

-- ============================================================================
-- 1. HARD DATABASE CONSTRAINTS (Defense in Depth)
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

-- Function: Sync document record when file is uploaded (backup mechanism)
CREATE OR REPLACE FUNCTION sync_document_on_upload()
RETURNS TRIGGER AS $$
DECLARE
  path_segments TEXT[];
  organization_id_val UUID;
  category_val TEXT;
  file_name_val TEXT;
  user_id_val UUID;
BEGIN
  IF NEW.bucket_id != 'documents' THEN
    RETURN NEW;
  END IF;

  path_segments := string_to_array(NEW.name, '/');
  
  -- Only sync if document doesn't already exist (prevent duplicates)
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
        'pdf'
      ),
      category_val,
      NEW.name,
      COALESCE((NEW.metadata->>'size')::bigint, 0),
      COALESCE(NEW.metadata->>'mimetype', 'application/octet-stream'),
      organization_id_val,
      user_id_val,
      NEW.created_at
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Sync document on upload
DROP TRIGGER IF EXISTS on_document_upload ON storage.objects;
CREATE TRIGGER on_document_upload
AFTER INSERT ON storage.objects
FOR EACH ROW
WHEN (NEW.bucket_id = 'documents')
EXECUTE FUNCTION sync_document_on_upload();

-- Function: Clean up document record when file is deleted
CREATE OR REPLACE FUNCTION cleanup_document_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.bucket_id != 'documents' THEN
    RETURN OLD;
  END IF;

  DELETE FROM public.documents
  WHERE file_url = OLD.name;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Clean up document on delete
DROP TRIGGER IF EXISTS on_document_delete ON storage.objects;
CREATE TRIGGER on_document_delete
AFTER DELETE ON storage.objects
FOR EACH ROW
WHEN (OLD.bucket_id = 'documents')
EXECUTE FUNCTION cleanup_document_on_delete();

-- Function: Log message attachment upload (monitoring only)
-- NOTE: message_attachments requires message_id, so application layer handles record creation
CREATE OR REPLACE FUNCTION log_message_attachment_upload()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.bucket_id != 'message-attachments' THEN
    RETURN NEW;
  END IF;
  -- Logging can be added here if needed
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Log message attachment upload
DROP TRIGGER IF EXISTS on_message_attachment_upload ON storage.objects;
CREATE TRIGGER on_message_attachment_upload
AFTER INSERT ON storage.objects
FOR EACH ROW
WHEN (NEW.bucket_id = 'message-attachments')
EXECUTE FUNCTION log_message_attachment_upload();

-- Function: Update organization avatar when public asset is uploaded
CREATE OR REPLACE FUNCTION update_organization_avatar()
RETURNS TRIGGER AS $$
DECLARE
  path_segments TEXT[];
  tenant_id_val UUID;
  organization_id_val UUID;
BEGIN
  IF NEW.bucket_id != 'public-assets' THEN
    RETURN NEW;
  END IF;

  path_segments := string_to_array(NEW.name, '/');
  
  IF array_length(path_segments, 1) >= 4 AND path_segments[3] = 'avatar' THEN
    tenant_id_val := path_segments[1]::UUID;
    organization_id_val := path_segments[2]::UUID;
    
    UPDATE public.organizations
    SET 
      avatar_url = NEW.name,
      updated_at = NOW()
    WHERE 
      id = organization_id_val
      AND tenant_id = tenant_id_val;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Update avatar on upload
DROP TRIGGER IF EXISTS on_avatar_upload ON storage.objects;
CREATE TRIGGER on_avatar_upload
AFTER INSERT ON storage.objects
FOR EACH ROW
WHEN (NEW.bucket_id = 'public-assets' AND (string_to_array(NEW.name, '/'))[3] = 'avatar')
EXECUTE FUNCTION update_organization_avatar();

-- ============================================================================
-- 3. AUTOMATED MAINTENANCE (pg_cron)
-- ============================================================================

-- Enable pg_cron extension (if not already enabled)
-- NOTE: This may require superuser privileges. If it fails, enable via Dashboard:
-- Dashboard -> Database -> Extensions -> Enable "pg_cron"
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Function: Clean up orphaned files
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
  -- Clean up orphaned documents (older than 7 days, not referenced)
  WITH deleted AS (
    DELETE FROM storage.objects
    WHERE bucket_id = 'documents'
      AND created_at < NOW() - INTERVAL '7 days'
      AND name NOT IN (SELECT file_url FROM public.documents WHERE file_url IS NOT NULL)
    RETURNING bucket_id, (metadata->>'size')::bigint as size
  )
  SELECT COUNT(*), bucket_id, COALESCE(SUM(size), 0)
  INTO deleted_count_val, bucket_id_val, total_size_val
  FROM deleted;
  
  RETURN QUERY SELECT deleted_count_val, bucket_id_val, total_size_val;
  
  -- Clean up orphaned message attachments (older than 30 days, not referenced)
  WITH deleted AS (
    DELETE FROM storage.objects
    WHERE bucket_id = 'message-attachments'
      AND created_at < NOW() - INTERVAL '30 days'
      AND name NOT IN (SELECT file_url FROM public.message_attachments WHERE file_url IS NOT NULL)
    RETURNING bucket_id, (metadata->>'size')::bigint as size
  )
  SELECT COUNT(*), bucket_id, COALESCE(SUM(size), 0)
  INTO deleted_count_val, bucket_id_val, total_size_val
  FROM deleted;
  
  RETURN QUERY SELECT deleted_count_val, bucket_id_val, total_size_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule: Clean up orphaned files weekly (Sunday at 3 AM)
-- NOTE: Uncomment after verifying pg_cron is enabled
SELECT cron.schedule(
  'cleanup-orphaned-storage-files',
  '0 3 * * 0', -- Every Sunday at 3 AM
  $$
    SELECT cleanup_orphaned_storage_files();
  $$
);

-- Function: Clean up incomplete uploads
CREATE OR REPLACE FUNCTION cleanup_incomplete_uploads()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Note: This assumes storage.s3_multipart_uploads table exists
  -- Adjust if your Supabase version uses different table names
  DELETE FROM storage.s3_multipart_uploads
  WHERE created_at < NOW() - INTERVAL '24 hours'
    AND id NOT IN (
      SELECT DISTINCT upload_id 
      FROM storage.s3_multipart_uploads_parts
      WHERE created_at > NOW() - INTERVAL '1 hour'
    );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
EXCEPTION
  WHEN undefined_table THEN
    -- Table doesn't exist in this Supabase version, skip
    RETURN 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule: Clean up incomplete uploads daily (3 AM)
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

-- Function: Check for storage anomalies
CREATE OR REPLACE FUNCTION check_storage_anomalies()
RETURNS TABLE (
  anomaly_type TEXT,
  bucket_id TEXT,
  count BIGINT,
  message TEXT
) AS $$
BEGIN
  -- Check for files exceeding bucket limits
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
  
  -- Check for orphaned files
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
