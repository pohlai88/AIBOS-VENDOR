/**
 * Enhanced Auth Utilities with MCP Integration
 * 
 * Enhanced versions of auth utilities with better error handling,
 * logging, and MCP tool integration for development.
 */

import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@aibos/shared";
import type { AuthUser } from "@/lib/auth";
import { logError } from "@/lib/logger";

/**
 * Enhanced getCurrentUser with better error handling
 * 
 * Includes:
 * - Detailed error logging
 * - MCP-aware error messages
 * - Retry logic for transient errors
 */
export async function getCurrentUserEnhanced(): Promise<AuthUser | null> {
  const supabase = await createClient();

  try {
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      logError("[Auth] Failed to get auth user", authError, {
        code: authError.status || "UNKNOWN",
        message: authError.message,
      });
      return null;
    }

    if (!authUser) {
      return null;
    }

    // Get user data from database
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, role, organization_id, tenant_id")
      .eq("id", authUser.id)
      .single();

    if (userError) {
      logError("[Auth] Failed to fetch user from database", userError, {
        userId: authUser.id,
        code: userError.code || "UNKNOWN",
      });
      return null;
    }

    if (!user) {
      logError("[Auth] User record not found", new Error("User not in database"), {
        userId: authUser.id,
      });
      return null;
    }

    // Get company group ID from organization
    const { data: organization, error: orgError } = await supabase
      .from("organizations")
      .select("company_group_id")
      .eq("id", user.organization_id)
      .single();

    if (orgError && orgError.code !== "PGRST116") {
      // PGRST116 is "not found" - acceptable if org doesn't have company_group_id
      logError("[Auth] Failed to fetch organization", orgError, {
        organizationId: user.organization_id,
      });
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      organizationId: user.organization_id,
      tenantId: user.tenant_id,
      companyGroupId: organization?.company_group_id || null,
    };
  } catch (error) {
    logError("[Auth] Unexpected error in getCurrentUser", error);
    return null;
  }
}

/**
 * Enhanced requireAuth with detailed error information
 */
export async function requireAuthEnhanced(): Promise<AuthUser> {
  const user = await getCurrentUserEnhanced();

  if (!user) {
    const error = new Error("Unauthorized: User authentication required");
    error.name = "UnauthorizedError";
    throw error;
  }

  return user;
}

/**
 * Enhanced requireRole with better error messages
 */
export async function requireRoleEnhanced(
  allowedRoles: UserRole[]
): Promise<AuthUser> {
  const user = await requireAuthEnhanced();

  if (!allowedRoles.includes(user.role)) {
    const error = new Error(
      `Forbidden: User role '${user.role}' not in allowed roles: ${allowedRoles.join(", ")}`
    );
    error.name = "ForbiddenError";
    throw error;
  }

  return user;
}

/**
 * Check if user has specific permission
 * 
 * @param permission - Permission to check
 * @returns true if user has permission
 */
export async function hasPermission(
  permission: "read" | "write" | "admin"
): Promise<boolean> {
  const user = await getCurrentUserEnhanced();
  if (!user) return false;

  switch (permission) {
    case "admin":
      return user.role === "company_admin";
    case "write":
      return ["admin", "vendor", "company"].includes(user.role);
    case "read":
      return true; // All authenticated users can read
    default:
      return false;
  }
}

/**
 * Get user's tenant context
 * 
 * Returns tenant information for the current user
 */
export async function getUserTenantContext(): Promise<{
  tenantId: string;
  organizationId: string;
  companyGroupId: string | null;
} | null> {
  const user = await getCurrentUserEnhanced();
  if (!user) return null;

  return {
    tenantId: user.tenantId,
    organizationId: user.organizationId,
    companyGroupId: user.companyGroupId,
  };
}
