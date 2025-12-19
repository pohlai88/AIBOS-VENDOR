import Link from "next/link";
import type { Metadata } from "next";
import { Settings, Play } from "lucide-react";
import { PublicPageLayout } from "@/components/layout/PublicPageLayout";


export const metadata: Metadata = {
  title: "Getting Started",
  description: "Getting started guide for NexusCanon Vendor Governance Platform",
};

// Route segment config for static generation with ISR
export const dynamic = "force-static";
export const revalidate = 3600;

const GETTING_STARTED_LINKS = [
  {
    title: "Installation",
    description: "Install and set up NexusCanon on your system",
    href: "/docs/getting-started/installation",
    icon: Settings,
  },
  {
    title: "Configuration",
    description: "Configure your platform settings and environment",
    href: "/docs/getting-started/configuration",
    icon: Settings,
  },
  {
    title: "First Steps",
    description: "Learn the basics and get started with your first vendor",
    href: "/docs/getting-started/first-steps",
    icon: Play,
  },
];

export default function GettingStartedPage() {
  return (
    <PublicPageLayout backHref="/docs" backLabel="Back to Docs">
      <div className="mb-12">
        <Link
          href="/docs"
          className="text-[10px] font-brand text-foreground-muted uppercase tracking-[0.2em] hover:text-foreground transition-colors font-normal"
        >
          Documentation
        </Link>
        <h1 className="text-5xl md:text-6xl font-serif text-foreground mb-4 mt-4 font-normal">
          Getting Started
        </h1>
        <p className="text-lg text-foreground-muted font-normal leading-relaxed font-brand font-normal">
          Everything you need to get started with NexusCanon Vendor Governance Platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {GETTING_STARTED_LINKS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="border border-border bg-background-elevated p-8 hover:bg-background-hover transition-colors group"
              aria-label={`Navigate to ${item.title} documentation`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center border border-border bg-background rounded-lg group-hover:border-success-500/30 transition-colors">
                  <Icon className="w-5 h-5 text-foreground-muted group-hover:text-foreground transition-colors" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-serif text-foreground mb-2 group-hover:text-success-500 transition-colors font-normal">
                    {item.title}
                  </h2>
                  <p className="text-sm text-foreground-muted font-normal leading-relaxed font-brand font-normal">
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </PublicPageLayout>
  );
}


