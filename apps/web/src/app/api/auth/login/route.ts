import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { validateRequest, loginSchema } from "@/lib/validation";
import { logError } from "@/lib/logger";

// Route segment config following Next.js 16 best practices
// Public auth route - can be cached briefly
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = await validateRequest(loginSchema, body);

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return createErrorResponse(new Error(error.message), 401, "AUTH_ERROR");
    }

    return createSuccessResponse({
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    logError("[Auth Login API Error]", error, {
      path: "/api/auth/login",
    });
    return createErrorResponse(
      error instanceof Error ? error : new Error("Login failed"),
      500,
      "LOGIN_ERROR"
    );
  }
}

