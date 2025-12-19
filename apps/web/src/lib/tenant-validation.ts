/**
 * Tenant Validation Utilities
 * 
 * Provides utilities for validating tenant scope in API routes
 * and logging cross-tenant access attempts for security monitoring.
 * 
 * Following production security best practices:
 * - Validate tenant_id in all tenant-scoped operations
 * - Log cross-tenant access attempts
 * - Use requestId for correlation
 */

import { getCurrentUser } from "@/lib/auth";
import { logError, logWarn } from "@/lib/logger";
import { getRequestId } from "@/lib/request-id";
import type { NextRequest } from "next/server";

export interface TenantValidationResult {
  valid: boolean;
  userTenantId: string | null;
  requestedTenantId: string | null;
  error?: string;
  code?: string;
}

/**
 * Validate tenant scope for a request
 * 
 * Checks if the requested tenant_id matches the user's tenant_id.
 * Logs cross-tenant access attempts for security monitoring.
 * 
 * @param request - Next.js request object (for requestId)
 * @param requestedTenantId - Tenant ID from request (query param, body, etc.)
 * @returns Validation result with tenant IDs and error info
 */
export async function validateTenantScope(
  request: NextRequest,
  requestedTenantId: string | null | undefined
): Promise<TenantValidationResult> {
  const requestId = getRequestId(request);

  // Get current user
  const user = await getCurrentUser();

  if (!user) {
    logWarn("[TenantValidation] Unauthenticated tenant validation attempt", {
      requestId,
      requestedTenantId,
    });

    return {
      valid: false,
      userTenantId: null,
      requestedTenantId: requestedTenantId || null,
      error: "User not authenticated",
      code: "UNAUTHENTICATED",
    };
  }

  if (!user.tenantId) {
    logWarn("[TenantValidation] User has no tenant_id", {
      requestId,
      userId: user.id,
      requestedTenantId,
    });

    return {
      valid: false,
      userTenantId: null,
      requestedTenantId: requestedTenantId || null,
      error: "User has no tenant assigned",
      code: "NO_TENANT",
    };
  }

  // If no tenant_id requested, allow (RLS will enforce tenant scope)
  if (!requestedTenantId) {
    return {
      valid: true,
      userTenantId: user.tenantId,
      requestedTenantId: null,
    };
  }

  // Validate tenant match
  if (requestedTenantId !== user.tenantId) {
    // CRITICAL: Cross-tenant access attempt detected
    logError("[TenantValidation] Cross-tenant access attempt blocked", new Error("Cross-tenant access attempt"), {
      requestId,
      userId: user.id,
      userTenantId: user.tenantId,
      requestedTenantId,
      path: request.nextUrl.pathname,
      method: request.method,
    });

    return {
      valid: false,
      userTenantId: user.tenantId,
      requestedTenantId,
      error: "Access denied: tenant mismatch",
      code: "TENANT_MISMATCH",
    };
  }

  return {
    valid: true,
    userTenantId: user.tenantId,
    requestedTenantId,
  };
}

/**
 * Validate tenant scope from request body
 * 
 * Extracts tenant_id from request body and validates it.
 * 
 * @param request - Next.js request object
 * @param body - Parsed request body (optional, will parse if not provided)
 * @returns Validation result
 */
export async function validateTenantFromBody(
  request: NextRequest,
  body?: any
): Promise<TenantValidationResult> {
  let parsedBody = body;

  if (!parsedBody) {
    try {
      parsedBody = await request.json();
    } catch (error) {
      return {
        valid: false,
        userTenantId: null,
        requestedTenantId: null,
        error: "Invalid request body",
        code: "INVALID_BODY",
      };
    }
  }

  const requestedTenantId = parsedBody?.tenant_id || parsedBody?.tenantId;

  return validateTenantScope(request, requestedTenantId);
}

/**
 * Validate tenant scope from query parameters
 * 
 * Extracts tenant_id from query params and validates it.
 * 
 * @param request - Next.js request object
 * @returns Validation result
 */
export async function validateTenantFromQuery(
  request: NextRequest
): Promise<TenantValidationResult> {
  const requestedTenantId = request.nextUrl.searchParams.get("tenant_id") ||
    request.nextUrl.searchParams.get("tenantId");

  return validateTenantScope(request, requestedTenantId);
}

/**
 * Validate tenant scope from path parameters
 * 
 * Extracts tenant_id from path (e.g., /api/tenants/:tenant_id/...)
 * 
 * @param request - Next.js request object
 * @param tenantIdFromPath - Tenant ID extracted from path
 * @returns Validation result
 */
export async function validateTenantFromPath(
  request: NextRequest,
  tenantIdFromPath: string | null | undefined
): Promise<TenantValidationResult> {
  return validateTenantScope(request, tenantIdFromPath);
}

/**
 * Log unsafe API attempt (missing tenant scope)
 * 
 * Logs when an API receives a request without proper tenant scoping.
 * This helps detect potential security issues.
 * 
 * @param request - Next.js request object
 * @param context - Additional context (table name, operation, etc.)
 */
export function logUnsafeApiAttempt(
  request: NextRequest,
  context?: {
    table?: string;
    operation?: string;
    resourceId?: string;
  }
): void {
  const requestId = getRequestId(request);

  logWarn("[TenantValidation] Unsafe API attempt - missing tenant scope", {
    requestId,
    path: request.nextUrl.pathname,
    method: request.method,
    ...context,
  });
}

/**
 * Require tenant validation (throws if invalid)
 * 
 * Validates tenant scope and throws an error if validation fails.
 * Use this in API routes that require tenant validation.
 * 
 * @param request - Next.js request object
 * @param requestedTenantId - Tenant ID from request
 * @throws Error if tenant validation fails
 */
export async function requireTenantValidation(
  request: NextRequest,
  requestedTenantId: string | null | undefined
): Promise<string> {
  const validation = await validateTenantScope(request, requestedTenantId);

  if (!validation.valid) {
    const error = new Error(validation.error || "Tenant validation failed");
    (error as any).code = validation.code || "TENANT_VALIDATION_FAILED";
    throw error;
  }

  return validation.userTenantId!;
}
