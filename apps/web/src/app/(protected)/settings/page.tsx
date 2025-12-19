import { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsClient } from "@/components/settings/SettingsClient";
import { createClient } from "@/lib/supabase/server";

// Force dynamic rendering since this page requires authentication and database calls
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings | AI-BOS Vendor Portal",
  description: "Manage your account settings, profile, and preferences",
};

async function getUserProfile() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  // Get organization name
  const { data: organization } = await supabase
    .from("organizations")
    .select("name")
    .eq("id", user.organizationId)
    .single();

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    organizationName: organization?.name || "Unknown",
  };
}

export default async function SettingsPage() {
  const profile = await getUserProfile();

  return <SettingsClient initialProfile={profile} />;
}
