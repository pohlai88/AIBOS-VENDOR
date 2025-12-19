import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ShieldCheck, Lock, Fingerprint } from "lucide-react";
import { NexusIcon } from "@/components/icons/NexusIcon";
import { BrandName } from "@/components/brand/BrandName";

export const metadata: Metadata = {
  title: "Security - NexusCanon",
  description: "Security information for NexusCanon Vendor Governance Platform",
};

export default function SecurityPage() {
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
            href="/"
            className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors text-sm font-brand"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 md:px-12 py-16">
        <h1 className="text-5xl md:text-6xl font-serif text-foreground mb-8">
          Security
        </h1>

        <div className="space-y-12">
          <section>
            <h2 className="text-3xl font-serif text-foreground mb-6">Security First</h2>
            <p className="text-lg text-foreground-muted font-light leading-relaxed mb-8">
              NexusCanon is built with security as a foundational principle. We employ industry-leading
              security practices to protect your data and ensure compliance with the highest standards.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-border bg-background-elevated/50 p-8">
              <Lock className="w-10 h-10 text-foreground/80 mb-4 stroke-1" />
              <h3 className="text-xl font-serif text-foreground mb-3">Zero-Trust Architecture</h3>
              <p className="text-sm text-foreground-muted font-light leading-relaxed">
                Every access request is verified, regardless of origin. No implicit trust assumptions.
                Continuous verification of user identity and device security.
              </p>
            </div>
            <div className="border border-border bg-background-elevated/50 p-8">
              <ShieldCheck className="w-10 h-10 text-foreground/80 mb-4 stroke-1" />
              <h3 className="text-xl font-serif text-foreground mb-3">Compliance Certified</h3>
              <p className="text-sm text-foreground-muted font-light leading-relaxed">
                SOC 2 Type II, ISO 27001, GDPR compliant. Regular security audits, penetration testing,
                and third-party security assessments.
              </p>
            </div>
            <div className="border border-border bg-background-elevated/50 p-8">
              <Fingerprint className="w-10 h-10 text-foreground/80 mb-4 stroke-1" />
              <h3 className="text-xl font-serif text-foreground mb-3">Immutable Audit Trails</h3>
              <p className="text-sm text-foreground-muted font-light leading-relaxed">
                Blockchain-backed logs ensure complete transparency and non-repudiation of all actions.
                Tamper-proof record keeping for compliance and accountability.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Data Protection</h2>
            <ul className="list-disc pl-6 space-y-2 text-foreground-muted font-light">
              <li>End-to-end encryption for data in transit and at rest</li>
              <li>Row-level security (RLS) for database access control</li>
              <li>Regular automated backups with point-in-time recovery</li>
              <li>Data residency options for compliance requirements</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Security Practices</h2>
            <ul className="list-disc pl-6 space-y-2 text-foreground-muted font-light">
              <li>Regular security audits and vulnerability assessments</li>
              <li>Penetration testing by independent security firms</li>
              <li>24/7 security monitoring and incident response</li>
              <li>Employee security training and background checks</li>
              <li>Bug bounty program for responsible disclosure</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Compliance & Certifications</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="border border-border bg-background-elevated/50 p-4 text-center">
                <p className="text-sm font-brand text-foreground-muted uppercase tracking-widest mb-2">SOC 2</p>
                <p className="text-xs text-foreground-subtle">Type II</p>
              </div>
              <div className="border border-border bg-background-elevated/50 p-4 text-center">
                <p className="text-sm font-brand text-foreground-muted uppercase tracking-widest mb-2">ISO 27001</p>
                <p className="text-xs text-foreground-subtle">Certified</p>
              </div>
              <div className="border border-border bg-background-elevated/50 p-4 text-center">
                <p className="text-sm font-brand text-foreground-muted uppercase tracking-widest mb-2">GDPR</p>
                <p className="text-xs text-foreground-subtle">Compliant</p>
              </div>
              <div className="border border-border bg-background-elevated/50 p-4 text-center">
                <p className="text-sm font-brand text-foreground-muted uppercase tracking-widest mb-2">CCPA</p>
                <p className="text-xs text-foreground-subtle">Compliant</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Report Security Issues</h2>
            <p className="text-foreground-muted font-light leading-relaxed mb-4">
              If you discover a security vulnerability, please report it to security@nexuscanon.com.
              We appreciate responsible disclosure and will respond promptly.
            </p>
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
