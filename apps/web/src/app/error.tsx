"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight, AlertCircle } from "lucide-react";
import { PublicPageLayout } from "@/components/layout/PublicPageLayout";

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
    <PublicPageLayout>
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <AlertCircle className="w-16 h-16 text-error-400 mx-auto mb-4" aria-hidden="true" />
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4 font-normal">
            Something went wrong
          </h1>
          <p className="text-foreground-muted font-normal leading-relaxed mb-2 font-brand">
            {error.message || "An unexpected error occurred"}
          </p>
          {error.digest && (
            <p className="text-xs text-foreground-subtle font-mono font-normal" role="status" aria-live="polite">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="bg-background-elevated border border-border p-8 space-y-4">
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-foreground text-background border border-foreground hover:bg-foreground/90 transition-all duration-base text-xs font-normal uppercase tracking-[0.2em] group font-brand"
            aria-label="Try again to reload the page"
          >
            Try again
            <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
          </button>
          <Link
            href="/"
            className="block w-full text-center border border-border px-6 py-3 text-foreground hover:bg-background-hover hover:border-border-hover transition-all duration-base text-xs font-normal uppercase tracking-[0.2em] font-brand"
            aria-label="Go to home page"
          >
            Go home
          </Link>
        </div>
      </div>
    </PublicPageLayout>
  );
}

