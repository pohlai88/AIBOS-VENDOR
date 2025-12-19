"use client";

import { useEffect } from "react";
import { Button, Card } from "@aibos/ui";

export default function DocumentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    import("@/lib/analytics")
      .then(({ trackError }) => trackError(error, { context: "DocumentsError" }))
      .catch(() => {
        console.error("Documents error:", error);
      });
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4 text-error-400">
          Failed to load documents
        </h2>
        <p className="text-foreground-muted mb-4">
          {error.message || "An error occurred while loading documents"}
        </p>
        <div className="flex gap-2">
          <Button onClick={reset}>Try again</Button>
          <Button
            variant="outline"
            onClick={() => {
              reset();
              window.location.href = "/documents";
            }}
          >
            Reload Documents
          </Button>
        </div>
      </Card>
    </div>
  );
}
