import { PaymentsListClient } from "./PaymentsListClient";
import { getAppUrl } from "@/lib/env";

export async function PaymentsList() {
  const response = await fetch(`${getAppUrl()}/api/payments`, {
    next: {
      revalidate: 300, // Revalidate every 5 minutes
      tags: ["payments"],
    },
  });

  if (!response.ok) {
    return (
      <div className="bg-error-900/50 border border-error-700 text-error-200 px-4 py-3 rounded-lg">
        Failed to load payments
      </div>
    );
  }

  const { payments } = await response.json();

  return <PaymentsListClient initialPayments={payments || []} />;
}

