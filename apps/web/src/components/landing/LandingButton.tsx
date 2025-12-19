import { memo, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LandingButtonProps {
  children: ReactNode;
  variant?: "primary" | "outline";
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

export const LandingButton = memo(function LandingButton({
  children,
  variant = "primary",
  className = "",
  type = "button",
  onClick,
}: LandingButtonProps) {
  const baseStyle =
    "flex items-center justify-center gap-3 px-6 py-3 transition-all duration-base group text-xs font-normal uppercase tracking-[0.2em] min-h-[44px] min-w-[44px]";
  const variants = {
    primary: "bg-foreground text-background border border-foreground hover:bg-foreground/90",
    outline: "border border-border text-foreground hover:bg-background-hover hover:border-border-hover",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(baseStyle, variants[variant], className)}
    >
      {children}
      <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
    </button>
  );
});
