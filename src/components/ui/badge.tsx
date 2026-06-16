import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 font-mono text-[0.66rem] font-bold uppercase tracking-[0.22em] transition-colors",
  {
    variants: {
      variant: {
        default: "border-gold/40 bg-gold/95 text-primary-foreground shadow-glow",
        secondary: "border-white/10 bg-white/[0.055] text-secondary-foreground",
        outline: "border-white/14 bg-white/[0.018] text-foreground",
        gold: "border-gold/30 bg-gold/10 text-gold",
        blue: "border-mist-blue/30 bg-mist-blue/10 text-mist-blue",
        red: "border-burgundy-bright/30 bg-burgundy-bright/10 text-burgundy-soft"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
