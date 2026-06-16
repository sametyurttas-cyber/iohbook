import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-2 font-mono text-xs font-bold uppercase tracking-[0.16em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border border-gold/55 bg-gold text-primary-foreground shadow-glow hover:bg-gold-soft hover:shadow-[0_0_48px_rgba(242,201,109,0.28)]",
        secondary:
          "border border-white/10 bg-white/[0.055] text-secondary-foreground hover:border-mist-blue/40 hover:bg-mist-blue/10 hover:text-mist-pale",
        outline:
          "border border-white/14 bg-white/[0.025] text-foreground backdrop-blur hover:border-gold/45 hover:bg-gold/10 hover:text-gold",
        ghost: "text-foreground hover:bg-white/[0.055] hover:text-gold",
        destructive:
          "border border-burgundy-bright/45 bg-destructive text-destructive-foreground shadow-glow-red hover:bg-burgundy-bright"
      },
      size: {
        default: "h-11 px-4",
        sm: "h-11 px-3",
        lg: "h-12 px-6",
        icon: "h-11 w-11 px-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
