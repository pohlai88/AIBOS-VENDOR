import { getCurrentUser } from "@/lib/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { logError } from "@/lib/logger";

// Route segment config following Next.js 16 best practices
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return createErrorResponse(new Error("Unauthorized"), 401, "UNAUTHORIZED");
    }

    return createSuccessResponse({ user });
  } catch (error) {
    logError("[Auth Me API Error]", error, {
      path: "/api/auth/me",
    });
    return createErrorResponse(
      error instanceof Error ? error : new Error("Failed to get user"),
      500,
      "AUTH_ERROR"
    );
  }
}

