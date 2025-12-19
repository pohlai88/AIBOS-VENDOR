-- Quick Vault Setup Script
-- Purpose: Store required secrets in Supabase Vault
-- Date: 2025-01-27
-- 
-- INSTRUCTIONS:
-- 1. Replace 'YOUR_PROJECT_URL' with your actual Supabase project URL
-- 2. Replace 'YOUR_ANON_KEY' with your actual anon key (from Settings > API)
-- 3. Replace 'YOUR_SERVICE_ROLE_KEY' with your service role key (optional)
-- 4. Run this script in Supabase SQL Editor

-- ============================================================================
-- STEP 1: Get Your Credentials
-- ============================================================================
-- 
-- Go to: https://app.supabase.com → Your Project → Settings → API
-- Copy:
--   - Project URL (e.g., https://abcdefghijklmn.supabase.co)
--   - anon public key (starts with eyJ...)
--   - service_role key (starts with eyJ..., optional)
--

-- ============================================================================
-- STEP 2: Store Secrets (Uncomment and fill in values)
-- ============================================================================

-- Store project URL
-- SELECT vault.create_secret(
--   'https://YOUR_PROJECT_REF.supabase.co',  -- Replace with your project URL
--   'project_url',
--   'Supabase project URL for Edge Function calls'
-- );

-- Store anon key
-- SELECT vault.create_secret(
--   'YOUR_ANON_KEY_HERE',  -- Replace with your anon key
--   'anon_key',
--   'Supabase anon/public key for API authentication'
-- );

-- Store service role key (optional, for Edge Functions with elevated permissions)
-- SELECT vault.create_secret(
--   'YOUR_SERVICE_ROLE_KEY_HERE',  -- Replace with your service role key
--   'service_role_key',
--   'Supabase service role key for elevated permissions'
-- );

-- ============================================================================
-- STEP 3: Verify Setup
-- ============================================================================

-- Check if secrets exist
SELECT * FROM validate_vault_setup();

-- Test helper functions (should return values if secrets are stored)
-- SELECT get_project_url() as project_url;
-- SELECT get_anon_key() as anon_key;

-- ============================================================================
-- EXAMPLE: Complete Setup (Uncomment to use)
-- ============================================================================

/*
DO $$
BEGIN
  -- Store project URL
  IF NOT vault_secret_exists('project_url') THEN
    PERFORM vault.create_secret(
      'https://your-project-ref.supabase.co',
      'project_url',
      'Supabase project URL'
    );
    RAISE NOTICE '✅ Created project_url secret';
  ELSE
    RAISE NOTICE '⚠️ project_url already exists';
  END IF;
  
  -- Store anon key
  IF NOT vault_secret_exists('anon_key') THEN
    PERFORM vault.create_secret(
      'your-anon-key-here',
      'anon_key',
      'Supabase anon key'
    );
    RAISE NOTICE '✅ Created anon_key secret';
  ELSE
    RAISE NOTICE '⚠️ anon_key already exists';
  END IF;
  
  -- Validate
  RAISE NOTICE 'Vault setup validation:';
  PERFORM * FROM validate_vault_setup();
END $$;
*/
