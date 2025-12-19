import { NextRequest } from "next/server";
import { logError } from "@/lib/logger";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logDocumentAccess } from "@/lib/documents";
import {
  createErrorResponse,
  createSuccessResponse,
  withAuth,
  validatePagination,
  validateSort,
} from "@/lib/api-utils";

// Route segment config following Next.js 16 best practices
// force-dynamic: Always render on request (authenticated route)
// nodejs runtime: Required for Supabase client (Node.js library)
export const dynamic = 'force-dynamic';
export const revalidate = 60;
export const runtime = "nodejs";

export const GET = withAuth(async (request: NextRequest, _context, user) => {
  const supabase = await createClient();
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const vendorId = searchParams.get("vendorId");
  const useSemantic = searchParams.get("semantic") === "true"; // Optional semantic search flag

  // Validate pagination (best practice)
  const { page, limit, offset } = validatePagination(searchParams);

  // Validate sorting (best practice)
  const validSortFields = ["name", "created_at", "file_size", "category"];
  const { sortBy: sortField, ascending } = validateSort(
    searchParams,
    validSortFields
  );

  // If semantic search is requested and query is substantial, use hybrid search
  if (useSemantic && search && search.length > 3) {
    try {
      const { hybridSearchDocuments } = await import("@/lib/semantic-search");
      const hybridResults = await hybridSearchDocuments(
        search,
        user.tenantId,
        user.organizationId,
        { limit, useSemantic: true }
      );

      // Get full document details for combined results
      if (hybridResults.combined.length > 0) {
        const documentIds = hybridResults.combined.map(r => r.document_id);

        let documentsQuery = supabase
          .from("documents")
          .select("id, name, category, file_size, created_at, mime_type, file_url, is_shared, vendor_id, organization_id")
          .in("id", documentIds)
          .eq("tenant_id", user.tenantId);

        // Apply role-based filtering
        if (user.role === "vendor") {
          documentsQuery = documentsQuery.or(
            `organization_id.eq.${user.organizationId},and(vendor_id.eq.${user.organizationId},is_shared.eq.true)`
          );
        } else {
          documentsQuery = documentsQuery.or(
            `organization_id.eq.${user.organizationId},vendor_id.in.(select vendor_id from vendor_relationships where company_id.eq.${user.organizationId} and status.eq.active and tenant_id.eq.${user.tenantId})`
          );
        }

        if (category) {
          documentsQuery = documentsQuery.eq("category", category);
        }

        if (vendorId && user.role !== "vendor") {
          documentsQuery = documentsQuery.eq("vendor_id", vendorId);
        }

        const { data: documentsData, error: documentsError } = await documentsQuery;

        if (documentsError) {
          // Fall back to keyword search
          logError("[Hybrid Search] Failed to fetch document details", documentsError);
        } else {
          // Preserve search result order and similarity
          const docMap = new Map(documentsData?.map(d => [d.id, d]) || []);
          const orderedDocuments = hybridResults.combined
            .map(r => docMap.get(r.document_id))
            .filter(Boolean) as typeof documentsData;

          return createSuccessResponse({
            documents: orderedDocuments || [],
            pagination: {
              currentPage: page,
              totalPages: Math.ceil(orderedDocuments.length / limit),
              totalItems: orderedDocuments.length,
              itemsPerPage: limit,
            },
            searchMetadata: {
              searchType: "hybrid",
              keywordCount: hybridResults.keywordResults.length,
              semanticCount: hybridResults.semanticResults.length,
            },
          });
        }
      }
    } catch (semanticError) {
      // Graceful degradation: fall back to keyword search
      logError("[Semantic Search] Failed, falling back to keyword search", semanticError);
    }
  }

  // Standard keyword search (default or fallback)
  // Build base query with count for total items
  // Only select fields that are actually used to reduce payload size
  // RLS enforces tenant isolation, but we explicitly filter for defense in depth
  let query = supabase
    .from("documents")
    .select("id, name, category, file_size, created_at, mime_type, file_url, is_shared, vendor_id, organization_id", { count: "exact" })
    .eq("tenant_id", user.tenantId); // Explicit tenant filter

  // Apply filters based on user role and access
  if (user.role === "vendor") {
    // Vendors can see their own documents + shared company documents
    query = query.or(
      `organization_id.eq.${user.organizationId},and(vendor_id.eq.${user.organizationId},is_shared.eq.true)`
    );
  } else {
    // Company users can see all documents in their org + vendor documents
    query = query.or(
      `organization_id.eq.${user.organizationId},vendor_id.in.(select vendor_id from vendor_relationships where company_id.eq.${user.organizationId} and status.eq.active and tenant_id.eq.${user.tenantId})`
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
});

export const POST = withAuth(async (request: NextRequest, _context, user) => {
  const supabase = await createClient();

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const name = formData.get("name") as string;
  const category = formData.get("category") as string;
  const vendorId = formData.get("vendorId") as string | null;
  const isShared = formData.get("isShared") === "true";

  if (!file || !name) {
    return createErrorResponse(
      new Error("File and name are required"),
      400,
      "VALIDATION_ERROR"
    );
  }

  // Upload file to Supabase Storage using helper function
  const { uploadFile, generateFilePath, getSignedUrl, getFileExtension } = await import("@/lib/storage");

  const fileExt = getFileExtension(file.name);
  const fileName = generateFilePath(user.organizationId, `${Date.now()}.${fileExt}`, {
    tenantId: user.tenantId,
    category: category || undefined,
    timestamp: true,
  });

  try {
    await uploadFile({
      bucket: "documents",
      path: fileName,
      file,
      options: {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      },
    });
  } catch (uploadError) {
    logError("[Document Upload Error]", uploadError, {
      userId: user.id,
      fileName,
    });
    return createErrorResponse(
      uploadError instanceof Error ? uploadError : new Error("Upload failed"),
      400,
      "UPLOAD_ERROR"
    );
  }

  // Get signed URL for private file (best practice: use signed URLs instead of public URLs)
  const signedUrl = await getSignedUrl("documents", fileName, 3600);

  // Create document record with tenant_id
  const { data: document, error: docError } = await supabase
    .from("documents")
    .insert({
      name,
      type: fileExt || "",
      category: category || "other",
      file_url: signedUrl,
      file_size: file.size,
      mime_type: file.type,
      organization_id: user.organizationId,
      tenant_id: user.tenantId, // Required for multi-tenant
      vendor_id: vendorId || null,
      is_shared: isShared,
      created_by: user.id,
    })
    .select()
    .single();

  if (docError) {
    // Clean up uploaded file
    await supabase.storage.from("documents").remove([fileName]);
    return createErrorResponse(
      new Error(docError.message),
      400,
      "DOCUMENT_CREATE_ERROR"
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
});

