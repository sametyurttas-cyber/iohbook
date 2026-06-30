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
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950/80 p-8 backdrop-blur-md shadow-2xl">
        <div className="mb-8">
          <Link className="text-sm font-semibold tracking-wider text-zinc-400 hover:text-white transition-colors uppercase" href="/">
            IOH Universe
          </Link>
          <h1 className="mt-3 font-sans text-2xl font-bold text-white tracking-tight">Giriş Yap</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Devam etmek için hesabınızla oturum açın.
          </p>
        </div>

        {params?.["pending-confirmation"] ? (
          <p className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-xs text-zinc-300 leading-relaxed font-sans">
            Kayıt oluşturuldu. {params?.email ? `${params.email} adresini kontrol edip ` : ""}
            e-posta doğrulamasını tamamladıktan sonra giriş yapabilirsiniz.
          </p>
        ) : null}
        {params?.confirmed ? (
          <p className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-xs text-zinc-300 leading-relaxed font-sans">
            E-posta doğrulandı. Artık giriş yapabilirsiniz.
          </p>
        ) : null}
        {params?.error ? (
          <p className="mb-6 rounded-lg border border-red-950/30 bg-red-950/10 p-4 text-xs text-red-400 leading-relaxed font-sans">
            {params.error === "email-not-confirmed"
              ? "Bu hesap için e-posta doğrulaması gerekiyor."
              : params.error === "oauth-failed"
                ? "Google ile giriş başarısız oldu. Lütfen tekrar deneyin."
                : "Giriş bilgilerini kontrol edin."}
          </p>
        ) : null}

        <form action={signInWithPassword} className="grid gap-4">
          <input name="next" type="hidden" value={next} />
          <Input 
            autoComplete="email" 
            name="email" 
            placeholder="E-posta adresi" 
            type="email" 
            className="border-zinc-800 bg-zinc-900/30 text-white focus-visible:ring-zinc-700 focus-visible:border-zinc-700 focus-visible:ring-1 rounded-lg placeholder:text-zinc-600"
          />
          <Input
            autoComplete="current-password"
            name="password"
            placeholder="Şifre"
            type="password"
            className="border-zinc-800 bg-zinc-900/30 text-white focus-visible:ring-zinc-700 focus-visible:border-zinc-700 focus-visible:ring-1 rounded-lg placeholder:text-zinc-600"
          />
          <Button type="submit" className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-medium py-3 rounded-lg transition-colors cursor-pointer border-none shadow-sm font-sans">
            Giriş Yap
          </Button>
        </form>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <span className="relative bg-zinc-950 px-3 text-xs text-zinc-500 font-sans">veya</span>
        </div>

        <form action={signInWithGoogle}>
          <input name="next" type="hidden" value={next} />
          <Button type="submit" variant="outline" className="w-full flex items-center justify-center gap-3 border border-zinc-800 hover:border-zinc-700 bg-zinc-900/20 hover:bg-zinc-900/50 text-white font-sans text-sm py-3 rounded-lg transition-all duration-300 cursor-pointer shadow-sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Google ile Devam Et
          </Button>
        </form>

        <div className="mt-8 flex flex-col gap-2 text-sm text-zinc-400 font-sans border-t border-zinc-800/50 pt-6">
          <p>
            Hesabınız yok mu?{" "}
            <Link
              className="text-white hover:underline transition-colors font-medium"
              href={next ? `/sign-up?next=${encodeURIComponent(next)}` : "/sign-up"}
            >
              Kayıt olun
            </Link>
          </p>
          <Link className="text-zinc-500 hover:text-white transition-colors text-xs" href="/forgot-password">
            Şifremi unuttum
          </Link>
        </div>
      </div>
    </main>
  );
}
