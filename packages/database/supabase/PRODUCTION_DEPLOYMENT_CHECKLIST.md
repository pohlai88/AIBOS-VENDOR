# Production Deployment Checklist

**Date:** 2025-01-27  
**Status:** Ready for Production Deployment

---

## Pre-Deployment Checklist

### 1. Database Migrations ✅

- [x] All migrations created and tested
- [x] Multi-tenant schema migration (`000_multi_tenant_schema.sql`)
- [x] Multi-tenant RLS policies (`000_multi_tenant_rls.sql`)
- [x] Production optimization (`011_production_optimization.sql`)
- [ ] **Apply migrations to production database**
- [ ] Verify all tables created
- [ ] Verify all indexes created
- [ ] Verify all RLS policies active

### 2. Security Configuration ✅

- [x] RLS enabled on all tables
- [x] Tenant isolation policies
- [x] Service role policies optimized
- [ ] **Review security advisors** (0 issues found ✅)
- [ ] **Verify API keys** (anon + publishable)
- [ ] **Enable IP allowlisting** (if needed)
- [ ] **Review CORS settings**

### 3. Performance Optimization ✅

- [x] RLS policy optimization migration created
- [x] Performance monitoring functions created
- [x] Maintenance functions created
- [ ] **Apply optimization migration**
- [ ] **Monitor slow queries** (use `get_slow_queries()`)
- [ ] **Review index usage** (30+ unused indexes - monitor first)
- [ ] **Set up pg_cron jobs** (if extension enabled)

### 4. Feature Configuration

#### Authentication ✅
- [x] Email/password configured
- [x] SSO/SAML tables ready
- [ ] **Configure OAuth providers** (if needed)
- [ ] **Enable MFA** (if needed)

#### Storage ✅
- [x] Documents bucket configured
- [x] RLS policies for storage
- [ ] **Create additional buckets** (avatars, public, etc.)
- [ ] **Enable image transformations** (if needed)
- [ ] **Configure CDN** (if needed)

#### Realtime ⚠️
- [x] Tables ready for replication
- [ ] **Enable realtime for messages table**
- [ ] **Enable realtime for message_threads table**
- [ ] **Test realtime subscriptions**

#### Edge Functions ⚠️
- [ ] **Deploy webhook processor** (if needed)
- [ ] **Deploy email sender** (if needed)
- [ ] **Deploy background jobs** (if needed)

---

## Deployment Steps

### Step 1: Apply Migrations

```bash
# Option 1: Using Supabase CLI
supabase link --project-ref your-production-ref
supabase db push

# Option 2: Using Supabase Dashboard
# Copy and paste each migration file into SQL Editor
# Execute in order:
# 1. 000_multi_tenant_schema.sql
# 2. 000_multi_tenant_rls.sql
# 3. 011_production_optimization.sql
```

**Verification:**
```sql
-- Check tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check RLS
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Check functions
SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public';
```

### Step 2: Create Initial Tenant

```sql
-- Create your first tenant
INSERT INTO tenants (name, slug, status, subscription_tier, max_users, max_companies)
VALUES (
  'Your Company Name',
  'your-company-slug',
  'active',
  'enterprise',
  100,
  50
)
RETURNING *;
```

**Save the tenant ID** - you'll need it for the next steps.

### Step 3: Configure Storage

```sql
-- Verify documents bucket exists
SELECT * FROM storage.buckets WHERE id = 'documents';

-- If not, create it
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Verify storage policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

### Step 4: Enable Realtime

```sql
-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable realtime for message_threads
ALTER PUBLICATION supabase_realtime ADD TABLE message_threads;

-- Verify
SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
```

### Step 5: Set Up Monitoring

```sql
-- Test health check
SELECT health_check();

-- Test performance functions
SELECT * FROM get_slow_queries(5);
SELECT * FROM get_table_sizes();
SELECT * FROM get_index_usage() WHERE is_used = false LIMIT 10;
```

### Step 6: Schedule Maintenance Jobs

```sql
-- Verify pg_cron is enabled
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- If enabled, verify jobs are scheduled
SELECT * FROM cron.job;

-- Jobs should be automatically created by migration 011
```

---

## Post-Deployment Verification

### 1. Database Health ✅

```sql
-- Health check
SELECT health_check();

-- Connection stats
SELECT * FROM get_connection_stats();

-- Database size
SELECT get_database_size();
```

### 2. Security Verification ✅

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = false; -- Should return 0 rows

-- Check policies exist
SELECT COUNT(*) as policy_count 
FROM pg_policies 
WHERE schemaname = 'public';

-- Test tenant isolation
-- (Create test users in different tenants and verify they can't access each other's data)
```

### 3. Performance Verification ✅

```sql
-- Check for slow queries
SELECT * FROM get_slow_queries(10);

-- Check table sizes
SELECT * FROM get_table_sizes();

-- Check index usage
SELECT * FROM get_index_usage() 
WHERE index_scans = 0 
ORDER BY index_size DESC 
LIMIT 10;
```

### 4. Feature Verification

#### Authentication ✅
- [ ] Test user signup
- [ ] Test user login
- [ ] Test password reset
- [ ] Test SSO (if configured)

#### Storage ✅
- [ ] Test file upload
- [ ] Test file download
- [ ] Test file deletion
- [ ] Verify RLS policies work

#### Realtime ⚠️
- [ ] Test message subscription
- [ ] Test thread updates
- [ ] Verify WebSocket connections

#### API ✅
- [ ] Test REST API endpoints
- [ ] Verify RLS enforcement
- [ ] Test error handling
- [ ] Verify rate limiting

---

## Production Configuration

### Environment Variables

**Required:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Recommended:**
```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
SUPABASE_DB_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

### Application Configuration

**Update Next.js config:**
```typescript
// next.config.js
module.exports = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};
```

---

## Monitoring Setup

### 1. Supabase Dashboard

- [ ] Set up alerts for:
  - High API usage
  - Database size warnings
  - Error rate spikes
  - Slow query alerts

### 2. Custom Monitoring

```sql
-- Schedule daily health checks (if pg_cron enabled)
SELECT cron.schedule(
  'daily-health-check',
  '0 9 * * *', -- 9 AM daily
  'SELECT health_check();'
);
```

### 3. Application Monitoring

- [ ] Set up Sentry (already configured)
- [ ] Monitor API response times
- [ ] Track error rates
- [ ] Monitor user activity

---

## Backup Strategy

### Automated Backups ✅

**Supabase Provides:**
- Daily automated backups
- Point-in-time recovery (PITR)
- 7-day retention (Pro plan)

**Verify:**
- [ ] Backups are enabled
- [ ] Backup schedule is appropriate
- [ ] Test restore procedure

### Manual Backups

```bash
# Create manual backup
supabase db dump -f backup-$(date +%Y%m%d).sql

# Store in secure location
# Test restore on staging
```

---

## Rollback Plan

### If Migration Fails

1. **Stop deployment immediately**
2. **Review error logs**
3. **Fix migration issues**
4. **Test on staging first**
5. **Re-deploy**

### If Issues Detected Post-Deployment

1. **Monitor error rates**
2. **Check Supabase logs**
3. **Review slow queries**
4. **Check RLS policies**
5. **Rollback if critical**

---

## Performance Benchmarks

### Target Metrics

- **API Response Time:** < 200ms (p95)
- **Database Query Time:** < 100ms (average)
- **Connection Pool Usage:** < 80%
- **Error Rate:** < 0.1%

### Monitoring Queries

```sql
-- Average query time
SELECT 
  AVG(mean_exec_time) as avg_time_ms,
  MAX(max_exec_time) as max_time_ms
FROM pg_stat_statements
WHERE mean_exec_time > 0;

-- Connection usage
SELECT 
  (SELECT count(*) FROM pg_stat_activity) as active_connections,
  (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections;
```

---

## Support and Resources

### Documentation

- [Production Configuration](./PRODUCTION_CONFIGURATION.md)
- [Supabase Features Guide](./SUPABASE_FEATURES_GUIDE.md)
- [Testing Setup](./TESTING_SETUP.md)
- [Multi-Tenant Setup](./MULTI_TENANT_SETUP.md)

### Supabase Resources

- [Supabase Dashboard](https://app.supabase.com)
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Status](https://status.supabase.com)

### Emergency Contacts

- Supabase Support: support@supabase.com
- Database Issues: Check Supabase Dashboard > Database > Logs

---

## Final Checklist

### Before Going Live

- [ ] All migrations applied
- [ ] Security advisors reviewed (0 issues ✅)
- [ ] Performance optimization applied
- [ ] Realtime enabled (if needed)
- [ ] Storage buckets configured
- [ ] Monitoring set up
- [ ] Backups verified
- [ ] Health checks passing
- [ ] Test users created
- [ ] Documentation updated

### After Going Live

- [ ] Monitor error rates (first 24 hours)
- [ ] Check slow queries
- [ ] Verify RLS policies
- [ ] Test all critical features
- [ ] Review user feedback
- [ ] Monitor database growth
- [ ] Check connection pool usage

---

## Success Criteria

✅ **Production Ready When:**
- All migrations applied successfully
- Zero security vulnerabilities
- Performance optimizations active
- Monitoring in place
- Backups configured
- Health checks passing
- All features tested

---

*Last updated: 2025-01-27*  
*Status: Ready for Production Deployment*
