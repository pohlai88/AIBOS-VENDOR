import { memo } from "react";
import { LucideIcon } from "lucide-react";

interface Metric {
  label: string;
  val: string;
  delta: string;
  icon: LucideIcon;
}

interface MetricsGridProps {
  metrics: Metric[];
}

export const MetricsGrid = memo(function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10" role="region" aria-label="Platform metrics">
      {metrics.map((stat, i) => {
        const IconComponent = stat.icon;
        return (
          <div
            key={i}
            className="border border-border bg-background-elevated/30 p-6 hover:bg-background-hover transition-colors duration-base"
            role="group"
            aria-label={`${stat.label}: ${stat.val} ${stat.delta}`}
          >
            <div className="flex items-center justify-between mb-5">
              <IconComponent className="w-4 h-4 text-foreground-subtle" aria-hidden="true" />
              <p className="text-[9px] font-brand text-foreground-subtle uppercase tracking-widest font-normal">
                {stat.label}
              </p>
            </div>
            <p className="text-2xl font-serif text-foreground mb-2 font-normal" aria-live="polite">
              {stat.val}
            </p>
            <p className="text-[10px] text-success-500/70 font-brand tracking-wider font-normal">
              {stat.delta}
            </p>
          </div>
        );
      })}
    </div>
  );
});
