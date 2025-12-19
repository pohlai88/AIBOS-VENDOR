import { Suspense } from "react";
import type { Metadata } from "next";
import { StatementsList } from "@/components/statements/StatementsList";
import { Card } from "@aibos/ui";


// Force dynamic rendering since this page requires authentication and API calls
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Financial Statements",
  description: "View and export your financial statements and transaction history",
  openGraph: {
    title: "Financial Statements",
    description: "View and export your financial statements and transaction history",
  },
};

function StatementsLoading() {
  return (
    <Card>
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-secondary-700 rounded w-3/4"></div>
        <div className="h-4 bg-secondary-700 rounded w-1/2"></div>
      </div>
    </Card>
  );
}

export default function StatementsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif text-foreground mb-8 font-normal">Financial Statements</h1>

      <Suspense fallback={<StatementsLoading />}>
        <StatementsList />
      </Suspense>
    </div>
  );
}

