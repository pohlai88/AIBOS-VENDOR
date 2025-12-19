import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { logDocumentAccess } from "@/lib/documents";

// Route segment config following Next.js 16 best practices
// force-dynamic: Always render on request (authenticated route)
// nodejs runtime: Required for Supabase client (Node.js library)
export const dynamic = "force-dynamic";
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
    // Generate signed URL for private file (best practice)
    // If file_url is already a signed URL, use it; otherwise generate new one
    let downloadUrl = document.file_url;

    // If file_url is a storage path (not a full URL), generate signed URL
    if (document.file_url && !document.file_url.startsWith('http')) {
      const { getSignedUrl } = await import("@/lib/storage");
      // Extract path from file_url (assuming format: bucket/path)
      const path = document.file_url.replace(/^.*\/storage\/v1\/object\/[^\/]+\//, '');
      downloadUrl = await getSignedUrl("documents", path, 3600);
    }

    return NextResponse.redirect(downloadUrl);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

