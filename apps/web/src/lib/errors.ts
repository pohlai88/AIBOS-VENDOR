import { NextResponse } from "next/server";

/**
 * Custom error class for application errors
 * @deprecated Prefer using structured error responses from lib/api-utils
 * This is kept for backward compatibility
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Create error response (legacy version)
 * @deprecated Use createErrorResponse from lib/api-utils for consistency
 * This function is kept for backward compatibility but routes should migrate to api-utils
 */
export function createErrorResponse(
  error: unknown,
  statusCode?: number,
  code?: string
): NextResponse {
  // Re-export from api-utils for consistency
  const { createErrorResponse: createErrorResponseNew } = require('@/lib/api-utils')
  return createErrorResponseNew(error, statusCode || 500, code)
}

/**
 * Create success response (legacy version)
 * @deprecated Use createSuccessResponse from lib/api-utils for consistency
 * This function is kept for backward compatibility but routes should migrate to api-utils
 */
export function createSuccessResponse<T>(data: T, _status: number = 200): NextResponse {
  // Re-export from api-utils for consistency
  const { createSuccessResponse: createSuccessResponseNew } = require('@/lib/api-utils')
  return createSuccessResponseNew(data)
}

