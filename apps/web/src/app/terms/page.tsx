import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { NexusIcon } from "@/components/icons/NexusIcon";
import { BrandName } from "@/components/brand/BrandName";

export const metadata: Metadata = {
  title: "Terms of Service - NexusCanon",
  description: "Terms of service for NexusCanon Vendor Governance Platform",
};

export default function TermsPage() {
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
          Terms of Service
        </h1>

        <div className="prose prose-invert max-w-none space-y-8 text-foreground-muted font-light leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Last Updated: January 2025</h2>
            <p>
              These Terms of Service ("Terms") govern your access to and use of the NexusCanon Vendor
              Governance Platform ("Service") provided by NexusCanon Governance Systems ("we," "our," or "us").
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Acceptance of Terms</h2>
            <p>
              By accessing or using our Service, you agree to be bound by these Terms. If you disagree
              with any part of these Terms, you may not access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Use of Service</h2>
            <p>You agree to use the Service only for lawful purposes and in accordance with these Terms.
              You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Transmit any malicious code or harmful content</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Interfere with or disrupt the Service or servers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Account Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials and for
              all activities that occur under your account. You must immediately notify us of any
              unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Intellectual Property</h2>
            <p>
              The Service and its original content, features, and functionality are owned by NexusCanon
              Governance Systems and are protected by international copyright, trademark, and other
              intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, NexusCanon Governance Systems shall not be liable
              for any indirect, incidental, special, consequential, or punitive damages resulting from your
              use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Contact Us</h2>
            <p>
              If you have questions about these Terms, please contact us at legal@nexuscanon.com
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
