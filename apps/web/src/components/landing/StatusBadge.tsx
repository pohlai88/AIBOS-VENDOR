import { memo } from "react";

interface StatusBadgeProps {
  text: string;
}

export const StatusBadge = memo(function StatusBadge({ text }: StatusBadgeProps) {
  return (
    <div className="px-3 py-1 border border-border bg-background-elevated text-[9px] font-normal font-brand tracking-wider text-foreground-muted">
      {text}
    </div>
  );
});
