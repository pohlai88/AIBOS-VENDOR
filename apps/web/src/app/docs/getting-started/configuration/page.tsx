import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Settings, Database, Key } from "lucide-react";
import { NexusIcon } from "@/components/icons/NexusIcon";
import { BrandName } from "@/components/brand/BrandName";


export const metadata: Metadata = {
  title: "Configuration",
  description: "Configuration guide for NexusCanon Vendor Governance Platform",
};

// Route segment config for static generation with ISR
export const dynamic = "force-static";
export const revalidate = 3600;

export default function ConfigurationPage() {
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
            href="/docs/getting-started"
            className="text-[10px] font-brand text-foreground-muted uppercase tracking-[0.2em] hover:text-foreground transition-colors"
          >
            Getting Started
          </Link>
          <h1 className="text-5xl md:text-6xl font-serif text-foreground mb-4 mt-4">
            Configuration
          </h1>
          <p className="text-lg text-foreground-muted font-normal leading-relaxed">
            Configure your NexusCanon platform for optimal performance and security.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-foreground-muted font-normal leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Environment Variables</h2>
            <p className="mb-4">
              Configure essential environment variables for your deployment:
            </p>
            <div className="border border-border bg-background-elevated p-6 rounded-lg space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-foreground-muted" />
                  <span className="text-sm font-brand text-foreground font-normal">Database</span>
                </div>
                <code className="text-xs bg-background px-1.5 py-0.5 rounded border border-border">NEXT_PUBLIC_SUPABASE_URL</code>
                <p className="text-sm text-foreground-muted mt-1">Your Supabase project URL</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-4 h-4 text-foreground-muted" />
                  <span className="text-sm font-brand text-foreground font-normal">Authentication</span>
                </div>
                <code className="text-xs bg-background px-1.5 py-0.5 rounded border border-border">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
                <p className="text-sm text-foreground-muted mt-1">Public anonymous key for client-side operations</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Platform Settings</h2>
            <p className="mb-4">
              Configure platform-wide settings through the admin dashboard:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Multi-tenant configuration</li>
              <li>Company group management</li>
              <li>Default compliance frameworks</li>
              <li>Notification preferences</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Security Configuration</h2>
            <div className="border border-border bg-background-elevated p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Settings className="w-5 h-5 text-foreground-muted" />
                <h3 className="text-lg font-serif text-foreground">Zero-Trust Settings</h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li>• Enable Row Level Security (RLS) policies</li>
                <li>• Configure OAuth providers</li>
                <li>• Set up SAML SSO (Enterprise)</li>
                <li>• Configure API rate limiting</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Next Steps</h2>
            <Link
              href="/docs/getting-started/first-steps"
              className="inline-flex items-center gap-2 border border-border bg-background-elevated px-6 py-3 hover:bg-background-hover transition-colors text-sm font-brand uppercase tracking-wider"
            >
              Continue to First Steps
            </Link>
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


