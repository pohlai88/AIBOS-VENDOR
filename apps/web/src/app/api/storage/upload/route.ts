/**
 * Storage Upload API Route
 * Best practice: Centralized file upload endpoint with validation
 */

import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  uploadFile,
  generateFilePath,
  validateFile,
  getFileExtension,
} from "@/lib/storage";
import { logError } from "@/lib/logger";
import { createErrorResponse, createSuccessResponse } from "@/lib/api-utils";
import { getRequestId } from "@/lib/request-id";

// Route segment config following Next.js 16 best practices
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60; // 60 seconds for file uploads

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);

  try {
    const user = await requireAuth();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const bucket = (formData.get("bucket") as string) || "documents";
    const category = formData.get("category") as string | null;
    const metadata = formData.get("metadata") as string | null;

    if (!file) {
      return createErrorResponse(
        new Error("File is required"),
        400,
        "FILE_REQUIRED",
        requestId
      );
    }

    // Validate file
    const validation = validateFile(file, {
      maxSize: bucket === "documents" ? 52428800 : 10485760, // 50MB for documents, 10MB for others
      allowedTypes: undefined, // Use bucket's allowed types
    });

    if (!validation.valid) {
      return createErrorResponse(
        new Error(validation.error || "File validation failed"),
        400,
        "FILE_VALIDATION_ERROR",
        requestId
      );
    }

    // Generate secure file path
    const fileExt = getFileExtension(file.name);
    const fileName = generateFilePath(user.organizationId, `${Date.now()}.${fileExt}`, {
      tenantId: user.tenantId,
      category: category || undefined,
      timestamp: true,
    });

    // Check Content-Length header for pre-upload size validation (true 413 detection)
    // Only return 413 if we can detect payload size BEFORE parsing
    const contentLength = request.headers.get("content-length");
    if (contentLength) {
      const maxSize = bucket === "documents" ? 52428800 : bucket === "message-attachments" ? 10485760 : 5242880;
      const payloadSize = parseInt(contentLength, 10);

      if (!isNaN(payloadSize) && payloadSize > maxSize) {
        return createErrorResponse(
          new Error("File size exceeds the maximum allowed size"),
          413,
          "PAYLOAD_TOO_LARGE",
          requestId
        );
      }
    }

    // Note: file.size check happens after formData parsing, so it's not a true "pre-DB" check
    // We validate it in validateFile() which returns 400, not 413

    // Upload file
    try {
      // Import cache control helper
      const { getCacheControl } = await import("@/lib/storage");

      await uploadFile({
        bucket,
        path: fileName,
        file,
        options: {
          cacheControl: getCacheControl(file.type, bucket === "public-assets"),
          contentType: file.type,
          upsert: false,
        },
      });
    } catch (uploadError: any) {
      // Log full error details server-side only (includes originalError, constraint names, etc.)
      const originalError = uploadError?.originalError || uploadError?.error || uploadError;
      const errorMessage = originalError?.message || uploadError?.message || "Failed to upload file";

      // Server-side logging: Include full error details for debugging
      // Client only gets safe code/kind/message/requestId
      logError("[Storage Upload Error]", uploadError, {
        userId: user.id,
        tenantId: user.tenantId,
        organizationId: user.organizationId,
        bucket,
        fileName,
        requestId,
        route: "/api/storage/upload",
        // Server-side only: include raw error details (not sent to client)
        originalError: originalError,
        supabaseErrorCode: originalError?.code || uploadError?.code,
        sqlState: originalError?.code || uploadError?.code, // Postgres SQLSTATE
        errorMessage: errorMessage,
        // Include constraint names server-side for debugging
        constraintName: errorMessage?.match(/constraint "([^"]+)"/)?.[1],
        // Include full error stack for debugging
        stack: uploadError?.stack || originalError?.stack,
      });
      const rawErrorCode = originalError?.code || uploadError?.code || uploadError?.statusCode || "UPLOAD_ERROR";

      // Map internal constraint names to safe client codes (don't expose DB internals)
      let clientErrorCode = String(rawErrorCode);
      let httpStatus = 500;
      let friendlyMessage = errorMessage;

      // Map constraint violations (23514) - don't expose constraint names
      // Only use 415 if we explicitly validated MIME type ourselves
      if (
        rawErrorCode === "23514" ||
        rawErrorCode === 23514 ||
        errorMessage?.includes("violates check constraint") ||
        errorMessage?.includes("file_size_limit") ||
        errorMessage?.includes("allowed_mime_types")
      ) {
        httpStatus = 400;
        clientErrorCode = "CONSTRAINT_VIOLATION";

        if (errorMessage?.includes("file_size_limit") || errorMessage?.includes("size")) {
          friendlyMessage = "File size exceeds the strict database limit";
        } else if (errorMessage?.includes("allowed_mime_types") || errorMessage?.includes("mime") || errorMessage?.includes("type")) {
          // Only use 415 if we validated MIME type ourselves (not from DB constraint)
          // Since this is from DB constraint, use 400 with CONSTRAINT_VIOLATION
          friendlyMessage = "This file type is not allowed for this bucket";
        } else {
          friendlyMessage = "File violates database constraints";
        }
      }
      // Map unique violations (23505) - conflicts
      else if (rawErrorCode === "23505" || rawErrorCode === 23505 || errorMessage?.includes("unique constraint")) {
        httpStatus = 409;
        clientErrorCode = "CONFLICT";
        friendlyMessage = "A file with this path already exists";
      }
      // Map RLS/permission errors (42501) - CONSERVATIVE detection
      // Only classify as permission error if we're CERTAIN it's an RLS/policy issue
      // Rule: If code is 42501 OR message clearly indicates RLS/permission → 403
      // Otherwise → 500 (don't mislabel internal failures as permission denied)
      else if (
        rawErrorCode === "42501" ||
        rawErrorCode === 42501 ||
        (errorMessage?.includes("row-level security policy") && rawErrorCode !== undefined) ||
        (errorMessage?.toLowerCase().includes("permission denied") && rawErrorCode !== undefined) ||
        (errorMessage?.toLowerCase().includes("insufficient privilege") && rawErrorCode !== undefined)
      ) {
        httpStatus = 403;
        clientErrorCode = "PERMISSION_DENIED";
        friendlyMessage = "You do not have permission to upload to this location";
      }
      // Note: Generic "policy" or "RLS" mentions without error code → treat as 500
      // This prevents misclassifying internal errors as permission issues
      // Map authentication errors
      else if (rawErrorCode === "401" || rawErrorCode === 401 || errorMessage?.includes("not authenticated")) {
        httpStatus = 401;
        clientErrorCode = "AUTHENTICATION_REQUIRED";
        friendlyMessage = "Authentication required to upload files";
      }

      return createErrorResponse(
        new Error(friendlyMessage),
        httpStatus,
        clientErrorCode,
        requestId
      );
    }

    // Get signed URL for private files, public URL for public files
    let fileUrl: string;
    if (bucket === "public-assets") {
      const { getPublicUrl } = await import("@/lib/storage");
      fileUrl = getPublicUrl(bucket, fileName);
    } else {
      const { getSignedUrl } = await import("@/lib/storage");
      fileUrl = await getSignedUrl(bucket, fileName, 3600); // 1 hour expiry
    }

    // Parse metadata if provided
    let parsedMetadata: Record<string, any> = {};
    if (metadata) {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch {
        // Ignore invalid JSON
      }
    }

    return createSuccessResponse(
      {
        fileUrl,
        fileName,
        path: fileName,
        bucket,
        size: file.size,
        mimeType: file.type,
        metadata: parsedMetadata,
      },
      requestId
    );
  } catch (error) {
    const requestId = getRequestId(request);

    logError("[Storage Upload API Error]", error, {
      path: "/api/storage/upload",
      requestId,
    });

    return createErrorResponse(
      new Error("Failed to upload file"),
      500,
      "STORAGE_UPLOAD_ERROR",
      requestId
    );
  }
}
