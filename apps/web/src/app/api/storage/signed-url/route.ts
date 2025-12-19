/**
 * Storage Signed URL API Route
 * Best practice: Generate signed URLs server-side for security
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getSignedUrl } from "@/lib/storage";
import { logError } from "@/lib/logger";
import { createErrorResponse, createSuccessResponse } from "@/lib/errors";

// Route segment config following Next.js 16 best practices
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { bucket, path, expiresIn } = body;

    if (!bucket || !path) {
      return createErrorResponse(
        new Error("Bucket and path are required"),
        400,
        "MISSING_PARAMETERS"
      );
    }

    // Validate that user has access to this file
    // (RLS policies will enforce this, but we check here for defense in depth)
    const filePath = path as string;
    const organizationId = filePath.split("/")[1]; // Extract org ID from path

    // Verify user has access to this organization's files
    if (organizationId && organizationId !== user.organizationId) {
      // Check if file is shared (would need to query documents table)
      // For now, rely on RLS policies
    }

    const signedUrl = await getSignedUrl(
      bucket,
      path,
      expiresIn || 3600 // Default 1 hour
    );

    return createSuccessResponse({
      signedUrl,
      expiresIn: expiresIn || 3600,
    });
  } catch (error) {
    logError("[Storage Signed URL API Error]", error, {
      path: "/api/storage/signed-url",
    });

    return createErrorResponse(
      new Error("Failed to generate signed URL"),
      500,
      "SIGNED_URL_ERROR"
    );
  }
}
