import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { requestPasswordReset } from "@/features/auth/actions";
import { buildNoIndexMetadata } from "@/lib/seo";

type ForgotPasswordPageProps = {
  searchParams?: Promise<{
    error?: string;
    sent?: string;
  }>;
};

export const metadata: Metadata = buildNoIndexMetadata(
  "Sifre sifirlama",
  "IOH hesap sifre sifirlama sayfasi."
);

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = await searchParams;

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <Section>
          <Container className="max-w-xl">
            <div className="rounded-lg border border-border bg-card p-6 shadow-panel">
              <p className="text-eyebrow uppercase text-muted-foreground">Account security</p>
              <h1 className="mt-3 font-display text-title-lg text-paper">Sifre sifirlama</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                E-posta adresinizi girin; size markali ve tek kullanimlik sifre
                sifirlama baglantisi gonderelim.
              </p>

              {params?.sent ? (
                <div className="mt-5 rounded-md border border-gold/30 bg-gold/10 p-3 text-sm text-gold">
                  Sifre sifirlama e-postasi gonderildi. Gelen kutunuzu kontrol edin.
                </div>
              ) : null}
              {params?.error ? (
                <div className="mt-5 rounded-md border border-burgundy-bright/30 bg-burgundy-bright/10 p-3 text-sm text-burgundy-soft">
                  Islem tamamlanamadi: {params.error}
                </div>
              ) : null}

              <form action={requestPasswordReset} className="mt-6 grid gap-4">
                <label className="grid gap-2 text-sm">
                  <span className="text-muted-foreground">E-posta</span>
                  <Input autoComplete="email" name="email" required type="email" />
                </label>
                <Button type="submit">Sifirlama baglantisi gonder</Button>
              </form>

              <Button asChild className="mt-4" variant="outline">
                <Link href="/sign-in">Giris sayfasina don</Link>
              </Button>
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
