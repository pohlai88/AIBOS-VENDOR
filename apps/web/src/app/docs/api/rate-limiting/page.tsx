import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Gauge, AlertCircle } from "lucide-react";
import { NexusIcon } from "@/components/icons/NexusIcon";
import { BrandName } from "@/components/brand/BrandName";


export const metadata: Metadata = {
  title: "Rate Limiting",
  description: "API rate limiting guide for NexusCanon Vendor Governance Platform",
};

// Route segment config for static generation with ISR
export const dynamic = "force-static";
export const revalidate = 3600;

export default function RateLimitingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="w-10 h-10 flex items-center justify-center">
              <NexusIcon size="lg" animated />
            </div>
            <div className="hidden md:block border-l border-border pl-4 group-hover:border-success-500/30 transition-colors duration-base">
              <BrandName variant="compact" />
            </div>
          </Link>
          <Link
            href="/docs"
            className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors text-sm font-brand"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Docs</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 md:px-12 py-16">
        <div className="mb-8">
          <Link
            href="/docs/api"
            className="text-[10px] font-brand text-foreground-muted uppercase tracking-[0.2em] hover:text-foreground transition-colors"
          >
            API Reference
          </Link>
          <h1 className="text-5xl md:text-6xl font-serif text-foreground mb-4 mt-4">
            Rate Limiting
          </h1>
          <p className="text-lg text-foreground-muted font-normal leading-relaxed">
            Understand API rate limits and how to handle rate limit responses.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-foreground-muted font-normal leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Overview</h2>
            <p className="mb-4">
              NexusCanon API implements rate limiting to ensure fair usage and system stability.
              Rate limits are applied per API key and reset on a rolling window basis.
            </p>
          </section>

          <section>
            <div className="border border-border bg-background-elevated p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Gauge className="w-5 h-5 text-foreground-muted" />
                <h3 className="text-lg font-serif text-foreground">Rate Limits</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-brand text-foreground mb-1">Free Tier</p>
                  <p className="text-sm text-foreground-muted">100 requests per minute</p>
                </div>
                <div>
                  <p className="text-sm font-brand text-foreground mb-1">Professional</p>
                  <p className="text-sm text-foreground-muted">1,000 requests per minute</p>
                </div>
                <div>
                  <p className="text-sm font-brand text-foreground mb-1">Enterprise</p>
                  <p className="text-sm text-foreground-muted">10,000 requests per minute</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Rate Limit Headers</h2>
            <p className="mb-4">
              Every API response includes rate limit information in the headers:
            </p>
            <div className="border border-border bg-background-elevated p-6 rounded-lg">
              <pre className="text-sm font-mono text-foreground overflow-x-auto">
                {`X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200`}
              </pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Handling Rate Limits</h2>
            <div className="border border-border bg-background-elevated p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-foreground-muted" />
                <h3 className="text-lg font-serif text-foreground">429 Too Many Requests</h3>
              </div>
              <p className="text-sm mb-4">
                When you exceed the rate limit, the API returns a 429 status code:
              </p>
              <pre className="text-sm font-mono text-foreground overflow-x-auto">
                {`HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1640995200
Retry-After: 60

{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}`}
              </pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Best Practices</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Monitor rate limit headers in your responses</li>
              <li>Implement exponential backoff when receiving 429 responses</li>
              <li>Use the Retry-After header to determine when to retry</li>
              <li>Cache responses when possible to reduce API calls</li>
              <li>Consider upgrading your plan for higher rate limits</li>
            </ul>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 md:px-12 bg-background-elevated mt-16">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center">
                <NexusIcon size="lg" animated />
              </div>
              <div className="border-l border-border pl-4">
                <BrandName variant="compact" />
              </div>
            </div>
            <p className="text-xs text-foreground-subtle max-w-md text-center leading-relaxed">
              Institutional-grade vendor governance for the world's most regulated organizations.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}


