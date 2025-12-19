import Link from "next/link";
import type { Metadata } from "next";
import {
  ShieldCheck,
  Globe,
  ArrowUpRight,
  Building2,
  Fingerprint,
  Lock,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { NexusIcon } from '@/components/icons/NexusIcon';
import { BrandName } from '@/components/brand/BrandName';

export const metadata: Metadata = {
  title: "NexusCanon - Institutional-Grade Vendor Governance",
  description: "Eliminate supply chain opacity. Orchestrate global procurement, compliance, and risk mitigation from a single, institutional-grade terminal.",
};

// --- DATA LAYER (Move this to a separate file in production) ---

const NAV_LINKS = [
  { name: 'Platform', href: '#platform' },
  { name: 'Intelligence', href: '#intelligence' },
  { name: 'Governance', href: '#governance' },
  { name: 'Security', href: '#security' },
];

const COMPLIANCE_BADGES = ['SOC2 TYPE II', 'ISO 27001', 'GDPR'];

const HERO_CHECKPOINTS = [
  "Zero-trust vendor verification",
  "Continuous financial health monitoring",
  "Immutable audit trails"
];

const METRICS = [
  { label: "Active Vendors", val: "1,240", delta: "+12%", icon: Building2 },
  { label: "Compliance", val: "99.9%", delta: "+0.4%", icon: ShieldCheck },
  { label: "Spend Vol", val: "$2.4B", delta: "Q3", icon: Zap },
  { label: "Risk Alerts", val: "0", delta: "Active", icon: Lock },
];

const TRUSTED_PROFESSIONALS = ["Auditors", "Accountants", "Venture Capitals", "Private Equity", "Compliance Officers", "Risk Managers", "CFOs", "Legal Counsel"];

// --- REUSABLE UI COMPONENTS ---

const Section = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <section className={`px-6 md:px-12 ${className}`}>
    <div className="max-w-[1600px] mx-auto">{children}</div>
  </section>
);

const Button = ({ children, variant = 'primary', className = "" }: { children: React.ReactNode, variant?: 'primary' | 'outline', className?: string }) => {
  const baseStyle = "flex items-center justify-center gap-3 px-6 py-3 transition-all duration-base group text-xs font-normal uppercase tracking-[0.2em]";
  const variants = {
    primary: "bg-foreground text-background border border-foreground hover:bg-foreground/90",
    outline: "border border-border text-foreground hover:bg-background-hover hover:border-border-hover"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
      <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
    </button>
  );
};

const StatusBadge = ({ text }: { text: string }) => (
  <div className="px-3 py-1 border border-border bg-background-elevated text-[9px] font-normal font-brand tracking-wider text-foreground-muted">
    {text}
  </div>
);

// --- MAIN PAGE COMPONENT ---

export default function NexusCanonLanding() {
  return (
    // OPTIMIZED: Using design system tokens
    <div className="w-full min-h-screen bg-background text-foreground font-sans selection:bg-foreground/10 selection:text-foreground overflow-x-hidden">

      {/* NAVIGATION */}
      {/* OPTIMIZED: bg-background/80, border-border */}
      <nav className="fixed top-0 w-full z-fixed border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="w-10 h-10 flex items-center justify-center">
              <NexusIcon size="lg" animated />
            </div>
            <div className="hidden md:block border-l border-border pl-4 group-hover:border-success-500/30 transition-colors duration-base">
              <BrandName variant="compact" />
            </div>
          </Link>

          {/* OPTIMIZED: text-foreground-muted */}
          <div className="hidden lg:flex items-center gap-10 text-[10px] font-normal font-brand uppercase tracking-[0.25em] text-foreground-muted">
            {NAV_LINKS.map(link => (
              <Link key={link.name} href={link.href} className="hover:text-foreground transition-colors duration-base">
                {link.name}
              </Link>
            ))}
          </div>

          <Link href="/signup">
            {/* OPTIMIZED: border-border */}
            <button className="flex items-center gap-3 border border-border px-6 py-2.5 hover:bg-foreground hover:text-background hover:border-foreground transition-all duration-base group">
              <span className="text-[10px] font-normal uppercase tracking-[0.2em]">Request Access</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <Section className="pt-48 pb-36">
        {/* Status Bar */}
        {/* OPTIMIZED: border-border, success-500 */}
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
          <span className="text-[10px] font-brand tracking-wider text-foreground-subtle">v2.0.4</span>
          <div className="flex-1"></div>
          <div className="hidden md:flex items-center gap-3">
            {COMPLIANCE_BADGES.map(badge => <StatusBadge key={badge} text={badge} />)}
          </div>
        </div>

        {/* Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-24 items-end">
          <div className="lg:col-span-7 space-y-10">
            <h1 className="text-6xl md:text-9xl font-serif leading-[0.9] tracking-tight text-foreground">
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
            {/* OPTIMIZED: text-foreground-muted */}
            <p className="text-lg text-foreground-muted leading-relaxed font-light">
              Eliminate supply chain opacity. Orchestrate global procurement,
              compliance, and risk mitigation from a single,
              <span className="font-medium text-foreground"> institutional-grade terminal.</span>
            </p>

            <div className="space-y-3">
              {HERO_CHECKPOINTS.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  {/* OPTIMIZED: success-500 */}
                  <CheckCircle2 className="w-4 h-4 text-success-500" />
                  <p className="text-sm text-foreground-muted">{item}</p>
                </div>
              ))}
            </div>

            <div className="pt-6">
              <Link href="/signup">
                <Button className="w-full py-4">Book Strategic Demo</Button>
              </Link>
            </div>
          </div>
        </div>

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

            {/* OPTIMIZED: Using design system tokens */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
              {METRICS.map((stat, i) => {
                const IconComponent = stat.icon;
                return (
                  <div key={i} className="border border-border bg-background-elevated/30 p-6 hover:bg-background-hover transition-colors duration-base">
                    <div className="flex items-center justify-between mb-5">
                      <IconComponent className="w-4 h-4 text-foreground-subtle" />
                      <p className="text-[9px] font-brand text-foreground-subtle uppercase tracking-widest">{stat.label}</p>
                    </div>
                    <p className="text-2xl font-serif text-foreground mb-2">{stat.val}</p>
                    {/* OPTIMIZED: success-500 */}
                    <p className="text-[10px] text-success-500/70 font-brand tracking-wider">{stat.delta}</p>
                  </div>
                );
              })}
            </div>
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
              <span key={role} className="font-serif text-lg text-foreground/20 hover:text-foreground/40 transition-colors cursor-default">
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES GRID */}
      <Section className="py-24">
        <div className="mb-12">
          <h2 className="text-4xl md:text-6xl font-serif leading-[1.1] mb-4 text-foreground">
            Institutional <span className="text-foreground/30 italic">Governance.</span>
          </h2>
          <div className="w-24 h-px bg-gradient-to-r from-foreground/40 to-transparent"></div>
        </div>

        {/* OPTIMIZED: border-border */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-px bg-border border border-border overflow-hidden">
          {/* Feature 1 */}
          {/* OPTIMIZED: bg-background, hover:bg-background-hover */}
          <div className="md:col-span-8 bg-background p-8 md:p-12 hover:bg-background-hover transition-colors group">
            <ShieldCheck className="w-10 h-10 text-foreground/80 mb-6 stroke-1" />
            <h3 className="text-3xl font-serif text-foreground mb-3">Zero-Trust Risk Assessment</h3>
            <p className="text-foreground-muted font-light leading-relaxed max-w-lg mb-6">
              Automated background checks against 400+ global watchlists.
              Continuous monitoring of vendor financial health and reputational signals.
            </p>
            <div className="flex gap-2">
              {['AML', 'Sanctions', 'PEP'].map(tag => (
                <StatusBadge key={tag} text={tag} />
              ))}
            </div>
          </div>

          {/* Feature 2 */}
          <div className="md:col-span-4 bg-background p-8 md:p-12 hover:bg-background-hover transition-colors">
            <Fingerprint className="w-10 h-10 text-foreground/80 mb-6 stroke-1" />
            <h3 className="text-2xl font-serif text-foreground mb-3">Immutable Audit</h3>
            <p className="text-foreground-muted font-light leading-relaxed">
              Blockchain-backed logs for every contract interaction.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="md:col-span-4 bg-background p-8 md:p-12 hover:bg-background-hover transition-colors">
            <Building2 className="w-10 h-10 text-foreground/80 mb-6 stroke-1" />
            <h3 className="text-2xl font-serif text-foreground mb-3">Entity Management</h3>
            <p className="text-foreground-muted font-light leading-relaxed">
              Centralized hierarchy for parent-child vendor relationships.
            </p>
          </div>

          {/* Feature 4 - Global Compliance */}
          <div className="md:col-span-8 bg-background p-8 md:p-12 hover:bg-background-hover transition-colors group">
            <Globe className="w-10 h-10 text-foreground/80 mb-6 stroke-1" />
            <h3 className="text-3xl font-serif text-foreground mb-3">Global Compliance</h3>
            <p className="text-foreground-muted font-light leading-relaxed max-w-lg mb-6">
              Where <strong className="text-foreground font-normal">Nexus</strong> (connections) and <strong className="text-foreground font-normal">Canon</strong> (regulations) achieve balance.
              Real-time mapping of compliance frameworks across your vendor network.
            </p>
            <div className="flex flex-wrap gap-2">
              {['GDPR', 'CCPA', 'ISO 27001'].map(tag => (
                <StatusBadge key={tag} text={tag} />
              ))}
            </div>
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
          <h2 className="text-4xl md:text-6xl font-serif leading-[1.1] mb-4 text-foreground">
            Secure your <span className="text-foreground/30 italic">supply chain.</span>
          </h2>
          <p className="text-lg text-foreground-muted font-light leading-relaxed max-w-2xl mx-auto mb-8">
            Join the world's most regulated organizations in achieving institutional-grade vendor governance.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup">
              <Button className="py-4 px-10">Book Strategic Demo</Button>
            </Link>
            <Link href="/docs">
              <Button variant="outline" className="py-4 px-10">View Documentation</Button>
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
            <p className="text-xs text-foreground-subtle max-w-md text-center leading-relaxed">
              Institutional-grade vendor governance for the world's most regulated organizations.
            </p>
            <div className="pt-4 border-t border-border w-full flex flex-col md:flex-row justify-between items-center gap-2">
              <p className="text-[9px] font-brand text-foreground-subtle uppercase tracking-widest">© 2024 NexusCanon Governance Systems</p>
              <div className="flex gap-3">
                <Link href="#privacy" className="text-[9px] font-brand text-foreground-subtle uppercase tracking-widest hover:text-foreground transition-colors">Privacy</Link>
                <Link href="#terms" className="text-[9px] font-brand text-foreground-subtle uppercase tracking-widest hover:text-foreground transition-colors">Terms</Link>
                <Link href="#security" className="text-[9px] font-brand text-foreground-subtle uppercase tracking-widest hover:text-foreground transition-colors">Security</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
