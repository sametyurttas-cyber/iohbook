import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import { getCurrentUser, requireStaff } from "@/features/auth/queries";
import type { StaffRole } from "@/types/database";
import styles from "@/features/admin/admin-scene.module.css";

type AdminLayoutProps = {
  children: ReactNode;
};

type AdminNavItem = {
  allowedRoles?: StaffRole[];
  href: string;
  label: string;
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

  const navItems = [
    { href: "/admin/products", label: "Urunler" },
    { href: "/admin/nft-orders", label: "NFT Siparisleri" },
    { href: "/admin/token-campaigns", label: "Token Kampanyalari" },
    { href: "/admin/token-sales", label: "Token Satislari" },
    { href: "/admin/orders", label: "Siparisler" },
    {
      allowedRoles: ["owner", "admin_ops", "fulfillment"],
      href: "/admin/users",
      label: "Kullanicilar"
    },
    {
      allowedRoles: ["owner", "admin_ops", "support"],
      href: "/admin/verifications",
      label: "Dogrulamalar"
    },
    {
      allowedRoles: ["owner", "admin_ops", "support"],
      href: "/admin/emails",
      label: "Mailler"
    },
    {
      allowedRoles: ["owner", "admin_ops", "support"],
      href: "/admin/analytics",
      label: "Analitik"
    },
    { href: "/admin/content", label: "Icerik" },
    { href: "/admin/media", label: "Medya" }
  ] satisfies AdminNavItem[];
  const visibleNavItems = navItems.filter(
    (item) => !item.allowedRoles || item.allowedRoles.some((role) => staff.roles.includes(role))
  );

  return (
    <div className={styles.page}>
      <div className={styles.bgGrid} aria-hidden="true" />
      <div className={styles.bgGlow} aria-hidden="true" />

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <p className={styles.brandKicker}>IOH / Operations Center</p>
            <h1 className={styles.brandTitle}>
              <b>IOH</b> Admin
            </h1>
          </div>
          <div className={styles.roles}>
            {staff.roles.map((role) => (
              <span className={styles.roleTag} key={role}>{role}</span>
            ))}
          </div>
        </div>
        <nav aria-label="Admin navigasyonu" className={styles.nav}>
          {visibleNavItems.map((item) => (
            <Link className={styles.navLink} href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {children}

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerMeta}>
            <span>IOH Admin <b>v1.0</b></span>
            <span>Kullanici: <b>{user.email}</b></span>
            <span>Rol: <b>{staff.roles.join(", ")}</b></span>
          </div>
          <span className={styles.footerStatus}>Sistem Aktif</span>
        </div>
      </footer>
    </div>
  );
}
