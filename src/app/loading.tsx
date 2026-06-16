import { Container } from "@/components/layout/container";

export default function Loading() {
  return (
    <main className="min-h-screen bg-ink py-16 text-paper">
      <Container>
        <div className="grid gap-6">
          <div className="h-4 w-36 animate-pulse rounded-full bg-gold/25" />
          <div className="h-16 max-w-2xl animate-pulse rounded-2xl bg-white/10" />
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-64 animate-pulse rounded-2xl border border-white/10 bg-card" />
            <div className="h-64 animate-pulse rounded-2xl border border-white/10 bg-card" />
            <div className="h-64 animate-pulse rounded-2xl border border-white/10 bg-card" />
          </div>
        </div>
      </Container>
    </main>
  );
}
