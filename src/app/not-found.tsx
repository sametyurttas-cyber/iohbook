import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center bg-ink py-16 text-paper">
      <Container className="max-w-3xl">
        <div className="rounded-2xl border border-white/10 bg-card p-8 shadow-panel">
          <p className="mono-label text-gold">404 / IOH</p>
          <h1 className="mt-4 font-display text-display-sm text-paper">
            Sayfa bulunamadi
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-mist">
            Aradigin sayfa tasinmis, silinmis veya henuz yayinlanmamis olabilir.
          </p>
          <Button asChild className="mt-6">
            <Link href="/">Ana sayfaya don</Link>
          </Button>
        </div>
      </Container>
    </main>
  );
}
