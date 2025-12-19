import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { LandingButton } from "./LandingButton";
import { StatusBadge } from "./StatusBadge";
import { COMPLIANCE_BADGES, HERO_CHECKPOINTS } from "@/data/landing";

interface HeroSectionProps {
  className?: string;
}

export function HeroSection({ className = "" }: HeroSectionProps) {
  return (
    <div className={className}>
      {/* Status Bar */}
      <div className="flex items-center gap-6 mb-20 pb-10 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500"></span>
          </div>
          <span className="text-[10px] font-normal font-brand uppercase tracking-[0.2em] text-foreground-muted">
            System Operational
          </span>
        </div>
        <div className="w-px h-3 bg-border"></div>
        <span className="text-[10px] font-brand tracking-wider text-foreground-subtle font-normal">
          v2.0.4
        </span>
        <div className="flex-1"></div>
        <div className="hidden md:flex items-center gap-3">
          {COMPLIANCE_BADGES.map((badge) => (
            <StatusBadge key={badge} text={badge} />
          ))}
        </div>
      </div>

      {/* Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-24 items-end">
        <div className="lg:col-span-7 space-y-10">
          <h1 className="text-6xl md:text-9xl font-serif leading-[0.9] tracking-tight text-foreground font-normal">
            Total Vendor <br />
            <span className="italic text-foreground/40">Command.</span>
          </h1>
          <div className="flex items-center gap-6">
            <div className="w-16 h-px bg-foreground/40"></div>
            <p className="text-[10px] font-normal font-brand uppercase tracking-[0.25em] text-foreground-muted">
              Institutional Grade
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 border-l border-border pl-12 space-y-10 pb-2">
          <p className="text-lg text-foreground-muted leading-relaxed font-normal font-brand">
            Eliminate supply chain opacity. Orchestrate global procurement, compliance, and risk
            mitigation from a single,
            <span className="text-foreground"> institutional-grade terminal.</span>
          </p>

          <div className="space-y-3">
            {HERO_CHECKPOINTS.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-success-500" aria-hidden="true" />
                <p className="text-sm text-foreground-muted font-brand font-normal">{item}</p>
              </div>
            ))}
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-3">
            <Link href="/signup" className="flex-1">
              <LandingButton className="w-full py-4">Book Strategic Demo</LandingButton>
            </Link>
            <Link href="/docs" className="flex-1">
              <LandingButton variant="outline" className="w-full py-4">View Documentation</LandingButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
