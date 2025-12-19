import type { Metadata } from "next";
import { ShieldCheck, Lock, Fingerprint } from "lucide-react";
import { PublicPageLayout } from "@/components/layout/PublicPageLayout";


export const metadata: Metadata = {
  title: "Security",
  description: "Security information for NexusCanon Vendor Governance Platform",
};

// Route segment config for static generation with ISR
export const dynamic = "force-static";
export const revalidate = 3600;

export default function SecurityPage() {
  return (
    <PublicPageLayout>
      <h1 className="text-5xl md:text-6xl font-serif text-foreground mb-8 font-normal">Security</h1>

      <div className="space-y-12">
        <section>
          <h2 className="text-3xl font-serif text-foreground mb-6 font-normal">Security First</h2>
          <p className="text-lg text-foreground-muted font-normal leading-relaxed mb-8 font-brand">
            NexusCanon is built with security as a foundational principle. We employ industry-leading
            security practices to protect your data and ensure compliance with the highest standards.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-border bg-background-elevated/50 p-8">
            <Lock className="w-10 h-10 text-foreground/80 mb-4 stroke-1" aria-hidden="true" />
            <h3 className="text-xl font-serif text-foreground mb-3 font-normal">Zero-Trust Architecture</h3>
            <p className="text-sm text-foreground-muted font-normal leading-relaxed font-brand">
              Every access request is verified, regardless of origin. No implicit trust assumptions.
              Continuous verification of user identity and device security.
            </p>
          </div>
          <div className="border border-border bg-background-elevated/50 p-8">
            <ShieldCheck className="w-10 h-10 text-foreground/80 mb-4 stroke-1" aria-hidden="true" />
            <h3 className="text-xl font-serif text-foreground mb-3 font-normal">Compliance Certified</h3>
            <p className="text-sm text-foreground-muted font-normal leading-relaxed font-brand">
              SOC 2 Type II, ISO 27001, GDPR compliant. Regular security audits, penetration testing,
              and third-party security assessments.
            </p>
          </div>
          <div className="border border-border bg-background-elevated/50 p-8">
            <Fingerprint className="w-10 h-10 text-foreground/80 mb-4 stroke-1" aria-hidden="true" />
            <h3 className="text-xl font-serif text-foreground mb-3 font-normal">Immutable Audit Trails</h3>
            <p className="text-sm text-foreground-muted font-normal leading-relaxed font-brand">
              Blockchain-backed logs ensure complete transparency and non-repudiation of all actions.
              Tamper-proof record keeping for compliance and accountability.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-foreground mb-4 font-normal">Data Protection</h2>
          <ul className="list-disc pl-6 space-y-2 text-foreground-muted font-normal font-brand">
            <li>End-to-end encryption for data in transit and at rest</li>
            <li>Row-level security (RLS) for database access control</li>
            <li>Regular automated backups with point-in-time recovery</li>
            <li>Data residency options for compliance requirements</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-foreground mb-4 font-normal">Security Practices</h2>
          <ul className="list-disc pl-6 space-y-2 text-foreground-muted font-normal font-brand">
            <li>Regular security audits and vulnerability assessments</li>
            <li>Penetration testing by independent security firms</li>
            <li>24/7 security monitoring and incident response</li>
            <li>Employee security training and background checks</li>
            <li>Bug bounty program for responsible disclosure</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-foreground mb-4 font-normal">Compliance & Certifications</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-border bg-background-elevated/50 p-4 text-center">
              <p className="text-sm font-brand text-foreground-muted uppercase tracking-widest mb-2 font-normal">
                SOC 2
              </p>
              <p className="text-xs text-foreground-subtle font-brand font-normal">Type II</p>
            </div>
            <div className="border border-border bg-background-elevated/50 p-4 text-center">
              <p className="text-sm font-brand text-foreground-muted uppercase tracking-widest mb-2 font-normal">
                ISO 27001
              </p>
              <p className="text-xs text-foreground-subtle font-brand font-normal">Certified</p>
            </div>
            <div className="border border-border bg-background-elevated/50 p-4 text-center">
              <p className="text-sm font-brand text-foreground-muted uppercase tracking-widest mb-2 font-normal">
                GDPR
              </p>
              <p className="text-xs text-foreground-subtle font-brand font-normal">Compliant</p>
            </div>
            <div className="border border-border bg-background-elevated/50 p-4 text-center">
              <p className="text-sm font-brand text-foreground-muted uppercase tracking-widest mb-2 font-normal">
                CCPA
              </p>
              <p className="text-xs text-foreground-subtle font-brand font-normal">Compliant</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-foreground mb-4 font-normal">Report Security Issues</h2>
          <p className="text-foreground-muted font-normal leading-relaxed mb-4 font-brand">
            If you discover a security vulnerability, please report it to security@nexuscanon.com.
            We appreciate responsible disclosure and will respond promptly.
          </p>
        </section>
      </div>
    </PublicPageLayout>
  );
}
