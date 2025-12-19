import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, RotateCcw, Database, Clock } from "lucide-react";
import { NexusIcon } from "@/components/icons/NexusIcon";
import { BrandName } from "@/components/brand/BrandName";


export const metadata: Metadata = {
  title: "Disaster Recovery",
  description: "Disaster recovery procedures for NexusCanon Vendor Governance Platform",
};

// Route segment config for static generation with ISR
export const dynamic = "force-static";
export const revalidate = 3600;

export default function DisasterRecoveryPage() {
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
            href="/docs/security"
            className="text-[10px] font-brand text-foreground-muted uppercase tracking-[0.2em] hover:text-foreground transition-colors"
          >
            Security & Compliance
          </Link>
          <h1 className="text-5xl md:text-6xl font-serif text-foreground mb-4 mt-4">
            Disaster Recovery
          </h1>
          <p className="text-lg text-foreground-muted font-normal leading-relaxed">
            Comprehensive backup and recovery procedures ensuring business continuity.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-foreground-muted font-normal leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Backup Strategy</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-border bg-background-elevated p-6">
                <Database className="w-6 h-6 text-foreground-muted mb-3" />
                <h3 className="text-lg font-serif text-foreground mb-2">Automated Backups</h3>
                <p className="text-sm text-foreground-muted">
                  Daily automated backups with point-in-time recovery
                </p>
              </div>
              <div className="border border-border bg-background-elevated p-6">
                <Clock className="w-6 h-6 text-foreground-muted mb-3" />
                <h3 className="text-lg font-serif text-foreground mb-2">RTO/RPO</h3>
                <p className="text-sm text-foreground-muted">
                  Recovery Time Objective: 4 hours<br />
                  Recovery Point Objective: 1 hour
                </p>
              </div>
              <div className="border border-border bg-background-elevated p-6">
                <RotateCcw className="w-6 h-6 text-foreground-muted mb-3" />
                <h3 className="text-lg font-serif text-foreground mb-2">Geographic Redundancy</h3>
                <p className="text-sm text-foreground-muted">
                  Backups stored in multiple geographic regions
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Recovery Procedures</h2>
            <div className="border border-border bg-background-elevated p-6 rounded-lg">
              <ol className="list-decimal pl-6 space-y-3 text-sm">
                <li>Assessment of the incident and data loss scope</li>
                <li>Activation of disaster recovery team</li>
                <li>Restoration from most recent backup</li>
                <li>Verification of data integrity</li>
                <li>Gradual service restoration</li>
                <li>Post-incident review and documentation</li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Business Continuity</h2>
            <p className="mb-4">
              NexusCanon maintains high availability through:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>99.9% uptime SLA</li>
              <li>Multi-region deployment</li>
              <li>Automatic failover mechanisms</li>
              <li>24/7 monitoring and incident response</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Contact</h2>
            <p className="mb-4">
              For disaster recovery assistance, contact our support team:
            </p>
            <div className="border border-border bg-background-elevated p-6 rounded-lg">
              <p className="text-sm text-foreground-muted">
                Email: <span className="text-foreground">support@nexuscanon.com</span><br />
                Phone: <span className="text-foreground">+1 (555) 123-4567</span><br />
                Emergency: <span className="text-foreground">emergency@nexuscanon.com</span>
              </p>
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


