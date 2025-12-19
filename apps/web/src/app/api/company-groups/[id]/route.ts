import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth, requireRole } from "@/lib/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { logError } from "@/lib/logger";

// Route segment config following Next.js 16 best practices
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/company-groups/[id]
 * Get a specific company group
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const supabase = await createClient();

    const { data: companyGroup, error } = await supabase
      .from("company_groups")
      .select("id, name, description, parent_group_id, settings, created_at, updated_at")
      .eq("id", id)
      .eq("tenant_id", user.tenantId)
      .single();

    if (error || !companyGroup) {
      return createErrorResponse(
        new Error("Company group not found"),
        404,
        "COMPANY_GROUP_NOT_FOUND"
      );
    }

    // Get organizations in this company group
    const { data: organizations } = await supabase
      .from("organizations")
      .select("id, name, type")
      .eq("company_group_id", id)
      .eq("tenant_id", user.tenantId);

    return createSuccessResponse({
      companyGroup: {
        ...companyGroup,
        organizations: organizations || [],
      },
    });
  } catch (error) {
    logError("[Company Groups API GET Error]", error);
    return createErrorResponse(
      new Error("Failed to fetch company group"),
      500,
      "COMPANY_GROUP_FETCH_ERROR"
    );
  }
}

/**
 * PATCH /api/company-groups/[id]
 * Update a company group (admin only)
 */
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["company_admin"]);
    const { id } = await params;
    const supabase = await createClient();
    const body = await _request.json();

    // Verify company group belongs to user's tenant
    const { data: existing } = await supabase
      .from("company_groups")
      .select("id")
      .eq("id", id)
      .eq("tenant_id", user.tenantId)
      .single();

    if (!existing) {
      return createErrorResponse(
        new Error("Company group not found"),
        404,
        "COMPANY_GROUP_NOT_FOUND"
      );
    }

    const updates: any = {};

    if (body.name) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.parent_group_id !== undefined) {
      if (body.parent_group_id) {
        // Validate parent exists in same tenant
        const { data: parent } = await supabase
          .from("company_groups")
          .select("id")
          .eq("id", body.parent_group_id)
          .eq("tenant_id", user.tenantId)
          .single();

        if (!parent) {
          return createErrorResponse(
            new Error("Parent company group not found"),
            404,
            "PARENT_GROUP_NOT_FOUND"
          );
        }
      }
      updates.parent_group_id = body.parent_group_id;
    }
    if (body.settings) updates.settings = body.settings;

    if (Object.keys(updates).length === 0) {
      return createErrorResponse(
        new Error("No fields to update"),
        400,
        "VALIDATION_ERROR"
      );
    }

    const { data: companyGroup, error } = await supabase
      .from("company_groups")
      .update(updates)
      .eq("id", id)
      .eq("tenant_id", user.tenantId)
      .select()
      .single();

    if (error) {
      logError("[Company Groups API PATCH Error]", error);
      return createErrorResponse(
        new Error(error.message),
        400,
        "COMPANY_GROUP_UPDATE_ERROR"
      );
    }

    return createSuccessResponse({ companyGroup });
  } catch (error) {
    logError("[Company Groups API PATCH Error]", error);
    return createErrorResponse(
      new Error("Failed to update company group"),
      500,
      "COMPANY_GROUP_UPDATE_ERROR"
    );
  }
}

/**
 * DELETE /api/company-groups/[id]
 * Delete a company group (admin only)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireRole(["company_admin"]);
    const { id } = await params;
    const supabase = await createClient();

    // Verify company group belongs to user's tenant
    const { data: existing } = await supabase
      .from("company_groups")
      .select("id")
      .eq("id", id)
      .eq("tenant_id", user.tenantId)
      .single();

    if (!existing) {
      return createErrorResponse(
        new Error("Company group not found"),
        404,
        "COMPANY_GROUP_NOT_FOUND"
      );
    }

    // Check if any organizations are using this group
    const { data: organizations } = await supabase
      .from("organizations")
      .select("id")
      .eq("company_group_id", id)
      .limit(1);

    if (organizations && organizations.length > 0) {
      return createErrorResponse(
        new Error("Cannot delete company group with associated organizations"),
        400,
        "COMPANY_GROUP_IN_USE"
      );
    }

    const { error } = await supabase
      .from("company_groups")
      .delete()
      .eq("id", id)
      .eq("tenant_id", user.tenantId);

    if (error) {
      logError("[Company Groups API DELETE Error]", error);
      return createErrorResponse(
        new Error(error.message),
        400,
        "COMPANY_GROUP_DELETE_ERROR"
      );
    }

    return createSuccessResponse({ message: "Company group deleted successfully" });
  } catch (error) {
    logError("[Company Groups API DELETE Error]", error);
    return createErrorResponse(
      new Error("Failed to delete company group"),
      500,
      "COMPANY_GROUP_DELETE_ERROR"
    );
  }
}
