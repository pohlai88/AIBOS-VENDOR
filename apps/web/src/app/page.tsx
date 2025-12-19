import Link from "next/link";
import type { Metadata } from "next";
import {
  ShieldCheck,
  Globe,
  Building2,
  Fingerprint,
  Lock,
} from "lucide-react";
import { NexusIcon } from "@/components/icons/NexusIcon";
import { BrandName } from "@/components/brand/BrandName";
import { Section } from "@/components/landing/Section";
import { LandingButton } from "@/components/landing/LandingButton";
import { StatusBadge } from "@/components/landing/StatusBadge";
import { HeroSection } from "@/components/landing/HeroSection";
import { MetricsGrid } from "@/components/landing/MetricsGrid";
import {
  NAV_LINKS,
  TRUSTED_PROFESSIONALS,
  METRICS,
} from "@/data/landing";


export const metadata: Metadata = {
  title: "NexusCanon - Institutional-Grade Vendor Governance",
  description:
    "Eliminate supply chain opacity. Orchestrate global procurement, compliance, and risk mitigation from a single, institutional-grade terminal.",
};

// Route segment config for static generation with ISR
export const dynamic = "force-static";
export const revalidate = 3600;

// --- MAIN PAGE COMPONENT ---

export default function NexusCanonLanding() {
  return (
    // OPTIMIZED: Using design system tokens
    <div className="w-full min-h-screen bg-background text-foreground font-sans selection:bg-foreground/10 selection:text-foreground overflow-x-hidden">

      {/* NAVIGATION */}
      <nav
        className="fixed top-0 w-full z-fixed border-b border-border bg-background/80 backdrop-blur-xl"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 group" aria-label="NexusCanon Home">
            <div className="w-10 h-10 flex items-center justify-center">
              <NexusIcon size="lg" animated />
            </div>
            <div className="hidden md:block border-l border-border pl-4 group-hover:border-success-500/30 transition-colors duration-base">
              <BrandName variant="compact" />
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-10 text-[10px] font-normal font-brand uppercase tracking-[0.25em] text-foreground-muted">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="hover:text-foreground transition-colors duration-base"
                aria-label={`Navigate to ${link.name} section`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <Link href="/signup">
            <LandingButton className="px-6 py-2.5">Request Access</LandingButton>
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <Section className="pt-48 pb-36">
        <HeroSection />

        {/* Dashboard Mockup */}
        {/* OPTIMIZED: bg-background-elevated, border-border */}
        <div className="w-full border border-border relative overflow-hidden bg-background-elevated">
          {/* OPTIMIZED: Grid pattern using foreground */}
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-[size:4rem_4rem] text-foreground"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>

          <div className="relative z-10 p-12 md:p-20 min-h-[500px] flex flex-col justify-between">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* OPTIMIZED: bg-background-elevated/50, border-border */}
              <div className="md:col-span-4 border border-border bg-background-elevated/50 backdrop-blur-sm p-10">
                <div className="flex justify-between items-start mb-5">
                  <p className="text-[9px] font-normal font-brand text-foreground-muted uppercase tracking-[0.2em]">Global Risk Index</p>
                  <div className="w-2 h-2 rounded-full bg-success-500"></div>
                </div>
                <div className="flex items-baseline gap-3 mb-3">
                  <p className="text-6xl font-serif text-foreground">98.4</p>
                  {/* OPTIMIZED: success-500 */}
                  <span className="text-xl text-success-500 font-serif">%</span>
                </div>
                <div className="h-0.5 w-full bg-foreground/5 overflow-hidden rounded-full mb-2">
                  {/* OPTIMIZED: success-500 */}
                  <div className="h-full w-[98%] bg-gradient-to-r from-success-500 to-success-400 rounded-full"></div>
                </div>
                <span className="text-xs text-foreground-subtle font-brand block">Top 1% of Industry Standard</span>
              </div>
              {/* Enhanced Globe Section - Live Monitoring Display */}
              <div className="md:col-span-8 border border-border bg-background-elevated/50 backdrop-blur-sm relative overflow-hidden flex flex-col justify-between p-10 group/globe min-h-[300px]">
                {/* Active Grid Background */}
                <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-[size:2rem_2rem] text-foreground group-hover/globe:opacity-[0.05] transition-opacity duration-slow"></div>

                {/* Holographic Globe Centerpiece */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                  {/* Glowing Orb Background */}
                  <div className="absolute w-48 h-48 bg-success-500/10 blur-[80px] rounded-full animate-pulse"></div>

                  <div className="relative w-64 h-64 flex items-center justify-center">
                    {/* Outer Rotating Ring - Slow rotation */}
                    <div className="absolute inset-0 border border-foreground/5 rounded-full border-dashed animate-spin-slow"></div>

                    {/* Inner Rotating Globe (Slow) */}
                    <Globe className="absolute w-56 h-56 text-foreground/5 stroke-[0.5] animate-spin-very-slow" />

                    {/* Counter-Rotating Globe (Creating Moiré Effect) */}
                    <Globe className="absolute w-48 h-48 text-success-500/10 stroke-[0.5] animate-spin-reverse" />

                    {/* Radar "Ping" Effect */}
                    <div className="absolute inset-12 border border-success-500/20 rounded-full animate-ping"></div>
                  </div>
                </div>

                {/* Live Terminal Overlay (Top Left) */}
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 border border-success-500/20 bg-success-500/5 px-2 py-1 mb-4 backdrop-blur-md">
                    <span className="w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse"></span>
                    <span className="text-[9px] font-brand text-success-400 uppercase tracking-widest">Live Monitoring</span>
                  </div>

                  {/* Fake Scrolling Data */}
                  <div className="space-y-1.5 font-brand text-[9px] text-foreground-muted">
                    <div className="flex items-center gap-2">
                      <span className="text-success-500">►</span>
                      <span>LATENCY: <span className="text-foreground-subtle">12ms</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-success-500">►</span>
                      <span>NODES: <span className="text-foreground-subtle">8,402 Verified</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-success-500">►</span>
                      <span>THREAT_LEVEL: <span className="text-success-500">LOW</span></span>
                    </div>
                  </div>
                </div>

                {/* Map Coordinates (Bottom Right) */}
                <div className="relative z-10 flex justify-end mt-auto">
                  <div className="text-right">
                    <p className="text-[9px] font-brand text-foreground-subtle uppercase tracking-widest mb-0.5">Global Coverage</p>
                    <div className="flex items-baseline gap-1 justify-end">
                      <span className="text-3xl font-serif text-foreground leading-none">142</span>
                      <span className="text-[10px] font-brand text-success-500 uppercase">Regions</span>
                    </div>
                    <p className="text-[9px] font-brand text-foreground-subtle uppercase tracking-widest mt-2">24/7 Continuous Watch</p>
                  </div>
                </div>

                {/* Scanning Line (The "TV Scan" effect) */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-success-500/20 to-transparent opacity-20 pointer-events-none animate-ping-slow"></div>
              </div>
            </div>

            <MetricsGrid metrics={METRICS} />
          </div>
        </div>
      </Section>

      {/* TRUST TICKER */}
      {/* OPTIMIZED: border-border, bg-foreground/[0.02] */}
      <div className="border-y border-border bg-foreground/[0.02]">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row">
          <div className="py-6 px-12 md:border-r border-border flex items-center justify-center md:justify-start">
            <span className="text-[9px] font-normal font-brand uppercase tracking-[0.2em] text-foreground-subtle">Trusted By</span>
          </div>
          <div className="flex-1 flex flex-wrap justify-around items-center py-6 gap-6 px-12">
            {TRUSTED_PROFESSIONALS.map((role) => (
              <span
                key={role}
                className="font-serif text-lg text-foreground/20 hover:text-foreground/40 transition-colors cursor-default font-normal"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* GOVERNANCE SECTION */}
      <Section id="governance" className="py-24 scroll-mt-20">
        <div className="mb-12">
          <h2 className="text-4xl md:text-6xl font-serif leading-[1.1] mb-4 text-foreground font-normal">
            Institutional <span className="text-foreground/30 italic">Governance.</span>
          </h2>
          <div className="w-24 h-px bg-gradient-to-r from-foreground/40 to-transparent"></div>
        </div>

        {/* OPTIMIZED: border-border */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-px bg-border border border-border overflow-hidden">
          {/* Feature 1 */}
          <div className="md:col-span-8 bg-background p-8 md:p-12 hover:bg-background-hover transition-colors group">
            <ShieldCheck className="w-10 h-10 text-foreground/80 mb-6 stroke-1" aria-hidden="true" />
            <h3 className="text-3xl font-serif text-foreground mb-3 font-normal">Zero-Trust Risk Assessment</h3>
            <p className="text-foreground-muted font-normal leading-relaxed max-w-lg mb-6 font-brand">
              Automated background checks against 400+ global watchlists.
              Continuous monitoring of vendor financial health and reputational signals.
            </p>
            <div className="flex gap-2">
              {["AML", "Sanctions", "PEP"].map((tag) => (
                <StatusBadge key={tag} text={tag} />
              ))}
            </div>
          </div>

          {/* Feature 2 */}
          <div className="md:col-span-4 bg-background p-8 md:p-12 hover:bg-background-hover transition-colors">
            <Fingerprint className="w-10 h-10 text-foreground/80 mb-6 stroke-1" aria-hidden="true" />
            <h3 className="text-2xl font-serif text-foreground mb-3 font-normal">Immutable Audit</h3>
            <p className="text-foreground-muted font-normal leading-relaxed font-brand">
              Blockchain-backed logs for every contract interaction.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="md:col-span-4 bg-background p-8 md:p-12 hover:bg-background-hover transition-colors">
            <Building2 className="w-10 h-10 text-foreground/80 mb-6 stroke-1" aria-hidden="true" />
            <h3 className="text-2xl font-serif text-foreground mb-3 font-normal">Entity Management</h3>
            <p className="text-foreground-muted font-normal leading-relaxed font-brand">
              Centralized hierarchy for parent-child vendor relationships.
            </p>
          </div>

          {/* Feature 4 - Global Compliance */}
          <div className="md:col-span-8 bg-background p-8 md:p-12 hover:bg-background-hover transition-colors group">
            <Globe className="w-10 h-10 text-foreground/80 mb-6 stroke-1" aria-hidden="true" />
            <h3 className="text-3xl font-serif text-foreground mb-3 font-normal">Global Compliance</h3>
            <p className="text-foreground-muted font-normal leading-relaxed max-w-lg mb-6 font-brand">
              Where <strong className="text-foreground font-normal">Nexus</strong> (connections) and{" "}
              <strong className="text-foreground font-normal">Canon</strong> (regulations) achieve balance.
              Real-time mapping of compliance frameworks across your vendor network.
            </p>
            <div className="flex flex-wrap gap-2">
              {["GDPR", "CCPA", "ISO 27001"].map((tag) => (
                <StatusBadge key={tag} text={tag} />
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* SECURITY SECTION */}
      <Section id="security" className="py-24 scroll-mt-20">
        <div className="mb-12">
          <h2 className="text-4xl md:text-6xl font-serif leading-[1.1] mb-4 text-foreground font-normal">
            Security <span className="text-foreground/30 italic">First.</span>
          </h2>
          <div className="w-24 h-px bg-gradient-to-r from-foreground/40 to-transparent"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-border bg-background-elevated/50 p-8">
            <Lock className="w-8 h-8 text-foreground/80 mb-4 stroke-1" aria-hidden="true" />
            <h3 className="text-xl font-serif text-foreground mb-3 font-normal">Zero-Trust Architecture</h3>
            <p className="text-sm text-foreground-muted font-normal leading-relaxed font-brand">
              Every access request is verified, regardless of origin. No implicit trust assumptions.
            </p>
          </div>
          <div className="border border-border bg-background-elevated/50 p-8">
            <ShieldCheck className="w-8 h-8 text-foreground/80 mb-4 stroke-1" aria-hidden="true" />
            <h3 className="text-xl font-serif text-foreground mb-3 font-normal">Compliance Certified</h3>
            <p className="text-sm text-foreground-muted font-normal leading-relaxed font-brand">
              SOC 2 Type II, ISO 27001, GDPR compliant. Regular security audits and penetration testing.
            </p>
          </div>
          <div className="border border-border bg-background-elevated/50 p-8">
            <Fingerprint className="w-8 h-8 text-foreground/80 mb-4 stroke-1" aria-hidden="true" />
            <h3 className="text-xl font-serif text-foreground mb-3 font-normal">Immutable Audit Trails</h3>
            <p className="text-sm text-foreground-muted font-normal leading-relaxed font-brand">
              Blockchain-backed logs ensure complete transparency and non-repudiation of all actions.
            </p>
          </div>
        </div>
      </Section>

      {/* CTA SECTION */}
      <Section className="py-24">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex gap-1">
              {/* OPTIMIZED: success-500 */}
              {[1, 2, 3].map(i => <span key={i} className="w-2 h-2 rounded-full bg-success-500"></span>)}
            </div>
            <span className="text-[10px] font-normal font-brand uppercase tracking-[0.2em] text-foreground-muted">
              Secure Your Supply Chain
            </span>
          </div>
          <h2 className="text-4xl md:text-6xl font-serif leading-[1.1] mb-4 text-foreground font-normal">
            Secure your <span className="text-foreground/30 italic">supply chain.</span>
          </h2>
          <p className="text-lg text-foreground-muted font-normal leading-relaxed max-w-2xl mx-auto mb-8 font-brand">
            Join the world's most regulated organizations in achieving institutional-grade vendor governance.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <LandingButton className="py-4 px-10">Book Strategic Demo</LandingButton>
            </Link>
            <Link href="/docs">
              <LandingButton variant="outline" className="py-4 px-10">View Documentation</LandingButton>
            </Link>
          </div>
        </div>
      </Section>

      {/* FOOTER */}
      {/* OPTIMIZED: bg-background-elevated, border-border */}
      <footer className="border-t border-border py-8 px-6 md:px-12 bg-background-elevated">
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
