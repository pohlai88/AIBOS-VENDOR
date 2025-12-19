import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, CheckCircle2, ArrowRight } from "lucide-react";
import { NexusIcon } from "@/components/icons/NexusIcon";
import { BrandName } from "@/components/brand/BrandName";


export const metadata: Metadata = {
  title: "First Steps",
  description: "First steps guide for NexusCanon Vendor Governance Platform",
};

// Route segment config for static generation with ISR
export const dynamic = "force-static";
export const revalidate = 3600;

const STEPS = [
  {
    title: "Create Your Account",
    description: "Sign up for a NexusCanon account and verify your email address.",
    action: "Sign Up",
    href: "/signup",
  },
  {
    title: "Set Up Your Organization",
    description: "Configure your organization profile and compliance requirements.",
    action: "Go to Settings",
    href: "/settings",
  },
  {
    title: "Add Your First Vendor",
    description: "Start by adding vendors to your network and begin risk assessment.",
    action: "View Dashboard",
    href: "/dashboard",
  },
  {
    title: "Configure Compliance",
    description: "Set up compliance frameworks relevant to your industry and region.",
    action: "Learn More",
    href: "/docs/security/compliance",
  },
];

export default function FirstStepsPage() {
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
            First Steps
          </h1>
          <p className="text-lg text-foreground-muted font-normal leading-relaxed">
            Get up and running with NexusCanon in four simple steps.
          </p>
        </div>

        <div className="space-y-6">
          {STEPS.map((step, index) => (
            <div
              key={index}
              className="border border-border bg-background-elevated p-8 hover:bg-background-hover transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center border border-border rounded-full bg-background">
                  <span className="text-lg font-serif text-foreground">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-serif text-foreground mb-3">{step.title}</h2>
                  <p className="text-foreground-muted font-normal leading-relaxed mb-4">
                    {step.description}
                  </p>
                  <Link
                    href={step.href}
                    className="inline-flex items-center gap-2 border border-border px-6 py-2 hover:bg-foreground hover:text-background hover:border-foreground transition-all text-xs font-brand uppercase tracking-wider group"
                  >
                    {step.action}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
                <CheckCircle2 className="w-6 h-6 text-success-500 flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 border border-border bg-background-elevated/50">
          <h2 className="text-xl font-serif text-foreground mb-3">Need Help?</h2>
          <p className="text-sm text-foreground-muted font-normal leading-relaxed mb-4">
            If you encounter any issues or have questions, check out our documentation or contact support.
          </p>
          <div className="flex gap-3">
            <Link
              href="/docs"
              className="text-sm text-foreground-muted hover:text-foreground transition-colors font-brand"
            >
              View Documentation
            </Link>
            <span className="text-foreground-subtle">•</span>
            <Link
              href="/security"
              className="text-sm text-foreground-muted hover:text-foreground transition-colors font-brand"
            >
              Security Information
            </Link>
          </div>
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


