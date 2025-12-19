import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DocumentDetailClient } from "@/components/documents/DocumentDetailClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Document Details",
  description: "View document details and information",
};

async function getDocument(id: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  const { data: document, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", user.tenantId)
    .single();

  if (error || !document) {
    redirect("/documents?error=not-found");
  }

  // Check access
  const hasAccess =
    document.organization_id === user.organizationId ||
    (document.is_shared &&
      document.organization_id !== user.organizationId &&
      user.role === "vendor") ||
    (document.vendor_id === user.organizationId && user.role !== "vendor");

  if (!hasAccess) {
    redirect("/documents?error=access-denied");
  }

  return document;
}

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const document = await getDocument(id);

  return <DocumentDetailClient document={document} />;
}
