import { NextRequest } from "next/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";

// Route segment config following Next.js 16 best practices
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, title } = body;

    // Log page view (can be extended to save to database)
    const { logInfo } = await import("@/lib/logger");
    logInfo("[Analytics] Page View", { path, title });

    // In production, you would:
    // 1. Save to analytics database
    // 2. Send to analytics service (e.g., PostHog, Mixpanel)
    // 3. Update user session tracking

    return createSuccessResponse({ success: true });
  } catch (error) {
    const { logError } = await import("@/lib/logger");
    logError("[Analytics Pageview API Error]", error, {
      path: "/api/analytics/pageview",
    });
    return createErrorResponse(
      error instanceof Error ? error : new Error("Failed to log pageview"),
      500,
      "ANALYTICS_ERROR"
    );
  }
}
