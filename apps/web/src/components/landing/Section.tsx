import { memo, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export const Section = memo(function Section({ children, className = "", id }: SectionProps) {
  return (
    <section id={id} className={cn("px-6 md:px-12", className)}>
      <div className="max-w-[1600px] mx-auto">{children}</div>
    </section>
  );
});
