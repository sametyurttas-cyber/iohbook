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
      <div className="dark-panel w-full max-w-md rounded-[1.5rem] p-8 border border-[#e7c574]/15 relative overflow-hidden shadow-[0_24px_90px_rgba(0,0,0,0.6),0_0_40px_rgba(231, 197, 116, 0.02)]">
        <Link className="mono-label text-gold transition-colors hover:text-gold-soft tracking-[0.25em]" href="/">
          IOH Universe
        </Link>
        <p className="mono-label mt-8 text-mist/50 text-[0.62rem] tracking-[0.3em]">// SECURE_LOGIN_GATEWAY</p>
        <h1 className="mt-2 font-display text-2xl text-paper tracking-wide">Giriş Yap</h1>
        <div className="h-[1px] w-12 bg-gradient-to-r from-[#e7c574] to-transparent mt-2 mb-6" />

        {params?.["pending-confirmation"] ? (
          <p className="mb-4 rounded-xl border border-gold/30 bg-gold/5 p-3 text-xs text-gold font-mono leading-relaxed">
            Kayit olusturuldu. {params?.email ? `${params.email} adresini kontrol edip ` : ""}
            e-posta dogrulamasini tamamladiktan sonra giris yap.
          </p>
        ) : null}
        {params?.confirmed ? (
          <p className="mb-4 rounded-xl border border-gold/30 bg-gold/5 p-3 text-xs text-gold font-mono leading-relaxed">
            E-posta dogrulandi. Artik giris yapabilirsin.
          </p>
        ) : null}
        {params?.error ? (
          <p className="mb-4 rounded-xl border border-burgundy-bright/30 bg-burgundy-bright/5 p-3 text-xs text-burgundy-soft font-mono leading-relaxed">
            {params.error === "email-not-confirmed"
              ? "Bu hesap icin e-posta dogrulamasi gerekiyor."
              : params.error === "oauth-failed"
                ? "Google ile giris basarisiz oldu. Lutfen tekrar dene."
                : "Giris bilgilerini kontrol et."}
          </p>
        ) : null}

        <form action={signInWithPassword} className="grid gap-4">
          <input name="next" type="hidden" value={next} />
          <Input 
            autoComplete="email" 
            name="email" 
            placeholder="E-posta adresi" 
            type="email" 
            className="border-white/10 bg-black/40 text-paper focus-visible:ring-[#e7c574]/40 focus-visible:border-[#e7c574]/40 focus-visible:ring-1 rounded-lg placeholder:text-mist/30"
          />
          <Input
            autoComplete="current-password"
            name="password"
            placeholder="Şifre"
            type="password"
            className="border-white/10 bg-black/40 text-paper focus-visible:ring-[#e7c574]/40 focus-visible:border-[#e7c574]/40 focus-visible:ring-1 rounded-lg placeholder:text-mist/30"
          />
          <Button type="submit" className="w-full bg-gradient-to-r from-[#e7c574] to-[#cba353] hover:from-[#f2d897] hover:to-[#e7c574] text-[#050507] font-mono text-xs font-bold tracking-[0.2em] uppercase py-3 rounded-lg shadow-lg hover:shadow-[#e7c574]/10 transition-all duration-300 border-none cursor-pointer">
            Giriş Yap
          </Button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5" />
          </div>
          <span className="relative bg-[#050507] px-3 font-mono text-[0.55rem] tracking-[0.25em] text-mist/40 uppercase">// LINK_GATEWAY</span>
        </div>

        <form action={signInWithGoogle}>
          <input name="next" type="hidden" value={next} />
          <Button type="submit" variant="outline" className="w-full flex items-center justify-center gap-3 border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.06] text-paper font-mono text-xs tracking-[0.15em] uppercase py-3 rounded-lg transition-all duration-300 cursor-pointer shadow-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Google ile Devam Et
          </Button>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-xs text-mist/60 font-mono">
          <p>
            Hesabın yok mu?{" "}
            <Link
              className="text-gold hover:text-gold-soft transition-colors"
              href={next ? `/sign-up?next=${encodeURIComponent(next)}` : "/sign-up"}
            >
              Kayıt ol
            </Link>
          </p>
          <Link className="text-gold hover:text-gold-soft transition-colors" href="/forgot-password">
            Şifremi unuttum
          </Link>
        </div>
      </div>
    </main>
  );
}
