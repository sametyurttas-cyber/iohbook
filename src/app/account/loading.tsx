import { Container } from "@/components/layout/container";

export default function AccountLoading() {
  return (
    <main className="min-h-screen bg-ink py-10 text-paper">
      <Container>
        <div className="grid gap-5">
          <div className="h-10 w-48 animate-pulse rounded-2xl bg-white/10" />
          <div className="flex flex-wrap gap-2">
            <div className="h-11 w-32 animate-pulse rounded-full bg-white/10" />
            <div className="h-11 w-36 animate-pulse rounded-full bg-white/10" />
            <div className="h-11 w-28 animate-pulse rounded-full bg-white/10" />
          </div>
          <div className="h-80 animate-pulse rounded-2xl border border-white/10 bg-card" />
        </div>
      </Container>
    </main>
  );
}
