"use client";

import { useEffect } from "react";
import { Button, Card } from "@aibos/ui";

export default function MessagesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    import("@/lib/analytics")
      .then(({ trackError }) => trackError(error, { context: "MessagesError" }))
      .catch(() => {
        console.error("Messages error:", error);
      });
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4 text-error-400">
          Failed to load messages
        </h2>
        <p className="text-foreground-muted mb-4">
          {error.message || "An error occurred while loading messages"}
        </p>
        <div className="flex gap-2">
          <Button onClick={reset}>Try again</Button>
          <Button
            variant="outline"
            onClick={() => {
              reset();
              window.location.href = "/messages";
            }}
          >
            Reload Messages
          </Button>
        </div>
      </Card>
    </div>
  );
}
