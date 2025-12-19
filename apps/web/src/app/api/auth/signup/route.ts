import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { validateRequest, signupSchema } from "@/lib/validation";

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

    // Create organization
    const { data: orgData, error: orgError } = await supabase
      .from("organizations")
      .insert({
        name: organizationName,
        type: role === "vendor" ? "vendor" : "company",
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

    // Create user record
    const { error: userError } = await supabase.from("users").insert({
      id: authData.user.id,
      email,
      role: role || "vendor",
      organization_id: orgData.id,
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

