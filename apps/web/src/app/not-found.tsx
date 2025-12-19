import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PublicPageLayout } from "@/components/layout/PublicPageLayout";

/**
 * Root Not Found page
 * Shown when a route doesn't exist
 */
export default function NotFound() {
  return (
    <PublicPageLayout>
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-serif text-foreground mb-4 font-normal">404</h1>
          <h2 className="text-2xl md:text-3xl font-serif text-foreground mb-4 font-normal">
            Page Not Found
          </h2>
          <p className="text-foreground-muted font-normal leading-relaxed font-brand">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="bg-background-elevated border border-border p-8 space-y-4">
          <Link
            href="/"
            className="block w-full flex items-center justify-center gap-3 px-6 py-3 bg-foreground text-background border border-foreground hover:bg-foreground/90 transition-all duration-base text-xs font-normal uppercase tracking-[0.2em] group font-brand"
            aria-label="Go to home page"
          >
            Go to Home
            <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
          </Link>
          <Link
            href="/dashboard"
            className="block w-full text-center border border-border px-6 py-3 text-foreground hover:bg-background-hover hover:border-border-hover transition-all duration-base text-xs font-normal uppercase tracking-[0.2em] font-brand"
            aria-label="Go to dashboard"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </PublicPageLayout>
  );
}
