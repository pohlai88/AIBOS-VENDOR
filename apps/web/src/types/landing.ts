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

export interface HeroCheckpoint {
  text: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  tags?: string[];
}
