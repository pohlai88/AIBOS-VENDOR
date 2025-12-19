"use client";

import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Table, Card, Button } from "@aibos/ui";
import type { TableColumn } from "@aibos/ui";
import type { Statement } from "@aibos/shared";
import { formatCurrency, formatDate } from "@aibos/shared";
import { Modal } from "@aibos/ui";
import type { StatementsResponse } from "@/types/api";

export const StatementsListClient = memo(function StatementsListClient({
  initialStatements,
}: {
  initialStatements: Statement[];
}) {
  const [statements, setStatements] = useState<Statement[]>(initialStatements);
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [selectedStatement, setSelectedStatement] = useState<Statement | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    const fetchStatements = async () => {
      const params = new URLSearchParams();
      if (periodStart) params.append("periodStart", periodStart);
      if (periodEnd) params.append("periodEnd", periodEnd);

      const response = await fetch(`/api/statements?${params.toString()}`);
      if (response.ok) {
        const data: StatementsResponse = await response.json();
        setStatements(data.statements || []);
      }
    };

    const timeoutId = setTimeout(fetchStatements, 300);
    return () => clearTimeout(timeoutId);
  }, [periodStart, periodEnd]);

  const handleExport = useCallback((statementId: string) => {
    window.open(`/api/statements/${statementId}/export?format=csv`, "_blank");

    // Track analytics (non-blocking)
    import("@/lib/analytics")
      .then(({ trackStatementAction }) => trackStatementAction("export", statementId))
      .catch(() => { }); // Don't block on analytics errors
  }, []);

  const handleViewDetails = useCallback((statement: Statement) => {
    setSelectedStatement(statement);
    setIsDetailOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsDetailOpen(false);
  }, []);

  const columns: TableColumn<Statement>[] = useMemo(() => [
    {
      key: "periodStart",
      header: "Period Start",
      render: (stmt) => formatDate(stmt.periodStart),
    },
    {
      key: "periodEnd",
      header: "Period End",
      render: (stmt) => formatDate(stmt.periodEnd),
    },
    {
      key: "balance",
      header: "Balance",
      render: (stmt) => formatCurrency(stmt.balance, stmt.currency),
    },
    {
      key: "transactions",
      header: "Transactions",
      render: (stmt) => (stmt.transactions?.length || 0),
    },
    {
      key: "actions",
      header: "Actions",
      render: (stmt) => (
        <div className="flex space-x-2" role="group" aria-label={`Actions for statement ${stmt.id}`}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewDetails(stmt)}
            aria-label={`View details for statement from ${formatDate(stmt.periodStart)} to ${formatDate(stmt.periodEnd)}`}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleExport(stmt.id)}
            aria-label={`Export statement from ${formatDate(stmt.periodStart)} to ${formatDate(stmt.periodEnd)}`}
          >
            Export
          </Button>
        </div>
      ),
    },
  ], [handleExport, handleViewDetails]);

  return (
    <>
      <Card>
        <div className="mb-4 space-y-4" role="search" aria-label="Statement filters">
          <div className="flex gap-4">
            <label htmlFor="statement-period-start" className="sr-only">
              Period start date
            </label>
            <input
              id="statement-period-start"
              type="date"
              placeholder="Period Start"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              aria-label="Filter statements from period start date"
              className="px-4 py-2 bg-background-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            />
            <label htmlFor="statement-period-end" className="sr-only">
              Period end date
            </label>
            <input
              id="statement-period-end"
              type="date"
              placeholder="Period End"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              aria-label="Filter statements until period end date"
              className="px-4 py-2 bg-background-elevated border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            />
          </div>
        </div>

        <Table
          columns={columns}
          data={statements}
          emptyMessage="No statements found"
        />
      </Card>

      <Modal
        isOpen={isDetailOpen}
        onClose={handleCloseModal}
        title={`Statement: ${selectedStatement ? formatDate(selectedStatement.periodStart) : ""} - ${selectedStatement ? formatDate(selectedStatement.periodEnd) : ""}`}
        size="xl"
        aria-labelledby="statement-detail-title"
        aria-describedby="statement-detail-content"
      >
        {selectedStatement && (
          <div id="statement-detail-content" className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm" role="group" aria-label="Statement summary">
              <div>
                <span className="text-foreground-muted">Balance:</span>
                <span className="ml-2 text-lg font-semibold text-foreground">
                  {formatCurrency(selectedStatement.balance, selectedStatement.currency)}
                </span>
              </div>
              <div>
                <span className="text-foreground-muted">Transactions:</span>
                <span className="ml-2 text-foreground">{selectedStatement.transactions?.length || 0}</span>
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="font-semibold mb-2">Transactions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" role="table" aria-label="Statement transactions">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-2 text-left" scope="col">Date</th>
                      <th className="px-4 py-2 text-left" scope="col">Type</th>
                      <th className="px-4 py-2 text-left" scope="col">Description</th>
                      <th className="px-4 py-2 text-right" scope="col">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedStatement.transactions || []).map((t) => (
                      <tr key={t.id} className="border-b border-border">
                        <td className="px-4 py-2">{formatDate(t.date)}</td>
                        <td className="px-4 py-2 capitalize">{t.type}</td>
                        <td className="px-4 py-2">{t.description}</td>
                        <td className="px-4 py-2 text-right">
                          {formatCurrency(t.amount, selectedStatement.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={handleCloseModal}
                aria-label="Close statement details"
              >
                Close
              </Button>
              <Button
                onClick={() => handleExport(selectedStatement.id)}
                aria-label="Export statement to CSV"
              >
                Export CSV
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
});

