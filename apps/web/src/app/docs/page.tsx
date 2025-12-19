import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Book, FileText, Shield, Database, Code } from "lucide-react";
import { NexusIcon } from "@/components/icons/NexusIcon";
import { BrandName } from "@/components/brand/BrandName";

export const metadata: Metadata = {
  title: "Documentation - NexusCanon",
  description: "Complete documentation for NexusCanon Vendor Governance Platform",
};

const DOCS_SECTIONS = [
  {
    title: "Getting Started",
    icon: Book,
    description: "Setup guides and quick start tutorials",
    links: [
      { name: "Installation", href: "/docs/getting-started/installation" },
      { name: "Configuration", href: "/docs/getting-started/configuration" },
      { name: "First Steps", href: "/docs/getting-started/first-steps" },
    ],
  },
  {
    title: "API Reference",
    icon: Code,
    description: "Complete API documentation and endpoints",
    links: [
      { name: "Authentication", href: "/docs/api/authentication" },
      { name: "Endpoints", href: "/docs/api/endpoints" },
      { name: "Rate Limiting", href: "/docs/api/rate-limiting" },
    ],
  },
  {
    title: "Architecture",
    icon: Database,
    description: "System architecture and design patterns",
    links: [
      { name: "Overview", href: "/docs/architecture/overview" },
      { name: "Data Flow", href: "/docs/architecture/data-flow" },
      { name: "Security", href: "/docs/architecture/security" },
    ],
  },
  {
    title: "Security & Compliance",
    icon: Shield,
    description: "Security measures and compliance documentation",
    links: [
      { name: "Security Overview", href: "/docs/security/overview" },
      { name: "Compliance", href: "/docs/security/compliance" },
      { name: "Disaster Recovery", href: "/docs/security/disaster-recovery" },
    ],
  },
];

export default function DocsPage() {
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
      <main className="max-w-[1600px] mx-auto px-6 md:px-12 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-16">
            <h1 className="text-5xl md:text-6xl font-serif text-foreground mb-6">
              Documentation
            </h1>
            <p className="text-lg text-foreground-muted font-light leading-relaxed max-w-2xl">
              Complete documentation for the NexusCanon Vendor Governance Platform.
              Find guides, API references, architecture details, and security information.
            </p>
          </div>

          {/* Documentation Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {DOCS_SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.title}
                  className="border border-border bg-background-elevated p-8 hover:bg-background-hover transition-colors group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center border border-border bg-background rounded-lg group-hover:border-success-500/30 transition-colors">
                      <Icon className="w-5 h-5 text-foreground-muted group-hover:text-foreground transition-colors" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-serif text-foreground mb-2">
                        {section.title}
                      </h2>
                      <p className="text-sm text-foreground-muted font-light leading-relaxed mb-4">
                        {section.description}
                      </p>
                      <ul className="space-y-2">
                        {section.links.map((link) => (
                          <li key={link.name}>
                            <Link
                              href={link.href}
                              className="text-sm text-foreground-muted hover:text-foreground transition-colors font-brand flex items-center gap-2 group/link"
                            >
                              <FileText className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                              <span>{link.name}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Links */}
          <div className="border-t border-border pt-12">
            <h2 className="text-2xl font-serif text-foreground mb-6">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/docs/architecture"
                className="border border-border bg-background-elevated p-6 hover:bg-background-hover transition-colors group"
              >
                <h3 className="text-lg font-serif text-foreground mb-2 group-hover:text-success-500 transition-colors">
                  Architecture Docs
                </h3>
                <p className="text-sm text-foreground-muted font-light">
                  System architecture and design patterns
                </p>
              </Link>
              <Link
                href="/docs/api"
                className="border border-border bg-background-elevated p-6 hover:bg-background-hover transition-colors group"
              >
                <h3 className="text-lg font-serif text-foreground mb-2 group-hover:text-success-500 transition-colors">
                  API Reference
                </h3>
                <p className="text-sm text-foreground-muted font-light">
                  Complete API documentation
                </p>
              </Link>
              <Link
                href="/docs/security"
                className="border border-border bg-background-elevated p-6 hover:bg-background-hover transition-colors group"
              >
                <h3 className="text-lg font-serif text-foreground mb-2 group-hover:text-success-500 transition-colors">
                  Security & Compliance
                </h3>
                <p className="text-sm text-foreground-muted font-light">
                  Security measures and compliance
                </p>
              </Link>
            </div>
          </div>

          {/* Note */}
          <div className="mt-12 p-6 border border-border bg-background-elevated/50">
            <p className="text-sm text-foreground-muted font-light leading-relaxed">
              <strong className="text-foreground font-normal">Note:</strong> This documentation
              page provides an overview and quick access to documentation sections. Detailed
              documentation is available in the <code className="text-xs bg-background px-1.5 py-0.5 rounded border border-border">docs/</code> directory
              of the repository.
            </p>
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
