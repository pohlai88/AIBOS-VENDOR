"use client";

import { Component, ReactNode, ErrorInfo } from "react";
import Link from "next/link";
import { AlertCircle, ArrowUpRight } from "lucide-react";
import { PublicPageLayout } from "@/components/layout/PublicPageLayout";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to analytics
    import("@/lib/analytics")
      .then(({ trackError }) => trackError(error, { context: "ErrorBoundary", errorInfo }))
      .catch(() => {
        console.error("Error caught by boundary:", error, errorInfo);
      });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <PublicPageLayout>
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <AlertCircle className="w-16 h-16 text-error-400 mx-auto mb-4" aria-hidden="true" />
              <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4 font-normal">
                Something went wrong
              </h1>
              <p className="text-foreground-muted font-light leading-relaxed mb-2 font-brand font-normal">
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
            </div>

            <div className="bg-background-elevated border border-border p-8 space-y-4">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-foreground text-background border border-foreground hover:bg-foreground/90 transition-all duration-base text-xs font-normal uppercase tracking-[0.2em] group font-brand"
                aria-label="Reload the page"
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

    return this.props.children;
  }
}
