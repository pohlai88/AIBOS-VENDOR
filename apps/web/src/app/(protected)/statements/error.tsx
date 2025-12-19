"use client";

import { useEffect } from "react";
import { Button, Card } from "@aibos/ui";

export default function StatementsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    import("@/lib/analytics")
      .then(({ trackError }) => trackError(error, { context: "StatementsError" }))
      .catch(() => {
        console.error("Statements error:", error);
      });
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4 text-error-400">
          Failed to load statements
        </h2>
        <p className="text-foreground-muted mb-4">
          {error.message || "An error occurred while loading statements"}
        </p>
        <div className="flex gap-2">
          <Button onClick={reset}>Try again</Button>
          <Button
            variant="outline"
            onClick={() => {
              reset();
              window.location.href = "/statements";
            }}
          >
            Reload Statements
          </Button>
        </div>
      </Card>
    </div>
  );
}
