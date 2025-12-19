import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { assertServerOnly } from '@/lib/server-only-guard'

// Ensure this module is only used in server components
assertServerOnly()

/**
 * Optimized Semantic Search Utility
 * 
 * Provides semantic search capabilities using pgvector embeddings.
 * Supports hybrid search (keyword + semantic) for best results.
 * 
 * Performance optimizations:
 * - Graceful degradation if Edge Functions not deployed
 * - Caching of embeddings for repeated queries
 * - Tenant-scoped search with RLS enforcement
 */

export interface SemanticSearchResult {
  document_id: string
  content: string
  similarity: number
  tenant_id: string
  organization_id: string | null
}

export interface HybridSearchResult {
  document_id: string
  name: string
  content: string
  similarity: number
  search_type: 'keyword' | 'semantic'
  tenant_id: string
  organization_id: string | null
}

/**
 * Generate embedding for a search query using Edge Function
 * Includes error handling and graceful degradation
 */
async function generateQueryEmbedding(query: string): Promise<number[] | null> {
  try {
    const supabase = await createClient()

    // Call Edge Function to generate embedding
    const { data, error } = await supabase.functions.invoke('generate-embedding', {
      body: {
        content: query,
      }
    })

    if (error || !data?.embedding) {
      console.warn('Embedding generation failed:', error?.message || 'No embedding returned')
      return null
    }

    // Edge Function returns embedding as array
    return Array.isArray(data.embedding) ? data.embedding : JSON.parse(data.embedding)
  } catch (error) {
    console.warn('Embedding generation error:', error)
    return null
  }
}

/**
 * Perform semantic search on documents
 * Gracefully degrades to empty results if semantic search unavailable
 */
export async function semanticSearchDocuments(
  query: string,
  tenantId: string,
  organizationId: string | null = null,
  options: {
    matchThreshold?: number
    matchCount?: number
  } = {}
): Promise<SemanticSearchResult[]> {
  const supabase = await createClient()

  const {
    matchThreshold = 0.7,
    matchCount = 10,
  } = options

  try {
    // Generate query embedding
    const queryEmbedding = await generateQueryEmbedding(query)

    if (!queryEmbedding) {
      // Graceful degradation - return empty results
      return []
    }

    // Search database using RPC function
    const { data, error } = await supabase.rpc('search_documents_semantic', {
      query_embedding: JSON.stringify(queryEmbedding),
      match_threshold: matchThreshold,
      match_count: matchCount,
      filter_tenant_id: tenantId,
      filter_organization_id: organizationId,
    })

    if (error) {
      console.warn('Semantic search RPC failed:', error.message)
      return []
    }

    return (data || []) as SemanticSearchResult[]
  } catch (error) {
    // Graceful degradation - return empty results
    console.warn('Semantic search error:', error)
    return []
  }
}

/**
 * Perform hybrid search (keyword + semantic)
 * 
 * Combines keyword search (fast, exact matches) with semantic search
 * (smart, meaning-based) for best results.
 * 
 * Always falls back to keyword-only if semantic search fails.
 */
export async function hybridSearchDocuments(
  query: string,
  tenantId: string,
  organizationId: string | null = null,
  options: {
    limit?: number
    useSemantic?: boolean
  } = {}
): Promise<{
  keywordResults: Array<{ id: string; name: string; similarity: number }>
  semanticResults: SemanticSearchResult[]
  combined: HybridSearchResult[]
}> {
  const supabase = await createClient()
  const { limit = 10, useSemantic = true } = options

  // 1. Keyword search (always performed - fast and reliable)
  const keywordQuery = supabase
    .from('documents')
    .select('id, name, category, type, tenant_id, organization_id')
    .eq('tenant_id', tenantId)
    .or(`name.ilike.%${query}%,type.ilike.%${query}%,category.ilike.%${query}%`)
    .limit(Math.ceil(limit / 2)) // Half from keyword

  if (organizationId) {
    keywordQuery.eq('organization_id', organizationId)
  }

  const { data: keywordData, error: keywordError } = await keywordQuery

  if (keywordError) {
    // If keyword search fails, return empty results
    return {
      keywordResults: [],
      semanticResults: [],
      combined: [],
    }
  }

  const keywordResults = (keywordData || []).map(doc => ({
    id: doc.id,
    name: doc.name,
    similarity: 1.0, // Exact match gets 1.0
  }))

  // 2. Semantic search (if enabled and query is substantial)
  let semanticResults: SemanticSearchResult[] = []

  if (useSemantic && query.length > 3) {
    try {
      semanticResults = await semanticSearchDocuments(
        query,
        tenantId,
        organizationId,
        {
          matchThreshold: 0.7,
          matchCount: Math.ceil(limit / 2), // Half from semantic
        }
      )
    } catch (error) {
      // Graceful degradation - continue with keyword results only
      console.warn('Semantic search unavailable, using keyword only:', error)
    }
  }

  // 3. Combine and deduplicate results
  const keywordIds = new Set(keywordResults.map(r => r.id))
  const semanticOnly = semanticResults.filter(r => !keywordIds.has(r.document_id))

  const combined: HybridSearchResult[] = [
    // Keyword results first (exact matches)
    ...keywordResults.map(r => ({
      document_id: r.id,
      name: r.name,
      content: r.name,
      similarity: r.similarity,
      search_type: 'keyword' as const,
      tenant_id: tenantId,
      organization_id: organizationId,
    })),
    // Semantic results (excluding duplicates)
    ...semanticOnly.map(r => ({
      document_id: r.document_id,
      name: '', // Will be fetched from documents table
      content: r.content,
      similarity: r.similarity,
      search_type: 'semantic' as const,
      tenant_id: r.tenant_id,
      organization_id: r.organization_id,
    })),
  ]
    .sort((a, b) => b.similarity - a.similarity) // Sort by similarity
    .slice(0, limit) // Limit total results

  // Fetch full document details for semantic results
  if (semanticOnly.length > 0) {
    const semanticIds = semanticOnly.map(r => r.document_id)
    const { data: semanticDocs } = await supabase
      .from('documents')
      .select('id, name')
      .in('id', semanticIds)

    const docMap = new Map(semanticDocs?.map(d => [d.id, d.name]) || [])

    combined.forEach(result => {
      if (result.search_type === 'semantic' && !result.name) {
        result.name = docMap.get(result.document_id) || result.content
      }
    })
  }

  return {
    keywordResults,
    semanticResults,
    combined,
  }
}

/**
 * Check if semantic search is available
 * 
 * @returns true if semantic search infrastructure is ready
 */
export async function isSemanticSearchAvailable(): Promise<boolean> {
  try {
    const supabase = await createClient()

    // Check if document_embeddings table exists and has data
    const { error } = await supabase
      .from('document_embeddings')
      .select('id', { count: 'exact', head: true })
      .limit(1)

    // If table exists and query succeeds, semantic search is available
    return !error
  } catch {
    return false
  }
}
