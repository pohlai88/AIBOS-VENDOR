import type { Metadata } from "next";
import { PublicPageLayout } from "@/components/layout/PublicPageLayout";


export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for NexusCanon Vendor Governance Platform",
};

// Route segment config for static generation with ISR
export const dynamic = "force-static";
export const revalidate = 3600;

export default function PrivacyPage() {
  return (
    <PublicPageLayout>
      <h1 className="text-5xl md:text-6xl font-serif text-foreground mb-8 font-normal">
        Privacy Policy
      </h1>

      <div className="prose prose-invert max-w-none space-y-8 text-foreground-muted font-normal leading-relaxed">
        <section>
          <h2 className="text-2xl font-serif text-foreground mb-4 font-normal">
            Last Updated: January 2025
          </h2>
          <p className="font-brand font-normal">
            NexusCanon Governance Systems ("we," "our," or "us") is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when
            you use our vendor governance platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-foreground mb-4 font-normal">
            Information We Collect
          </h2>
          <p className="font-brand font-normal">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 font-brand font-normal">
            <li>Account information (name, email address, organization details)</li>
            <li>Vendor and transaction data</li>
            <li>Communication records and messages</li>
            <li>Documentation and compliance records</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-foreground mb-4 font-normal">
            How We Use Your Information
          </h2>
          <p className="font-brand font-normal">We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-2 font-brand font-normal">
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and manage vendor relationships</li>
            <li>Ensure compliance with regulatory requirements</li>
            <li>Send you technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-foreground mb-4 font-normal">Data Security</h2>
          <p className="font-brand font-normal">
            We implement industry-standard security measures to protect your information, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 font-brand font-normal">
            <li>Encryption of data in transit and at rest</li>
            <li>Zero-trust architecture and access controls</li>
            <li>Regular security audits and penetration testing</li>
            <li>Compliance with SOC 2 Type II, ISO 27001, and GDPR standards</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-foreground mb-4 font-normal">Your Rights</h2>
          <p className="font-brand font-normal">
            Depending on your location, you may have certain rights regarding your personal information,
            including the right to access, correct, delete, or restrict processing of your data.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-foreground mb-4 font-normal">Contact Us</h2>
          <p className="font-brand font-normal">
            If you have questions about this Privacy Policy, please contact us at privacy@nexuscanon.com
          </p>
        </section>
      </div>
    </PublicPageLayout>
  );
}
