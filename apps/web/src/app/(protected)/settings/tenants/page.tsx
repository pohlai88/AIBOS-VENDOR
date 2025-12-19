import { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TenantManagementClient } from "@/components/settings/TenantManagementClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tenant Management | AI-BOS Vendor Portal",
  description: "Manage your tenant settings and subscription",
};

export default async function TenantsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Only admins can access tenant management
  if (user.role !== "company_admin") {
    redirect("/settings");
  }

  return <TenantManagementClient />;
}
