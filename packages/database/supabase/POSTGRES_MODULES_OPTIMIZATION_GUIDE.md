# PostgreSQL Modules - Optimal Utilization Guide

**Date:** 2025-01-27  
**Purpose:** Guide for optimal utilization of AI & Vectors, Cron, Queues, and Edge Functions  
**Status:** ✅ **COMPREHENSIVE RECOMMENDATIONS**

---

## Current State

### **Installed Extensions:**
- ✅ `pg_cron` (v1.6.4) - **ACTIVE** - 2 jobs scheduled
- ✅ `pg_graphql` (v1.5.11)
- ✅ `pg_stat_statements` (v1.11)
- ✅ `pgcrypto` (v1.3)
- ✅ `supabase_vault` (v0.3.1)
- ✅ `uuid-ossp` (v1.1)

### **Available but Not Installed:**
- ⚠️ `vector` (pgvector v0.8.0) - For AI & embeddings
- ⚠️ `pg_net` (v0.19.5) - For async HTTP/queues
- ⚠️ `pgmq` (v1.5.1) - For message queues

---

## 1. AI & Vectors (pgvector)

### **What It Is:**
- PostgreSQL extension for storing and querying vector embeddings
- Enables semantic search, similarity search, and AI-powered features
- Works with Edge Functions for embedding generation

### **When to Use:**
✅ **Use pgvector when:**
- You need semantic search (search by meaning, not keywords)
- Building AI-powered document search
- Implementing recommendation systems
- Creating chatbots with RAG (Retrieval Augmented Generation)
- Image similarity search
- Product recommendations

❌ **Don't use pgvector when:**
- Simple keyword search is sufficient
- You don't have AI/ML requirements
- Data volume is very small (< 1000 records)

### **Optimal Utilization:**

#### **1. Enable the Extension:**
```sql
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;
```

#### **2. Create Vector Tables:**
```sql
-- Example: Document embeddings for semantic search
CREATE TABLE document_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(384), -- 384 for gte-small model
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create HNSW index for fast similarity search
CREATE INDEX ON document_embeddings 
USING hnsw (embedding vector_cosine_ops);

-- Add tenant-scoped RLS
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_tenant_embeddings"
  ON document_embeddings FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );
```

#### **3. Generate Embeddings via Edge Function:**
```typescript
// supabase/functions/generate-embedding/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const model = new Supabase.ai.Session('gte-small')

Deno.serve(async (req) => {
  const { content, document_id, tenant_id } = await req.json()
  
  // Generate embedding
  const embedding = await model.run(content, {
    mean_pool: true,
    normalize: true,
  })
  
  // Store in database
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  await supabase.from('document_embeddings').insert({
    document_id,
    content,
    embedding: JSON.stringify(embedding),
    tenant_id,
  })
  
  return new Response(JSON.stringify({ success: true }))
})
```

#### **4. Semantic Search Function:**
```sql
CREATE OR REPLACE FUNCTION search_documents_semantic(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_tenant_id UUID DEFAULT NULL
)
RETURNS TABLE (
  document_id UUID,
  content TEXT,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    de.document_id,
    de.content,
    1 - (de.embedding <=> query_embedding) as similarity
  FROM document_embeddings de
  WHERE 
    (filter_tenant_id IS NULL OR de.tenant_id = filter_tenant_id)
    AND (de.embedding <=> query_embedding) < (1 - match_threshold)
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### **Use Cases for Your Application:**

1. **Document Search Enhancement:**
   - Add semantic search to document search
   - Users can find documents by meaning, not just keywords
   - Better search results for invoices, contracts, statements

2. **Payment/Statement Analysis:**
   - Find similar payment patterns
   - Detect anomalies using vector similarity
   - Categorize transactions automatically

3. **Message Thread Intelligence:**
   - Find similar past conversations
   - Auto-categorize message threads
   - Suggest relevant documents based on conversation context

### **Performance Considerations:**
- **Index Type:** Use HNSW for production (faster, larger index)
- **Vector Dimension:** 384 for gte-small (Supabase default)
- **Batch Processing:** Generate embeddings in batches via Edge Functions
- **Tenant Isolation:** Always filter by tenant_id in queries

---

## 2. Cron (pg_cron)

### **What It Is:**
- PostgreSQL extension for scheduling recurring jobs
- Runs SQL queries or database functions on a schedule
- Can invoke Edge Functions via pg_net

### **Current Status:**
✅ **INSTALLED** - v1.6.4  
✅ **ACTIVE** - 2 jobs running:
- `cleanup_orphaned_storage_files()` - Weekly (Sunday 3 AM)
- `cleanup_incomplete_uploads()` - Daily (3 AM)

### **Optimal Utilization:**

#### **Best Practices:**
1. **Limit Concurrent Jobs:** Max 8 concurrent jobs recommended
2. **Job Duration:** Each job should complete in < 10 minutes
3. **Error Handling:** Always wrap in functions with exception handling
4. **Monitoring:** Check `cron.job_run_details` regularly

#### **Recommended Jobs for Your Application:**

```sql
-- 1. Daily maintenance (already scheduled)
SELECT cron.schedule(
  'daily-analyze',
  '0 2 * * *', -- 2 AM daily
  'SELECT analyze_all_tables();'
);

-- 2. Weekly data cleanup
SELECT cron.schedule(
  'weekly-cleanup',
  '0 3 * * 0', -- Sunday 3 AM
  $$
    SELECT cleanup_old_notifications();
    SELECT cleanup_orphaned_storage_files();
  $$
);

-- 3. Daily audit log cleanup (keep last 90 days)
SELECT cron.schedule(
  'audit-cleanup',
  '0 4 * * *', -- 4 AM daily
  $$
    DELETE FROM audit_events 
    WHERE created_at < NOW() - INTERVAL '90 days';
  $$
);

-- 4. Hourly payment status sync (if using external payment processors)
SELECT cron.schedule(
  'payment-status-sync',
  '0 * * * *', -- Every hour
  $$
    SELECT sync_payment_statuses();
  $$
);

-- 5. Daily stats aggregation
SELECT cron.schedule(
  'daily-stats-aggregation',
  '0 1 * * *', -- 1 AM daily
  $$
    SELECT aggregate_daily_stats();
  $$
);
```

#### **Invoke Edge Functions from Cron:**
```sql
-- Store secrets in Vault first
SELECT vault.create_secret('https://project-ref.supabase.co', 'project_url');
SELECT vault.create_secret('YOUR_ANON_KEY', 'anon_key');

-- Schedule Edge Function invocation
SELECT cron.schedule(
  'invoke-ai-processing',
  '0 */6 * * *', -- Every 6 hours
  $$
    SELECT net.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url') || '/functions/v1/process-ai',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'anon_key')
      ),
      body := jsonb_build_object('action', 'batch_process')
    );
  $$
);
```

### **Monitoring Cron Jobs:**
```sql
-- Check job status
SELECT 
  jobid,
  schedule,
  command,
  active,
  jobname
FROM cron.job;

-- Check recent runs
SELECT 
  jobid,
  status,
  return_message,
  start_time,
  end_time,
  EXTRACT(EPOCH FROM (end_time - start_time)) as duration_seconds
FROM cron.job_run_details
WHERE start_time > NOW() - INTERVAL '7 days'
ORDER BY start_time DESC;

-- Find failed jobs
SELECT *
FROM cron.job_run_details
WHERE status != 'succeeded'
  AND start_time > NOW() - INTERVAL '7 days'
ORDER BY start_time DESC;
```

---

## 3. Queues (pgmq or pg_net)

### **Option A: pgmq (Message Queue)**

**What It Is:**
- Lightweight message queue like AWS SQS
- Built on PostgreSQL
- Perfect for background job processing

**When to Use:**
✅ **Use pgmq when:**
- You need reliable job queuing
- Processing can be asynchronous
- You need job retries and visibility
- Background task processing (email sending, PDF generation, etc.)

**Optimal Utilization:**

```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pgmq;

-- Create a queue
SELECT pgmq.create('document_processing');
SELECT pgmq.create('email_notifications');
SELECT pgmq.create('payment_webhooks');

-- Send a message
SELECT pgmq.send(
  'document_processing',
  jsonb_build_object(
    'document_id', '123e4567-e89b-12d3-a456-426614174000',
    'action', 'generate_pdf',
    'tenant_id', '...'
  )
);

-- Read messages (in Edge Function or worker)
SELECT * FROM pgmq.read('document_processing', 1, 30); -- queue, vt (visibility timeout), qty

-- Process and delete
SELECT pgmq.delete('document_processing', msg_id);
```

**Use Cases:**
- Document PDF generation
- Email notifications (batch processing)
- Payment webhook processing
- Image processing/thumbnails
- Report generation

### **Option B: pg_net (Async HTTP)**

**What It Is:**
- Asynchronous HTTP client for PostgreSQL
- Non-blocking requests
- Perfect for triggers and webhooks

**When to Use:**
✅ **Use pg_net when:**
- You need async HTTP from database triggers
- Invoking Edge Functions from triggers
- Webhook notifications
- External API calls from database

**Optimal Utilization:**

```sql
-- Enable extension
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Example: Trigger webhook on payment status change
CREATE OR REPLACE FUNCTION notify_payment_webhook()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only notify on status change
  IF OLD.status != NEW.status THEN
    PERFORM net.http_post(
      url := 'https://project-ref.supabase.co/functions/v1/payment-webhook',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'anon_key')
      ),
      body := jsonb_build_object(
        'payment_id', NEW.id,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'tenant_id', NEW.tenant_id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER payment_webhook_trigger
  AFTER UPDATE OF status ON payments
  FOR EACH ROW
  EXECUTE FUNCTION notify_payment_webhook();
```

**Use Cases:**
- Payment status change webhooks
- Document upload notifications
- Real-time external API calls
- Trigger-based Edge Function invocations

### **Recommendation:**
- **Use pgmq** for reliable background job processing
- **Use pg_net** for async HTTP from triggers/webhooks
- **Both can work together:** pgmq for job queue, pg_net for HTTP calls

---

## 4. Edge Functions (for AI)

### **What It Is:**
- Globally distributed TypeScript functions
- Built-in AI inference API (gte-small model)
- No external dependencies needed for embeddings

### **Optimal Utilization:**

#### **1. Embedding Generation Function:**
```typescript
// supabase/functions/generate-embedding/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const model = new Supabase.ai.Session('gte-small')

Deno.serve(async (req) => {
  const { content, document_id, tenant_id } = await req.json()
  
  if (!content || !document_id || !tenant_id) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields' }),
      { status: 400 }
    )
  }
  
  // Generate embedding
  const embedding = await model.run(content, {
    mean_pool: true,
    normalize: true,
  })
  
  // Store in database
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  const { error } = await supabase
    .from('document_embeddings')
    .upsert({
      document_id,
      content,
      embedding: JSON.stringify(embedding),
      tenant_id,
    }, {
      onConflict: 'document_id'
    })
  
  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    )
  }
  
  return new Response(
    JSON.stringify({ success: true, embedding_length: embedding.length }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

#### **2. Semantic Search Function:**
```typescript
// supabase/functions/semantic-search/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const model = new Supabase.ai.Session('gte-small')

Deno.serve(async (req) => {
  const { query, tenant_id, limit = 10 } = await req.json()
  
  if (!query || !tenant_id) {
    return new Response(
      JSON.stringify({ error: 'Missing query or tenant_id' }),
      { status: 400 }
    )
  }
  
  // Generate query embedding
  const queryEmbedding = await model.run(query, {
    mean_pool: true,
    normalize: true,
  })
  
  // Search database
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  const { data, error } = await supabase.rpc('search_documents_semantic', {
    query_embedding: JSON.stringify(queryEmbedding),
    match_threshold: 0.7,
    match_count: limit,
    filter_tenant_id: tenant_id,
  })
  
  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    )
  }
  
  return new Response(
    JSON.stringify({ results: data }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

#### **3. Batch Processing Function:**
```typescript
// supabase/functions/batch-process-embeddings/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const model = new Supabase.ai.Session('gte-small')

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  // Get documents without embeddings
  const { data: documents, error } = await supabase
    .from('documents')
    .select('id, name, type, tenant_id')
    .is('embedding', null)
    .limit(100) // Process in batches
  
  if (error || !documents) {
    return new Response(
      JSON.stringify({ error: error?.message || 'No documents found' }),
      { status: 500 }
    )
  }
  
  // Process each document
  const results = await Promise.all(
    documents.map(async (doc) => {
      try {
        const embedding = await model.run(doc.name || '', {
          mean_pool: true,
          normalize: true,
        })
        
        await supabase.from('document_embeddings').insert({
          document_id: doc.id,
          content: doc.name,
          embedding: JSON.stringify(embedding),
          tenant_id: doc.tenant_id,
        })
        
        return { document_id: doc.id, status: 'success' }
      } catch (err) {
        return { document_id: doc.id, status: 'error', error: err.message }
      }
    })
  )
  
  return new Response(
    JSON.stringify({ processed: results.length, results }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

### **Deployment:**
```bash
# Deploy functions
supabase functions deploy generate-embedding
supabase functions deploy semantic-search
supabase functions deploy batch-process-embeddings

# Set secrets (if needed)
supabase secrets set OPENAI_API_KEY=your_key
```

---

## Integration Patterns

### **Pattern 1: Document Upload → Auto-Embedding**

```sql
-- Trigger: When document is uploaded, generate embedding
CREATE OR REPLACE FUNCTION trigger_document_embedding()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Invoke Edge Function to generate embedding
  PERFORM net.http_post(
    url := 'https://project-ref.supabase.co/functions/v1/generate-embedding',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'anon_key')
    ),
    body := jsonb_build_object(
      'document_id', NEW.id,
      'content', NEW.name || ' ' || COALESCE(NEW.type, ''),
      'tenant_id', NEW.tenant_id
    )
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER document_embedding_trigger
  AFTER INSERT ON documents
  FOR EACH ROW
  EXECUTE FUNCTION trigger_document_embedding();
```

### **Pattern 2: Scheduled Batch Processing**

```sql
-- Cron job: Process embeddings for documents without them
SELECT cron.schedule(
  'batch-process-embeddings',
  '0 2 * * *', -- 2 AM daily
  $$
    SELECT net.http_post(
      url := (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'project_url') || '/functions/v1/batch-process-embeddings',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'anon_key')
      )
    );
  $$
);
```

### **Pattern 3: Queue-Based Processing**

```sql
-- When document uploaded, add to queue
CREATE OR REPLACE FUNCTION queue_document_processing()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Add to pgmq queue
  PERFORM pgmq.send(
    'document_processing',
    jsonb_build_object(
      'document_id', NEW.id,
      'action', 'generate_embedding',
      'tenant_id', NEW.tenant_id
    )
  );
  
  RETURN NEW;
END;
$$;

-- Worker Edge Function processes queue
-- (runs via cron or separate worker process)
```

---

## Recommended Implementation Order

### **Phase 1: Enable Core Extensions (Now)**
1. ✅ `pg_cron` - Already enabled
2. ⚠️ Enable `pg_net` - For async HTTP/webhooks
3. ⚠️ Enable `vector` - If AI features needed

### **Phase 2: Basic Automation (Week 1)**
1. Add more pg_cron jobs for maintenance
2. Use pg_net for webhook triggers
3. Set up monitoring for cron jobs

### **Phase 3: AI Features (Week 2-3)**
1. Enable `vector` extension
2. Create embedding tables
3. Deploy embedding generation Edge Function
4. Add semantic search to document search

### **Phase 4: Advanced Queuing (Week 4+)**
1. Enable `pgmq` if needed for complex job queues
2. Set up worker Edge Functions
3. Implement retry logic and error handling

---

## Use Case Recommendations

### **For Your Application:**

#### **1. Document Management:**
- ✅ **pg_cron**: Daily cleanup of orphaned files
- ✅ **pg_net**: Webhook on document upload
- ⚠️ **vector**: Semantic document search
- ⚠️ **Edge Function**: Auto-generate document embeddings

#### **2. Payment Processing:**
- ✅ **pg_cron**: Hourly payment status sync
- ✅ **pg_net**: Payment webhook notifications
- ⚠️ **Edge Function**: Payment reconciliation AI

#### **3. Messaging:**
- ⚠️ **vector**: Find similar past conversations
- ⚠️ **Edge Function**: Auto-categorize messages

#### **4. Notifications:**
- ✅ **pg_cron**: Batch email sending
- ⚠️ **pgmq**: Queue notification jobs
- ⚠️ **Edge Function**: Smart notification routing

---

## Performance & Cost Considerations

### **pg_cron:**
- ✅ **Free** - Included in Supabase
- ⚠️ **Limit**: Max 8 concurrent jobs
- ⚠️ **Duration**: Jobs should complete in < 10 minutes

### **pg_net:**
- ✅ **Free** - Included in Supabase
- ⚠️ **Rate**: ~200 requests/second max
- ⚠️ **TTL**: Responses stored for 6 hours

### **pgmq:**
- ✅ **Free** - Included in Supabase
- ⚠️ **Storage**: Messages stored in PostgreSQL
- ⚠️ **Scale**: Good for moderate workloads

### **vector (pgvector):**
- ✅ **Free** - Included in Supabase
- ⚠️ **Storage**: Embeddings add ~1.5KB per record (384 dimensions)
- ⚠️ **Index**: HNSW index can be large
- ⚠️ **Compute**: Embedding generation uses Edge Function resources

### **Edge Functions:**
- ⚠️ **Cost**: Based on invocations and duration
- ⚠️ **AI Models**: gte-small is free, larger models may have costs
- ⚠️ **Rate Limits**: Check your plan limits

---

## Security Considerations

### **pg_cron:**
- ✅ Jobs run with `postgres` role (full access)
- ⚠️ **Secure**: Use SECURITY DEFINER functions
- ⚠️ **Audit**: Log all cron job executions

### **pg_net:**
- ✅ Uses SECURITY DEFINER functions
- ⚠️ **Secrets**: Store API keys in Supabase Vault
- ⚠️ **Validation**: Validate all HTTP responses

### **vector:**
- ✅ RLS policies apply to vector tables
- ⚠️ **Tenant Isolation**: Always filter by tenant_id
- ⚠️ **Access Control**: Limit who can generate embeddings

### **Edge Functions:**
- ✅ Use service role key securely
- ⚠️ **Authentication**: Validate all requests
- ⚠️ **Rate Limiting**: Implement rate limits
- ⚠️ **Tenant Validation**: Always validate tenant_id

---

## Monitoring & Maintenance

### **pg_cron Monitoring:**
```sql
-- Daily health check
SELECT 
  COUNT(*) FILTER (WHERE status = 'succeeded') as succeeded,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  COUNT(*) FILTER (WHERE status = 'running') as running
FROM cron.job_run_details
WHERE start_time > NOW() - INTERVAL '24 hours';
```

### **pg_net Monitoring:**
```sql
-- Check failed requests
SELECT 
  COUNT(*) as failed_count,
  COUNT(DISTINCT url) as unique_endpoints
FROM net._http_response
WHERE status_code >= 400 OR error_msg IS NOT NULL
  AND created > NOW() - INTERVAL '24 hours';
```

### **vector Performance:**
```sql
-- Check embedding table size
SELECT 
  pg_size_pretty(pg_total_relation_size('document_embeddings')) as table_size,
  COUNT(*) as total_embeddings,
  COUNT(*) FILTER (WHERE embedding IS NOT NULL) as with_embeddings
FROM document_embeddings;
```

---

## Quick Start Checklist

### **Immediate (This Week):**
- [ ] Enable `pg_net` extension
- [ ] Add webhook triggers for critical events
- [ ] Review and optimize existing pg_cron jobs
- [ ] Set up cron job monitoring

### **Short-term (Next 2 Weeks):**
- [ ] Evaluate if AI features are needed
- [ ] If yes, enable `vector` extension
- [ ] Create embedding tables
- [ ] Deploy embedding generation Edge Function

### **Medium-term (Next Month):**
- [ ] Add semantic search to document search
- [ ] Implement batch processing for embeddings
- [ ] Set up pgmq if complex queuing needed
- [ ] Monitor performance and costs

---

## Summary

**Recommended Extensions to Enable:**
1. ✅ **pg_cron** - Already enabled, optimize usage
2. ⚠️ **pg_net** - Enable for webhooks/async HTTP
3. ⚠️ **vector** - Enable if AI features needed
4. ⚠️ **pgmq** - Enable if complex job queuing needed

**Priority Order:**
1. **pg_net** (High) - Useful for webhooks and async operations
2. **vector** (Medium) - If AI features are planned
3. **pgmq** (Low) - Only if complex queuing is needed

**The current setup with pg_cron is good. Add pg_net for webhooks, and consider vector if you want AI-powered search features.**

---

*Guide created: 2025-01-27*  
*Based on Supabase documentation and current database state*
