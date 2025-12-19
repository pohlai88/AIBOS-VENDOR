import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "./lib/supabase/middleware";
import { checkRateLimit, getRateLimitHeaders, type RateLimitTier } from "./lib/rate-limit";
import { getRequestId } from "./lib/request-id";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip proxy for Next.js internal routes including MCP endpoint
  if (path.startsWith("/_next/mcp")) {
    return NextResponse.next();
  }

  // Get or create request ID (propagate if present, generate if not)
  const requestId = getRequestId(request);

  // Determine rate limit tier based on path
  let tier: RateLimitTier = "public";

  // Check if route is authenticated (protected routes)
  // Exclude public auth routes from authenticated tier
  if (path.startsWith("/api/") &&
    !path.startsWith("/api/auth/login") &&
    !path.startsWith("/api/auth/signup") &&
    !path.startsWith("/api/auth/oauth") &&
    !path.startsWith("/api/auth/health")) {
    tier = "authenticated";
  }

  // Check if route is admin
  if (path.startsWith("/api/admin/")) {
    tier = "admin";
  }

  // Get identifier (IP address or user ID if available)
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  let identifier = "unknown";
  if (forwardedFor && typeof forwardedFor === 'string') {
    const parts = forwardedFor.split(",");
    if (parts.length > 0 && parts[0]) {
      identifier = parts[0].trim();
    }
  }
  if (identifier === "unknown" && realIp && typeof realIp === 'string') {
    identifier = realIp;
  }

  // Check rate limit
  const rateLimitResult = await checkRateLimit(identifier, tier);

  // If rate limit exceeded, return 429
  if (!rateLimitResult.success) {
    const headers = new Headers(getRateLimitHeaders(rateLimitResult));
    // Set request ID in response header for correlation
    headers.set('x-request-id', requestId);

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          kind: "rate_limit",
          message: "Rate limit exceeded. Please try again later.",
          requestId,
        },
        retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers,
      }
    );
  }

  // Continue with session update
  const response = await updateSession(request);

  // Add rate limit headers to response
  const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);
  Object.entries(rateLimitHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Set request ID in response header for correlation across proxies/APM
  response.headers.set('x-request-id', requestId);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/mcp|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
