import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { runRetentionCleanup } from "@/lib/data-retention";
import { logError } from "@/lib/logger";

// Route segment config following Next.js 16 best practices
// force-dynamic: Always render on request (admin route)
// nodejs runtime: Required for Supabase client (Node.js library)
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/admin/retention - Run retention cleanup (admin only)
 */
export async function POST(_request: NextRequest) {
  try {
    const user = await requireAuth();

    // Only admins can run retention cleanup
    if (user.role !== "company_admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const results = await runRetentionCleanup();

    return NextResponse.json({
      success: true,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logError("Retention cleanup error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
