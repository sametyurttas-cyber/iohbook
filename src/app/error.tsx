"use client";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

export default function Error({
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
          <p className="mono-label text-gold">IOH Sistem</p>
          <h1 className="mt-4 font-display text-display-sm text-paper">
            Bir hata olustu
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-mist">
            Sayfa yuklenirken beklenmeyen bir sorun yasandi. Tekrar deneyebilir
            veya ana sayfaya donup islemi bastan baslatabilirsin.
          </p>
          {error.digest ? (
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Hata kodu: {error.digest}
            </p>
          ) : null}
          <Button className="mt-6" onClick={reset} type="button">
            Tekrar dene
          </Button>
        </div>
      </Container>
    </main>
  );
}
