import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { logDocumentAccess } from "@/lib/documents";

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
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
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
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Log document access
    await logDocumentAccess(document.id, user.id, "download");

    // Redirect to the file URL
    return NextResponse.redirect(document.file_url);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

