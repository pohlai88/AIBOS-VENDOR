/**
 * Tenant-Aware Supabase Client
 * 
 * This module provides Supabase client helpers that automatically
 * enforce tenant isolation in queries.
 */

import { createClient as createServerClient } from "./server";
import type { SupabaseClient } from "@supabase/supabase-js";

// Type placeholder for Database - can be generated from Supabase CLI
type Database = any;

/**
 * Get a tenant-scoped Supabase client for server-side operations
 * Automatically filters queries to the user's tenant
 */
export async function createTenantClient(): Promise<
  SupabaseClient<Database> & { tenantId: string }
> {
  const supabase = await createServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    throw new Error("User not authenticated");
  }

  const { data: user } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", authUser.id)
    .single();

  if (!user?.tenant_id) {
    throw new Error("User has no tenant assigned");
  }

  // Return client with tenant context
  return Object.assign(supabase, { tenantId: user.tenant_id });
}

/**
 * Get tenant ID from current user
 */
export async function getTenantId(): Promise<string> {
  const supabase = await createServerClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    throw new Error("User not authenticated");
  }

  const { data: user } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", authUser.id)
    .single();

  if (!user?.tenant_id) {
    throw new Error("User has no tenant assigned");
  }

  return user.tenant_id;
}

/**
 * Create a tenant-scoped query builder helper
 * Automatically adds tenant_id filter to queries
 */
export async function withTenantFilter(
  query: any,
  tableName: string
) {
  const tenantId = await getTenantId();
  return query.eq(`${tableName}.tenant_id`, tenantId);
}

/**
 * Validate that a resource belongs to the current tenant
 */
export async function validateTenantAccess(
  tableName: string,
  resourceId: string
): Promise<boolean> {
  const tenantId = await getTenantId();
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from(tableName as any)
    .select("tenant_id")
    .eq("id", resourceId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.tenant_id === tenantId;
}
