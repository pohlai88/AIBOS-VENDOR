import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth, requireRole } from "@/lib/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { logError } from "@/lib/logger";

// Route segment config following Next.js 16 best practices
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/company-groups
 * Get all company groups in the current tenant
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const { data: companyGroups, error } = await supabase
      .from("company_groups")
      .select("id, name, description, parent_group_id, settings, created_at, updated_at")
      .eq("tenant_id", user.tenantId)
      .order("name", { ascending: true });

    if (error) {
      logError("[Company Groups API GET Error]", error);
      return createErrorResponse(
        new Error("Failed to fetch company groups"),
        400,
        "QUERY_ERROR"
      );
    }

    return createSuccessResponse({ companyGroups: companyGroups || [] });
  } catch (error) {
    logError("[Company Groups API GET Error]", error);
    return createErrorResponse(
      new Error("Failed to fetch company groups"),
      500,
      "COMPANY_GROUPS_FETCH_ERROR"
    );
  }
}

/**
 * POST /api/company-groups
 * Create a new company group (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["company_admin"]);
    const supabase = await createClient();
    const body = await request.json();

    const { name, description, parent_group_id, settings } = body;

    if (!name) {
      return createErrorResponse(
        new Error("Name is required"),
        400,
        "VALIDATION_ERROR"
      );
    }

    // Check if name already exists in tenant
    const { data: existing } = await supabase
      .from("company_groups")
      .select("id")
      .eq("tenant_id", user.tenantId)
      .eq("name", name)
      .single();

    if (existing) {
      return createErrorResponse(
        new Error("Company group name already exists in this tenant"),
        409,
        "COMPANY_GROUP_NAME_EXISTS"
      );
    }

    // Validate parent_group_id if provided
    if (parent_group_id) {
      const { data: parent } = await supabase
        .from("company_groups")
        .select("id")
        .eq("id", parent_group_id)
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

    const { data: companyGroup, error } = await supabase
      .from("company_groups")
      .insert({
        tenant_id: user.tenantId,
        name,
        description: description || null,
        parent_group_id: parent_group_id || null,
        settings: settings || {},
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      logError("[Company Groups API POST Error]", error);
      return createErrorResponse(
        new Error(error.message),
        400,
        "COMPANY_GROUP_CREATE_ERROR"
      );
    }

    return createSuccessResponse({ companyGroup }, 201);
  } catch (error) {
    logError("[Company Groups API POST Error]", error);
    return createErrorResponse(
      new Error("Failed to create company group"),
      500,
      "COMPANY_GROUP_CREATE_ERROR"
    );
  }
}
