import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { validateRequest, loginSchema } from "@/lib/validation";

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
    return createErrorResponse(error);
  }
}

