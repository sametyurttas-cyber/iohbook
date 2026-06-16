import { Container } from "@/components/layout/container";

export default function AdminLoading() {
  return (
    <main className="min-h-screen bg-ink py-10 text-paper">
      <Container>
        <div className="grid gap-5">
          <div className="h-10 w-56 animate-pulse rounded-2xl bg-white/10" />
          <div className="h-20 animate-pulse rounded-2xl border border-white/10 bg-card" />
          <div className="h-96 animate-pulse rounded-2xl border border-white/10 bg-card" />
        </div>
      </Container>
    </main>
  );
}
