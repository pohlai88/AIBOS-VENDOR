import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, CheckCircle2, FileCheck } from "lucide-react";
import { NexusIcon } from "@/components/icons/NexusIcon";
import { BrandName } from "@/components/brand/BrandName";


export const metadata: Metadata = {
  title: "Compliance",
  description: "Compliance information for NexusCanon Vendor Governance Platform",
};

// Route segment config for static generation with ISR
export const dynamic = "force-static";
export const revalidate = 3600;

const COMPLIANCE_FRAMEWORKS = [
  {
    name: "SOC 2 Type II",
    description: "Service Organization Control 2 Type II certification ensures our controls are operating effectively.",
    status: "Certified",
  },
  {
    name: "ISO 27001",
    description: "International standard for information security management systems.",
    status: "Certified",
  },
  {
    name: "GDPR",
    description: "General Data Protection Regulation compliance for EU data protection.",
    status: "Compliant",
  },
  {
    name: "CCPA",
    description: "California Consumer Privacy Act compliance for California residents.",
    status: "Compliant",
  },
];

export default function CompliancePage() {
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
            Compliance
          </h1>
          <p className="text-lg text-foreground-muted font-normal leading-relaxed">
            NexusCanon meets the highest compliance standards for institutional-grade operations.
          </p>
        </div>

        <div className="space-y-6">
          {COMPLIANCE_FRAMEWORKS.map((framework) => (
            <div
              key={framework.name}
              className="border border-border bg-background-elevated p-8 hover:bg-background-hover transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <FileCheck className="w-6 h-6 text-success-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-serif text-foreground">{framework.name}</h2>
                    <span className="px-3 py-1 border border-success-500/30 bg-success-500/10 text-[9px] font-brand text-success-500 uppercase tracking-wider">
                      {framework.status}
                    </span>
                  </div>
                  <p className="text-foreground-muted font-normal leading-relaxed">
                    {framework.description}
                  </p>
                </div>
                <CheckCircle2 className="w-6 h-6 text-success-500 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 border border-border bg-background-elevated/50">
          <h2 className="text-xl font-serif text-foreground mb-3">Audit Reports</h2>
          <p className="text-sm text-foreground-muted font-normal leading-relaxed mb-4">
            Compliance reports and audit documentation are available upon request for enterprise customers.
            Contact your account representative for access.
          </p>
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


