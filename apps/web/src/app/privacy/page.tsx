import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { NexusIcon } from "@/components/icons/NexusIcon";
import { BrandName } from "@/components/brand/BrandName";

export const metadata: Metadata = {
  title: "Privacy Policy - NexusCanon",
  description: "Privacy policy for NexusCanon Vendor Governance Platform",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>

        <div className="prose prose-invert max-w-none space-y-8 text-foreground-muted font-light leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Last Updated: January 2025</h2>
            <p>
              NexusCanon Governance Systems ("we," "our," or "us") is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when
              you use our vendor governance platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Account information (name, email address, organization details)</li>
              <li>Vendor and transaction data</li>
              <li>Communication records and messages</li>
              <li>Documentation and compliance records</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and manage vendor relationships</li>
              <li>Ensure compliance with regulatory requirements</li>
              <li>Send you technical notices and support messages</li>
              <li>Respond to your comments and questions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Encryption of data in transit and at rest</li>
              <li>Zero-trust architecture and access controls</li>
              <li>Regular security audits and penetration testing</li>
              <li>Compliance with SOC 2 Type II, ISO 27001, and GDPR standards</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Your Rights</h2>
            <p>
              Depending on your location, you may have certain rights regarding your personal information,
              including the right to access, correct, delete, or restrict processing of your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at privacy@nexuscanon.com
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
