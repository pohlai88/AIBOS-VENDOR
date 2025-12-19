import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/logger";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { logDocumentAccess } from "@/lib/documents";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";

// Route segment config for caching
export const dynamic = "force-dynamic"; // Authenticated routes need dynamic rendering
export const revalidate = 60; // Revalidate every 60 seconds

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const vendorId = searchParams.get("vendorId");

    // Pagination parameters
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    // Sorting parameters
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const validSortFields = ["name", "created_at", "file_size", "category"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "created_at";
    const ascending = sortOrder === "asc";

    // Build base query with count for total items
    // Only select fields that are actually used to reduce payload size
    let query = supabase
      .from("documents")
      .select("id, name, category, file_size, created_at, mime_type, file_url, is_shared, vendor_id, organization_id", { count: "exact" });

    // Apply filters based on user role and access
    if (user.role === "vendor") {
      // Vendors can see their own documents + shared company documents
      query = query.or(
        `organization_id.eq.${user.organizationId},and(vendor_id.eq.${user.organizationId},is_shared.eq.true)`
      );
    } else {
      // Company users can see all documents in their org + vendor documents
      query = query.or(
        `organization_id.eq.${user.organizationId},vendor_id.in.(select vendor_id from vendor_relationships where company_id.eq.${user.organizationId} and status.eq.active)`
      );
    }

    if (category) {
      query = query.eq("category", category);
    }

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    if (vendorId && user.role !== "vendor") {
      query = query.eq("vendor_id", vendorId);
    }

    // Apply sorting
    query = query.order(sortField, { ascending });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      logError("[Documents API GET Error]", error, {
        userId: user.id,
      });
      return createErrorResponse(
        new Error("Failed to fetch documents"),
        400,
        "DOCUMENTS_FETCH_ERROR"
      );
    }

    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / limit);

    return createSuccessResponse({
      documents: data || [],
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    const errorDetails = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : { error: String(error) };

    logError("[Documents API GET Error]", error, {
      ...errorDetails,
      path: "/api/documents",
    });

    return createErrorResponse(
      new Error("Failed to fetch documents"),
      500,
      "DOCUMENTS_API_ERROR"
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const vendorId = formData.get("vendorId") as string | null;
    const isShared = formData.get("isShared") === "true";

    if (!file || !name) {
      return NextResponse.json(
        { error: "File and name are required" },
        { status: 400 }
      );
    }

    // Upload file to Supabase Storage
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.organizationId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
        { status: 400 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("documents").getPublicUrl(fileName);

    // Create document record
    const { data: document, error: docError } = await supabase
      .from("documents")
      .insert({
        name,
        type: fileExt || "",
        category: category || "other",
        file_url: publicUrl,
        file_size: file.size,
        mime_type: file.type,
        organization_id: user.organizationId,
        vendor_id: vendorId || null,
        is_shared: isShared,
        created_by: user.id,
      })
      .select()
      .single();

    if (docError) {
      // Clean up uploaded file
      await supabase.storage.from("documents").remove([fileName]);
      return NextResponse.json(
        { error: docError.message },
        { status: 400 }
      );
    }

    // Log document access
    await logDocumentAccess(document.id, user.id, "upload");

    // Revalidate cache after creating document
    revalidateTag("documents", "max");

    // Send email notification if document is shared
    if (document && isShared && vendorId) {
      const { sendDocumentUpdateEmail } = await import("@/lib/email-notifications");
      sendDocumentUpdateEmail(vendorId, {
        documentName: document.name,
        action: "shared",
        link: `/documents/${document.id}`,
      }).catch((error) => {
        // Log but don't fail the request
        logError("[Email] Document share notification failed", error, {
          documentId: document.id,
          vendorId,
        });
      });
    }

    // Trigger webhook for document.uploaded event
    if (document) {
      const { deliverWebhook } = await import("@/lib/webhooks");
      deliverWebhook("document.uploaded", {
        documentId: document.id,
        name: document.name,
        category: document.category,
        organizationId: user.organizationId,
        vendorId: document.vendor_id,
        isShared: document.is_shared,
      }, user.organizationId).catch((error) => {
        // Log but don't fail the request
        logError("[Webhook] Document upload webhook failed", error, {
          documentId: document.id,
        });
      });
    }

    return createSuccessResponse({ document });
  } catch (error) {
    const errorDetails = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : { error: String(error) };

    logError("[Documents API POST Error]", error, {
      ...errorDetails,
      path: "/api/documents",
    });

    return createErrorResponse(
      new Error("Failed to create document"),
      500,
      "DOCUMENTS_CREATE_ERROR"
    );
  }
}

