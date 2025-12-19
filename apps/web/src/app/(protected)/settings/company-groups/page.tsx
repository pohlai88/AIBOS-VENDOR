import { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CompanyGroupsManagementClient } from "@/components/settings/CompanyGroupsManagementClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Company Groups",
  description: "Manage company groups within your tenant",
};

export default async function CompanyGroupsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Only admins can access company group management
  if (user.role !== "company_admin") {
    redirect("/settings");
  }

  return <CompanyGroupsManagementClient />;
}
