import type { Metadata } from "next";
import { PublicPageLayout } from "@/components/layout/PublicPageLayout";


export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for NexusCanon Vendor Governance Platform",
};

// Route segment config for static generation with ISR
export const dynamic = "force-static";
export const revalidate = 3600;

export default function TermsPage() {
  return (
    <PublicPageLayout>
      <h1 className="text-5xl md:text-6xl font-serif text-foreground mb-8 font-normal">
        Terms of Service
      </h1>

      <div className="prose prose-invert max-w-none space-y-8 text-foreground-muted font-normal leading-relaxed">
        <section>
          <h2 className="text-2xl font-serif text-foreground mb-4 font-normal">
            Last Updated: January 2025
          </h2>
          <p className="font-brand font-normal">
            These Terms of Service ("Terms") govern your access to and use of the NexusCanon Vendor
            Governance Platform ("Service") provided by NexusCanon Governance Systems ("we," "our," or "us").
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-foreground mb-4 font-normal">Acceptance of Terms</h2>
          <p className="font-brand font-normal">
            By accessing or using our Service, you agree to be bound by these Terms. If you disagree
            with any part of these Terms, you may not access the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-foreground mb-4 font-normal">Use of Service</h2>
          <p className="font-brand font-normal">
            You agree to use the Service only for lawful purposes and in accordance with these Terms.
            You agree not to:
          </p>
          <ul className="list-disc pl-6 space-y-2 font-brand font-normal">
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe upon the rights of others</li>
            <li>Transmit any malicious code or harmful content</li>
            <li>Attempt to gain unauthorized access to the Service</li>
            <li>Interfere with or disrupt the Service or servers</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-foreground mb-4 font-normal">Account Responsibilities</h2>
          <p className="font-brand font-normal">
            You are responsible for maintaining the confidentiality of your account credentials and for
            all activities that occur under your account. You must immediately notify us of any
            unauthorized use of your account.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-foreground mb-4 font-normal">Intellectual Property</h2>
          <p className="font-brand font-normal">
            The Service and its original content, features, and functionality are owned by NexusCanon
            Governance Systems and are protected by international copyright, trademark, and other
            intellectual property laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-foreground mb-4 font-normal">Limitation of Liability</h2>
          <p className="font-brand font-normal">
            To the maximum extent permitted by law, NexusCanon Governance Systems shall not be liable
            for any indirect, incidental, special, consequential, or punitive damages resulting from your
            use of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-foreground mb-4 font-normal">Contact Us</h2>
          <p className="font-brand font-normal">
            If you have questions about these Terms, please contact us at legal@nexuscanon.com
          </p>
        </section>
      </div>
    </PublicPageLayout>
  );
}
