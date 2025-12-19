/**
 * Multi-Tenant Helper Functions
 * 
 * This module provides utilities for working with tenants and company groups
 * in a multi-tenant, multi-company architecture.
 */

import { createClient } from "./supabase/server";

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: "active" | "suspended" | "deleted";
  subscription_tier: "free" | "basic" | "professional" | "enterprise";
  max_users: number;
  max_companies: number;
  settings: Record<string, any>;
};

export type CompanyGroup = {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  parent_group_id: string | null;
  settings: Record<string, any>;
};

/**
 * Get the current user's tenant
 */
export async function getCurrentTenant(): Promise<Tenant | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  const { data: user } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", authUser.id)
    .single();

  if (!user?.tenant_id) {
    return null;
  }

  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", user.tenant_id)
    .eq("status", "active")
    .single();

  if (error || !tenant) {
    return null;
  }

  return tenant as Tenant;
}

/**
 * Get tenant by slug (for public routes like signup)
 */
export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const supabase = await createClient();

  const { data: tenant, error } = await supabase
    .from("tenants")
    .select("*")
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error || !tenant) {
    return null;
  }

  return tenant as Tenant;
}

/**
 * Get the current user's company group (if their organization belongs to one)
 */
export async function getCurrentCompanyGroup(): Promise<CompanyGroup | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  const { data: user } = await supabase
    .from("users")
    .select("organization_id, tenant_id")
    .eq("id", authUser.id)
    .single();

  if (!user) {
    return null;
  }

  const { data: organization } = await supabase
    .from("organizations")
    .select("company_group_id")
    .eq("id", user.organization_id)
    .single();

  if (!organization?.company_group_id) {
    return null;
  }

  const { data: companyGroup, error } = await supabase
    .from("company_groups")
    .select("*")
    .eq("id", organization.company_group_id)
    .eq("tenant_id", user.tenant_id)
    .single();

  if (error || !companyGroup) {
    return null;
  }

  return companyGroup as CompanyGroup;
}

/**
 * Get all organizations in the user's company group
 */
export async function getCompanyGroupOrganizations(): Promise<
  Array<{ id: string; name: string; type: string }>
> {
  const companyGroup = await getCurrentCompanyGroup();
  if (!companyGroup) {
    return [];
  }

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return [];
  }

  const { data: user } = await supabase
    .from("users")
    .select("tenant_id")
    .eq("id", authUser.id)
    .single();

  if (!user) {
    return [];
  }

  const { data: organizations, error } = await supabase
    .from("organizations")
    .select("id, name, type")
    .eq("company_group_id", companyGroup.id)
    .eq("tenant_id", user.tenant_id);

  if (error || !organizations) {
    return [];
  }

  return organizations;
}

/**
 * Get all organizations in the current tenant
 */
export async function getTenantOrganizations(): Promise<
  Array<{ id: string; name: string; type: string; company_group_id: string | null }>
> {
  const tenant = await getCurrentTenant();
  if (!tenant) {
    return [];
  }

  const supabase = await createClient();
  const { data: organizations, error } = await supabase
    .from("organizations")
    .select("id, name, type, company_group_id")
    .eq("tenant_id", tenant.id);

  if (error || !organizations) {
    return [];
  }

  return organizations;
}

/**
 * Check if user has access to a specific organization (same tenant or company group)
 */
export async function canAccessOrganization(
  organizationId: string
): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return false;
  }

  const { data: user } = await supabase
    .from("users")
    .select("organization_id, tenant_id")
    .eq("id", authUser.id)
    .single();

  if (!user) {
    return false;
  }

  // Check if organization belongs to same tenant
  const { data: organization } = await supabase
    .from("organizations")
    .select("tenant_id, company_group_id")
    .eq("id", organizationId)
    .single();

  if (!organization || organization.tenant_id !== user.tenant_id) {
    return false;
  }

  // If user's organization is in a company group, check if target org is in same group
  if (organization.company_group_id) {
    const { data: userOrg } = await supabase
      .from("organizations")
      .select("company_group_id")
      .eq("id", user.organization_id)
      .single();

    if (userOrg?.company_group_id === organization.company_group_id) {
      return true;
    }
  }

  // Check vendor relationships
  const { data: relationship } = await supabase
    .from("vendor_relationships")
    .select("id")
    .eq("tenant_id", user.tenant_id)
    .or(
      `vendor_id.eq.${user.organization_id},company_id.eq.${user.organization_id}`
    )
    .eq("status", "active")
    .single();

  return !!relationship;
}

/**
 * Require tenant context - throws if no tenant
 */
export async function requireTenant(): Promise<Tenant> {
  const tenant = await getCurrentTenant();
  if (!tenant) {
    throw new Error("No active tenant found for user");
  }
  return tenant;
}

/**
 * Get tenant context for API routes (from headers or query params)
 */
export async function getTenantFromRequest(
  slug?: string | null
): Promise<Tenant | null> {
  if (slug) {
    return getTenantBySlug(slug);
  }

  // Try to get from current user
  return getCurrentTenant();
}
