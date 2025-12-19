"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function LoadingBar() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) return;

    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [pathname, prefersReducedMotion]);

  if (!loading || prefersReducedMotion) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-success-500/20 z-50" role="progressbar" aria-label="Page loading">
      <div className="h-full bg-success-500 animate-pulse" style={{ width: "100%" }} />
    </div>
  );
}
