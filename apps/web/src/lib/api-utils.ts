import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { logError } from '@/lib/logger'

/**
 * Utility functions for API routes following Next.js 16 best practices
 */

export interface ApiError {
  code: string
  kind: string
  message: string
  requestId?: string
}

export interface ApiSuccessResponse<T> {
  ok: true
  data: T
  requestId?: string
}

export interface ApiErrorResponse {
  ok: false
  error: ApiError
}

/**
 * Create a standardized success response
 * Enterprise-grade envelope with consistent format and request ID in both JSON and headers
 * 
 * Best practice: Always include requestId in both response body and headers
 * for correlation across proxies/APM tools
 */
export function createSuccessResponse<T>(
  data: T,
  requestId?: string
): NextResponse<ApiSuccessResponse<T>> {
  const headers = new Headers();

  // Set request ID in response header for correlation
  if (requestId) {
    headers.set('x-request-id', requestId);
  }

  return NextResponse.json(
    {
      ok: true,
      data,
      ...(requestId && { requestId }),
    },
    { headers }
  )
}

/**
 * Error kind mapping for consistent error categorization
 */
export type ErrorKind =
  | 'constraint_violation'
  | 'permission_denied'
  | 'validation_error'
  | 'authentication_required'
  | 'not_found'
  | 'conflict'
  | 'payload_too_large'
  | 'unsupported_media_type'
  | 'internal_error'
  | 'service_unavailable'

/**
 * Map error code to error kind
 */
function mapErrorCodeToKind(code: string, message?: string): ErrorKind {
  // Constraint violations
  if (code === '23514' || message?.includes('violates check constraint')) {
    return 'constraint_violation'
  }

  // Unique violations
  if (code === '23505' || message?.includes('unique constraint')) {
    return 'conflict'
  }

  // RLS / Permission errors
  if (
    code === '42501' ||
    message?.includes('row-level security') ||
    message?.includes('permission denied') ||
    message?.includes('policy')
  ) {
    return 'permission_denied'
  }

  // Validation errors
  if (code === 'FILE_VALIDATION_ERROR' || code === 'FILE_REQUIRED') {
    return 'validation_error'
  }

  // Authentication
  if (code === '401' || message?.includes('not authenticated')) {
    return 'authentication_required'
  }

  // Not found
  if (code === '404' || message?.includes('not found')) {
    return 'not_found'
  }

  // Payload too large
  if (code === '413' || message?.includes('too large')) {
    return 'payload_too_large'
  }

  // Unsupported media type
  if (code === '415' || message?.includes('unsupported media')) {
    return 'unsupported_media_type'
  }

  return 'internal_error'
}

/**
 * Create a standardized error response
 * Enterprise-grade error envelope with kind, code, message, and requestId
 * 
 * Best practice: Always include requestId in both response body and headers
 * for correlation across proxies/APM tools
 */
export function createErrorResponse(
  error: Error | unknown,
  status: number = 500,
  code?: string,
  requestId?: string
): NextResponse<ApiErrorResponse> {
  const errorMessage = error instanceof Error ? error.message : 'Internal server error'
  const errorCode = code || 'INTERNAL_ERROR'
  const errorKind = mapErrorCodeToKind(errorCode, errorMessage)

  const headers = new Headers();

  // Set request ID in response header for correlation
  if (requestId) {
    headers.set('x-request-id', requestId);
  }

  return NextResponse.json(
    {
      ok: false,
      error: {
        code: errorCode,
        kind: errorKind,
        message: errorMessage,
        ...(requestId && { requestId }),
      },
    },
    { status, headers }
  )
}

/**
 * Validate pagination parameters
 */
export function validatePagination(searchParams: URLSearchParams) {
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)

  if (isNaN(page) || page < 1) {
    throw new Error('Invalid page parameter')
  }

  if (isNaN(limit) || limit < 1 || limit > 100) {
    throw new Error('Invalid limit parameter (must be between 1 and 100)')
  }

  return { page, limit, offset: (page - 1) * limit }
}

/**
 * Validate sort parameters
 */
export function validateSort(
  searchParams: URLSearchParams,
  validFields: string[],
  defaultField: string = 'created_at',
  defaultOrder: 'asc' | 'desc' = 'desc'
) {
  const sortBy = searchParams.get('sortBy') || defaultField
  const sortOrder = (searchParams.get('sortOrder') || defaultOrder) as 'asc' | 'desc'

  if (!validFields.includes(sortBy)) {
    throw new Error(`Invalid sort field. Must be one of: ${validFields.join(', ')}`)
  }

  if (sortOrder !== 'asc' && sortOrder !== 'desc') {
    throw new Error('Invalid sort order. Must be "asc" or "desc"')
  }

  return { sortBy, sortOrder, ascending: sortOrder === 'asc' }
}

/**
 * Wrapper for API route handlers with common error handling
 */
export function withApiHandler<T>(
  handler: (request: NextRequest, context: any) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest, context: any) => {
    try {
      return await handler(request, context)
    } catch (error) {
      const errorDetails = error instanceof Error
        ? { message: error.message, stack: error.stack }
        : { error: String(error) }

      logError('[API Handler Error]', error, {
        ...errorDetails,
        path: request.nextUrl.pathname,
        method: request.method,
      })

      return createErrorResponse(
        error instanceof Error ? error : new Error('Internal server error'),
        500,
        'INTERNAL_ERROR'
      )
    }
  }
}

/**
 * Wrapper for authenticated API route handlers
 */
export function withAuth<T>(
  handler: (
    request: NextRequest,
    context: any,
    user: Awaited<ReturnType<typeof requireAuth>>
  ) => Promise<NextResponse<T>>
) {
  return withApiHandler(async (request: NextRequest, context: any) => {
    const user = await requireAuth()
    return await handler(request, context, user)
  })
}

/**
 * Standard route segment config for authenticated routes
 */
export const authenticatedRouteConfig = {
  dynamic: 'force-dynamic' as const,
  revalidate: 60,
}

/**
 * Standard route segment config for public routes
 */
export const publicRouteConfig = {
  dynamic: 'auto' as const,
  revalidate: 3600,
}
