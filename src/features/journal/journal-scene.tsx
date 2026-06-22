import Link from "next/link";
import type { ReactNode } from "react";
import { BooksIndexFooter } from "@/features/catalog/books-index-scene";
import { getCurrentProfile, getCurrentUser } from "@/features/auth/queries";
import { getIohPointBalanceForProfile } from "@/features/points/queries";
import { IohIndexStyles } from "@/features/home/ioh-index-landing";
import styles from "./journal-scene.module.css";

type JournalUser = {
  displayName: string;
  points: number;
} | null;

const journalEntries = [
  {
    description:
      "IOH evreninin kurulus surecinden notlar, sistem mimarisi ve zaman cizelgesi uzerine arka plan kayitlari.",
    number: "01",
    status: "Hazirlanıyor",
    tag: "Evren Notlari",
    title: "Evren Arşivi"
  },
  {
    description:
      "Algus, Centrium ve System hatlarindaki karakterlerin dosyalari, motivasyonlari ve iliski haritalari.",
    number: "02",
    status: "Yakinda",
    tag: "Karakter Dosyalari",
    title: "Karakter Kayitlari"
  },
  {
    description:
      "GODCODE, SYSGOD ve CODEWAR icin yayin takvimi, baski durumlari ve dijital format gelismeleri.",
    number: "03",
    status: "Yakinda",
    tag: "Kitap Gunlukleri",
    title: "Kitap Güncellemeleri"
  },
  {
    description:
      "IOHcoin puan katmani, topluluk etkinlikleri ve dijital erisim duyurulari icin resmi kayit alani.",
    number: "04",
    status: "Yakinda",
    tag: "IOHcoin / Topluluk",
    title: "Topluluk Duyurulari"
  }
] as const;

function Kicker({ children }: { children: ReactNode }) {
  return <p className={styles.kicker}>{children}</p>;
}

function JournalHeader({ user }: { user: JournalUser }) {
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

function JournalHero() {
  return (
    <section className={styles.hero} id="chronicle">
      <div className={styles.heroGhost} aria-hidden="true">CHRONICLE</div>
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={styles.heroShell}>
        <Kicker>JOURNAL / IOH UNIVERSE LOG</Kicker>
        <h1 className={styles.heroTitle}>IOH Chronicle</h1>
        <p className={styles.heroLead}>
          IOH Universe&apos;in arka plan notlari, kitap guncellemeleri, karakter
          kayitlari ve dijital evren duyurulari burada yayinlanacak.
        </p>
      </div>
      <div className={styles.scrollHint} aria-hidden="true">
        <span>SCROLL</span>
        <i />
      </div>
    </section>
  );
}

function JournalMarquee() {
  return (
    <div className={styles.marquee} aria-hidden="true">
      <div>
        <span>IOH CHRONICLE / EVREN ARŞIVI / KAYIT MERKEZI / YAYIN GUNLUGU /</span>
        <span>IOH CHRONICLE / EVREN ARŞIVI / KAYIT MERKEZI / YAYIN GUNLUGU /</span>
      </div>
    </div>
  );
}

function JournalFeatured() {
  return (
    <section className={styles.featured} id="featured">
      <div className={styles.shell}>
        <div className={styles.featuredHeader}>
          <Kicker>01 / ONE CIKAN YAZI</Kicker>
        </div>
        <article className={styles.featuredCard}>
          <div className={styles.featuredCopy}>
            <div className={styles.featuredTop}>
              <span className={styles.featuredNumber}>/ 00</span>
              <span className={styles.featuredTag}>EDITORIAL</span>
            </div>
            <h2 className={styles.featuredTitle}>
              IOH Universe nasil dogdu?
            </h2>
            <p className={styles.featuredDesc}>
              Godcode, Codewar ve Sysgod arasinda kurulan sistemin arka planina
              kisa bir bakis. Evrenin cekirdek felsefesi, karakterlerin ortaya
              cikisi ve dijital kitap hattinin nasil sekillendigine dair ilk
              editoryal kayit.
            </p>
            <Link className={styles.featuredCta} href="#entries">
              Yakinda <span aria-hidden="true">-&gt;</span>
            </Link>
          </div>
          <div className={styles.featuredVisual}>
            <div className={styles.featuredVisualMark}>
              <span>IOH</span>
              <b>EDITORIAL / 00</b>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function JournalEntries() {
  return (
    <section className={styles.entries} id="entries">
      <div className={styles.shell}>
        <div className={styles.entriesHeader}>
          <Kicker>02 / KAYIT HATLARI</Kicker>
          <div>
            <h2>EVREN ARŞIVI</h2>
            <p className={styles.entriesLead}>
              IOH Chronicle, evrenin dort ana kaynak hattini takip eder. Her
              kart, ileride yayinlanacak bir yazı serisinin kapisidir.
            </p>
          </div>
        </div>
        <div className={styles.entryGrid}>
          {journalEntries.map((entry) => (
            <article className={styles.entryCard} key={entry.number}>
              <div className={styles.entryCardTop}>
                <span className={styles.entryNumber}>/ {entry.number}</span>
                <span className={styles.entryTag}>{entry.tag}</span>
              </div>
              <h3 className={styles.entryTitle}>{entry.title}</h3>
              <p className={styles.entryDesc}>{entry.description}</p>
              <div className={styles.entryFooter}>
                <span className={styles.entryStatus}>{entry.status}</span>
                <span className={styles.entryArrow} aria-hidden="true">-&gt;</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function JournalOutro() {
  return (
    <section className={styles.outro}>
      <div className={styles.shell}>
        <div className={styles.outroInner}>
          <Kicker>03 / EVRENE GIRIS</Kicker>
          <h2 className={styles.outroTitle}>
            Ilk kayitlardan once <em>evrene</em> giris yap.
          </h2>
          <div className={styles.outroActions}>
            <Link className={styles.primaryButton} href="/books">
              Kitaplari Incele
            </Link>
            <Link className={styles.secondaryButton} href="/token-sale">
              IOHcoin&apos;i Kesfet
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export async function JournalScene() {
  const user = await getCurrentUser();

  let userView: JournalUser = null;

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
      <JournalHeader user={userView} />
      <main className={styles.main} id="main-content">
        <JournalHero />
        <JournalMarquee />
        <JournalFeatured />
        <JournalEntries />
        <JournalOutro />
        <BooksIndexFooter />
      </main>
    </div>
  );
}
