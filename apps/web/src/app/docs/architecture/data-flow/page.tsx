import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, ArrowDown, Database } from "lucide-react";
import { NexusIcon } from "@/components/icons/NexusIcon";
import { BrandName } from "@/components/brand/BrandName";


export const metadata: Metadata = {
  title: "Data Flow",
  description: "Data flow architecture for NexusCanon Vendor Governance Platform",
};

// Route segment config for static generation with ISR
export const dynamic = "force-static";
export const revalidate = 3600;

export default function DataFlowPage() {
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
            href="/docs/architecture"
            className="text-[10px] font-brand text-foreground-muted uppercase tracking-[0.2em] hover:text-foreground transition-colors"
          >
            Architecture
          </Link>
          <h1 className="text-5xl md:text-6xl font-serif text-foreground mb-4 mt-4">
            Data Flow
          </h1>
          <p className="text-lg text-foreground-muted font-normal leading-relaxed">
            Understanding how data flows through the NexusCanon platform.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-foreground-muted font-normal leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Request Flow</h2>
            <div className="border border-border bg-background-elevated p-6 rounded-lg space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 border border-border bg-background rounded-lg flex items-center justify-center">
                  <span className="text-sm font-serif text-foreground">1</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-serif text-foreground mb-1">Client Request</h3>
                  <p className="text-sm text-foreground-muted">User initiates action in the frontend</p>
                </div>
              </div>
              <ArrowDown className="w-6 h-6 text-foreground-muted mx-auto" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 border border-border bg-background rounded-lg flex items-center justify-center">
                  <span className="text-sm font-serif text-foreground">2</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-serif text-foreground mb-1">API Route</h3>
                  <p className="text-sm text-foreground-muted">Next.js API route processes the request</p>
                </div>
              </div>
              <ArrowDown className="w-6 h-6 text-foreground-muted mx-auto" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 border border-border bg-background rounded-lg flex items-center justify-center">
                  <Database className="w-5 h-5 text-foreground-muted" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-serif text-foreground mb-1">Database</h3>
                  <p className="text-sm text-foreground-muted">Supabase PostgreSQL with RLS policies</p>
                </div>
              </div>
              <ArrowDown className="w-6 h-6 text-foreground-muted mx-auto" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 border border-border bg-background rounded-lg flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-foreground-muted" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-serif text-foreground mb-1">Response</h3>
                  <p className="text-sm text-foreground-muted">Data returned to client with real-time updates</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Real-time Updates</h2>
            <p className="mb-4">
              NexusCanon uses Supabase Realtime to provide live updates across the platform:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Document uploads and status changes</li>
              <li>Message notifications</li>
              <li>Payment status updates</li>
              <li>Compliance status changes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Data Security</h2>
            <p className="mb-4">
              All data flows through Row Level Security (RLS) policies ensuring:
            </p>
            <div className="border border-border bg-background-elevated p-6 rounded-lg">
              <ul className="space-y-2 text-sm">
                <li>• Tenant isolation at the database level</li>
                <li>• Role-based access control (RBAC)</li>
                <li>• Automatic data filtering by user context</li>
                <li>• Audit trail for all data access</li>
              </ul>
            </div>
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


