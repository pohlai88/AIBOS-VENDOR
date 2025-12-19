import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client (fallback to in-memory if not configured)
let redis: Redis | null = null;
let publicLimiter: Ratelimit | null = null;
let authenticatedLimiter: Ratelimit | null = null;
let adminLimiter: Ratelimit | null = null;

// Initialize rate limiters
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv();

    // Public endpoints: 60 requests per minute
    publicLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      analytics: true,
      prefix: "@upstash/ratelimit/public",
    });

    // Authenticated endpoints: 200 requests per minute
    authenticatedLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(200, "1 m"),
      analytics: true,
      prefix: "@upstash/ratelimit/auth",
    });

    // Admin endpoints: 500 requests per minute
    adminLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(500, "1 m"),
      analytics: true,
      prefix: "@upstash/ratelimit/admin",
    });
  }
} catch (error) {
  console.warn("Rate limiting not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables.");
}

export type RateLimitTier = "public" | "authenticated" | "admin";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check rate limit for a given identifier (IP address or user ID)
 */
export async function checkRateLimit(
  identifier: string,
  tier: RateLimitTier = "public"
): Promise<RateLimitResult> {
  // If rate limiting is not configured, allow all requests
  if (!redis) {
    return {
      success: true,
      limit: 1000,
      remaining: 1000,
      reset: Date.now() + 60000,
    };
  }

  let limiter: Ratelimit | null = null;

  switch (tier) {
    case "public":
      limiter = publicLimiter;
      break;
    case "authenticated":
      limiter = authenticatedLimiter;
      break;
    case "admin":
      limiter = adminLimiter;
      break;
  }

  // Ensure we always have a limiter
  const finalLimiter = limiter ?? publicLimiter;
  if (!finalLimiter) {
    // Fallback if no limiter is available
    return {
      success: true,
      limit: 1000,
      remaining: 1000,
      reset: Date.now() + 60000,
    };
  }
  const result = await finalLimiter.limit(identifier);

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
  };
}
