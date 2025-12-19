"use client";

import React from "react";
import { Button, Card } from "@aibos/ui";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Track error with Sentry
    import("@/lib/monitoring")
      .then(({ captureException }) =>
        captureException(error, {
          context: "ErrorBoundary",
          errorInfo: errorInfo.componentStack,
        })
      )
      .catch(() => {
        // Fallback to analytics
        import("@/lib/analytics")
          .then(({ trackError }) =>
            trackError(error, {
              context: "ErrorBoundary",
              errorInfo: errorInfo.componentStack,
            })
          )
          .catch(() => {
            // Final fallback to console
            console.error("Error caught by boundary:", error, errorInfo);
          });
      });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <Card className="max-w-md w-full">
            <h1 className="text-2xl font-bold mb-4 text-error-400">
              Something went wrong
            </h1>
            <p className="text-foreground mb-4">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                // Use router refresh for better UX
                if (typeof window !== "undefined") {
                  window.location.reload();
                }
              }}
            >
              Reload Page
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

