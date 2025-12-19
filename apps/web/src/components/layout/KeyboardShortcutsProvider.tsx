"use client";

import { ReactNode } from "react";
import { useNavigationShortcuts } from "@/hooks/useKeyboardShortcuts";

export function KeyboardShortcutsProvider({ children }: { children: ReactNode }) {
  useNavigationShortcuts();
  return <>{children}</>;
}
