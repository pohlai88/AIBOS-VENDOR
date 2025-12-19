import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { logError } from "@/lib/logger";

// Route segment config following Next.js 16 best practices
export const dynamic = "force-dynamic";
export const revalidate = 300;
export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const { id } = await params;

    const { data: statement, error } = await supabase
      .from("statements")
      .select("*, transactions(*)")
      .eq("id", id)
      .single();

    if (error || !statement) {
      return createErrorResponse(
        new Error("Statement not found"),
        404,
        "STATEMENT_NOT_FOUND"
      );
    }

    // Check access
    const hasAccess =
      statement.organization_id === user.organizationId ||
      (statement.is_shared &&
        statement.organization_id !== user.organizationId &&
        user.role === "vendor") ||
      (statement.vendor_id === user.organizationId &&
        user.role !== "vendor");

    if (!hasAccess) {
      return createErrorResponse(
        new Error("Access denied"),
        403,
        "ACCESS_DENIED"
      );
    }

    return createSuccessResponse({ statement });
  } catch (error) {
    const errorDetails = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : { error: String(error) };

    logError("[Statements API GET by ID Error]", error, {
      ...errorDetails,
      path: "/api/statements/[id]",
    });

    return createErrorResponse(
      new Error("Failed to fetch statement"),
      500,
      "STATEMENT_FETCH_ERROR"
    );
  }
}

