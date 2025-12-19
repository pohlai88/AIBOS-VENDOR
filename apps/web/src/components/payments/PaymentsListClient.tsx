"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Table, Card, Button } from "@aibos/ui";
import type { TableColumn } from "@aibos/ui";
import type { Payment } from "@aibos/shared";
import { formatCurrency, formatDate } from "@aibos/shared";
import type { PaymentsResponse } from "@/types/api";

export const PaymentsListClient = memo(function PaymentsListClient({
  initialPayments,
}: {
  initialPayments: Payment[];
}) {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchPayments = async () => {
      const params = new URLSearchParams();
      if (status) params.append("status", status);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const response = await fetch(`/api/payments?${params.toString()}`);
      if (response.ok) {
        const data: PaymentsResponse = await response.json();
        setPayments(data.payments || []);
      }
    };

    const timeoutId = setTimeout(fetchPayments, 300);
    return () => clearTimeout(timeoutId);
  }, [status, startDate, endDate]);

  const handleExport = useCallback(async () => {
    // Track analytics
    const { trackPaymentAction } = await import("@/lib/analytics");
    trackPaymentAction("export");

    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    window.open(`/api/payments/export?${params.toString()}`, "_blank");
  }, [status, startDate, endDate]);

  const getStatusColor = useCallback((status: string) => {
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
  }, []);

  const columns: TableColumn<Payment>[] = useMemo(() => [
    {
      key: "amount",
      header: "Amount",
      render: (payment) => (
        <a
          href={`/payments/${payment.id}`}
          aria-label={`View payment details for ${formatCurrency(payment.amount, payment.currency)}`}
          className="text-primary-400 hover:text-primary-300 underline focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
        >
          {formatCurrency(payment.amount, payment.currency)}
        </a>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (payment) => (
        <span
          className={`px-2 py-1 rounded text-xs capitalize ${getStatusColor(
            payment.status
          )}`}
        >
          {payment.status}
        </span>
      ),
    },
    {
      key: "method",
      header: "Method",
      render: (payment) => payment.method,
    },
    {
      key: "dueDate",
      header: "Due Date",
      render: (payment) => formatDate(payment.dueDate),
    },
    {
      key: "paidAt",
      header: "Paid At",
      render: (payment) =>
        payment.paidAt ? formatDate(payment.paidAt) : "-",
    },
    {
      key: "transactionId",
      header: "Transaction ID",
      render: (payment) => payment.transactionId || "-",
    },
  ], [getStatusColor]);

  return (
    <Card>
      <div className="mb-4 space-y-4" role="search" aria-label="Payment filters">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="payment-status" className="block text-sm font-medium text-foreground mb-1">
              Status
            </label>
            <select
              id="payment-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Filter payments by status"
              className="w-full px-4 py-2 bg-background-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="payment-start-date" className="block text-sm font-medium text-foreground mb-1">
              Start Date
            </label>
            <input
              id="payment-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              aria-label="Filter payments from start date"
              className="w-full px-4 py-2 bg-background-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="payment-end-date" className="block text-sm font-medium text-foreground mb-1">
              End Date
            </label>
            <input
              id="payment-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              aria-label="Filter payments until end date"
              className="w-full px-4 py-2 bg-background-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            />
          </div>
          <Button onClick={handleExport} variant="outline" aria-label="Export payments to CSV">
            Export CSV
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        data={payments}
        emptyMessage="No payments found"
      />
    </Card>
  );
});

