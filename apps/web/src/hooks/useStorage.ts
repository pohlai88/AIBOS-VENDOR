/**
 * useStorage Hook
 * 
 * Client-side storage operations hook for React components.
 * Provides file upload, signed URL generation, and progress tracking.
 * 
 * This hook uses the server-side API routes for security while
 * providing a convenient client-side interface.
 * 
 * Includes enterprise-grade error handling for hard database constraints
 * and RLS policy violations.
 */

"use client";

import { useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import type { ImageTransformOptions } from "@/lib/storage";

/**
 * Parse upload errors and return user-friendly messages
 * Handles Postgres constraint violations (23514) and RLS policy errors (42501)
 * 
 * This function translates database-level errors into user-friendly messages,
 * handling hard constraints enforced at the database level (file size, MIME type)
 * and RLS policy violations.
 * 
 * @returns Object with message and optional requestId
 */
function handleUploadError(error: any): { message: string; requestId?: string } {
  // Extract error message from various possible locations
  const errorMessage =
    error?.error?.message ||
    error?.message ||
    error?.error ||
    String(error) ||
    "An unexpected upload error occurred";

  // Extract error code from various possible locations
  const errorCode =
    error?.error?.code ||
    error?.code ||
    error?.errorCode ||
    error?.statusCode;

  // Extract requestId from various possible locations (API response format)
  const requestId =
    error?.error?.requestId ||
    error?.requestId ||
    error?.error?.requestId;

  const originalError = error?.originalError || error;

  // 1. Check for Hard Constraint Violations (Postgres Error 23514)
  // These occur when database-level constraints are violated (file size, MIME type)
  // The database enforces these limits even if frontend validation is bypassed
  if (
    errorCode === "23514" ||
    errorCode === 23514 ||
    errorCode === "CONSTRAINT_VIOLATION" ||
    errorMessage?.includes("violates check constraint") ||
    errorMessage?.includes("file_size_limit") ||
    errorMessage?.includes("allowed_mime_types") ||
    errorMessage?.includes("check constraint") ||
    originalError?.code === "23514" ||
    originalError?.code === 23514
  ) {
    // File size constraint violation
    if (
      errorMessage?.includes("file_size_limit") ||
      errorMessage?.includes("size") ||
      errorMessage?.includes("too large") ||
      errorMessage?.includes("exceeds")
    ) {
      return {
        message: "Upload failed: File size exceeds the strict database limit. Please choose a smaller file.",
        requestId,
      };
    }

    // MIME type constraint violation
    if (
      errorMessage?.includes("allowed_mime_types") ||
      errorMessage?.includes("mime") ||
      errorMessage?.includes("content type") ||
      errorMessage?.includes("file type") ||
      errorMessage?.includes("not allowed") ||
      errorCode === "UNSUPPORTED_MEDIA_TYPE"
    ) {
      return {
        message: "Upload failed: This file type is strictly prohibited by the server. Please check the allowed file types for this bucket.",
        requestId,
      };
    }

    // Generic constraint violation
    return {
      message: "Upload failed: File violates database constraints. Please check file size and type requirements.",
      requestId,
    };
  }

  // 2. Check for RLS Policy Violations (Postgres Error 42501)
  // CONSERVATIVE detection: Only classify as permission error if we're CERTAIN
  // Rule: If code is 42501 OR message clearly indicates RLS/permission → permission denied
  // Otherwise → treat as generic error (don't mislabel internal failures)
  if (
    errorCode === "42501" ||
    errorCode === 42501 ||
    errorCode === "PERMISSION_DENIED" ||
    (errorMessage?.toLowerCase().includes("row-level security policy") && errorCode !== undefined) ||
    (errorMessage?.toLowerCase().includes("permission denied") && errorCode !== undefined) ||
    (errorMessage?.toLowerCase().includes("insufficient privilege") && errorCode !== undefined) ||
    originalError?.code === "42501" ||
    originalError?.code === 42501
  ) {
    return {
      message: "Access denied: You do not have permission to upload to this location. Please contact your administrator.",
      requestId,
    };
  }

  // 3. Check for conflict errors (unique constraint violations)
  if (
    errorCode === "23505" ||
    errorCode === 23505 ||
    errorCode === "CONFLICT" ||
    errorMessage?.includes("unique constraint")
  ) {
    return {
      message: "Upload failed: A file with this path already exists.",
      requestId,
    };
  }

  // 4. Check for payload too large (413)
  if (
    errorCode === "413" ||
    errorCode === 413 ||
    errorCode === "PAYLOAD_TOO_LARGE" ||
    errorMessage?.includes("payload too large")
  ) {
    return {
      message: "Upload failed: File size exceeds the maximum allowed size.",
      requestId,
    };
  }

  // 5. Check for network errors
  if (errorMessage?.includes("Network") || errorMessage?.includes("network error") || errorCode === "NETWORK_ERROR") {
    return {
      message: "Network error: Please check your connection and try again.",
      requestId,
    };
  }

  // 6. Check for authentication errors
  if (
    errorMessage?.includes("Not authenticated") ||
    errorMessage?.includes("unauthorized") ||
    errorCode === "401" ||
    errorCode === 401 ||
    errorCode === "AUTHENTICATION_REQUIRED"
  ) {
    return {
      message: "Authentication required: Please sign in to upload files.",
      requestId,
    };
  }

  // 7. Check for file validation errors (from API route)
  if (errorCode === "FILE_VALIDATION_ERROR" || errorMessage?.includes("validation")) {
    return {
      message: errorMessage || "Upload failed: File validation error. Please check file size and type.",
      requestId,
    };
  }

  // 8. Fallback - return original message or generic error
  return {
    message: errorMessage || "An unexpected upload error occurred. Please try again.",
    requestId,
  };
}

interface UploadOptions {
  category?: string;
  metadata?: Record<string, any>;
  onProgress?: (progress: number) => void;
}

interface UploadResult {
  fileUrl: string;
  fileName: string;
  path: string;
  bucket: string;
  size: number;
  mimeType: string;
  metadata: Record<string, any>;
}

interface UseStorageReturn {
  uploadFile: (
    bucket: string,
    file: File,
    options?: UploadOptions
  ) => Promise<UploadResult>;
  getSignedUrl: (
    bucket: string,
    path: string,
    expiresIn?: number,
    transform?: ImageTransformOptions
  ) => Promise<string>;
  getPublicUrl: (
    bucket: string,
    path: string,
    transform?: ImageTransformOptions
  ) => string;
  uploading: boolean;
  progress: number;
  error: Error | null;
}

/**
 * React hook for client-side storage operations
 * 
 * @returns {UseStorageReturn} Storage operations and state
 * 
 * @example
 * ```tsx
 * function UploadComponent() {
 *   const { uploadFile, uploading, progress } = useStorage();
 *   
 *   const handleUpload = async (file: File) => {
 *     try {
 *       const result = await uploadFile("documents", file, {
 *         category: "invoice",
 *         onProgress: (p) => console.log(`${p}% uploaded`),
 *       });
 *       console.log("Uploaded:", result.fileUrl);
 *     } catch (error) {
 *       console.error("Upload failed:", error);
 *     }
 *   };
 *   
 *   return (
 *     <div>
 *       {uploading && <div>Uploading... {progress}%</div>}
 *       <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useStorage(): UseStorageReturn {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const uploadFile = useCallback(
    async (
      bucket: string,
      file: File,
      options?: UploadOptions
    ): Promise<UploadResult> => {
      if (!user) {
        throw new Error("Not authenticated");
      }

      setUploading(true);
      setProgress(0);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bucket", bucket);

        if (options?.category) {
          formData.append("category", options.category);
        }

        if (options?.metadata) {
          formData.append("metadata", JSON.stringify(options.metadata));
        }

        // Use XMLHttpRequest for progress tracking
        return new Promise<UploadResult>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const percentComplete = (e.loaded / e.total) * 100;
              setProgress(percentComplete);
              options?.onProgress?.(percentComplete);
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                // Handle new envelope format: { ok: true, data: {...}, requestId: "..." }
                if (data.ok === true && data.data) {
                  setProgress(100);
                  resolve(data.data);
                }
                // Handle legacy format: { success: true, data: {...} }
                else if (data.success && data.data) {
                  setProgress(100);
                  resolve(data.data);
                } else {
                  const { message, requestId } = handleUploadError(data);
                  const error = new Error(message);
                  (error as any).code = data.error?.code || data.code;
                  (error as any).requestId = requestId;
                  reject(error);
                }
              } catch (err) {
                // Non-JSON response (HTML, plain text, etc.)
                const { message, requestId } = handleUploadError({
                  message: xhr.responseText || "Failed to parse server response",
                });
                const error = new Error(message);
                (error as any).requestId = requestId;
                reject(error);
              }
            } else {
              try {
                const errorData = JSON.parse(xhr.responseText);
                const { message, requestId } = handleUploadError(errorData);
                const error = new Error(message);
                (error as any).code = errorData.error?.code || errorData.code;
                (error as any).statusCode = xhr.status;
                (error as any).requestId = requestId;
                reject(error);
              } catch {
                // Non-JSON error response
                const { message, requestId } = handleUploadError({
                  message: `Upload failed with status ${xhr.status}`,
                  code: xhr.status.toString(),
                });
                const error = new Error(message);
                (error as any).statusCode = xhr.status;
                (error as any).requestId = requestId;
                reject(error);
              }
            }
          });

          xhr.addEventListener("error", () => {
            const { message, requestId } = handleUploadError({
              message: "Network error during upload",
              code: "NETWORK_ERROR",
            });
            const error = new Error(message);
            (error as any).requestId = requestId;
            reject(error);
          });

          xhr.addEventListener("abort", () => {
            const { message } = handleUploadError({
              name: "AbortError",
              message: "Upload aborted",
            });
            reject(new Error(message));
          });

          xhr.open("POST", "/api/storage/upload");
          xhr.send(formData);
        });
      } catch (err) {
        // Parse error for user-friendly message
        const { message, requestId } = handleUploadError(err);
        const error = err instanceof Error ? err : new Error(message);

        // Update error message if it's not already user-friendly
        if (!err || (err instanceof Error && !err.message.includes("Upload failed:") && !err.message.includes("Access denied:"))) {
          error.message = message;
        }

        // Preserve requestId for debugging
        if (requestId) {
          (error as any).requestId = requestId;
        }

        setError(error);
        throw error;
      } finally {
        setUploading(false);
        // Reset progress after a delay to show 100% completion
        setTimeout(() => setProgress(0), 1000);
      }
    },
    [user]
  );

  const getSignedUrl = useCallback(
    async (
      bucket: string,
      path: string,
      expiresIn: number = 3600,
      transform?: ImageTransformOptions
    ): Promise<string> => {
      if (!user) {
        throw new Error("Not authenticated");
      }

      setError(null);

      try {
        const response = await fetch("/api/storage/signed-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bucket,
            path,
            expiresIn,
            transform, // Pass transform options if needed
          }),
          credentials: "include",
        });

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            // Non-JSON response
            errorData = { message: `Failed to get signed URL (${response.status})` };
          }
          const { message, requestId } = handleUploadError(errorData);
          const error = new Error(message);
          if (requestId) {
            (error as any).requestId = requestId;
          }
          throw error;
        }

        const data = await response.json();
        return data.data?.signedUrl || data.signedUrl;
      } catch (err) {
        const { message, requestId } = handleUploadError(err);
        const error = err instanceof Error ? err : new Error(message);
        if (requestId) {
          (error as any).requestId = requestId;
        }
        setError(error);
        throw error;
      }
    },
    [user]
  );

  const getPublicUrl = useCallback(
    (bucket: string, path: string, transform?: ImageTransformOptions): string => {
      // Import client-side helper
      const { getPublicUrl: getPublicUrlHelper } = require("@/lib/storage");
      return getPublicUrlHelper(bucket, path, transform);
    },
    []
  );

  return {
    uploadFile,
    getSignedUrl,
    getPublicUrl,
    uploading,
    progress,
    error,
  };
}
