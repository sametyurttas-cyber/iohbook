import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type SectionProps = HTMLAttributes<HTMLElement> & {
  tone?: "default" | "muted" | "ink";
};

const sectionTones = {
  default: "bg-transparent",
  muted:
    "border-y border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.012))]",
  ink: "bg-ink/86"
};

export function Section({
  className,
  tone = "default",
  ...props
}: SectionProps) {
  return (
    <section
      className={cn("relative py-16 md:py-22", sectionTones[tone], className)}
      {...props}
    />
  );
}
