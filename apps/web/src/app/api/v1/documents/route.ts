import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { getAPIVersion, addVersionHeaders, getVersionInfo, createVersionedErrorResponse } from "@/lib/api/versioning";
import { logApiRequest } from "@/lib/audit-log";
import { trackAPICall } from "@/lib/apm";

// Route segment config following Next.js 16 best practices
export const dynamic = "force-dynamic";
export const revalidate = 60;
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const version = getAPIVersion(request);
  const versionInfo = getVersionInfo(version);

  return trackAPICall("GET /api/v1/documents", async () => {
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

      if (!validSortFields.includes(sortBy)) {
        const response = createVersionedErrorResponse(
          "Invalid sort field",
          400,
          version
        );
        await logApiRequest(
          "GET",
          request.nextUrl.pathname,
          400,
          user.id,
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || undefined,
          request.headers.get("user-agent") || undefined
        );
        return response;
      }

      let query = supabase
        .from("documents")
        .select("id, name, type, category, file_url, file_size, mime_type, organization_id, vendor_id, is_shared, version, created_at, updated_at, created_by", { count: "exact" })
        .eq("tenant_id", user.tenantId) // Explicit tenant filter
        .or(`organization_id.eq.${user.organizationId},and(vendor_id.eq.${user.organizationId},is_shared.eq.true)`);

      if (category) {
        query = query.eq("category", category);
      }

      if (search) {
        query = query.ilike("name", `%${search}%`);
      }

      if (vendorId) {
        query = query.eq("vendor_id", vendorId);
      }

      query = query.order(sortBy, { ascending: sortOrder === "asc" });
      query = query.range(offset, offset + limit - 1);

      const { data: documents, error, count } = await query;

      if (error) {
        const response = createVersionedErrorResponse(
          "Failed to fetch documents",
          500,
          version,
          { error: error.message }
        );
        await logApiRequest(
          "GET",
          request.nextUrl.pathname,
          500,
          user.id,
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || undefined,
          request.headers.get("user-agent") || undefined
        );
        return response;
      }

      const totalPages = count ? Math.ceil(count / limit) : 0;

      const response = NextResponse.json(
        {
          documents: documents || [],
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: count || 0,
            itemsPerPage: limit,
          },
          version,
        },
        { status: 200 }
      );

      await logApiRequest(
        "GET",
        request.nextUrl.pathname,
        200,
        user.id,
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || undefined,
        request.headers.get("user-agent") || undefined
      );

      return addVersionHeaders(response, version, versionInfo);
    } catch (error) {
      const response = createVersionedErrorResponse(
        "Internal server error",
        500,
        version
      );
      await logApiRequest(
        "GET",
        request.nextUrl.pathname,
        500,
        null,
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || undefined,
        request.headers.get("user-agent") || undefined
      );
      return response;
    }
  });
}
