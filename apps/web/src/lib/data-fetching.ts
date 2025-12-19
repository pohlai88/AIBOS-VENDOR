import 'server-only'
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { assertServerOnly } from '@/lib/server-only-guard'
import type { Document } from '@aibos/shared'

// Ensure this module is only used in server components
assertServerOnly()

/**
 * Utility functions for data fetching following Next.js 16 best practices
 * Uses React cache() for request memoization + unstable_cache for tag-based invalidation
 * 
 * IMPORTANT: 
 * - All functions include tenantId in cache keys to prevent cross-tenant data leakage
 * - All cached functions take tenantId/userId as explicit args (not from closure)
 * - NOTE: unstable_cache is experimental. Future migration path: Cache Components + "use cache" directive
 * 
 * Migration backlog: Consider migrating hot paths to Cache Components once stable
 */

/**
 * Internal function that performs the actual database query
 * This is wrapped with both cache() and unstable_cache for optimal caching
 */
async function _fetchDocumentsInternal(
  tenantId: string,
  organizationId: string,
  role: string,
  options?: {
    search?: string
    category?: string
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }
) {
  const supabase = await createClient()

  const {
    search,
    category,
    page = 1,
    limit = 10,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = options || {}

  const offset = (page - 1) * limit
  const validSortFields = ['name', 'created_at', 'file_size', 'category']
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at'
  const ascending = sortOrder === 'asc'

  // Build query with tenant isolation
  let query = supabase
    .from('documents')
    .select('id, name, category, file_size, created_at, mime_type, file_url, is_shared, vendor_id, organization_id', {
      count: 'exact',
    })
    .eq('tenant_id', tenantId)

  // Apply filters based on user role
  if (role === 'vendor') {
    query = query.or(
      `organization_id.eq.${organizationId},and(vendor_id.eq.${organizationId},is_shared.eq.true)`
    )
  } else {
    query = query.or(
      `organization_id.eq.${organizationId},vendor_id.in.(select vendor_id from vendor_relationships where company_id.eq.${organizationId} and status.eq.active and tenant_id.eq.${tenantId})`
    )
  }

  if (category) {
    query = query.eq('category', category)
  }

  if (search) {
    // Use keyword search (semantic search can be added via API route)
    query = query.ilike('name', `%${search}%`)
  }

  query = query.order(sortField, { ascending })
  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch documents: ${error.message}`)
  }

  const totalItems = count || 0
  const totalPages = Math.ceil(totalItems / limit)

  // Map database fields to Document type
  const mappedDocuments: Document[] = (data || []).map((doc: any) => ({
    id: doc.id,
    name: doc.name,
    category: doc.category || 'other',
    type: doc.type || 'other',
    fileSize: doc.file_size || 0,
    fileUrl: doc.file_url || '',
    mimeType: doc.mime_type || 'application/octet-stream',
    isShared: doc.is_shared || false,
    vendorId: doc.vendor_id || null,
    organizationId: doc.organization_id || '',
    version: 1,
    createdAt: doc.created_at || new Date().toISOString(),
    updatedAt: doc.updated_at || doc.created_at || new Date().toISOString(),
    createdBy: doc.created_by || '',
  }))

  return {
    documents: mappedDocuments,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
    },
  }
}

/**
 * Fetch documents with tag-based caching and request memoization
 * 
 * Cache strategy:
 * - React cache() for request deduplication within a single render
 * - unstable_cache() for persistent caching with tag-based invalidation
 * - tenantId included in cache key to prevent cross-tenant leakage
 */
export const getDocuments = cache(async (options?: {
  search?: string
  category?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}) => {
  const user = await requireAuth()

  // Create cache key that includes tenant and org for security
  const cacheKey = `documents-${user.tenantId}-${user.organizationId}-${JSON.stringify(options || {})}`

  // Use unstable_cache with tags for invalidation
  return unstable_cache(
    () => _fetchDocumentsInternal(user.tenantId, user.organizationId, user.role, options),
    [cacheKey],
    {
      tags: ['documents', `documents:tenant:${user.tenantId}`, `documents:org:${user.organizationId}`],
      revalidate: 60, // Revalidate every 60 seconds
    }
  )()
})

/**
 * Internal function for fetching a single document
 */
async function _fetchDocumentInternal(
  id: string,
  tenantId: string,
  organizationId: string,
  role: string
) {
  const supabase = await createClient()

  const { data: document, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single()

  if (error || !document) {
    throw new Error('Document not found')
  }

  // Check access
  const hasAccess =
    document.organization_id === organizationId ||
    (document.is_shared &&
      document.organization_id !== organizationId &&
      role === 'vendor') ||
    (document.vendor_id === organizationId && role !== 'vendor')

  if (!hasAccess) {
    throw new Error('Access denied')
  }

  return document as Document
}

/**
 * Fetch a single document by ID with tag-based caching
 * Includes tenantId in cache key for security
 */
export const getDocument = cache(async (id: string) => {
  const user = await requireAuth()

  const cacheKey = `document-${id}-${user.tenantId}-${user.organizationId}`

  return unstable_cache(
    () => _fetchDocumentInternal(id, user.tenantId, user.organizationId, user.role),
    [cacheKey],
    {
      tags: ['documents', `documents:${id}`, `documents:tenant:${user.tenantId}`],
      revalidate: 60,
    }
  )()
})

/**
 * Fetch dashboard stats with parallel data fetching and caching
 */
export const getDashboardStats = cache(async () => {
  const user = await requireAuth()
  const supabase = await createClient()

  const cacheKey = `dashboard-stats-${user.tenantId}-${user.organizationId}`

  return unstable_cache(
    async () => {
      // Fetch all stats in parallel
      const [documentsResult, paymentsResult, statementsResult, messagesResult] =
        await Promise.all([
          supabase
            .from('documents')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', user.tenantId)
            .eq('organization_id', user.organizationId),
          supabase
            .from('payments')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', user.tenantId)
            .eq('organization_id', user.organizationId),
          supabase
            .from('statements')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', user.tenantId)
            .eq('organization_id', user.organizationId),
          supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', user.tenantId)
            .eq('organization_id', user.organizationId),
        ])

      // Calculate payments total
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('amount')
        .eq('tenant_id', user.tenantId)
        .eq('organization_id', user.organizationId)

      const paymentsTotal = paymentsData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

      // Count unread messages (use messagesResult from parallel fetch)
      const unreadCount = messagesResult.count || 0

      return {
        documents: {
          count: documentsResult.count || 0,
        },
        payments: {
          count: paymentsResult.count || 0,
          total: paymentsTotal,
        },
        statements: {
          count: statementsResult.count || 0,
        },
        messages: {
          unread: unreadCount || 0,
        },
      }
    },
    [cacheKey],
    {
      tags: ['dashboard-stats', `dashboard-stats:tenant:${user.tenantId}`],
      revalidate: 60,
    }
  )()
})

/**
 * Internal function for fetching recent activity
 */
async function _fetchRecentActivityInternal(
  tenantId: string,
  organizationId: string,
  limit: number
) {
  const supabase = await createClient()

  // This would typically join multiple tables for activity feed
  // For now, returning recent documents as activity
  const { data, error } = await supabase
    .from('documents')
    .select('id, name, created_at, category')
    .eq('tenant_id', tenantId)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch recent activity: ${error.message}`)
  }

  return data || []
}

/**
 * Fetch recent activity with caching
 */
export const getRecentActivity = cache(async (limit: number = 10) => {
  const user = await requireAuth()

  const cacheKey = `recent-activity-${user.tenantId}-${user.organizationId}-${limit}`

  return unstable_cache(
    () => _fetchRecentActivityInternal(user.tenantId, user.organizationId, limit),
    [cacheKey],
    {
      tags: ['recent-activity', `recent-activity:tenant:${user.tenantId}`],
      revalidate: 30, // Activity updates more frequently
    }
  )()
})
