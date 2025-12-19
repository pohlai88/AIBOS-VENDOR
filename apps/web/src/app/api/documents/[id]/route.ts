import { NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { logDocumentAccess } from "@/lib/documents";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { logError } from "@/lib/logger";

// Route segment config following Next.js 16 best practices
// force-dynamic: Always render on request (authenticated route)
// nodejs runtime: Required for Supabase client (Node.js library)
export const dynamic = "force-dynamic";
export const revalidate = 60;
export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const { id } = await params;

    const { data: document, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !document) {
      return createErrorResponse(
        new Error("Document not found"),
        404,
        "DOCUMENT_NOT_FOUND"
      );
    }

    // Check access
    const hasAccess =
      document.organization_id === user.organizationId ||
      (document.is_shared &&
        document.organization_id !== user.organizationId &&
        user.role === "vendor") ||
      (document.vendor_id === user.organizationId &&
        user.role !== "vendor");

    if (!hasAccess) {
      return createErrorResponse(
        new Error("Access denied"),
        403,
        "ACCESS_DENIED"
      );
    }

    // Log document access
    await logDocumentAccess(document.id, user.id, "view");

    return createSuccessResponse({ document });
  } catch (error) {
    const errorDetails = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : { error: String(error) };

    logError("[Documents API GET by ID Error]", error, {
      ...errorDetails,
      path: "/api/documents/[id]",
    });

    return createErrorResponse(
      new Error("Failed to fetch document"),
      500,
      "DOCUMENT_FETCH_ERROR"
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const { id } = await params;

    const { data: document, error: fetchError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !document) {
      return createErrorResponse(
        new Error("Document not found"),
        404,
        "DOCUMENT_NOT_FOUND"
      );
    }

    // Check permissions
    const canDelete =
      document.created_by === user.id ||
      (document.organization_id === user.organizationId &&
        (user.role === "company_admin" || user.role === "company_user"));

    if (!canDelete) {
      return createErrorResponse(
        new Error("Access denied"),
        403,
        "ACCESS_DENIED"
      );
    }

    // Delete file from storage
    const fileName = document.file_url.split("/").pop();
    if (fileName) {
      await supabase.storage
        .from("documents")
        .remove([`${document.organization_id}/${fileName}`]);
    }

    // Delete document record
    const { error: deleteError } = await supabase
      .from("documents")
      .delete()
      .eq("id", id);

    if (deleteError) {
      logError("[Documents API DELETE Error]", deleteError, {
        documentId: id,
        userId: user.id,
        timestamp: new Date().toISOString(),
      });
      return createErrorResponse(
        new Error("Failed to delete document"),
        400,
        "DOCUMENT_DELETE_ERROR"
      );
    }

    // Log document access
    await logDocumentAccess(document.id, user.id, "delete");

    // Trigger webhook for document.deleted event
    const { deliverWebhook } = await import("@/lib/webhooks");
    deliverWebhook("document.deleted", {
      documentId: document.id,
      name: document.name,
      organizationId: user.organizationId,
    }, user.organizationId).catch((error) => {
      // Log but don't fail the request
      logError("[Webhook] Document delete webhook failed", error, {
        documentId: document.id,
      });
    });

    // Revalidate cache after deletion
    revalidateTag("documents", "max");

    return createSuccessResponse({ success: true });
  } catch (error) {
    const errorDetails = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : { error: String(error) };

    logError("[Documents API DELETE Error]", error, {
      ...errorDetails,
      path: "/api/documents/[id]",
    });

    return createErrorResponse(
      new Error("Failed to delete document"),
      500,
      "DOCUMENT_DELETE_ERROR"
    );
  }
}

