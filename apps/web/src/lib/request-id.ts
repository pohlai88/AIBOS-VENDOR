/**
 * Request ID / Correlation ID utilities
 * 
 * Generates unique request IDs for tracing requests across services
 * and correlating client-side errors with server-side logs.
 * 
 * Best practice: Use incoming request ID if present (from proxies/APM),
 * otherwise generate a UUID. This enables correlation across services.
 */

/**
 * Generate a unique request ID using UUID
 * Format: UUID v4 (e.g., "550e8400-e29b-41d4-a716-446655440000")
 * 
 * UUIDs are collision-resistant and cleaner than timestamp-based IDs
 */
export function generateRequestId(): string {
  // Use crypto.randomUUID() if available (Node.js 19+, modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older environments
  // Generate UUID v4 manually
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Get or create request ID from headers
 * 
 * Best practice: Propagate incoming request ID if present (from proxies/APM),
 * otherwise generate new one. This enables correlation across services.
 * 
 * @param request - NextRequest or Request object
 * @returns Request ID (UUID format)
 */
export function getRequestId(request: Request | { headers: Headers | { get: (name: string) => string | null } }): string {
  // Try multiple header name variations (common in different proxies/APM tools)
  const existingId = 
    request.headers.get("x-request-id") ||
    request.headers.get("X-Request-Id") ||
    request.headers.get("request-id") ||
    request.headers.get("Request-Id");
  
  if (existingId) {
    return existingId;
  }
  
  return generateRequestId();
}
