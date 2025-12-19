import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PaymentDetailClient } from "@/components/payments/PaymentDetailClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment Details",
  description: "View payment details and transaction information",
};

async function getPayment(id: string) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  let query = supabase
    .from("payments")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", user.tenantId);

  // Apply role-based filtering
  if (user.role === "vendor") {
    query = query.eq("vendor_id", user.organizationId);
  } else {
    query = query.or(
      `organization_id.eq.${user.organizationId},vendor_id.in.(select vendor_id from vendor_relationships where company_id.eq.${user.organizationId} and status.eq.active and tenant_id.eq.${user.tenantId})`
    );
  }

  const { data: payment, error } = await query.single();

  if (error || !payment) {
    redirect("/payments?error=not-found");
  }

  return payment;
}

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const payment = await getPayment(id);

  return <PaymentDetailClient payment={payment} />;
}
