import { NextRequest } from "next/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";

// Route segment config
export const dynamic = "force-dynamic";

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
    return createErrorResponse(error);
  }
}
