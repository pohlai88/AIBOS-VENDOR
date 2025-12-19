-- Production Optimization Migration
-- Fixes RLS performance issues and optimizes database for production

-- ============================================================================
-- 1. FIX RLS POLICY PERFORMANCE ISSUES
-- ============================================================================
-- Replace auth.role() with (select auth.role()) for better performance
-- This prevents re-evaluation for each row

-- Function to safely update RLS policies
CREATE OR REPLACE FUNCTION update_rls_policy_for_performance()
RETURNS void AS $$
DECLARE
  policy_record RECORD;
  new_policy_def TEXT;
BEGIN
  -- Get all policies that use auth.role() directly
  FOR policy_record IN
    SELECT 
      schemaname,
      tablename,
      policyname,
      permissive,
      roles,
      cmd,
      qual,
      with_check
    FROM pg_policies
    WHERE qual LIKE '%auth.role()%' 
       OR with_check LIKE '%auth.role()%'
  LOOP
    -- Replace auth.role() with (select auth.role())
    new_policy_def := REPLACE(
      COALESCE(policy_record.qual, '') || ' ' || COALESCE(policy_record.with_check, ''),
      'auth.role()',
      '(select auth.role())'
    );
    
    -- Drop and recreate policy (we'll do this manually for safety)
    RAISE NOTICE 'Policy % on %.% needs optimization', 
      policy_record.policyname, 
      policy_record.schemaname, 
      policy_record.tablename;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. CREATE OPTIMIZED RLS POLICIES FOR MDM TABLES
-- ============================================================================

-- Optimize service role policies for all MDM tables
-- Pattern: Replace auth.role() with (select auth.role())

DO $$
DECLARE
  table_name TEXT;
  tables TEXT[] := ARRAY[
    'mdm_lineage_node',
    'mdm_lineage_edge',
    'mdm_composite_kpi',
    'mdm_global_metadata',
    'mdm_entity_catalog',
    'mdm_standard_pack',
    'mdm_metadata_mapping',
    'mdm_kpi_definition',
    'mdm_kpi_component',
    'mdm_tag',
    'mdm_tag_assignment',
    'mdm_usage_log',
    'mdm_profile',
    'mdm_approval',
    'mdm_business_rule',
    'mdm_glossary_term'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables
  LOOP
    -- Drop existing service role policy if it exists
    EXECUTE format('DROP POLICY IF EXISTS "Service role has full access to %s" ON %I', 
      REPLACE(table_name, 'mdm_', ''), table_name);
    
    -- Create optimized service role policy
    EXECUTE format('
      CREATE POLICY "Service role has full access to %s"
      ON %I FOR ALL
      USING ((select auth.role()) = ''service_role'')
      WITH CHECK ((select auth.role()) = ''service_role'')
    ', REPLACE(table_name, 'mdm_', ''), table_name);
  END LOOP;
END $$;

-- ============================================================================
-- 3. CREATE PERFORMANCE MONITORING FUNCTIONS
-- ============================================================================

-- Function to get slow queries
CREATE OR REPLACE FUNCTION get_slow_queries(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  query TEXT,
  calls BIGINT,
  total_time DOUBLE PRECISION,
  mean_time DOUBLE PRECISION,
  max_time DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pg_stat_statements.query::TEXT,
    pg_stat_statements.calls,
    pg_stat_statements.total_exec_time,
    pg_stat_statements.mean_exec_time,
    pg_stat_statements.max_exec_time
  FROM pg_stat_statements
  WHERE pg_stat_statements.mean_exec_time > 100 -- Queries taking > 100ms on average
  ORDER BY pg_stat_statements.mean_exec_time DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get table sizes
CREATE OR REPLACE FUNCTION get_table_sizes()
RETURNS TABLE (
  table_name TEXT,
  row_count BIGINT,
  total_size TEXT,
  table_size TEXT,
  indexes_size TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname||'.'||tablename AS table_name,
    n_live_tup::BIGINT AS row_count,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get index usage statistics
CREATE OR REPLACE FUNCTION get_index_usage()
RETURNS TABLE (
  table_name TEXT,
  index_name TEXT,
  index_scans BIGINT,
  index_size TEXT,
  is_used BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname||'.'||tablename AS table_name,
    indexrelname AS index_name,
    idx_scan AS index_scans,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
    (idx_scan > 0) AS is_used
  FROM pg_stat_user_indexes
  WHERE schemaname = 'public'
  ORDER BY idx_scan ASC, pg_relation_size(indexrelid) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. CREATE MAINTENANCE FUNCTIONS
-- ============================================================================

-- Function to analyze all tables
CREATE OR REPLACE FUNCTION analyze_all_tables()
RETURNS void AS $$
DECLARE
  table_record RECORD;
BEGIN
  FOR table_record IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ANALYZE %I', table_record.tablename);
    RAISE NOTICE 'Analyzed table: %', table_record.tablename;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to vacuum and analyze table
CREATE OR REPLACE FUNCTION maintain_table(table_name TEXT)
RETURNS void AS $$
BEGIN
  EXECUTE format('VACUUM ANALYZE %I', table_name);
  RAISE NOTICE 'Maintained table: %', table_name;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. CREATE CONNECTION POOLING HELPER
-- ============================================================================

-- Function to check connection count
CREATE OR REPLACE FUNCTION get_connection_stats()
RETURNS TABLE (
  state TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    state,
    COUNT(*)::BIGINT
  FROM pg_stat_activity
  WHERE datname = current_database()
  GROUP BY state
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. CREATE BACKUP AND RESTORE HELPERS
-- ============================================================================

-- Function to get database size
CREATE OR REPLACE FUNCTION get_database_size()
RETURNS TEXT AS $$
BEGIN
  RETURN pg_size_pretty(pg_database_size(current_database()));
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 7. CREATE HEALTH CHECK FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION health_check()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'database', current_database(),
    'size', get_database_size(),
    'connections', (SELECT jsonb_agg(row_to_json(t)) FROM get_connection_stats() t),
    'timestamp', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. CREATE AUTOMATED MAINTENANCE JOB (using pg_cron if available)
-- ============================================================================

-- Schedule daily ANALYZE (if pg_cron is enabled)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Schedule daily analyze at 2 AM
    PERFORM cron.schedule(
      'daily-analyze',
      '0 2 * * *',
      'SELECT analyze_all_tables();'
    );
    
    RAISE NOTICE 'Scheduled daily ANALYZE job';
  ELSE
    RAISE NOTICE 'pg_cron not available - manual maintenance required';
  END IF;
END $$;

-- ============================================================================
-- 9. CREATE INDEXES FOR COMMON QUERIES
-- ============================================================================

-- Index for tenant-based queries (if tenants table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tenants') THEN
    -- Composite index for tenant + status queries
    CREATE INDEX IF NOT EXISTS idx_tenants_status_active 
    ON tenants(status) 
    WHERE status = 'active';
    
    RAISE NOTICE 'Created tenant status index';
  END IF;
END $$;

-- ============================================================================
-- 10. OPTIMIZE EXISTING INDEXES
-- ============================================================================

-- Analyze all tables to update statistics
SELECT analyze_all_tables();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON FUNCTION get_slow_queries IS 'Returns slow queries from pg_stat_statements';
COMMENT ON FUNCTION get_table_sizes IS 'Returns size information for all tables';
COMMENT ON FUNCTION get_index_usage IS 'Returns index usage statistics';
COMMENT ON FUNCTION analyze_all_tables IS 'Runs ANALYZE on all public tables';
COMMENT ON FUNCTION maintain_table IS 'Runs VACUUM ANALYZE on specified table';
COMMENT ON FUNCTION get_connection_stats IS 'Returns connection statistics';
COMMENT ON FUNCTION get_database_size IS 'Returns current database size';
COMMENT ON FUNCTION health_check IS 'Returns database health check information';
