import Link from "next/link";
import type { Metadata } from "next";
import { PublicAtmosphere } from "@/components/layout/public-atmosphere";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithPassword, signInWithGoogle } from "@/features/auth/actions";
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
              : params.error === "oauth-failed"
                ? "Google ile giris basarisiz oldu. Lutfen tekrar dene."
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

        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <span className="relative bg-[#05060a] px-3 font-mono text-[0.62rem] text-mist/50 uppercase">// VEYA</span>
        </div>

        <form action={signInWithGoogle}>
          <input name="next" type="hidden" value={next} />
          <Button type="submit" variant="outline" className="w-full flex items-center justify-center gap-2 border-white/10 text-paper hover:bg-white/5 cursor-pointer">
            <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
              <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.74-.08-1.306-.177-1.859H12.24z"/>
            </svg>
            Google ile Devam Et
          </Button>
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
