-- Migration: Enable pg_net and Create Critical Triggers
-- Purpose: Enable pg_net extension and create time-sensitive trigger functions
-- Date: 2025-01-27
-- Risk: LOW - Adds async HTTP capability, non-blocking

-- ============================================================================
-- 1. ENABLE PG_NET EXTENSION
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================================================
-- 2. CREATE HELPER FUNCTION TO GET ANON KEY FROM VAULT
-- ============================================================================

-- This function retrieves the anon key from Supabase Vault securely
-- Note: You'll need to store the anon key in Vault first:
-- SELECT vault.create_secret('YOUR_ANON_KEY', 'anon_key');

CREATE OR REPLACE FUNCTION get_anon_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
DECLARE
  anon_key TEXT;
BEGIN
  -- Try to get from vault first
  SELECT decrypted_secret INTO anon_key
  FROM vault.decrypted_secrets
  WHERE name = 'anon_key'
  LIMIT 1;
  
  -- If not in vault, return NULL (will need to be set)
  RETURN COALESCE(anon_key, NULL);
END;
$$;

COMMENT ON FUNCTION get_anon_key() IS 'Retrieves anon key from Supabase Vault for use in pg_net requests';

-- ============================================================================
-- 3. CREATE PAYMENT STATUS CHANGE WEBHOOK TRIGGER
-- ============================================================================

-- Only trigger for critical payment status changes
CREATE OR REPLACE FUNCTION notify_payment_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  project_url TEXT;
  anon_key TEXT;
  edge_function_url TEXT;
BEGIN
  -- Only notify on status change to critical states
  IF OLD.status != NEW.status AND NEW.status IN ('completed', 'failed', 'refunded', 'cancelled') THEN
    -- Get project URL and anon key from vault
    SELECT 
      (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url' LIMIT 1),
      get_anon_key()
    INTO project_url, anon_key;
    
    -- Only proceed if we have the required secrets
    IF project_url IS NOT NULL AND anon_key IS NOT NULL THEN
      edge_function_url := project_url || '/functions/v1/payment-webhook';
      
      -- Send async HTTP request (non-blocking)
      PERFORM net.http_post(
        url := edge_function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || anon_key
        ),
        body := jsonb_build_object(
          'payment_id', NEW.id,
          'old_status', OLD.status,
          'new_status', NEW.status,
          'tenant_id', NEW.tenant_id,
          'organization_id', NEW.organization_id,
          'amount', NEW.amount,
          'currency', NEW.currency,
          'timestamp', NOW()
        ),
        timeout_milliseconds := 5000
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION notify_payment_status_change() IS 'Sends async webhook notification when payment status changes to critical states';

-- Create trigger only if payments table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'payments'
  ) THEN
    -- Drop existing trigger if it exists
    DROP TRIGGER IF EXISTS payment_status_webhook_trigger ON payments;
    
    -- Create trigger
    CREATE TRIGGER payment_status_webhook_trigger
      AFTER UPDATE OF status ON payments
      FOR EACH ROW
      WHEN (OLD.status IS DISTINCT FROM NEW.status)
      EXECUTE FUNCTION notify_payment_status_change();
    
    RAISE NOTICE 'Created payment status webhook trigger';
  ELSE
    RAISE NOTICE 'Payments table does not exist, skipping trigger creation';
  END IF;
END $$;

-- ============================================================================
-- 4. CREATE DOCUMENT UPLOAD NOTIFICATION TRIGGER
-- ============================================================================

-- Trigger Edge Function for document processing (e.g., generate embeddings)
CREATE OR REPLACE FUNCTION notify_document_upload()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  project_url TEXT;
  anon_key TEXT;
  edge_function_url TEXT;
BEGIN
  -- Only trigger for new document uploads
  IF TG_OP = 'INSERT' AND NEW.file_url IS NOT NULL THEN
    -- Get project URL and anon key from vault
    SELECT 
      (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url' LIMIT 1),
      get_anon_key()
    INTO project_url, anon_key;
    
    -- Only proceed if we have the required secrets
    IF project_url IS NOT NULL AND anon_key IS NOT NULL THEN
      edge_function_url := project_url || '/functions/v1/process-document';
      
      -- Send async HTTP request (non-blocking)
      PERFORM net.http_post(
        url := edge_function_url,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || anon_key
        ),
        body := jsonb_build_object(
          'document_id', NEW.id,
          'name', NEW.name,
          'type', NEW.type,
          'category', NEW.category,
          'tenant_id', NEW.tenant_id,
          'organization_id', NEW.organization_id,
          'file_url', NEW.file_url,
          'action', 'process_upload',
          'timestamp', NOW()
        ),
        timeout_milliseconds := 5000
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION notify_document_upload() IS 'Sends async notification when document is uploaded for processing';

-- Create trigger only if documents table exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'documents'
  ) THEN
    -- Drop existing trigger if it exists
    DROP TRIGGER IF EXISTS document_upload_notification_trigger ON documents;
    
    -- Create trigger
    CREATE TRIGGER document_upload_notification_trigger
      AFTER INSERT ON documents
      FOR EACH ROW
      WHEN (NEW.file_url IS NOT NULL)
      EXECUTE FUNCTION notify_document_upload();
    
    RAISE NOTICE 'Created document upload notification trigger';
  ELSE
    RAISE NOTICE 'Documents table does not exist, skipping trigger creation';
  END IF;
END $$;

-- ============================================================================
-- 5. VERIFY PG_NET INSTALLATION
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_net'
  ) THEN
    RAISE NOTICE 'pg_net extension enabled successfully';
  ELSE
    RAISE WARNING 'pg_net extension may not be enabled - check Supabase dashboard';
  END IF;
END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON EXTENSION pg_net IS 'Async HTTP extension for non-blocking webhooks and Edge Function invocations';
