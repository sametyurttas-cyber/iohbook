import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16" id="main-content">
      <div className="w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-panel">
        <p className="text-eyebrow uppercase text-muted-foreground">Access denied</p>
        <h1 className="mt-3 font-display text-title-lg text-paper">
          Bu alan staff rolü gerektirir
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Müşteri hesabı ile giriş yaptın, ancak admin alanına erişmek için aktif
          owner, admin ops, editor veya fulfillment rolü gerekir.
        </p>
        <Button asChild className="mt-6" variant="outline">
          <Link href="/account">Hesabıma Dön</Link>
        </Button>
      </div>
    </main>
  );
}
