import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { logError } from "@/lib/logger";

// Route segment config following Next.js 16 best practices
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      return createErrorResponse(new Error(error.message), 400, "LOGOUT_ERROR");
    }

    return createSuccessResponse({ success: true });
  } catch (error) {
    logError("[Auth Logout API Error]", error, {
      path: "/api/auth/logout",
    });
    return createErrorResponse(
      error instanceof Error ? error : new Error("Logout failed"),
      500,
      "LOGOUT_ERROR"
    );
  }
}

