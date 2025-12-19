/**
 * Standardized Route Segment Configurations
 * 
 * Following Next.js 16 best practices for route segment configs.
 * Use these constants to ensure consistent caching and rendering behavior.
 */

/**
 * Public/Marketing Pages Configuration
 * 
 * Use for:
 * - Landing pages
 * - Documentation pages
 * - Public marketing pages
 * - Legal pages (privacy, terms, security)
 * 
 * Strategy: Static generation with ISR (Incremental Static Regeneration)
 * - Cache for 1 hour (3600 seconds)
 * - Revalidate in background after cache expires
 */
export const publicPageConfig = {
  dynamic: "force-static" as const,
  revalidate: 3600, // 1 hour
};

/**
 * Protected/App Pages Configuration
 * 
 * Use for:
 * - Dashboard pages
 * - Authenticated app pages
 * - Pages requiring user session
 * - Pages with dynamic data based on user context
 * 
 * Strategy: Always render on request (force-dynamic)
 * - No static generation
 * - Always fresh data
 * - Required for pages that depend on cookies/headers
 */
export const protectedPageConfig = {
  dynamic: "force-dynamic" as const,
};

/**
 * API Routes Configuration
 * 
 * Use for:
 * - All API route handlers
 * 
 * Strategy: Always dynamic with Node.js runtime
 */
export const apiRouteConfig = {
  dynamic: "force-dynamic" as const,
  runtime: "nodejs" as const,
};

/**
 * Metadata Title Template
 * 
 * Standard format for page titles
 */
export const metadataTitleTemplate = "%s | NexusCanon";
