import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Shield, Lock, Key } from "lucide-react";
import { NexusIcon } from "@/components/icons/NexusIcon";
import { BrandName } from "@/components/brand/BrandName";


export const metadata: Metadata = {
  title: "Security Architecture",
  description: "Security architecture for NexusCanon Vendor Governance Platform",
};

// Route segment config for static generation with ISR
export const dynamic = "force-static";
export const revalidate = 3600;

export default function SecurityArchitecturePage() {
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
            Security Architecture
          </h1>
          <p className="text-lg text-foreground-muted font-normal leading-relaxed">
            Zero-trust security architecture ensuring institutional-grade protection.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-foreground-muted font-normal leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Zero-Trust Principles</h2>
            <p className="mb-4">
              NexusCanon implements a zero-trust security model where no request is trusted by default:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-border bg-background-elevated p-6">
                <Lock className="w-6 h-6 text-foreground-muted mb-3" />
                <h3 className="text-lg font-serif text-foreground mb-2">Verify Everything</h3>
                <p className="text-sm text-foreground-muted">
                  Every request is authenticated and authorized
                </p>
              </div>
              <div className="border border-border bg-background-elevated p-6">
                <Shield className="w-6 h-6 text-foreground-muted mb-3" />
                <h3 className="text-lg font-serif text-foreground mb-2">Least Privilege</h3>
                <p className="text-sm text-foreground-muted">
                  Users only access what they need
                </p>
              </div>
              <div className="border border-border bg-background-elevated p-6">
                <Key className="w-6 h-6 text-foreground-muted mb-3" />
                <h3 className="text-lg font-serif text-foreground mb-2">Assume Breach</h3>
                <p className="text-sm text-foreground-muted">
                  Continuous monitoring and validation
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Row Level Security (RLS)</h2>
            <p className="mb-4">
              Database-level security policies ensure data isolation:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Tenant-based data isolation</li>
              <li>Role-based access control (RBAC)</li>
              <li>Automatic policy enforcement</li>
              <li>No application-level bypass possible</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Encryption</h2>
            <div className="border border-border bg-background-elevated p-6 rounded-lg">
              <ul className="space-y-2 text-sm">
                <li>• TLS 1.3 for data in transit</li>
                <li>• AES-256 encryption for data at rest</li>
                <li>• Encrypted database connections</li>
                <li>• Secure key management</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Compliance</h2>
            <p className="mb-4">
              NexusCanon meets the highest compliance standards:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['SOC 2 Type II', 'ISO 27001', 'GDPR', 'CCPA'].map((cert) => (
                <div key={cert} className="border border-border bg-background-elevated p-4 text-center">
                  <p className="text-xs font-brand text-foreground-muted uppercase tracking-wider">{cert}</p>
                </div>
              ))}
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


