import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";
import { validateRequest, threadCreateSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const supabase = await createClient();

    const body = await request.json();
    const { vendorId, subject } = await validateRequest(threadCreateSchema, body);

    // Verify vendor relationship
    if (user.role === "vendor") {
      return createErrorResponse(
        new Error("Vendors cannot create threads"),
        403,
        "FORBIDDEN"
      );
    }

    const { data: relationship, error: relError } = await supabase
      .from("vendor_relationships")
      .select("*")
      .eq("company_id", user.organizationId)
      .eq("vendor_id", vendorId)
      .eq("status", "active")
      .single();

    if (relError || !relationship) {
      return createErrorResponse(
        new Error("Vendor relationship not found"),
        404,
        "RELATIONSHIP_NOT_FOUND"
      );
    }

    // Create thread
    const { data: thread, error: threadError } = await supabase
      .from("message_threads")
      .insert({
        organization_id: user.organizationId,
        vendor_id: vendorId,
        subject: subject || null,
      })
      .select()
      .single();

    if (threadError) {
      return createErrorResponse(
        new Error(threadError.message),
        400,
        "THREAD_CREATE_ERROR"
      );
    }

    return createSuccessResponse({ thread });
  } catch (error) {
    return createErrorResponse(error);
  }
}

