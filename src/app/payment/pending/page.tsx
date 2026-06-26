import Link from "next/link";
import type { Metadata } from "next";
import { BooksIndexFooter } from "@/features/catalog/books-index-scene";
import { getCurrentProfile, getCurrentUser } from "@/features/auth/queries";
import { getIohPointBalanceForProfile } from "@/features/points/queries";
import { IohIndexStyles } from "@/features/home/ioh-index-landing";
import { buildNoIndexMetadata } from "@/lib/seo";
import styles from "@/features/cart/cart-scene.module.css";

type PaymentPendingUser = {
  displayName: string;
  points: number;
} | null;

export const metadata: Metadata = buildNoIndexMetadata(
  "Odeme Bekleniyor — IOH",
  "Shopier odemeniz dogrulanmayi bekliyor."
);

function PendingHeader({ user }: { user: PaymentPendingUser }) {
  return (
    <header className="site-head is-solid">
      <Link className="logo" href="/" data-hover="">
        <b>IOH</b>
        <span>UNIVERSE</span>
      </Link>
      <nav className="site-nav" aria-label="Ana menu">
        <Link href="/">Evren</Link>
        <Link href="/books">Kitaplar</Link>
        <Link href="/token-sale">Iohcoin</Link>
        <Link href="/author">Yazar Hakkinda</Link>
        <Link href="/nft">NFT Galeri</Link>
        <Link href="/journal">Gunluk/Blog</Link>
        <Link href="/cart">Sepet</Link>
        <Link href="/contact">Iletisim</Link>
      </nav>
      <div className="head-actions">
        {user ? (
          <>
            <Link className="head-cta" href="/account" data-hover="" data-magnet="">
              {user.displayName}
            </Link>
            <Link className="head-cta" href="/account/profile" data-hover="" data-magnet="">
              IOH Puan: {user.points}
            </Link>
          </>
        ) : (
          <>
            <Link className="head-cta" href="/sign-in" data-hover="" data-magnet="">
              Giris
            </Link>
            <Link className="head-cta" href="/sign-up" data-hover="" data-magnet="">
              Uye Ol
            </Link>
          </>
        )}
        <Link className="head-cta" href="/collections" data-hover="" data-magnet="">
          Koleksiyona Gir
        </Link>
      </div>
    </header>
  );
}

export default async function PaymentPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const params = await searchParams;
  const orderNumber = params.order ?? null;

  const user = await getCurrentUser();
  let userView: PaymentPendingUser = null;

  if (user) {
    const [profile, points] = await Promise.all([
      getCurrentProfile(),
      getIohPointBalanceForProfile(user.id)
    ]);
    const displayName = profile?.full_name || profile?.email || user.email || "Hesabim";
    userView = { displayName, points: points?.balance ?? 0 };
  }

  return (
    <div className={styles.page}>
      <IohIndexStyles />
      <style dangerouslySetInnerHTML={{ __html: "body{cursor:auto!important}a,button,[data-hover],[data-magnet]{cursor:pointer!important}" }} />
      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />
      <PendingHeader user={userView} />
      <main className={styles.main} id="main-content">
        <section className={styles.hero} style={{ minHeight: "auto", padding: "8rem 0 3rem" }}>
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.heroShell} style={{ maxWidth: "640px" }}>
            <div className={styles.heroGhost} aria-hidden="true" style={{ fontSize: "clamp(6rem, 14vw, 14rem)" }}>
              PENDING
            </div>
            <p className={styles.kicker} style={{ justifyContent: "center" }}>ODEME BEKLENIYOR / IOH</p>
            <h1 className={styles.heroTitle} style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
              Odeme Bekleniyor
            </h1>
            <p className={styles.heroLead}>
              Shopier odemeniz dogrulaninca token hakkiniz hesabiniza islenecektir.
              Odeme Shopier uzerinde tamamlandiktan sonra hesabiniza donerek
              durumunuzu kontrol edebilirsiniz.
            </p>
          </div>
        </section>

        <section className={styles.cartBody} style={{ padding: "2rem 0 5rem" }}>
          <div className={styles.shell} style={{ maxWidth: "640px" }}>
            {orderNumber ? (
              <div className={styles.panel}>
                <div className={styles.panelHead}>
                  <h3 className={styles.panelTitle}>Siparis Bilgisi</h3>
                  <p className={styles.kicker}>ORDER</p>
                </div>
                <div className={styles.summaryRows}>
                  <div className={styles.summaryRow}>
                    <span className={styles.infoLabel} style={{ color: "var(--c-muted)", fontFamily: "var(--font-mono)", fontSize: "0.54rem", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                      Siparis No
                    </span>
                    <span style={{ color: "var(--c-ink)", fontFamily: "var(--font-mono)", fontSize: "0.92rem" }}>
                      {orderNumber}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}

            <div className={styles.trust}>
              <div className={styles.trustItem}>
                <span className={styles.trustCheck} aria-hidden="true">✓</span>
                <span>Odeme dogrulamasi backend tarafinda yapilir</span>
              </div>
              <div className={styles.trustItem}>
                <span className={styles.trustCheck} aria-hidden="true">✓</span>
                <span>Redirect basarisi odemeyi kesinlestirmez</span>
              </div>
              <div className={styles.trustItem}>
                <span className={styles.trustCheck} aria-hidden="true">✓</span>
                <span>Token hakki dogrulama sonrasi islenir</span>
              </div>
            </div>

            <div className={styles.heroActions} style={{ justifyContent: "center", marginTop: "2rem" }}>
              <Link className={styles.checkoutButton} href="/account/token-allocations">
                Token Haklarima Git <span aria-hidden="true">-&gt;</span>
              </Link>
              <Link className={styles.secondaryButton || styles.btnLink} href="/token-sale" style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "50px",
                padding: "0 1.45rem",
                border: "1px solid var(--c-line)",
                borderRadius: "999px",
                color: "var(--c-ink)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.67rem",
                letterSpacing: "0.14em",
                textDecoration: "none",
                textTransform: "uppercase"
              }}>
                Token Satisina Don
              </Link>
            </div>
          </div>
        </section>

        <BooksIndexFooter />
      </main>
    </div>
  );
}