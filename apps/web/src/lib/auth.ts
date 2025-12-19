import { createClient } from "./supabase/server";
import type { UserRole } from "@aibos/shared";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  organizationId: string;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createClient();

  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return null;
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("id, email, role, organization_id")
    .eq("id", authUser.id)
    .single();

  if (error || !user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    role: user.role as UserRole,
    organizationId: user.organization_id,
  };
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<AuthUser> {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden");
  }

  return user;
}

