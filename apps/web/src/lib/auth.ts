import { createClient } from "./supabase/server";
import type { UserRole } from "@aibos/shared";
import { logError } from "@/lib/logger";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string;
  tenantId: string;
  companyGroupId: string | null;
}

/**
 * Get current authenticated user
 * 
 * Returns the authenticated user with enriched data from the database.
 * Returns null if user is not authenticated or user record not found.
 * 
 * @returns AuthUser or null
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createClient();

  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    // Log auth errors in development for debugging
    if (process.env.NODE_ENV === "development") {
      logError("[Auth] Failed to get auth user", authError, {
        code: authError.status || "UNKNOWN",
      });
    }
    return null;
  }

  if (!authUser) {
    return null;
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("id, email, role, organization_id, tenant_id")
    .eq("id", authUser.id)
    .single();

  if (error) {
    // Log database errors in development
    if (process.env.NODE_ENV === "development") {
      logError("[Auth] Failed to fetch user from database", error, {
        userId: authUser.id,
        code: error.code || "UNKNOWN",
      });
    }
    return null;
  }

  if (!user) {
    return null;
  }

  // Get company group ID from organization
  const { data: organization, error: orgError } = await supabase
    .from("organizations")
    .select("company_group_id")
    .eq("id", user.organization_id)
    .single();

  // Organization error is non-critical (company_group_id may be null)
  if (orgError && orgError.code !== "PGRST116" && process.env.NODE_ENV === "development") {
    // PGRST116 is "not found" - acceptable if org doesn't exist
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
}

/**
 * Require authentication
 * 
 * Throws an error if user is not authenticated.
 * Use this in API routes and server components that require authentication.
 * 
 * @throws Error with message "Unauthorized" if user is not authenticated
 * @returns AuthUser (never returns null)
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    const error = new Error("Unauthorized");
    error.name = "UnauthorizedError";
    throw error;
  }

  return user;
}

/**
 * Require specific user role(s)
 * 
 * Throws an error if user is not authenticated or doesn't have required role.
 * 
 * @param allowedRoles - Array of allowed user roles
 * @throws Error with message "Unauthorized" if not authenticated
 * @throws Error with message "Forbidden" if role not allowed
 * @returns AuthUser (never returns null)
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<AuthUser> {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    const error = new Error(
      `Forbidden: User role '${user.role}' not in allowed roles: ${allowedRoles.join(", ")}`
    );
    error.name = "ForbiddenError";
    throw error;
  }

  return user;
}

