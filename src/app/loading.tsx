import { Container } from "@/components/layout/container";
import { SkeletonTelemetry } from "@/components/ui/skeleton-telemetry";

export default function Loading() {
  return (
    <main className="min-h-screen bg-ink py-16 text-paper">
      <Container>
        <div className="grid gap-6">
          {/* Section banner outline */}
          <div className="h-4 w-36 bg-white/10 rounded animate-pulse" />
          
          {/* Telemetry banner loader */}
          <SkeletonTelemetry variant="neutral" className="h-20 max-w-2xl" label="RETRIEVING DATA STREAM..." />
          
          {/* Modular grid loading blocks */}
          <div className="grid gap-6 md:grid-cols-3">
            <SkeletonTelemetry variant="neutral" className="h-64" label="ESTABLISHING CORE LINK..." />
            <SkeletonTelemetry variant="neutral" className="h-64" label="DECRYPTING SYSTEM MATRIX..." />
            <SkeletonTelemetry variant="neutral" className="h-64" label="SYNCHRONIZING..." />
          </div>
        </div>
      </Container>
    </main>
  );
}
