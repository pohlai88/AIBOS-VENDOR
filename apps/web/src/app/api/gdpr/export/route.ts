import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { exportUserData } from "@/lib/gdpr";
import { logError, logInfo } from "@/lib/logger";
import { logDataAccess } from "@/lib/audit-log";

// Route segment config following Next.js 16 best practices
// force-dynamic: Always render on request (authenticated route)
// nodejs runtime: Required for Supabase client (Node.js library)
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60; // 60 seconds for GDPR data export (can be large)

/**
 * GET /api/gdpr/export - Export user data (GDPR right to access)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Users can only export their own data
    const userId = request.nextUrl.searchParams.get("userId") || user.id;

    if (userId !== user.id && user.role !== "company_admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    const data = await exportUserData(userId);

    if (!data) {
      return NextResponse.json(
        { error: "Failed to export user data" },
        { status: 500 }
      );
    }

    // Log data export
    await logDataAccess(
      "export",
      "user_data",
      userId,
      user.id,
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || undefined,
      request.headers.get("user-agent") || undefined
    );

    logInfo("User data exported", { userId, exportedBy: user.id });

    // Return as JSON (can be downloaded)
    return NextResponse.json(data, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="user-data-${userId}-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    logError("GDPR export error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
