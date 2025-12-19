import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth, requireRole } from "@/lib/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { logError } from "@/lib/logger";

// Route segment config following Next.js 16 best practices
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/tenants
 * Get current user's tenant information
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const { data: tenant, error } = await supabase
      .from("tenants")
      .select("*")
      .eq("id", user.tenantId)
      .eq("status", "active")
      .single();

    if (error || !tenant) {
      return createErrorResponse(
        new Error("Tenant not found"),
        404,
        "TENANT_NOT_FOUND"
      );
    }

    return createSuccessResponse({ tenant });
  } catch (error) {
    logError("[Tenants API GET Error]", error);
    return createErrorResponse(
      new Error("Failed to fetch tenant"),
      500,
      "TENANT_FETCH_ERROR"
    );
  }
}

/**
 * POST /api/tenants
 * Create a new tenant (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireRole(["company_admin"]);
    const supabase = await createClient();
    const body = await request.json();

    const { name, slug, subscription_tier, max_users, max_companies, settings } = body;

    if (!name || !slug) {
      return createErrorResponse(
        new Error("Name and slug are required"),
        400,
        "VALIDATION_ERROR"
      );
    }

    // Check if slug already exists
    const { data: existing } = await supabase
      .from("tenants")
      .select("id")
      .eq("slug", slug)
      .single();

    if (existing) {
      return createErrorResponse(
        new Error("Tenant slug already exists"),
        409,
        "TENANT_SLUG_EXISTS"
      );
    }

    const { data: tenant, error } = await supabase
      .from("tenants")
      .insert({
        name,
        slug,
        status: "active",
        subscription_tier: subscription_tier || "free",
        max_users: max_users || 10,
        max_companies: max_companies || 5,
        settings: settings || {},
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      logError("[Tenants API POST Error]", error);
      return createErrorResponse(
        new Error(error.message),
        400,
        "TENANT_CREATE_ERROR"
      );
    }

    return createSuccessResponse({ tenant }, 201);
  } catch (error) {
    logError("[Tenants API POST Error]", error);
    return createErrorResponse(
      new Error("Failed to create tenant"),
      500,
      "TENANT_CREATE_ERROR"
    );
  }
}

/**
 * PATCH /api/tenants
 * Update current user's tenant (admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireRole(["company_admin"]);
    const supabase = await createClient();
    const body = await request.json();

    const updates: any = {};

    if (body.name) updates.name = body.name;
    if (body.subscription_tier) updates.subscription_tier = body.subscription_tier;
    if (body.max_users !== undefined) updates.max_users = body.max_users;
    if (body.max_companies !== undefined) updates.max_companies = body.max_companies;
    if (body.settings) updates.settings = body.settings;
    if (body.status) updates.status = body.status;

    if (Object.keys(updates).length === 0) {
      return createErrorResponse(
        new Error("No fields to update"),
        400,
        "VALIDATION_ERROR"
      );
    }

    const { data: tenant, error } = await supabase
      .from("tenants")
      .update(updates)
      .eq("id", user.tenantId)
      .select()
      .single();

    if (error) {
      logError("[Tenants API PATCH Error]", error);
      return createErrorResponse(
        new Error(error.message),
        400,
        "TENANT_UPDATE_ERROR"
      );
    }

    return createSuccessResponse({ tenant });
  } catch (error) {
    logError("[Tenants API PATCH Error]", error);
    return createErrorResponse(
      new Error("Failed to update tenant"),
      500,
      "TENANT_UPDATE_ERROR"
    );
  }
}
