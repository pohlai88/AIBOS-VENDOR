import Link from "next/link";
import type { Metadata } from "next";
import { Book, Code, Terminal } from "lucide-react";
import { PublicPageLayout } from "@/components/layout/PublicPageLayout";
import { NexusIcon } from "@/components/icons/NexusIcon";
import { BrandName } from "@/components/brand/BrandName";


export const metadata: Metadata = {
  title: "Installation",
  description: "Installation guide for NexusCanon Vendor Governance Platform",
};

// Route segment config for static generation with ISR
export const dynamic = "force-static";
export const revalidate = 3600;

export default function InstallationPage() {
  return (
    <PublicPageLayout backHref="/docs/getting-started" backLabel="Back to Getting Started">
      <div className="mb-8">
        <Link
          href="/docs/getting-started"
          className="text-[10px] font-brand text-foreground-muted uppercase tracking-[0.2em] hover:text-foreground transition-colors font-normal"
        >
          Getting Started
        </Link>
        <h1 className="text-5xl md:text-6xl font-serif text-foreground mb-4 mt-4 font-normal">
          Installation
        </h1>
        <p className="text-lg text-foreground-muted font-normal leading-relaxed font-brand">
          Get started with NexusCanon Vendor Governance Platform in minutes.
        </p>
      </div>

      <div className="prose prose-invert max-w-none space-y-8 text-foreground-muted font-normal leading-relaxed">
        <section>
          <h2 className="text-2xl font-serif text-foreground mb-4">Prerequisites</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Node.js 18+ installed</li>
            <li>npm, pnpm, yarn, or bun package manager</li>
            <li>Git for version control</li>
            <li>Supabase account (for database and authentication)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-foreground mb-4">Quick Start</h2>
          <div className="border border-border bg-background-elevated p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="w-5 h-5 text-foreground-muted" />
              <span className="text-sm font-brand text-foreground-muted uppercase tracking-wider">Terminal</span>
            </div>
            <pre className="text-sm font-mono text-foreground overflow-x-auto">
              {`# Clone the repository
git clone https://github.com/your-org/nexuscanon.git
cd nexuscanon

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev`}
            </pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-foreground mb-4">Environment Configuration</h2>
          <p className="mb-4">
            Configure your environment variables in <code className="text-xs bg-background-elevated px-1.5 py-0.5 rounded border border-border">.env.local</code>:
          </p>
          <div className="border border-border bg-background-elevated p-6 rounded-lg">
            <pre className="text-sm font-mono text-foreground overflow-x-auto">
              {`NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key`}
            </pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-foreground mb-4">Database Setup</h2>
          <p className="mb-4">
            Run the database migrations to set up your schema:
          </p>
          <div className="border border-border bg-background-elevated p-6 rounded-lg">
            <pre className="text-sm font-mono text-foreground overflow-x-auto">
              {`# Run migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed`}
            </pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-foreground mb-4">Verification</h2>
          <p className="mb-4">
            Once installed, verify your installation by:
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>Starting the development server: <code className="text-xs bg-background-elevated px-1.5 py-0.5 rounded border border-border">npm run dev</code></li>
            <li>Visiting <code className="text-xs bg-background-elevated px-1.5 py-0.5 rounded border border-border">http://localhost:3000</code></li>
            <li>Checking that the landing page loads correctly</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-serif text-foreground mb-4">Next Steps</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/docs/getting-started/configuration"
              className="border border-border bg-background-elevated p-6 hover:bg-background-hover transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <Code className="w-5 h-5 text-foreground-muted group-hover:text-foreground transition-colors" />
                <h3 className="text-lg font-serif text-foreground group-hover:text-success-500 transition-colors">
                  Configuration
                </h3>
              </div>
              <p className="text-sm text-foreground-muted font-normal">
                Configure your platform settings
              </p>
            </Link>
            <Link
              href="/docs/getting-started/first-steps"
              className="border border-border bg-background-elevated p-6 hover:bg-background-hover transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <Book className="w-5 h-5 text-foreground-muted group-hover:text-foreground transition-colors" />
                <h3 className="text-lg font-serif text-foreground group-hover:text-success-500 transition-colors">
                  First Steps
                </h3>
              </div>
              <p className="text-sm text-foreground-muted font-normal">
                Learn the basics of using the platform
              </p>
            </Link>
          </div>
        </section>
      </div>

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
    </PublicPageLayout>
  );
}


