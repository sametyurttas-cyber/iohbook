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

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16" id="main-content">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-panel">
        <p className="text-eyebrow uppercase text-muted-foreground">IOH account</p>
        <h1 className="mt-3 font-display text-title-lg text-paper">Hesap oluştur</h1>
        {params?.error ? (
          <p className="mt-3 rounded-md border border-burgundy-bright/30 bg-burgundy-bright/10 p-3 text-sm text-burgundy-soft">
            Kayıt tamamlanamadı. Bilgileri kontrol et.
          </p>
        ) : null}
        <form action={signUpWithPassword} className="mt-6 grid gap-4">
          <Input autoComplete="name" name="full_name" placeholder="Ad Soyad" />
          <Input autoComplete="email" name="email" placeholder="E-posta" type="email" />
          <Input
            autoComplete="new-password"
            name="password"
            placeholder="Şifre"
            type="password"
          />
          <Button type="submit">Kayıt Ol</Button>
        </form>
        <p className="mt-5 text-sm text-muted-foreground">
          Zaten hesabın var mı?{" "}
          <Link className="text-gold hover:underline" href="/sign-in">
            Giriş yap
          </Link>
        </p>
      </div>
    </main>
  );
}
