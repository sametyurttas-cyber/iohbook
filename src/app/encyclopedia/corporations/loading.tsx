import { SkeletonTelemetry } from "@/components/ui/skeleton-telemetry";

export default function CorporationsLoading() {
  return (
    <div className="min-h-screen bg-[#05060a] text-[#F6F0DF] p-6 md:p-12 flex flex-col justify-between select-none">
      {/* Header skeleton */}
      <div className="flex justify-between items-center border-b border-white/10 pb-5 mb-8">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gold/10 border border-gold/20 animate-pulse" />
          <div className="h-4 w-24 bg-white/10 rounded" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col my-6">
        {/* Title skeleton */}
        <div className="mb-10 text-left">
          <div className="h-3.5 w-48 bg-white/5 mb-3.5 rounded animate-pulse" />
          <div className="h-8 w-64 bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-full bg-white/5 rounded mt-4 max-w-xl" />
        </div>

        {/* Stacked list of corporate profile card skeletons */}
        <div className="flex flex-col gap-6">
          <SkeletonTelemetry variant="red" className="h-[180px]" label="FETCHING INTEL: AGROM TECHNOLOGY..." />
          <SkeletonTelemetry variant="red" className="h-[180px]" label="FETCHING INTEL: TENCON CONGLOMERATE..." />
          <SkeletonTelemetry variant="red" className="h-[180px]" label="FETCHING INTEL: QUALITY ENERGY..." />
        </div>
      </div>

      <div className="h-12 w-full border-t border-white/10 mt-8 opacity-40" />
    </div>
  );
}
