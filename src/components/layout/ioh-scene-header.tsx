import Link from "next/link";
import styles from "./ioh-scene-header.module.css";

export type IohSceneHeaderUser = {
  displayName: string;
  points: number;
} | null;

const navItems = [
  { href: "/", label: "Evren" },
  { href: "/books", label: "Kitaplar" },
  { href: "/token-sale", label: "Iohcoin" },
  { href: "/author", label: "Yazar Hakkinda" },
  { href: "/nft", label: "NFT Galeri" },
  { href: "/journal", label: "Gunluk/Blog" },
  { href: "/cart", label: "Sepet" },
  { href: "/contact", label: "Iletisim" }
] as const;

export function IohSceneHeader({ user }: { user: IohSceneHeaderUser }) {
  return (
    <header className={`site-head is-solid ${styles.header}`}>
      <Link className="logo" href="/" data-hover="">
        <b>IOH</b>
        <span className={styles.logoText}>UNIVERSE</span>
      </Link>
      <nav className="site-nav" aria-label="Ana menu">
        {navItems.map((item) => (
          <Link href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className={`head-actions ${styles.actions}`}>
        {user ? (
          <>
            <Link className={`head-cta ${styles.cta} ${styles.userName}`} href="/account" data-hover="" data-magnet="">
              {user.displayName}
            </Link>
            <Link className={`head-cta ${styles.cta}`} href="/account/profile" data-hover="" data-magnet="">
              IOH Puan: {user.points}
            </Link>
          </>
        ) : (
          <>
            <Link className={`head-cta ${styles.cta}`} href="/sign-in" data-hover="" data-magnet="">
              Giris
            </Link>
            <Link className={`head-cta ${styles.cta}`} href="/sign-up" data-hover="" data-magnet="">
              Uye Ol
            </Link>
          </>
        )}
        <Link
          className={`head-cta ${styles.cta} ${styles.collectionAction}`}
          href="/collections"
          data-hover=""
          data-magnet=""
        >
          Koleksiyona Gir
        </Link>
      </div>
    </header>
  );
}
