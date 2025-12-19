-- Migration: Optimize Supabase Vault Setup
-- Purpose: Create helper functions and optimize Vault usage for pg_net triggers
-- Date: 2025-01-27
-- Risk: LOW - Adds helper functions, no data changes

-- ============================================================================
-- 1. VERIFY VAULT EXTENSION
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'supabase_vault'
  ) THEN
    RAISE EXCEPTION 'supabase_vault extension is not enabled. Please enable it first.';
  END IF;
END $$;

-- ============================================================================
-- 2. CREATE HELPER FUNCTION TO GET PROJECT URL FROM VAULT
-- ============================================================================

CREATE OR REPLACE FUNCTION get_project_url()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
DECLARE
  project_url TEXT;
BEGIN
  SELECT decrypted_secret INTO project_url
  FROM vault.decrypted_secrets
  WHERE name = 'project_url'
  LIMIT 1;
  
  RETURN COALESCE(project_url, NULL);
END;
$$;

COMMENT ON FUNCTION get_project_url() IS 'Retrieves project URL from Supabase Vault for use in pg_net requests';

-- ============================================================================
-- 3. IMPROVE GET_ANON_KEY FUNCTION (if exists, update it)
-- ============================================================================

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
  SELECT decrypted_secret INTO anon_key
  FROM vault.decrypted_secrets
  WHERE name = 'anon_key'
  LIMIT 1;
  
  RETURN COALESCE(anon_key, NULL);
END;
$$;

COMMENT ON FUNCTION get_anon_key() IS 'Retrieves anon key from Supabase Vault for use in pg_net requests';

-- ============================================================================
-- 4. CREATE FUNCTION TO GET SERVICE ROLE KEY (for Edge Functions)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_service_role_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
DECLARE
  service_key TEXT;
BEGIN
  SELECT decrypted_secret INTO service_key
  FROM vault.decrypted_secrets
  WHERE name = 'service_role_key'
  LIMIT 1;
  
  RETURN COALESCE(service_key, NULL);
END;
$$;

COMMENT ON FUNCTION get_service_role_key() IS 'Retrieves service role key from Supabase Vault (use with caution)';

-- ============================================================================
-- 5. CREATE FUNCTION TO GET EDGE FUNCTION URL
-- ============================================================================

CREATE OR REPLACE FUNCTION get_edge_function_url(function_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
DECLARE
  project_url TEXT;
  function_url TEXT;
BEGIN
  project_url := get_project_url();
  
  IF project_url IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Construct Edge Function URL
  function_url := project_url || '/functions/v1/' || function_name;
  
  RETURN function_url;
END;
$$;

COMMENT ON FUNCTION get_edge_function_url(TEXT) IS 'Constructs Edge Function URL from project URL and function name';

-- ============================================================================
-- 6. CREATE FUNCTION TO GET VAULT SECRET (Generic Helper)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_vault_secret(secret_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
DECLARE
  secret_value TEXT;
BEGIN
  SELECT decrypted_secret INTO secret_value
  FROM vault.decrypted_secrets
  WHERE name = secret_name
  LIMIT 1;
  
  RETURN COALESCE(secret_value, NULL);
END;
$$;

COMMENT ON FUNCTION get_vault_secret(TEXT) IS 'Generic helper to retrieve any secret from Vault by name';

-- ============================================================================
-- 7. CREATE FUNCTION TO CHECK IF SECRET EXISTS
-- ============================================================================

CREATE OR REPLACE FUNCTION vault_secret_exists(secret_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
DECLARE
  secret_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO secret_count
  FROM vault.secrets
  WHERE name = secret_name;
  
  RETURN secret_count > 0;
END;
$$;

COMMENT ON FUNCTION vault_secret_exists(TEXT) IS 'Checks if a secret exists in Vault without decrypting it';

-- ============================================================================
-- 8. CREATE FUNCTION TO LIST ALL SECRET NAMES (Metadata Only)
-- ============================================================================

CREATE OR REPLACE FUNCTION list_vault_secret_names()
RETURNS TABLE (
  secret_name TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.name::TEXT,
    s.created_at,
    s.updated_at
  FROM vault.secrets s
  WHERE s.name IS NOT NULL
  ORDER BY s.created_at DESC;
END;
$$;

COMMENT ON FUNCTION list_vault_secret_names() IS 'Lists all secret names in Vault (metadata only, no decrypted values)';

-- ============================================================================
-- 9. UPDATE TRIGGER FUNCTIONS TO USE NEW HELPERS
-- ============================================================================

-- Update payment status change function
CREATE OR REPLACE FUNCTION notify_payment_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  edge_function_url TEXT;
  anon_key TEXT;
BEGIN
  -- Only notify on status change to critical states
  IF OLD.status != NEW.status AND NEW.status IN ('completed', 'failed', 'refunded', 'cancelled') THEN
    -- Get URLs and keys using helper functions
    edge_function_url := get_edge_function_url('payment-webhook');
    anon_key := get_anon_key();
    
    -- Only proceed if we have the required secrets
    IF edge_function_url IS NOT NULL AND anon_key IS NOT NULL THEN
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

-- Update document upload function
CREATE OR REPLACE FUNCTION notify_document_upload()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  edge_function_url TEXT;
  anon_key TEXT;
BEGIN
  -- Only trigger for new document uploads
  IF TG_OP = 'INSERT' AND NEW.file_url IS NOT NULL THEN
    -- Get URLs and keys using helper functions
    edge_function_url := get_edge_function_url('process-document');
    anon_key := get_anon_key();
    
    -- Only proceed if we have the required secrets
    IF edge_function_url IS NOT NULL AND anon_key IS NOT NULL THEN
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

-- ============================================================================
-- 10. CREATE FUNCTION TO VALIDATE VAULT SETUP
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_vault_setup()
RETURNS TABLE (
  secret_name TEXT,
  secret_exists BOOLEAN,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'project_url'::TEXT as secret_name,
    vault_secret_exists('project_url') as secret_exists,
    CASE 
      WHEN vault_secret_exists('project_url') THEN '✅ Configured'
      ELSE '❌ Missing'
    END::TEXT as status
  
  UNION ALL
  
  SELECT 
    'anon_key'::TEXT as secret_name,
    vault_secret_exists('anon_key') as secret_exists,
    CASE 
      WHEN vault_secret_exists('anon_key') THEN '✅ Configured'
      ELSE '❌ Missing'
    END::TEXT as status
  
  UNION ALL
  
  SELECT 
    'service_role_key'::TEXT as secret_name,
    vault_secret_exists('service_role_key') as secret_exists,
    CASE 
      WHEN vault_secret_exists('service_role_key') THEN '✅ Configured (Optional)'
      ELSE '⚠️ Not Set (Optional)'
    END::TEXT as status;
END;
$$;

COMMENT ON FUNCTION validate_vault_setup() IS 'Validates that required Vault secrets are configured';

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault extension for secure secret storage';
