import { getCurrentUser } from "@/lib/auth";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return createErrorResponse(new Error("Unauthorized"), 401, "UNAUTHORIZED");
    }

    return createSuccessResponse({ user });
  } catch (error) {
    return createErrorResponse(error);
  }
}

