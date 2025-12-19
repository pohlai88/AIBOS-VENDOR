"use client";

import { useRouter } from "next/navigation";
import { Card, Button } from "@aibos/ui";
import type { Payment } from "@aibos/shared";
import { formatCurrency, formatDate } from "@aibos/shared";
import { ArrowLeft } from "lucide-react";

export function PaymentDetailClient({ payment }: { payment: Payment }) {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success-700 text-success-200";
      case "pending":
        return "bg-warning-700 text-warning-200";
      case "failed":
        return "bg-error-700 text-error-200";
      default:
        return "bg-secondary-700 text-secondary-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-serif text-foreground font-normal">
            Payment Details
          </h1>
        </div>
      </div>

      {/* Payment Details */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-sm font-brand text-foreground-muted uppercase tracking-widest mb-2 font-normal">
              Payment Information
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-foreground-muted font-brand font-normal">Amount</dt>
                <dd className="text-2xl text-foreground font-normal">
                  {formatCurrency(payment.amount, payment.currency)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-foreground-muted font-brand font-normal">Status</dt>
                <dd>
                  <span
                    className={`px-2 py-1 rounded text-xs capitalize ${getStatusColor(
                      payment.status
                    )}`}
                  >
                    {payment.status}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-foreground-muted font-brand font-normal">Method</dt>
                <dd className="text-foreground font-normal">{payment.method}</dd>
              </div>
              <div>
                <dt className="text-sm text-foreground-muted font-brand font-normal">Transaction ID</dt>
                <dd className="text-foreground font-mono text-sm font-normal">
                  {payment.transactionId || "N/A"}
                </dd>
              </div>
            </dl>
          </div>
          <div>
            <h2 className="text-sm font-brand text-foreground-muted uppercase tracking-widest mb-2 font-normal">
              Dates
            </h2>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-foreground-muted font-brand font-normal">Due Date</dt>
                <dd className="text-foreground font-normal">{formatDate(payment.dueDate)}</dd>
              </div>
              <div>
                <dt className="text-sm text-foreground-muted font-brand font-normal">Paid At</dt>
                <dd className="text-foreground font-normal">
                  {payment.paidAt ? formatDate(payment.paidAt) : "Not paid"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </Card>
    </div>
  );
}
