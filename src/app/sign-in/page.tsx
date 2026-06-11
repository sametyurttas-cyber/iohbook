import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithPassword } from "@/features/auth/actions";

type SignInPageProps = {
  searchParams?: Promise<{
    confirmed?: string;
    email?: string;
    error?: string;
    next?: string;
    "pending-confirmation"?: string;
  }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const next = params?.next ?? "/account";

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16" id="main-content">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-panel">
        <p className="text-eyebrow uppercase text-muted-foreground">Customer access</p>
        <h1 className="mt-3 font-display text-title-lg text-paper">Giris yap</h1>
        {params?.["pending-confirmation"] ? (
          <p className="mt-3 rounded-md border border-gold/30 bg-gold/10 p-3 text-sm text-gold">
            Kayit olusturuldu. {params?.email ? `${params.email} adresini kontrol edip ` : ""}
            e-posta dogrulamasini tamamladiktan sonra giris yap.
          </p>
        ) : null}
        {params?.confirmed ? (
          <p className="mt-3 rounded-md border border-gold/30 bg-gold/10 p-3 text-sm text-gold">
            E-posta dogrulandi. Artik giris yapabilirsin.
          </p>
        ) : null}
        {params?.error ? (
          <p className="mt-3 rounded-md border border-burgundy-bright/30 bg-burgundy-bright/10 p-3 text-sm text-burgundy-soft">
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
            <Link className="text-gold hover:underline" href="/sign-up">
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
