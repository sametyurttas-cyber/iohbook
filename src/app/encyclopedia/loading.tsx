import { SkeletonTelemetry } from "@/components/ui/skeleton-telemetry";

export default function EncyclopediaLoading() {
  return (
    <div className="min-h-screen bg-[#05060a] text-[#F6F0DF] p-6 md:p-12 flex flex-col justify-between select-none">
      {/* Header skeleton */}
      <div className="flex justify-between items-center border-b border-white/10 pb-5 mb-8">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gold/10 border border-gold/20 animate-pulse" />
          <div className="h-4 w-24 bg-white/10 rounded" />
        </div>
        <div className="hidden md:flex gap-6">
          <div className="h-3 w-12 bg-white/5 rounded" />
          <div className="h-3 w-16 bg-white/5 rounded" />
          <div className="h-3 w-14 bg-white/5 rounded" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col justify-center my-6">
        {/* Title skeleton */}
        <div className="mb-12 text-center">
          <div className="h-3.5 w-48 bg-white/5 mx-auto mb-3.5 rounded animate-pulse" />
          <div className="h-7 w-80 bg-white/10 mx-auto rounded animate-pulse" />
        </div>

        {/* 2x2 grid console loading state */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonTelemetry variant="gold" className="h-[230px]" label="INITIALIZING RESISTANCE DOSSIERS..." />
          <SkeletonTelemetry variant="red" className="h-[230px]" label="ACCESSING CORPORATE DATABASE..." />
          <SkeletonTelemetry variant="blue" className="h-[230px]" label="CONNECTING TO STATE AUTHORITY..." />
          <SkeletonTelemetry variant="magenta" className="h-[230px]" label="LINKING TO QUANTUM CORES..." />
        </div>
      </div>

      <div className="h-12 w-full border-t border-white/10 mt-8 opacity-40" />
    </div>
  );
}
