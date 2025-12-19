import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { validateRequest, signupSchema } from "@/lib/validation";

// Route segment config following Next.js 16 best practices
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, organizationName, role } = await validateRequest(
      signupSchema,
      body
    );

    const supabase = await createClient();

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      return createErrorResponse(
        new Error(authError?.message || "Failed to create user"),
        400,
        "SIGNUP_ERROR"
      );
    }

    // Handle tenant assignment
    let tenantId: string;
    const { tenantSlug, tenantName } = body;

    if (tenantSlug) {
      // User wants to join existing tenant
      const { data: existingTenant } = await supabase
        .from("tenants")
        .select("id")
        .eq("slug", tenantSlug)
        .eq("status", "active")
        .single();

      if (!existingTenant) {
        await supabase.auth.admin.deleteUser(authData.user.id);
        return createErrorResponse(
          new Error("Tenant not found"),
          404,
          "TENANT_NOT_FOUND"
        );
      }

      tenantId = existingTenant.id;
    } else if (tenantName) {
      // Create new tenant
      const tenantSlugValue = tenantName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const { data: newTenant, error: tenantError } = await supabase
        .from("tenants")
        .insert({
          name: tenantName,
          slug: tenantSlugValue,
          status: "active",
          subscription_tier: "free",
          max_users: 10,
          max_companies: 5,
          created_by: authData.user.id,
        })
        .select()
        .single();

      if (tenantError || !newTenant) {
        await supabase.auth.admin.deleteUser(authData.user.id);
        return createErrorResponse(
          new Error("Failed to create tenant"),
          500,
          "TENANT_CREATE_ERROR"
        );
      }

      tenantId = newTenant.id;
    } else {
      // Use default tenant or create one
      let { data: defaultTenant } = await supabase
        .from("tenants")
        .select("id")
        .eq("slug", "default")
        .eq("status", "active")
        .single();

      if (!defaultTenant) {
        const { data: newDefaultTenant, error: defaultError } = await supabase
          .from("tenants")
          .insert({
            name: "Default Tenant",
            slug: "default",
            status: "active",
            subscription_tier: "free",
            max_users: 100,
            max_companies: 50,
          })
          .select()
          .single();

        if (defaultError || !newDefaultTenant) {
          await supabase.auth.admin.deleteUser(authData.user.id);
          return createErrorResponse(
            new Error("Failed to initialize tenant"),
            500,
            "TENANT_INIT_ERROR"
          );
        }

        defaultTenant = newDefaultTenant;
      }

      tenantId = defaultTenant!.id;
    }

    // Create organization with tenant_id
    const { data: orgData, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: organizationName,
        type: role === "vendor" ? "vendor" : "company",
        tenant_id: tenantId, // Required for multi-tenant
      })
      .select()
      .single();

    if (orgError || !orgData) {
      // Rollback: delete the auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      return createErrorResponse(
        new Error("Failed to create organization"),
        500,
        "ORG_CREATE_ERROR"
      );
    }

    // Create user record with tenant_id
    const { error: userError } = await supabase.from("users").insert({
      id: authData.user.id,
      email,
      role: role || "vendor",
      organization_id: orgData.id,
      tenant_id: tenantId, // Required for multi-tenant
    });

    if (userError) {
      // Rollback
      await supabase.from("organizations").delete().eq("id", orgData.id);
      await supabase.auth.admin.deleteUser(authData.user.id);
      return createErrorResponse(
        new Error("Failed to create user record"),
        500,
        "USER_CREATE_ERROR"
      );
    }

    return createSuccessResponse({
      user: authData.user,
      session: authData.session,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

