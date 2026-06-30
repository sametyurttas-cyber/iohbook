import Link from "next/link";
import type { Metadata } from "next";
import { PublicAtmosphere } from "@/components/layout/public-atmosphere";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUpWithPassword, signInWithGoogle } from "@/features/auth/actions";
import {
  getReferralCodeFromCookie,
  isReferralInputValid,
  normalizeReferralInput
} from "@/features/referrals/cookie";
import { buildNoIndexMetadata } from "@/lib/seo";

type SignUpPageProps = {
  searchParams?: Promise<{
    error?: string;
    ref?: string;
    next?: string;
  }>;
};

export const metadata: Metadata = buildNoIndexMetadata(
  "Hesap olustur",
  "IOH hesap olusturma sayfasi."
);

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const next = params?.next ?? "/account";
  const referralCodeFromUrl = normalizeReferralInput(params?.ref);
  const referralCode =
    isReferralInputValid(referralCodeFromUrl) ? referralCodeFromUrl : await getReferralCodeFromCookie();
  const errorMessage =
    params?.error === "email-rate-limit"
      ? "Su anda cok fazla dogrulama e-postasi istendi. Biraz bekleyip tekrar dene."
      : params?.error === "email-already-registered"
        ? "Bu e-posta zaten kayitli. Giris yapmayi ya da sifre sifirlamayi dene."
        : params?.error === "weak-password"
          ? "Sifre en az 8 karakter olmali."
        : params?.error
          ? "Kayit tamamlanamadi. Bilgileri kontrol et."
          : null;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16" id="main-content">
      <PublicAtmosphere />
      <div className="dark-panel w-full max-w-md rounded-[1.35rem] p-6">
        <Link className="mono-label text-gold transition-colors hover:text-gold-soft" href="/">
          IOH Universe
        </Link>
        <p className="mono-label mt-8 text-mist/70">IOH account</p>
        <h1 className="mt-3 font-display text-title-lg text-paper">Hesap olustur</h1>
        {errorMessage ? (
          <p className="mt-3 rounded-2xl border border-burgundy-bright/30 bg-burgundy-bright/10 p-3 text-sm text-burgundy-soft">
            {errorMessage}
          </p>
        ) : null}
        {referralCode ? (
          <p className="mt-3 rounded-2xl border border-gold/30 bg-gold/10 p-3 text-sm text-gold">
            Davet kodu algilandi. Kayittan sonra uygun oldugunda IOH odulu
            kazanabilirsin.
          </p>
        ) : null}
        <form action={signUpWithPassword} className="mt-6 grid gap-4">
          <input name="next" type="hidden" value={next} />
          {referralCode ? <input name="referral_code" type="hidden" value={referralCode} /> : null}
          <Input autoComplete="name" name="full_name" placeholder="Ad Soyad" />
          <Input autoComplete="email" name="email" placeholder="E-posta" type="email" />
          <Input
            autoComplete="new-password"
            name="password"
            placeholder="Sifre"
            type="password"
          />
          <Button type="submit">Kayit Ol</Button>
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

        <p className="mt-5 text-sm text-muted-foreground">
          Zaten hesabin var mi?{" "}
          <Link className="text-gold hover:underline" href="/sign-in">
            Giris yap
          </Link>
        </p>
      </div>
    </main>
  );
}
