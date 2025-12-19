import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Key, Shield, Lock } from "lucide-react";
import { NexusIcon } from "@/components/icons/NexusIcon";
import { BrandName } from "@/components/brand/BrandName";


export const metadata: Metadata = {
  title: "API Authentication",
  description: "API authentication guide for NexusCanon Vendor Governance Platform",
};

// Route segment config for static generation with ISR
export const dynamic = "force-static";
export const revalidate = 3600;

export default function ApiAuthenticationPage() {
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
            href="/docs/api"
            className="text-[10px] font-brand text-foreground-muted uppercase tracking-[0.2em] hover:text-foreground transition-colors"
          >
            API Reference
          </Link>
          <h1 className="text-5xl md:text-6xl font-serif text-foreground mb-4 mt-4">
            Authentication
          </h1>
          <p className="text-lg text-foreground-muted font-normal leading-relaxed">
            Secure API authentication using JWT tokens and OAuth 2.0.
          </p>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-foreground-muted font-normal leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Overview</h2>
            <p className="mb-4">
              NexusCanon API uses JWT (JSON Web Tokens) for authentication. All API requests must include
              a valid authentication token in the Authorization header.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Getting an Access Token</h2>
            <div className="border border-border bg-background-elevated p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Key className="w-5 h-5 text-foreground-muted" />
                <span className="text-sm font-brand text-foreground font-normal">Login Endpoint</span>
              </div>
              <pre className="text-sm font-mono text-foreground overflow-x-auto">
                {`POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}`}
              </pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Using the Token</h2>
            <p className="mb-4">
              Include the token in the Authorization header for all authenticated requests:
            </p>
            <div className="border border-border bg-background-elevated p-6 rounded-lg">
              <pre className="text-sm font-mono text-foreground overflow-x-auto">
                {`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
              </pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">OAuth 2.0</h2>
            <div className="border border-border bg-background-elevated p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-foreground-muted" />
                <h3 className="text-lg font-serif text-foreground">OAuth Providers</h3>
              </div>
              <p className="text-sm mb-4">
                NexusCanon supports OAuth 2.0 authentication with multiple providers:
              </p>
              <ul className="space-y-2 text-sm">
                <li>• GitHub</li>
                <li>• Google</li>
                <li>• Microsoft</li>
                <li>• Custom OAuth providers</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Security Best Practices</h2>
            <div className="border border-border bg-background-elevated p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-5 h-5 text-foreground-muted" />
                <h3 className="text-lg font-serif text-foreground">Recommendations</h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li>• Store tokens securely (never in localStorage for production)</li>
                <li>• Use HTTPS for all API requests</li>
                <li>• Implement token refresh before expiration</li>
                <li>• Rotate tokens regularly</li>
                <li>• Use environment variables for API keys</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-serif text-foreground mb-4">Next Steps</h2>
            <div className="flex gap-3">
              <Link
                href="/docs/api/endpoints"
                className="border border-border bg-background-elevated px-6 py-3 hover:bg-background-hover transition-colors text-sm font-brand uppercase tracking-wider"
              >
                View API Endpoints
              </Link>
              <Link
                href="/docs/api/rate-limiting"
                className="border border-border bg-background-elevated px-6 py-3 hover:bg-background-hover transition-colors text-sm font-brand uppercase tracking-wider"
              >
                Rate Limiting
              </Link>
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


