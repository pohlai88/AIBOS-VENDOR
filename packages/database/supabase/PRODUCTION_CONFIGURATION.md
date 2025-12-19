# Supabase Production Configuration Guide

**Date:** 2025-01-27  
**Status:** Production-Ready Configuration

---

## Executive Summary

This guide provides comprehensive configuration for production-grade Supabase database setup, including:

- ✅ Performance optimizations
- ✅ Security hardening
- ✅ Monitoring and maintenance
- ✅ Testing setup
- ✅ Feature utilization
- ✅ Backup and recovery

---

## 1. Database Configuration

### 1.1 Current Settings

Your database is configured with production-ready settings:

| Setting | Value | Status |
|---------|-------|--------|
| `shared_buffers` | 224 MB | ✅ Optimized |
| `effective_cache_size` | 384 MB | ✅ Optimized |
| `work_mem` | 2.1 MB | ✅ Optimized |
| `maintenance_work_mem` | 32 MB | ✅ Optimized |
| `max_connections` | 60 | ✅ Appropriate |
| `random_page_cost` | 1.1 | ✅ SSD optimized |
| `effective_io_concurrency` | 200 | ✅ High I/O |

### 1.2 Recommended Extensions

**Currently Installed:**
- ✅ `uuid-ossp` - UUID generation
- ✅ `pgcrypto` - Cryptographic functions
- ✅ `pg_stat_statements` - Query performance monitoring
- ✅ `pg_graphql` - GraphQL API
- ✅ `supabase_vault` - Secrets management

**Recommended for Production:**
- ✅ `pg_cron` - Scheduled jobs (maintenance, cleanup)
- ✅ `pg_net` - Async HTTP (webhooks, external APIs)
- ✅ `vector` - Vector embeddings (if using AI features)
- ✅ `pgmq` - Message queue (background jobs)

---

## 2. Performance Optimizations

### 2.1 RLS Policy Optimization

**Issue:** 18 RLS policies re-evaluating `auth.role()` for each row

**Solution:** Migration `011_production_optimization.sql` fixes this:

```sql
-- Before (slow)
USING (auth.role() = 'service_role')

-- After (optimized)
USING ((select auth.role()) = 'service_role')
```

**Impact:** 10-100x performance improvement on large queries

### 2.2 Index Optimization

**Current Status:**
- 30+ unused indexes detected
- Monitor usage before removing
- Keep indexes for future queries

**Action Plan:**
1. Monitor index usage for 2-4 weeks
2. Remove unused indexes after confirmation
3. Add indexes based on query patterns

### 2.3 Query Performance Monitoring

Use built-in functions:

```sql
-- Get slow queries
SELECT * FROM get_slow_queries(10);

-- Get table sizes
SELECT * FROM get_table_sizes();

-- Get index usage
SELECT * FROM get_index_usage();
```

---

## 3. Security Configuration

### 3.1 Row Level Security (RLS)

**Status:** ✅ All tables have RLS enabled

**Policies:**
- ✅ Tenant isolation enforced
- ✅ Organization-level access control
- ✅ Service role bypass for admin operations
- ✅ Vendor relationship access control

### 3.2 API Keys

**Current Keys:**
- ✅ Legacy anon key (for compatibility)
- ✅ Modern publishable key (recommended)

**Best Practices:**
- Use publishable keys for new integrations
- Rotate keys regularly
- Never expose service role key in client code

### 3.3 Network Security

**Recommended:**
- Enable IP allowlisting for production
- Use connection pooling (Supabase handles this)
- Enable SSL/TLS (enabled by default)

---

## 4. Supabase Features Utilization

### 4.1 Authentication ✅

**Current Usage:**
- Email/password authentication
- SSO/SAML support (configured)
- Session management via cookies

**Available Features:**
- ✅ OAuth providers (Google, GitHub, etc.)
- ✅ Magic links
- ✅ Phone authentication
- ✅ MFA (Multi-Factor Authentication)

### 4.2 Storage ✅

**Current Setup:**
- Documents bucket (configured)
- RLS policies for access control

**Recommended:**
- Enable image transformations
- Set up CDN for public assets
- Configure lifecycle policies

### 4.3 Realtime ✅

**Current Setup:**
- Messages table (ready for replication)
- Message threads table (ready for replication)

**Enable:**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_threads;
```

**Available Features:**
- Real-time subscriptions
- Presence (who's online)
- Broadcast channels

### 4.4 Edge Functions ⚠️

**Status:** Not deployed yet

**Recommended Use Cases:**
- Webhook processing
- Background jobs
- External API integrations
- Image processing
- Email sending

**Deployment:**
```bash
supabase functions deploy function-name
```

### 4.5 Database Functions ✅

**Current Functions:**
- `get_user_organization_id()`
- `get_user_role()`
- `is_vendor_for_company()`
- `update_updated_at_column()`
- Multi-tenant helpers

**Production Functions:**
- `get_slow_queries()` - Performance monitoring
- `get_table_sizes()` - Size monitoring
- `get_index_usage()` - Index analysis
- `health_check()` - Health monitoring

### 4.6 Scheduled Jobs (pg_cron)

**Recommended Jobs:**
```sql
-- Daily ANALYZE (already scheduled)
SELECT cron.schedule('daily-analyze', '0 2 * * *', 'SELECT analyze_all_tables();');

-- Weekly VACUUM
SELECT cron.schedule('weekly-vacuum', '0 3 * * 0', 'VACUUM ANALYZE;');

-- Data retention cleanup
SELECT cron.schedule('retention-cleanup', '0 4 * * *', 'SELECT cleanup_old_data();');
```

---

## 5. Monitoring and Maintenance

### 5.1 Health Checks

**Automated Health Check:**
```sql
SELECT health_check();
```

**Returns:**
- Database name
- Size
- Connection statistics
- Timestamp

### 5.2 Performance Monitoring

**Use Supabase Dashboard:**
- Query performance
- Connection pooling
- Database size
- API usage

**Custom Monitoring:**
```sql
-- Slow queries
SELECT * FROM get_slow_queries(10);

-- Table sizes
SELECT * FROM get_table_sizes();

-- Index usage
SELECT * FROM get_index_usage();
```

### 5.3 Maintenance Schedule

**Daily:**
- ✅ Automatic ANALYZE (scheduled via pg_cron)
- Monitor slow queries
- Check connection pool

**Weekly:**
- VACUUM ANALYZE
- Review unused indexes
- Check database growth

**Monthly:**
- Review and optimize RLS policies
- Analyze query patterns
- Update statistics targets

---

## 6. Testing Setup

### 6.1 Local Development

**Using Supabase CLI:**
```bash
# Start local Supabase
supabase start

# Run migrations
supabase db reset

# Generate types
supabase gen types typescript --local > types/database.ts
```

### 6.2 Test Database

**Create Test Branch:**
```sql
-- Using Supabase MCP
-- Create branch for testing
```

**Test Data:**
- Seed scripts for test tenants
- Test users with different roles
- Sample documents and messages

### 6.3 Integration Tests

**Test RLS Policies:**
```typescript
// Test tenant isolation
test('users cannot access other tenant data', async () => {
  const tenant1User = await createTestUser({ tenant_id: tenant1.id });
  const tenant2Data = await queryAsUser(tenant1User, 'SELECT * FROM documents WHERE tenant_id = $1', [tenant2.id]);
  expect(tenant2Data).toHaveLength(0);
});
```

---

## 7. Backup and Recovery

### 7.1 Automated Backups

**Supabase Provides:**
- ✅ Daily automated backups
- ✅ Point-in-time recovery (PITR)
- ✅ 7-day retention (Pro plan)

### 7.2 Manual Backups

**Using Supabase CLI:**
```bash
# Backup database
supabase db dump -f backup.sql

# Restore database
supabase db reset
psql < backup.sql
```

### 7.3 Migration Strategy

**Best Practices:**
1. Test migrations on local/staging first
2. Use transaction blocks
3. Make migrations idempotent
4. Keep rollback scripts

---

## 8. Production Deployment Checklist

### Pre-Deployment

- [ ] Run all migrations locally
- [ ] Test RLS policies
- [ ] Verify indexes
- [ ] Check performance
- [ ] Review security advisors
- [ ] Test backup/restore

### Deployment

- [ ] Apply migrations in order
- [ ] Verify all tables created
- [ ] Check RLS policies active
- [ ] Test authentication
- [ ] Verify storage buckets
- [ ] Enable realtime (if needed)

### Post-Deployment

- [ ] Monitor query performance
- [ ] Check error logs
- [ ] Verify backups running
- [ ] Test health checks
- [ ] Review connection pool
- [ ] Monitor database size

---

## 9. Feature-Specific Configuration

### 9.1 Multi-Tenant Setup

**Required:**
- ✅ Tenants table
- ✅ Company groups table
- ✅ Tenant_id on all tables
- ✅ RLS policies for isolation

**Verification:**
```sql
-- Check tenant isolation
SELECT COUNT(*) FROM tenants;
SELECT COUNT(*) FROM organizations WHERE tenant_id IS NOT NULL;
```

### 9.2 Storage Configuration

**Buckets:**
- `documents` - Private documents
- `avatars` - User avatars (optional)
- `public` - Public assets (optional)

**Policies:**
- Tenant-scoped access
- Organization-level permissions
- Vendor relationship access

### 9.3 Realtime Configuration

**Tables to Enable:**
- `messages` - Real-time messaging
- `message_threads` - Thread updates
- `notifications` - Push notifications (optional)

---

## 10. Troubleshooting

### Common Issues

**Issue: Slow Queries**
```sql
-- Check slow queries
SELECT * FROM get_slow_queries(10);

-- Analyze tables
SELECT analyze_all_tables();
```

**Issue: Connection Pool Exhausted**
```sql
-- Check connections
SELECT * FROM get_connection_stats();

-- Review connection settings
SHOW max_connections;
```

**Issue: RLS Policy Errors**
```sql
-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'your_table';

-- Test policy
EXPLAIN SELECT * FROM your_table;
```

---

## 11. Next Steps

1. **Apply Production Optimization Migration**
   ```bash
   # Apply migration 011_production_optimization.sql
   ```

2. **Enable Realtime**
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE messages;
   ALTER PUBLICATION supabase_realtime ADD TABLE message_threads;
   ```

3. **Set Up Monitoring**
   - Configure alerts in Supabase Dashboard
   - Set up custom health checks
   - Monitor slow queries

4. **Deploy Edge Functions** (if needed)
   ```bash
   supabase functions deploy webhook-processor
   ```

5. **Schedule Maintenance Jobs**
   ```sql
   -- Already configured in migration
   -- Verify pg_cron is enabled
   ```

---

## 12. Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)
- [RLS Best Practices](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Migration Files](./migrations/)

---

*Last updated: 2025-01-27*
