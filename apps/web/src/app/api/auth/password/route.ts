import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { validateRequest, passwordChangeSchema } from "@/lib/validation";
import { requireAuth } from "@/lib/auth";
import { logError } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { currentPassword, newPassword } = await validateRequest(
      passwordChangeSchema,
      body
    );

    const supabase = await createClient();

    // Verify current password by attempting to sign in
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user?.email) {
      return createErrorResponse(
        new Error("User not found"),
        404,
        "USER_NOT_FOUND"
      );
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: authUser.user.email,
      password: currentPassword,
    });

    if (signInError) {
      return createErrorResponse(
        new Error("Current password is incorrect"),
        401,
        "INVALID_PASSWORD"
      );
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      logError("[Password Change Error]", updateError, {
        userId: user.id,
        path: "/api/auth/password",
      });
      return createErrorResponse(
        new Error(updateError.message || "Failed to update password"),
        400,
        "UPDATE_ERROR"
      );
    }

    return createSuccessResponse({
      message: "Password changed successfully",
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}
