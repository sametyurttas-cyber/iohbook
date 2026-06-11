import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signUpWithPassword } from "@/features/auth/actions";

type SignUpPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
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
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-panel">
        <p className="text-eyebrow uppercase text-muted-foreground">IOH account</p>
        <h1 className="mt-3 font-display text-title-lg text-paper">Hesap olustur</h1>
        {errorMessage ? (
          <p className="mt-3 rounded-md border border-burgundy-bright/30 bg-burgundy-bright/10 p-3 text-sm text-burgundy-soft">
            {errorMessage}
          </p>
        ) : null}
        <form action={signUpWithPassword} className="mt-6 grid gap-4">
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
