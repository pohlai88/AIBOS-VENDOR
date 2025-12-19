-- Migration: Add Tenant-Scoped Unique Constraints
-- Purpose: Replace global unique constraints with tenant-scoped ones
-- Date: 2025-01-27
-- Risk: MEDIUM - May require data cleanup if duplicates exist

-- ============================================================================
-- 1. USERS.EMAIL - Make tenant-scoped instead of global
-- ============================================================================

-- First, check if there are any duplicate emails within the same tenant
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT tenant_id, email, COUNT(*) as cnt
    FROM users
    WHERE tenant_id IS NOT NULL
    GROUP BY tenant_id, email
    HAVING COUNT(*) > 1
  ) duplicates;
  
  IF duplicate_count > 0 THEN
    RAISE WARNING 'Found % duplicate email addresses within tenants. Please clean up before applying unique constraint.', duplicate_count;
  END IF;
END $$;

-- Drop existing global unique constraint on email
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_email_key' 
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_email_key;
  END IF;
END $$;

-- Add tenant-scoped unique constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
    AND tablename = 'users'
    AND indexname = 'users_tenant_email_unique'
  ) THEN
    CREATE UNIQUE INDEX users_tenant_email_unique 
    ON users(tenant_id, email)
    WHERE tenant_id IS NOT NULL;
  END IF;
END $$;

-- ============================================================================
-- 2. DOCUMENTS - Add tenant-scoped unique if external_id or document_no exists
-- ============================================================================

-- Check if external_id column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'documents'
    AND column_name = 'external_id'
  ) THEN
    -- Add tenant-scoped unique on (tenant_id, external_id)
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes
      WHERE schemaname = 'public'
      AND tablename = 'documents'
      AND indexname = 'documents_tenant_external_id_unique'
    ) THEN
      CREATE UNIQUE INDEX documents_tenant_external_id_unique 
      ON documents(tenant_id, external_id)
      WHERE tenant_id IS NOT NULL AND external_id IS NOT NULL;
    END IF;
  END IF;
END $$;

-- Check if document_no column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'documents'
    AND column_name = 'document_no'
  ) THEN
    -- Add tenant-scoped unique on (tenant_id, document_no)
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes
      WHERE schemaname = 'public'
      AND tablename = 'documents'
      AND indexname = 'documents_tenant_document_no_unique'
    ) THEN
      CREATE UNIQUE INDEX documents_tenant_document_no_unique 
      ON documents(tenant_id, document_no)
      WHERE tenant_id IS NOT NULL AND document_no IS NOT NULL;
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 3. PAYMENTS - Add tenant-scoped unique if transaction_id should be unique
-- ============================================================================

-- Note: transaction_id might need to be unique per tenant
-- Uncomment if transaction_id should be unique per tenant:
-- DO $$
-- BEGIN
--   IF NOT EXISTS (
--     SELECT 1 FROM pg_indexes
--     WHERE schemaname = 'public'
--     AND tablename = 'payments'
--     AND indexname = 'payments_tenant_transaction_id_unique'
--   ) THEN
--     CREATE UNIQUE INDEX payments_tenant_transaction_id_unique 
--     ON payments(tenant_id, transaction_id)
--     WHERE tenant_id IS NOT NULL AND transaction_id IS NOT NULL;
--   END IF;
-- END $$;

-- ============================================================================
-- Summary
-- ============================================================================

-- Created tenant-scoped unique constraints:
-- ✅ users(tenant_id, email) - Replaces global email unique
-- ⚠️ documents(tenant_id, external_id) - If external_id column exists
-- ⚠️ documents(tenant_id, document_no) - If document_no column exists
