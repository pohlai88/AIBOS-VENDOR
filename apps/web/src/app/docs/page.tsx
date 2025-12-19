import Link from "next/link";
import type { Metadata } from "next";
import { Book, FileText, Shield, Database, Code } from "lucide-react";
import { PublicPageLayout } from "@/components/layout/PublicPageLayout";


export const metadata: Metadata = {
  title: "Documentation",
  description: "Complete documentation for NexusCanon Vendor Governance Platform",
};

// Route segment config for static generation with ISR
export const dynamic = "force-static";
export const revalidate = 3600;

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
    <PublicPageLayout>
      <div className="max-w-[1600px] mx-auto">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-16">
            <h1 className="text-5xl md:text-6xl font-serif text-foreground mb-6 font-normal">
              Documentation
            </h1>
            <p className="text-lg text-foreground-muted font-normal leading-relaxed max-w-2xl font-brand">
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
                      <h2 className="text-2xl font-serif text-foreground mb-2 font-normal">
                        {section.title}
                      </h2>
                      <p className="text-sm text-foreground-muted font-normal leading-relaxed mb-4 font-brand">
                        {section.description}
                      </p>
                      <ul className="space-y-2">
                        {section.links.map((link) => (
                          <li key={link.name}>
                            <Link
                              href={link.href}
                              className="text-sm text-foreground-muted hover:text-foreground transition-colors font-brand flex items-center gap-2 group/link font-normal"
                              aria-label={`Navigate to ${link.name} documentation`}
                            >
                              <FileText className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity" aria-hidden="true" />
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
            <h2 className="text-2xl font-serif text-foreground mb-6 font-normal">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/docs/architecture"
                className="border border-border bg-background-elevated p-6 hover:bg-background-hover transition-colors group"
                aria-label="Navigate to Architecture documentation"
              >
                <h3 className="text-lg font-serif text-foreground mb-2 group-hover:text-success-500 transition-colors font-normal">
                  Architecture Docs
                </h3>
                <p className="text-sm text-foreground-muted font-normal font-brand">
                  System architecture and design patterns
                </p>
              </Link>
              <Link
                href="/docs/api"
                className="border border-border bg-background-elevated p-6 hover:bg-background-hover transition-colors group"
                aria-label="Navigate to API Reference documentation"
              >
                <h3 className="text-lg font-serif text-foreground mb-2 group-hover:text-success-500 transition-colors font-normal">
                  API Reference
                </h3>
                <p className="text-sm text-foreground-muted font-normal font-brand">
                  Complete API documentation
                </p>
              </Link>
              <Link
                href="/docs/security"
                className="border border-border bg-background-elevated p-6 hover:bg-background-hover transition-colors group"
                aria-label="Navigate to Security & Compliance documentation"
              >
                <h3 className="text-lg font-serif text-foreground mb-2 group-hover:text-success-500 transition-colors font-normal">
                  Security & Compliance
                </h3>
                <p className="text-sm text-foreground-muted font-normal font-brand">
                  Security measures and compliance
                </p>
              </Link>
            </div>
          </div>

          {/* Note */}
          <div className="mt-12 p-6 border border-border bg-background-elevated/50">
            <p className="text-sm text-foreground-muted font-normal leading-relaxed font-brand">
              <strong className="text-foreground font-normal">Note:</strong> This documentation
              page provides an overview and quick access to documentation sections. Detailed
              documentation is available in the <code className="text-xs bg-background px-1.5 py-0.5 rounded border border-border">docs/</code> directory
              of the repository.
            </p>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}


