/**
 * Supabase Storage Helper Functions
 * Best practices for file operations in Next.js with Supabase Storage
 */

import { createClient } from "@/lib/supabase/server";
import { createBrowserClient } from "@supabase/ssr";

/**
 * File upload configuration
 */
export interface UploadConfig {
  bucket: string;
  path: string;
  file: File | Blob;
  options?: {
    cacheControl?: string;
    contentType?: string;
    upsert?: boolean;
  };
}

/**
 * Upload file to Supabase Storage (Server-side)
 * Best practice: Use server-side uploads for security
 */
export async function uploadFile(config: UploadConfig) {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(config.bucket)
    .upload(config.path, config.file, {
      cacheControl: config.options?.cacheControl || "3600",
      contentType: config.options?.contentType,
      upsert: config.options?.upsert || false,
    });

  if (error) {
    // Preserve Supabase error details for better error handling
    const uploadError: any = new Error(`Upload failed: ${error.message}`);
    uploadError.code = (error as any).statusCode || (error as any).error || undefined;
    uploadError.message = error.message;
    uploadError.originalError = error;
    throw uploadError;
  }

  return data;
}

/**
 * Image transformation options
 * Best practice: Use image transformations to optimize delivery
 * Note: Supabase automatically converts to WebP when supported by client
 */
export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number; // 20-100, default 80
  resize?: "cover" | "contain" | "fill"; // default "cover"
  format?: "origin"; // "origin" to opt-out of auto WebP conversion, undefined for auto
}

/**
 * Get signed URL for private file (Server-side)
 * Best practice: Use signed URLs for private files instead of public URLs
 * 
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @param transform - Optional image transformation options (for images only)
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600,
  transform?: ImageTransformOptions
) {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn, {
      transform: transform ? {
        width: transform.width,
        height: transform.height,
        quality: transform.quality,
        resize: transform.resize,
        ...(transform.format && { format: transform.format }),
      } : undefined,
    });

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Get public URL for public file
 * Best practice: Only use for public assets bucket
 * 
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 * @param transform - Optional image transformation options (for images only)
 */
export function getPublicUrl(
  bucket: string,
  path: string,
  transform?: ImageTransformOptions
): string {
  // Use client-side for public URLs (no auth needed)
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path, {
      transform: transform ? {
        width: transform.width,
        height: transform.height,
        quality: transform.quality,
        resize: transform.resize,
        ...(transform.format && { format: transform.format }),
      } : undefined,
    });

  return data.publicUrl;
}

/**
 * Get public URL (server-side version)
 * 
 * @param bucket - Storage bucket name
 * @param path - File path in bucket
 * @param transform - Optional image transformation options (for images only)
 */
export async function getPublicUrlServer(
  bucket: string,
  path: string,
  transform?: ImageTransformOptions
): Promise<string> {
  const supabase = await createClient();

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path, {
      transform: transform ? {
        width: transform.width,
        height: transform.height,
        quality: transform.quality,
        resize: transform.resize,
        ...(transform.format && { format: transform.format }),
      } : undefined,
    });

  return data.publicUrl;
}

/**
 * Delete file from storage (Server-side)
 */
export async function deleteFile(bucket: string, path: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }

  return data;
}

/**
 * List files in a folder (Server-side)
 */
export async function listFiles(
  bucket: string,
  folder: string,
  options?: {
    limit?: number;
    offset?: number;
    sortBy?: { column: string; order: "asc" | "desc" };
  }
) {
  const supabase = await createClient();

  let query = supabase.storage
    .from(bucket)
    .list(folder, {
      limit: options?.limit || 100,
      offset: options?.offset || 0,
      sortBy: options?.sortBy || { column: "name", order: "asc" },
    });

  const { data, error } = await query;

  if (error) {
    throw new Error(`List files failed: ${error.message}`);
  }

  return data;
}

/**
 * Get file metadata (Server-side)
 */
export async function getFileMetadata(bucket: string, path: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path.split("/").slice(0, -1).join("/"), {
      search: path.split("/").pop() || "",
    });

  if (error) {
    throw new Error(`Get metadata failed: ${error.message}`);
  }

  return data[0];
}

/**
 * Generate secure file path for multi-tenant storage
 * Best practice: Organize files by tenant/organization for security
 */
export function generateFilePath(
  organizationId: string,
  fileName: string,
  options?: {
    tenantId?: string;
    category?: string;
    timestamp?: boolean;
  }
): string {
  const timestamp = options?.timestamp ? Date.now() : "";
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");

  if (options?.tenantId && options?.category) {
    return `${options.tenantId}/${organizationId}/${options.category}/${timestamp ? `${timestamp}_` : ""}${sanitizedFileName}`;
  } else if (options?.tenantId) {
    return `${options.tenantId}/${organizationId}/${timestamp ? `${timestamp}_` : ""}${sanitizedFileName}`;
  } else if (options?.category) {
    return `${organizationId}/${options.category}/${timestamp ? `${timestamp}_` : ""}${sanitizedFileName}`;
  } else {
    return `${organizationId}/${timestamp ? `${timestamp}_` : ""}${sanitizedFileName}`;
  }
}

/**
 * Validate file before upload
 * Best practice: Validate file size and type before upload
 */
export function validateFile(
  file: File,
  options?: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  }
): { valid: boolean; error?: string } {
  const maxSize = options?.maxSize || 52428800; // 50MB default
  const allowedTypes = options?.allowedTypes || [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/png",
    "text/plain",
  ];

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`,
    };
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  return { valid: true };
}

/**
 * Extract file extension from filename
 */
export function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}

/**
 * Check if file is an image
 * Best practice: Use for determining if image transformations are applicable
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

/**
 * Get optimal cache control header based on file type
 * Best practice: Set appropriate cache headers for different file types
 */
export function getCacheControl(fileType: string, isPublic: boolean = false): string {
  if (isImageFile(fileType)) {
    // Images: Cache for 1 year (public) or 1 hour (private)
    return isPublic ? "public, max-age=31536000, immutable" : "private, max-age=3600";
  }

  if (fileType === "application/pdf" || fileType.startsWith("text/")) {
    // Documents: Cache for 1 hour
    return "private, max-age=3600";
  }

  // Default: 1 hour
  return "private, max-age=3600";
}

/**
 * Resumable upload configuration
 * Best practice: Use resumable uploads for files > 6MB
 * Note: This requires TUS client library (tus-js-client or @uppy/tus)
 */
export interface ResumableUploadConfig {
  bucket: string;
  path: string;
  file: File | Blob;
  options?: {
    contentType?: string;
    cacheControl?: string;
    metadata?: Record<string, any>;
    upsert?: boolean;
  };
}

/**
 * Get TUS endpoint URL for resumable uploads
 * Best practice: Use direct storage hostname for better performance
 */
export function getTusEndpoint(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  // Extract project ID from URL (format: https://project-id.supabase.co)
  const projectId = supabaseUrl.replace("https://", "").replace(".supabase.co", "");
  // Use direct storage hostname for optimal performance
  return `https://${projectId}.storage.supabase.co/storage/v1/upload/resumable`;
}
