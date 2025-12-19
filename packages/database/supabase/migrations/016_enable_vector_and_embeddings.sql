-- Migration: Enable Vector Extension and Create Embedding Infrastructure
-- Purpose: Enable pgvector for semantic search and create embedding tables
-- Date: 2025-01-27
-- Risk: MEDIUM - Adds new tables and indexes, requires Edge Functions for embeddings

-- ============================================================================
-- 1. ENABLE VECTOR EXTENSION
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- ============================================================================
-- 2. CREATE DOCUMENT EMBEDDINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL,
  content TEXT NOT NULL,
  embedding vector(384), -- 384 dimensions for gte-small model
  tenant_id UUID NOT NULL,
  organization_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Foreign key constraint (only if documents table exists)
  CONSTRAINT fk_document_embeddings_document 
    FOREIGN KEY (document_id) 
    REFERENCES documents(id) 
    ON DELETE CASCADE
    DEFERRABLE INITIALLY DEFERRED
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_embeddings_document_id 
  ON document_embeddings(document_id);

CREATE INDEX IF NOT EXISTS idx_document_embeddings_tenant_id 
  ON document_embeddings(tenant_id);

CREATE INDEX IF NOT EXISTS idx_document_embeddings_organization_id 
  ON document_embeddings(organization_id) 
  WHERE organization_id IS NOT NULL;

-- Create HNSW index for fast similarity search
-- HNSW is faster than IVFFlat for similarity queries
CREATE INDEX IF NOT EXISTS idx_document_embeddings_embedding_hnsw 
  ON document_embeddings 
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Composite index for tenant-scoped searches
CREATE INDEX IF NOT EXISTS idx_document_embeddings_tenant_embedding 
  ON document_embeddings(tenant_id, embedding vector_cosine_ops);

-- ============================================================================
-- 3. ENABLE RLS ON DOCUMENT_EMBEDDINGS
-- ============================================================================

ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view embeddings for documents in their tenant
CREATE POLICY "users_view_tenant_embeddings"
  ON document_embeddings FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Service role can insert/update embeddings
CREATE POLICY "service_role_manage_embeddings"
  ON document_embeddings FOR ALL
  USING (
    (SELECT auth.role()) = 'service_role'
  )
  WITH CHECK (
    (SELECT auth.role()) = 'service_role'
  );

-- ============================================================================
-- 4. CREATE SEMANTIC SEARCH FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION search_documents_semantic(
  query_embedding vector(384),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_tenant_id UUID DEFAULT NULL,
  filter_organization_id UUID DEFAULT NULL
)
RETURNS TABLE (
  document_id UUID,
  content TEXT,
  similarity float,
  tenant_id UUID,
  organization_id UUID
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
    1 - (de.embedding <=> query_embedding) as similarity,
    de.tenant_id,
    de.organization_id
  FROM document_embeddings de
  WHERE 
    de.embedding IS NOT NULL
    AND (filter_tenant_id IS NULL OR de.tenant_id = filter_tenant_id)
    AND (filter_organization_id IS NULL OR de.organization_id = filter_organization_id)
    AND (de.embedding <=> query_embedding) < (1 - match_threshold)
  ORDER BY de.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION search_documents_semantic IS 'Performs semantic similarity search on document embeddings using cosine distance';

-- ============================================================================
-- 5. CREATE HYBRID SEARCH FUNCTION (KEYWORD + SEMANTIC)
-- ============================================================================

CREATE OR REPLACE FUNCTION search_documents_hybrid(
  search_query TEXT,
  query_embedding vector(384),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_tenant_id UUID DEFAULT NULL,
  filter_organization_id UUID DEFAULT NULL
)
RETURNS TABLE (
  document_id UUID,
  name TEXT,
  content TEXT,
  similarity float,
  search_type TEXT,
  tenant_id UUID,
  organization_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  keyword_count int;
  semantic_count int;
BEGIN
  -- Calculate how many results from each method
  keyword_count := LEAST(match_count / 2, 5); -- Half from keyword, max 5
  semantic_count := match_count - keyword_count; -- Rest from semantic
  
  -- Get keyword results first
  CREATE TEMP TABLE IF NOT EXISTS keyword_results AS
  SELECT 
    d.id as document_id,
    d.name,
    COALESCE(de.content, d.name) as content,
    1.0::float as similarity,
    'keyword'::TEXT as search_type,
    d.tenant_id,
    d.organization_id
  FROM documents d
  LEFT JOIN document_embeddings de ON d.id = de.document_id
  WHERE 
    (filter_tenant_id IS NULL OR d.tenant_id = filter_tenant_id)
    AND (filter_organization_id IS NULL OR d.organization_id = filter_organization_id)
    AND (
      d.name ILIKE '%' || search_query || '%'
      OR d.type ILIKE '%' || search_query || '%'
      OR d.category ILIKE '%' || search_query || '%'
    )
  LIMIT keyword_count;
  
  -- Get semantic results
  CREATE TEMP TABLE IF NOT EXISTS semantic_results AS
  SELECT 
    d.id as document_id,
    d.name,
    de.content,
    sd.similarity,
    'semantic'::TEXT as search_type,
    sd.tenant_id,
    sd.organization_id
  FROM search_documents_semantic(
    query_embedding,
    match_threshold,
    semantic_count,
    filter_tenant_id,
    filter_organization_id
  ) sd
  JOIN documents d ON d.id = sd.document_id
  WHERE d.id NOT IN (SELECT document_id FROM keyword_results);
  
  -- Return combined results
  RETURN QUERY
  SELECT * FROM keyword_results
  UNION ALL
  SELECT * FROM semantic_results
  ORDER BY similarity DESC, search_type
  LIMIT match_count;
  
  -- Clean up temp tables
  DROP TABLE IF EXISTS keyword_results;
  DROP TABLE IF EXISTS semantic_results;
END;
$$;

COMMENT ON FUNCTION search_documents_hybrid IS 'Combines keyword and semantic search for best results';

-- ============================================================================
-- 6. CREATE FUNCTION TO UPDATE UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_document_embeddings_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER document_embeddings_updated_at_trigger
  BEFORE UPDATE ON document_embeddings
  FOR EACH ROW
  EXECUTE FUNCTION update_document_embeddings_updated_at();

-- ============================================================================
-- 7. VERIFY VECTOR EXTENSION
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'vector'
  ) THEN
    RAISE NOTICE 'vector extension enabled successfully';
  ELSE
    RAISE WARNING 'vector extension may not be enabled - check Supabase dashboard';
  END IF;
END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE document_embeddings IS 'Stores vector embeddings for documents to enable semantic search';
COMMENT ON COLUMN document_embeddings.embedding IS '384-dimensional vector embedding generated by gte-small model';
COMMENT ON COLUMN document_embeddings.content IS 'Text content used to generate the embedding (document name + metadata)';
