import { StatementsListClient } from "./StatementsListClient";
import { getAppUrl } from "@/lib/env";

export async function StatementsList() {
  const response = await fetch(`${getAppUrl()}/api/statements`, {
    next: {
      revalidate: 300, // Revalidate every 5 minutes
      tags: ["statements"],
    },
  });

  if (!response.ok) {
    return (
      <div className="bg-error-900/50 border border-error-700 text-error-200 px-4 py-3 rounded-lg">
        Failed to load statements
      </div>
    );
  }

  const { statements } = await response.json();

  return <StatementsListClient initialStatements={statements || []} />;
}

