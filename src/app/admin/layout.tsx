import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { getCurrentUser, requireStaff } from "@/features/auth/queries";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in?next=/admin");
  }

  const staff = await requireStaff();

  if (!staff) {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-charcoal/40">
      <header className="border-b border-border bg-ink px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-eyebrow uppercase text-muted-foreground">IOH Admin</p>
            <p className="font-display text-title-md text-paper">Operations</p>
          </div>
          <p className="text-sm text-muted-foreground">
            Roles: {staff.roles.join(", ")}
          </p>
        </div>
        <nav className="mx-auto mt-4 flex max-w-7xl flex-wrap gap-2">
          {[
            { href: "/admin/products", label: "Urunler" },
            { href: "/admin/nft-orders", label: "NFT Siparisleri" },
            { href: "/admin/token-campaigns", label: "Token Kampanyalari" },
            { href: "/admin/token-sales", label: "Token Satislari" },
            { href: "/admin/orders", label: "Siparisler" },
            { href: "/admin/content", label: "Icerik" },
            { href: "/admin/media", label: "Medya" }
          ].map((item) => (
            <Link
              className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-gold/40 hover:text-gold"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}
