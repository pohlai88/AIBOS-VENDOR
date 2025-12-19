import {
  ShieldCheck,
  Building2,
  Zap,
  Lock,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface NavLink {
  name: string;
  href: string;
}

export interface Metric {
  label: string;
  val: string;
  delta: string;
  icon: LucideIcon;
}

export const NAV_LINKS: NavLink[] = [
  { name: "Governance", href: "#governance" },
  { name: "Security", href: "#security" },
];

export const COMPLIANCE_BADGES: string[] = ["SOC2 TYPE II", "ISO 27001", "GDPR"];

export const HERO_CHECKPOINTS: string[] = [
  "Zero-trust vendor verification",
  "Continuous financial health monitoring",
  "Immutable audit trails",
];

export const METRICS: Metric[] = [
  { label: "Active Vendors", val: "1,240", delta: "+12%", icon: Building2 },
  { label: "Compliance", val: "99.9%", delta: "+0.4%", icon: ShieldCheck },
  { label: "Spend Vol", val: "$2.4B", delta: "Q3", icon: Zap },
  { label: "Risk Alerts", val: "0", delta: "Active", icon: Lock },
];

export const TRUSTED_PROFESSIONALS: string[] = [
  "Auditors",
  "Accountants",
  "Venture Capitals",
  "Private Equity",
  "Compliance Officers",
  "Risk Managers",
  "CFOs",
  "Legal Counsel",
];
