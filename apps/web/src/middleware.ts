import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "./lib/supabase/middleware";
import { checkRateLimit, getRateLimitHeaders, type RateLimitTier } from "./lib/rate-limit";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip middleware for Next.js internal routes including MCP endpoint
  if (path.startsWith("/_next/mcp")) {
    return NextResponse.next();
  }

  // Determine rate limit tier based on path
  let tier: RateLimitTier = "public";

  // Check if route is authenticated (protected routes)
  if (path.startsWith("/api/") && !path.startsWith("/api/auth/login") && !path.startsWith("/api/auth/signup")) {
    tier = "authenticated";
  }

  // Check if route is admin
  if (path.startsWith("/api/admin/")) {
    tier = "admin";
  }

  // Get identifier (IP address or user ID if available)
  const identifier = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";

  // Check rate limit
  const rateLimitResult = await checkRateLimit(identifier, tier);

  // If rate limit exceeded, return 429
  if (!rateLimitResult.success) {
    const headers = getRateLimitHeaders(rateLimitResult);
    return NextResponse.json(
      {
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
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

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|_next/mcp|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

