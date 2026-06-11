import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SectionProps = HTMLAttributes<HTMLElement> & {
  tone?: "default" | "muted" | "ink";
};

const sectionTones = {
  default: "bg-transparent",
  muted: "border-y border-border bg-charcoal/35",
  ink: "bg-ink"
};

export function Section({
  className,
  tone = "default",
  ...props
}: SectionProps) {
  return (
    <section
      className={cn("py-16 md:py-22", sectionTones[tone], className)}
      {...props}
    />
  );
}
