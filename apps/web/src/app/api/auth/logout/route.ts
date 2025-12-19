import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";

export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      return createErrorResponse(new Error(error.message), 400, "LOGOUT_ERROR");
    }

    return createSuccessResponse({ success: true });
  } catch (error) {
    return createErrorResponse(error);
  }
}

