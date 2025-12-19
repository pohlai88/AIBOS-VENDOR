"use client";

import { useEffect } from "react";
import { Button, Card } from "@aibos/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Track error with analytics
    import("@/lib/analytics")
      .then(({ trackError }) => trackError(error, { context: "RootError" }))
      .catch(() => {
        // Fallback to console if analytics fails
        console.error(error);
      });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-error-400">
          Something went wrong
        </h1>
        <p className="text-foreground mb-4">
          {error.message || "An unexpected error occurred"}
        </p>
        <div className="flex gap-2">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            Go home
          </Button>
        </div>
      </Card>
    </div>
  );
}

