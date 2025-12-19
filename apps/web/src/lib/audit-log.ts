import { createClient } from "@/lib/supabase/server";
import { logError } from "./logger";

export interface AuditLogEntry {
  userId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestMethod?: string;
  requestPath?: string;
  statusCode?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Log an audit event to the database
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.from("audit_logs").insert({
      user_id: entry.userId || null,
      action: entry.action,
      resource_type: entry.resourceType || null,
      resource_id: entry.resourceId || null,
      ip_address: entry.ipAddress || null,
      user_agent: entry.userAgent || null,
      request_method: entry.requestMethod || null,
      request_path: entry.requestPath || null,
      status_code: entry.statusCode || null,
      metadata: entry.metadata || null,
    });

    if (error) {
      logError("Failed to log audit event", error, {
        action: entry.action,
        resourceType: entry.resourceType,
      });
    }
  } catch (error) {
    // Don't throw - audit logging should not break the application
    logError("Audit logging error", error, {
      action: entry.action,
    });
  }
}

/**
 * Log user authentication events
 */
export async function logAuthEvent(
  action: "login" | "logout" | "login_failed" | "password_reset",
  userId: string | null,
  ipAddress?: string,
  userAgent?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    userId: userId || undefined,
    action,
    resourceType: "auth",
    ipAddress,
    userAgent,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Log data access events
 */
export async function logDataAccess(
  action: "view" | "download" | "export",
  resourceType: "document" | "payment" | "statement" | "message" | "user_data",
  resourceId: string,
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAuditEvent({
    userId,
    action: `${resourceType}.${action}`,
    resourceType,
    resourceId,
    ipAddress,
    userAgent,
  });
}

/**
 * Log data modification events
 */
export async function logDataModification(
  action: "create" | "update" | "delete",
  resourceType: "document" | "payment" | "statement" | "message" | "user" | "webhook",
  resourceId: string,
  userId: string,
  ipAddress?: string,
  userAgent?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    userId,
    action: `${resourceType}.${action}`,
    resourceType,
    resourceId,
    ipAddress,
    userAgent,
    metadata,
  });
}

/**
 * Log security events
 */
export async function logSecurityEvent(
  action: "permission_denied" | "unauthorized_access" | "suspicious_activity" | "rate_limit_exceeded",
  userId: string | null,
  ipAddress?: string,
  userAgent?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    userId: userId || undefined,
    action: `security.${action}`,
    resourceType: "security",
    ipAddress,
    userAgent,
    metadata: {
      ...metadata,
      severity: "high",
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Log API request/response
 */
export async function logApiRequest(
  method: string,
  path: string,
  statusCode: number,
  userId: string | null,
  ipAddress?: string,
  userAgent?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logAuditEvent({
    userId: userId || undefined,
    action: "api.request",
    requestMethod: method,
    requestPath: path,
    statusCode,
    ipAddress,
    userAgent,
    metadata: {
      ...metadata,
      responseTime: metadata?.responseTime || null,
    },
  });
}
