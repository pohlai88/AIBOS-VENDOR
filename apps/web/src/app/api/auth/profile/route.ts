import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { validateRequest, profileUpdateSchema } from "@/lib/validation";
import { requireAuth } from "@/lib/auth";
import { logError } from "@/lib/logger";

// Route segment config following Next.js 16 best practices
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { email } = await validateRequest(profileUpdateSchema, body);

    const supabase = await createClient();

    // Update email in auth.users
    const { error: updateError } = await supabase.auth.updateUser({
      email,
    });

    if (updateError) {
      return createErrorResponse(
        new Error(updateError.message),
        400,
        "UPDATE_ERROR"
      );
    }

    // Update email in users table
    const { error: userUpdateError } = await supabase
      .from("users")
      .update({ email })
      .eq("id", user.id);

    if (userUpdateError) {
      logError("[Profile Update Error]", userUpdateError, {
        userId: user.id,
        path: "/api/auth/profile",
      });
      // Don't fail if users table update fails, auth.users is the source of truth
    }

    return createSuccessResponse({
      message: "Profile updated successfully",
      user: {
        id: user.id,
        email,
        role: user.role,
        organizationId: user.organizationId,
      },
    });
  } catch (error) {
    logError("[Auth Profile API Error]", error, {
      path: "/api/auth/profile",
    });
    return createErrorResponse(
      error instanceof Error ? error : new Error("Profile update failed"),
      500,
      "PROFILE_UPDATE_ERROR"
    );
  }
}
