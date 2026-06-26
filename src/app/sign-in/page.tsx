import Link from "next/link";
import type { Metadata } from "next";
import { PublicAtmosphere } from "@/components/layout/public-atmosphere";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithPassword } from "@/features/auth/actions";
import { buildNoIndexMetadata } from "@/lib/seo";

type SignInPageProps = {
  searchParams?: Promise<{
    confirmed?: string;
    email?: string;
    error?: string;
    next?: string;
    "pending-confirmation"?: string;
  }>;
};

export const metadata: Metadata = buildNoIndexMetadata("Giris yap", "IOH hesap giris sayfasi.");

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const next = params?.next ?? "/account";

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16" id="main-content">
      <PublicAtmosphere />
      <div className="dark-panel w-full max-w-md rounded-[1.35rem] p-6">
        <Link className="mono-label text-gold transition-colors hover:text-gold-soft" href="/">
          IOH Universe
        </Link>
        <p className="mono-label mt-8 text-mist/70">Customer access</p>
        <h1 className="mt-3 font-display text-title-lg text-paper">Giris yap</h1>
        {params?.["pending-confirmation"] ? (
          <p className="mt-3 rounded-2xl border border-gold/30 bg-gold/10 p-3 text-sm text-gold">
            Kayit olusturuldu. {params?.email ? `${params.email} adresini kontrol edip ` : ""}
            e-posta dogrulamasini tamamladiktan sonra giris yap.
          </p>
        ) : null}
        {params?.confirmed ? (
          <p className="mt-3 rounded-2xl border border-gold/30 bg-gold/10 p-3 text-sm text-gold">
            E-posta dogrulandi. Artik giris yapabilirsin.
          </p>
        ) : null}
        {params?.error ? (
          <p className="mt-3 rounded-2xl border border-burgundy-bright/30 bg-burgundy-bright/10 p-3 text-sm text-burgundy-soft">
            {params.error === "email-not-confirmed"
              ? "Bu hesap icin e-posta dogrulamasi gerekiyor."
              : "Giris bilgilerini kontrol et."}
          </p>
        ) : null}
        <form action={signInWithPassword} className="mt-6 grid gap-4">
          <input name="next" type="hidden" value={next} />
          <Input autoComplete="email" name="email" placeholder="E-posta" type="email" />
          <Input
            autoComplete="current-password"
            name="password"
            placeholder="Sifre"
            type="password"
          />
          <Button type="submit">Giris Yap</Button>
        </form>
        <div className="mt-5 grid gap-2 text-sm text-muted-foreground">
          <p>
            Hesabin yok mu?{" "}
            <Link
              className="text-gold hover:underline"
              href={next ? `/sign-up?next=${encodeURIComponent(next)}` : "/sign-up"}
            >
              Kayit ol
            </Link>
          </p>
          <Link className="text-gold hover:underline" href="/forgot-password">
            Sifremi unuttum
          </Link>
        </div>
      </div>
    </main>
  );
}
