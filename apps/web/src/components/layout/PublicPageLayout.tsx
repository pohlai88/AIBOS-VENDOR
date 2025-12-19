import Link from "next/link";
import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { NexusIcon } from "@/components/icons/NexusIcon";
import { BrandName } from "@/components/brand/BrandName";

interface PublicPageLayoutProps {
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
}

export function PublicPageLayout({
  children,
  backHref = "/",
  backLabel = "Back to Home",
}: PublicPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50" role="banner">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 group" aria-label="NexusCanon Home">
            <div className="w-10 h-10 flex items-center justify-center">
              <NexusIcon size="lg" animated />
            </div>
            <div className="hidden md:block border-l border-border pl-4 group-hover:border-success-500/30 transition-colors duration-base">
              <BrandName variant="compact" />
            </div>
          </Link>
          <Link
            href={backHref}
            className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors text-sm font-brand font-normal"
            aria-label={backLabel}
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>{backLabel}</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 md:px-12 py-16">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 md:px-12 bg-background-elevated mt-16" role="contentinfo">
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
            <p className="text-xs text-foreground-subtle max-w-md text-center leading-relaxed font-brand font-normal">
              Institutional-grade vendor governance for the world's most regulated organizations.
            </p>
            <div className="pt-4 border-t border-border w-full flex flex-col md:flex-row justify-between items-center gap-2">
              <p className="text-[9px] font-brand text-foreground-subtle uppercase tracking-widest font-normal">
                © 2024 NexusCanon Governance Systems
              </p>
              <nav className="flex gap-3" aria-label="Footer navigation">
                <Link
                  href="/privacy"
                  className="text-[9px] font-brand text-foreground-subtle uppercase tracking-widest hover:text-foreground transition-colors font-normal"
                >
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  className="text-[9px] font-brand text-foreground-subtle uppercase tracking-widest hover:text-foreground transition-colors font-normal"
                >
                  Terms
                </Link>
                <Link
                  href="/security"
                  className="text-[9px] font-brand text-foreground-subtle uppercase tracking-widest hover:text-foreground transition-colors font-normal"
                >
                  Security
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
