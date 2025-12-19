-- Migration: Optimize pg_cron Jobs
-- Purpose: Add recommended cron jobs for maintenance and automation
-- Date: 2025-01-27
-- Risk: LOW - Adds scheduled jobs, can be disabled if needed

-- ============================================================================
-- 1. VERIFY PG_CRON IS ENABLED
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    RAISE EXCEPTION 'pg_cron extension is not enabled. Please enable it first.';
  END IF;
END $$;

-- ============================================================================
-- 2. DAILY ANALYZE (Optimize Query Planner)
-- ============================================================================

-- This job updates table statistics for the query planner
-- Critical for maintaining query performance
DO $$
BEGIN
  -- Check if function exists, create if not
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'analyze_all_tables'
  ) THEN
    CREATE OR REPLACE FUNCTION analyze_all_tables()
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = ''
    AS $$
    DECLARE
      table_record RECORD;
    BEGIN
      FOR table_record IN
        SELECT schemaname, tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename NOT LIKE 'pg_%'
      LOOP
        EXECUTE format('ANALYZE %I.%I', table_record.schemaname, table_record.tablename);
      END LOOP;
    END;
    $$;
  END IF;
  
  -- Schedule job (replace if exists)
  PERFORM cron.unschedule('daily-analyze');
  PERFORM cron.schedule(
    'daily-analyze',
    '0 2 * * *', -- 2 AM daily
    'SELECT analyze_all_tables();'
  );
  
  RAISE NOTICE 'Scheduled daily ANALYZE job';
END $$;

-- ============================================================================
-- 3. AUDIT LOG CLEANUP (Prevent Unbounded Growth)
-- ============================================================================

-- Keep last 90 days of audit events, but preserve critical events
DO $$
BEGIN
  -- Schedule job (replace if exists)
  PERFORM cron.unschedule('audit-cleanup');
  PERFORM cron.schedule(
    'audit-cleanup',
    '0 4 * * *', -- 4 AM daily
    $$
    DELETE FROM audit_events 
    WHERE created_at < NOW() - INTERVAL '90 days'
    AND id NOT IN (
      -- Preserve last 1000 critical events (DELETE, UPDATE)
      SELECT id FROM audit_events 
      WHERE action IN ('DELETE', 'UPDATE') 
      ORDER BY created_at DESC 
      LIMIT 1000
    );
    $$
  );
  
  RAISE NOTICE 'Scheduled audit log cleanup job';
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'audit_events table does not exist, skipping audit cleanup job';
END $$;

-- ============================================================================
-- 4. BATCH GENERATE EMBEDDINGS (If Vector Enabled)
-- ============================================================================

-- Process documents without embeddings in batches
DO $$
DECLARE
  project_url TEXT;
  anon_key TEXT;
BEGIN
  -- Check if vector extension is enabled
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    -- Get secrets from vault
    SELECT 
      (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url' LIMIT 1),
      (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'anon_key' LIMIT 1)
    INTO project_url, anon_key;
    
    -- Only schedule if we have the required secrets
    IF project_url IS NOT NULL AND anon_key IS NOT NULL THEN
      -- Check if pg_net is enabled
      IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
        PERFORM cron.unschedule('batch-generate-embeddings');
        PERFORM cron.schedule(
          'batch-generate-embeddings',
          '0 */6 * * *', -- Every 6 hours
          format($$
            SELECT net.http_post(
              url := '%s/functions/v1/batch-process-embeddings',
              headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer %s'
              ),
              body := jsonb_build_object('batch_size', 100)
            );
          $$, project_url, anon_key)
        );
        
        RAISE NOTICE 'Scheduled batch embedding generation job';
      ELSE
        RAISE NOTICE 'pg_net not enabled, skipping batch embedding job';
      END IF;
    ELSE
      RAISE NOTICE 'Project URL or anon key not in vault, skipping batch embedding job';
    END IF;
  ELSE
    RAISE NOTICE 'vector extension not enabled, skipping batch embedding job';
  END IF;
END $$;

-- ============================================================================
-- 5. PAYMENT STATUS SYNC (If Using External Processors)
-- ============================================================================

-- Sync payment statuses from external payment processors
-- Note: This requires a sync_payment_statuses() function to be created
DO $$
BEGIN
  -- Check if function exists
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'sync_payment_statuses'
  ) THEN
    PERFORM cron.unschedule('payment-status-sync');
    PERFORM cron.schedule(
      'payment-status-sync',
      '0 */6 * * *', -- Every 6 hours
      'SELECT sync_payment_statuses();'
    );
    
    RAISE NOTICE 'Scheduled payment status sync job';
  ELSE
    RAISE NOTICE 'sync_payment_statuses() function does not exist, skipping payment sync job';
  END IF;
END $$;

-- ============================================================================
-- 6. DAILY STATS AGGREGATION (If Needed)
-- ============================================================================

-- Aggregate daily statistics for dashboards
-- Note: This requires an aggregate_daily_stats() function to be created
DO $$
BEGIN
  -- Check if function exists
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'aggregate_daily_stats'
  ) THEN
    PERFORM cron.unschedule('daily-stats');
    PERFORM cron.schedule(
      'daily-stats',
      '0 1 * * *', -- 1 AM daily
      'SELECT aggregate_daily_stats();'
    );
    
    RAISE NOTICE 'Scheduled daily stats aggregation job';
  ELSE
    RAISE NOTICE 'aggregate_daily_stats() function does not exist, skipping stats job';
  END IF;
END $$;

-- ============================================================================
-- 7. LIST ALL SCHEDULED JOBS
-- ============================================================================

-- This query shows all scheduled cron jobs
DO $$
DECLARE
  job_record RECORD;
BEGIN
  RAISE NOTICE 'Current pg_cron jobs:';
  FOR job_record IN
    SELECT jobid, jobname, schedule, command, active
    FROM cron.job
    ORDER BY jobid
  LOOP
    RAISE NOTICE 'Job ID: %, Name: %, Schedule: %, Active: %', 
      job_record.jobid, 
      job_record.jobname, 
      job_record.schedule,
      job_record.active;
  END LOOP;
END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION analyze_all_tables() IS 'Analyzes all public tables to update query planner statistics';
