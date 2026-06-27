import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { BooksIndexFooter } from "@/features/catalog/books-index-scene";
import { AccountNav } from "@/components/layout/account-nav";
import { IohSceneHeader } from "@/components/layout/ioh-scene-header";
import { IohIndexStyles } from "@/features/home/ioh-index-landing";
import { signOut } from "@/features/auth/actions";
import {
  getAccountOrderCount,
  getAccountPointBalance,
  getAccountProfile,
  listAccountDownloads,
  requireAccountUser
} from "@/features/account/queries";
import { listAccountUserWallets } from "@/features/wallets/queries";
import { shortenWalletAddress } from "@/features/account/account-utils";
import styles from "@/features/account/account-scene.module.css";

export const metadata: Metadata = {
  robots: {
    follow: false,
    index: false
  },
  title: "Hesabim"
};

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await requireAccountUser();
  const profile = await getAccountProfile();
  const [points, orderCount, downloads, wallets] = await Promise.all([
    getAccountPointBalance(),
    getAccountOrderCount(),
    listAccountDownloads(),
    listAccountUserWallets()
  ]);

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const displayName = profile?.full_name || profile?.email || user.email || "Hesabim";
  const firstWallet = wallets[0];
  const userView = {
    displayName,
    points: points.balance,
    email: profile?.email || user.email || "",
    orderCount
  };

  return (
    <div className={styles.page}>
      <IohIndexStyles />
      <style dangerouslySetInnerHTML={{ __html: "body{cursor:auto!important}a,button,[data-hover],[data-magnet]{cursor:pointer!important}" }} />
      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />
      <IohSceneHeader user={userView} />
      <main className={styles.main} id="main-content">
        <section className={styles.hero}>
          <div className={styles.heroGhost} aria-hidden="true">ARCHIVE</div>
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={`${styles.shell} ${styles.heroShell}`}>
            <p className={styles.kicker}>MÜŞTERİ HESABI / IOH ARCHIVE</p>
            <h1 className={styles.heroTitle}>Kisisel IOH Arşivin</h1>
            <p className={styles.heroLead}>
              Siparislerin, dijital kitaplarin, IOH puanin, cuzdanlarin ve
              koleksiyonlarin tek merkezde.
            </p>
            <form action={signOut}>
              <button className={styles.heroSignOut} type="submit">
                Cikis yap
              </button>
            </form>
          </div>
          <aside className={styles.infoPanel}>
            <div className={styles.infoHead}>
              <p className={styles.kicker}>IOH / KULLANICI</p>
              <h2 className={styles.infoName}>{displayName}</h2>
              <p className={styles.infoEmail}>{profile?.email ?? user.email}</p>
            </div>
            <div className={styles.infoRows}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>IOH Puan</span>
                <span className={styles.infoValueGold}>{points.balance}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Siparis</span>
                <span className={styles.infoValue}>{orderCount}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Indirilebilir</span>
                <span className={styles.infoValue}>{downloads.length}</span>
              </div>
              {firstWallet ? (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Wallet</span>
                  <span className={styles.infoValue}>{shortenWalletAddress(firstWallet.normalized_address)}</span>
                </div>
              ) : null}
            </div>
          </aside>
        </section>

        <AccountNav activePath={pathname} />

        <section className={styles.content}>
          <div className={styles.shell}>
            {children}
          </div>
        </section>

        <BooksIndexFooter />
      </main>
    </div>
  );
}
