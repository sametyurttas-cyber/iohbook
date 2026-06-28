import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonTelemetryProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "gold" | "red" | "blue" | "magenta" | "neutral";
  label?: string;
}

export function SkeletonTelemetry({
  className,
  variant = "neutral",
  label = "SYNCHRONIZING SYSTEM CORES...",
  ...props
}: SkeletonTelemetryProps) {
  // Variant configurations matching sector style accents
  const colorMap = {
    gold: {
      border: "border-gold/20",
      accent: "rgba(242, 201, 109, 0.05)",
      glow: "shadow-[0_0_15px_rgba(242,201,109,0.04)]",
      line: "rgba(242, 201, 109, 0.45)",
      text: "text-gold/50"
    },
    red: {
      border: "border-red-500/20",
      accent: "rgba(239, 68, 68, 0.05)",
      glow: "shadow-[0_0_15px_rgba(239,68,68,0.04)]",
      line: "rgba(239, 68, 68, 0.45)",
      text: "text-red-500/50"
    },
    blue: {
      border: "border-cyan-400/20",
      accent: "rgba(34, 211, 238, 0.05)",
      glow: "shadow-[0_0_15px_rgba(34,211,238,0.04)]",
      line: "rgba(34, 211, 238, 0.45)",
      text: "text-cyan-400/50"
    },
    magenta: {
      border: "border-fuchsia-500/20",
      accent: "rgba(217, 70, 239, 0.05)",
      glow: "shadow-[0_0_15px_rgba(217,70,239,0.04)]",
      line: "rgba(217, 70, 239, 0.45)",
      text: "text-fuchsia-500/50"
    },
    neutral: {
      border: "border-white/10",
      accent: "rgba(255, 255, 255, 0.03)",
      glow: "shadow-none",
      line: "rgba(255, 255, 255, 0.25)",
      text: "text-white/35"
    }
  };

  const current = colorMap[variant];

  return (
    <div
      className={cn(
        "relative overflow-hidden border bg-ink/70 select-none",
        current.border,
        current.glow,
        className
      )}
      style={{
        borderRadius: "0px",
        backgroundColor: current.accent
      }}
      {...props}
    >
      {/* Scanning scanning beam animation overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.015] to-transparent animate-pulse" />
      
      {/* Laser line diagnostic sweeper */}
      <div 
        className="absolute inset-x-0 top-0 h-[1.5px] animate-shimmer" 
        style={{
          backgroundImage: `linear-gradient(to right, transparent, ${current.line}, transparent)`
        }} 
      />

      {/* Grid pattern background */}
      <div 
        className="absolute inset-0 opacity-[0.025] pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
          backgroundSize: "14px 14px"
        }}
      />

      {/* Shimmer animation */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />

      {/* Diagnostic status tag */}
      {label && (
        <div className={cn("absolute bottom-2.5 left-3.5 font-mono text-[0.52rem] tracking-wider uppercase animate-pulse", current.text)}>
          [{label}]
        </div>
      )}
    </div>
  );
}
