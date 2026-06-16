"use client";

import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export default function CheckoutError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center bg-ink py-16 text-paper">
      <Container className="max-w-3xl">
        <div className="rounded-2xl border border-white/10 bg-card p-8 shadow-panel">
          <p className="mono-label text-gold">Checkout</p>
          <h1 className="mt-4 font-display text-display-sm text-paper">
            Odeme adimi tamamlanamadi
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-mist">
            Siparis bilgileri kontrol edilirken bir sorun olustu. Sepete donup
            urunleri kontrol edebilir veya islemi tekrar deneyebilirsin.
          </p>
          {error.digest ? (
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Hata kodu: {error.digest}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={reset} type="button">
              Tekrar dene
            </Button>
            <Button asChild variant="outline">
              <Link href="/cart">Sepete don</Link>
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
