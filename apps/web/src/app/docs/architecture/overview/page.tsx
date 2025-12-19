import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Database, Layers, Server } from "lucide-react";
import { NexusIcon } from "@/components/icons/NexusIcon";
import { BrandName } from "@/components/brand/BrandName";


export const metadata: Metadata = {
  title: "Architecture Overview",
  description: "System architecture overview for NexusCanon Vendor Governance Platform",
};

// Route segment config for static generation with ISR
export const dynamic = "force-static";
export const revalidate = 3600;

export default function ArchitectureOverviewPage() {
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
            Architecture Overview
          </h1>
          <p className="text-lg text-foreground-muted font-normal leading-relaxed">
            High-level overview of the NexusCanon platform architecture.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-foreground-muted font-normal leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">System Architecture</h2>
            <p className="mb-6">
              NexusCanon is built on a modern, scalable architecture designed for institutional-grade
              vendor governance with zero-trust security principles.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-border bg-background-elevated p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Server className="w-5 h-5 text-foreground-muted" />
                  <h3 className="text-lg font-serif text-foreground">Frontend</h3>
                </div>
                <p className="text-sm text-foreground-muted">
                  Next.js 16 with React 19, TypeScript, and Tailwind CSS
                </p>
              </div>
              <div className="border border-border bg-background-elevated p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Database className="w-5 h-5 text-foreground-muted" />
                  <h3 className="text-lg font-serif text-foreground">Backend</h3>
                </div>
                <p className="text-sm text-foreground-muted">
                  Next.js API routes with Supabase PostgreSQL database
                </p>
              </div>
              <div className="border border-border bg-background-elevated p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Layers className="w-5 h-5 text-foreground-muted" />
                  <h3 className="text-lg font-serif text-foreground">Security</h3>
                </div>
                <p className="text-sm text-foreground-muted">
                  Zero-trust architecture with Row Level Security (RLS)
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Key Components</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-foreground font-normal">Multi-tenant Architecture:</strong> Isolated data per tenant with shared infrastructure</li>
              <li><strong className="text-foreground font-normal">Row Level Security:</strong> Database-level access control for all data</li>
              <li><strong className="text-foreground font-normal">Real-time Updates:</strong> Supabase Realtime for live data synchronization</li>
              <li><strong className="text-foreground font-normal">API Layer:</strong> RESTful API with JWT authentication</li>
              <li><strong className="text-foreground font-normal">File Storage:</strong> Supabase Storage for documents and assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Technology Stack</h2>
            <div className="border border-border bg-background-elevated p-6 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-brand text-foreground mb-2">Frontend</p>
                  <ul className="space-y-1 text-foreground-muted">
                    <li>• Next.js 16</li>
                    <li>• React 19</li>
                    <li>• TypeScript 5.7</li>
                    <li>• Tailwind CSS</li>
                  </ul>
                </div>
                <div>
                  <p className="font-brand text-foreground mb-2">Backend</p>
                  <ul className="space-y-1 text-foreground-muted">
                    <li>• Next.js API Routes</li>
                    <li>• Supabase</li>
                    <li>• PostgreSQL</li>
                    <li>• Node.js</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Next Steps</h2>
            <div className="flex gap-3">
              <Link
                href="/docs/architecture/data-flow"
                className="border border-border bg-background-elevated px-6 py-3 hover:bg-background-hover transition-colors text-sm font-brand uppercase tracking-wider"
              >
                Data Flow
              </Link>
              <Link
                href="/docs/architecture/security"
                className="border border-border bg-background-elevated px-6 py-3 hover:bg-background-hover transition-colors text-sm font-brand uppercase tracking-wider"
              >
                Security Architecture
              </Link>
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


