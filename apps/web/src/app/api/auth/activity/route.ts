import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { requireAuth } from "@/lib/auth";
import { logError } from "@/lib/logger";

// Route segment config following Next.js 16 best practices
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const { data, error } = await supabase
      .from("user_activity_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      logError("[Activity Log GET Error]", error, {
        userId: user.id,
        path: "/api/auth/activity",
      });
      // Return empty array if table doesn't exist yet
      return createSuccessResponse({
        activities: [],
      });
    }

    const activities = (data || []).map((log) => ({
      id: log.id,
      action: log.action,
      resourceType: log.resource_type,
      resourceId: log.resource_id,
      createdAt: log.created_at,
    }));

    return createSuccessResponse({
      activities,
    });
  } catch (error) {
    logError("[Auth Activity API Error]", error, {
      path: "/api/auth/activity",
    });
    return createErrorResponse(
      error instanceof Error ? error : new Error("Failed to get activity"),
      500,
      "ACTIVITY_ERROR"
    );
  }
}
