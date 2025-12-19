"use client";

export function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-foreground/5 to-transparent ${className}`}
      aria-hidden="true"
    />
  );
}
