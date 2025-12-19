import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { deleteUserAccount } from "@/lib/gdpr";
import { logError, logInfo } from "@/lib/logger";
import { logDataModification } from "@/lib/audit-log";

/**
 * POST /api/gdpr/delete - Delete user account (GDPR right to be forgotten)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { userId, confirm } = body;

    // Users can only delete their own account (unless admin)
    const targetUserId = userId || user.id;

    if (targetUserId !== user.id && user.role !== "company_admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Require explicit confirmation
    if (!confirm || confirm !== "DELETE") {
      return NextResponse.json(
        { error: "Account deletion requires explicit confirmation. Send { confirm: 'DELETE' }" },
        { status: 400 }
      );
    }

    const result = await deleteUserAccount(targetUserId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to delete account" },
        { status: 500 }
      );
    }

    // Log account deletion
    await logDataModification(
      "delete",
      "user",
      targetUserId,
      user.id,
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || undefined,
      request.headers.get("user-agent") || undefined,
      { reason: "GDPR right to be forgotten" }
    );

    logInfo("User account deleted via GDPR request", {
      deletedUserId: targetUserId,
      deletedBy: user.id,
    });

    return NextResponse.json({
      success: true,
      message: "Account and all associated data have been deleted",
    });
  } catch (error) {
    logError("GDPR delete error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
