-- Vault Setup Script - Ready to Use
-- Purpose: Store required secrets in Supabase Vault
-- Date: 2025-01-27
-- 
-- INSTRUCTIONS:
-- 1. This script contains your actual project credentials
-- 2. Run this in Supabase SQL Editor
-- 3. Secrets will be stored securely in Vault

-- ============================================================================
-- YOUR PROJECT CREDENTIALS (Auto-detected)
-- ============================================================================

-- Project URL: https://vrawceruzokxitybkufk.supabase.co
-- Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyYXdjZXJ1em9reGl0eWJrdWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MTMxMzMsImV4cCI6MjA4MTM4OTEzM30.77ZTjHJdap0XGS2pi5FJqfdQDm6Tn9Fl1EptXQdertU

-- ============================================================================
-- STORE SECRETS IN VAULT
-- ============================================================================

DO $$
BEGIN
  -- Store project URL
  IF NOT EXISTS (
    SELECT 1 FROM vault.secrets WHERE name = 'project_url'
  ) THEN
    PERFORM vault.create_secret(
      'https://vrawceruzokxitybkufk.supabase.co',
      'project_url',
      'Supabase project URL for Edge Function calls'
    );
    RAISE NOTICE '✅ Created project_url secret';
  ELSE
    RAISE NOTICE '⚠️ project_url already exists - updating...';
    -- Update existing secret (get ID first)
    PERFORM vault.update_secret(
      (SELECT id FROM vault.secrets WHERE name = 'project_url' LIMIT 1),
      'https://vrawceruzokxitybkufk.supabase.co',
      'project_url',
      'Supabase project URL for Edge Function calls'
    );
    RAISE NOTICE '✅ Updated project_url secret';
  END IF;
  
  -- Store anon key
  IF NOT EXISTS (
    SELECT 1 FROM vault.secrets WHERE name = 'anon_key'
  ) THEN
    PERFORM vault.create_secret(
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyYXdjZXJ1em9reGl0eWJrdWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MTMxMzMsImV4cCI6MjA4MTM4OTEzM30.77ZTjHJdap0XGS2pi5FJqfdQDm6Tn9Fl1EptXQdertU',
      'anon_key',
      'Supabase anon/public key for API authentication'
    );
    RAISE NOTICE '✅ Created anon_key secret';
  ELSE
    RAISE NOTICE '⚠️ anon_key already exists - updating...';
    -- Update existing secret
    PERFORM vault.update_secret(
      (SELECT id FROM vault.secrets WHERE name = 'anon_key' LIMIT 1),
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyYXdjZXJ1em9reGl0eWJrdWZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MTMxMzMsImV4cCI6MjA4MTM4OTEzM30.77ZTjHJdap0XGS2pi5FJqfdQDm6Tn9Fl1EptXQdertU',
      'anon_key',
      'Supabase anon/public key for API authentication'
    );
    RAISE NOTICE '✅ Updated anon_key secret';
  END IF;
  
  -- Validate setup
  RAISE NOTICE '';
  RAISE NOTICE 'Vault Setup Validation:';
  RAISE NOTICE '======================';
END $$;

-- Show validation results
SELECT * FROM validate_vault_setup();

-- Test helper functions
SELECT 
  get_project_url() as project_url,
  CASE 
    WHEN get_anon_key() IS NOT NULL THEN '✅ Anon key retrieved'
    ELSE '❌ Anon key not found'
  END as anon_key_status,
  get_edge_function_url('test-function') as sample_function_url;
