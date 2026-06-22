import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import {
  IohSceneHeader,
  type IohSceneHeaderUser
} from "@/components/layout/ioh-scene-header";
import { IohIndexStyles } from "@/features/home/ioh-index-landing";
import styles from "./books-index.module.css";

export type BooksIndexItem = {
  accent: string;
  coverUrl: string | null;
  description: string;
  href: string;
  label: string;
  price: string;
  title: string;
  variants: number;
};

function MonoKicker({ children }: { children: ReactNode }) {
  return <p className={styles.kicker}>{children}</p>;
}

function BooksIndexRail({ books }: { books: BooksIndexItem[] }) {
  return (
    <nav className={styles.rail} aria-label="Kitap bolumleri">
      <a className={styles.activeRailLink} href="#catalog">
        <span />
        <b>00 / KITAPLAR</b>
      </a>
      {books.slice(0, 3).map((book, index) => (
        <a href={`#book-${index + 1}`} key={book.href}>
          <span />
          <b>{book.label}</b>
        </a>
      ))}
    </nav>
  );
}

function BooksIndexHero() {
  return (
    <section className={styles.hero} id="catalog">
      <div className={styles.heroHalo} aria-hidden="true" />
      <div className={styles.shell}>
        <MonoKicker>Samet Yurttas / IOH katalogu</MonoKicker>
        <h1 className={styles.heroTitle}>
          <span>IOH</span>
          <em>Books</em>
        </h1>
        <p className={styles.heroLead}>
          Uc kitap, tek cekirdek. Kod, sistem ve savas ayni evrenin farkli
          kapilarindan iceri girer.
        </p>
        <div className={styles.heroActions}>
          <a className={styles.primaryButton} href="#book-1">
            Ilk kitabi ac
          </a>
          <Link className={styles.secondaryButton} href="/collections">
            Koleksiyonlara git
          </Link>
        </div>
      </div>
      <div className={styles.scrollHint} aria-hidden="true">
        <span>SCROLL</span>
        <i />
      </div>
    </section>
  );
}

function BooksIndexManifesto() {
  return (
    <>
      <section className={styles.manifesto}>
        <div className={styles.manifestoInner}>
          <p>
            Bu katalog bir raf degil; <em>IOH Universe</em> icindeki uc ana
            kuvvetin giris kapisidir.
          </p>
          <p className={styles.manifestoNote}>
            GODCODE altin cekirdegi, SYSGOD mavi sistem katmanini, CODEWAR ise
            kirmizi catisma hattini tasir. Ilk erisim PDF ve EPUB dijital
            teslimatla baslar.
          </p>
        </div>
      </section>
      <div className={styles.marquee} aria-hidden="true">
        <div>
          <span>GODCODE / SYSGOD / CODEWAR / IOH UNIVERSE /</span>
          <span>GODCODE / SYSGOD / CODEWAR / IOH UNIVERSE /</span>
        </div>
      </div>
    </>
  );
}

function splitBookTitle(title: string) {
  const normalized = title.replace(/\s+/g, "").toUpperCase();

  if (normalized === "GODCODE") return ["GOD", "CODE"];
  if (normalized === "SYSGOD") return ["SYS", "GOD"];
  if (normalized === "CODEWAR") return ["CODE", "WAR"];

  const words = title.trim().split(/\s+/);
  if (words.length === 1) return ["IOH", words[0]];
  return [words.slice(0, -1).join(" "), words.at(-1) ?? ""];
}

function BooksIndexChapter({ book, index }: { book: BooksIndexItem; index: number }) {
  const [title, emphasis] = splitBookTitle(book.title);
  const chapterStyle = { "--book-accent": book.accent } as CSSProperties;

  return (
    <section
      className={styles.chapter}
      id={`book-${index + 1}`}
      style={chapterStyle}
    >
      <div className={styles.chapterGlow} aria-hidden="true" />
      <div className={styles.chapterGhost} aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </div>
      <div className={`${styles.shell} ${styles.chapterGrid}`}>
        <div className={styles.chapterCopy}>
          <span className={styles.chapterIndex}>{book.label}</span>
          <MonoKicker>IOH book chapter</MonoKicker>
          <h2 className={styles.chapterTitle}>
            {title} <em>{emphasis}</em>
          </h2>
          <p className={styles.chapterLead}>
            <strong>{book.title}</strong> / {book.description}
          </p>
          <ul className={styles.tags} aria-label="Kitap bilgileri">
            <li>{book.price}</li>
            <li>{book.variants} dijital format</li>
            <li>{book.coverUrl ? "Kapak hazir" : "Kapak bekleniyor"}</li>
          </ul>
          <Link className={styles.chapterLink} href={book.href}>
            Kitabi incele <span aria-hidden="true">-&gt;</span>
          </Link>
        </div>

        <Link className={styles.coverStage} href={book.href} aria-label={`${book.title} detayini ac`}>
          <span className={styles.coverNumber} aria-hidden="true">
            / {String(index + 1).padStart(2, "0")}
          </span>
          <div className={styles.coverFrame}>
            {book.coverUrl ? (
              <Image
                alt={`${book.title} kitap kapagi`}
                fill
                priority={index === 0}
                sizes="(max-width: 760px) 70vw, (max-width: 1100px) 38vw, 420px"
                src={book.coverUrl}
              />
            ) : (
              <div className={styles.coverFallback}>
                <span>IOH</span>
                <strong>{book.title}</strong>
              </div>
            )}
          </div>
          <span className={styles.coverCaption}>DIGITAL EDITION / IOH UNIVERSE</span>
        </Link>
      </div>
    </section>
  );
}

const paths = [
  {
    description: "Butik baskilar ve koleksiyon nesneleri icin ayrilmis editorial alan.",
    href: "/collections",
    label: "Butik",
    number: "01",
    title: "Koleksiyonlar"
  },
  {
    description: "Kitap evreninden tureyen dijital eser ve metadata galeri hatti.",
    href: "/nft",
    label: "Galeri",
    number: "02",
    title: "NFT Galeri"
  },
  {
    description: "IOH cekirdegine baglanan allocation ve wallet dogrulama alani.",
    href: "/token-sale",
    label: "Aktif",
    number: "03",
    title: "Token Sale"
  }
];

function BooksIndexPaths() {
  return (
    <section className={styles.paths}>
      <div className={styles.shell}>
        <MonoKicker>Katalog rotalari</MonoKicker>
        <h2>IOH PATHS</h2>
        <p className={styles.pathsLead}>
          Kitap, koleksiyon ve dijital evren ayni cekirdegin farkli erisim
          katmanlari olarak okunur.
        </p>
        <div className={styles.pathGrid}>
          {paths.map((path) => (
            <Link className={styles.pathCard} href={path.href} key={path.href}>
              <span>/ {path.number}</span>
              <b>{path.label}</b>
              <h3>{path.title}</h3>
              <p>{path.description}</p>
              <i aria-hidden="true">-&gt;</i>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BooksIndexFooter({ context = "books" }: { context?: "books" | "encyclopedia" }) {
  const isEncyclopedia = context === "encyclopedia";

  return (
    <section className={styles.outro}>
      <div className={styles.shell}>
        <div className={styles.outroCall}>
          <h2>
            {isEncyclopedia ? (
              <>Arsiv her kayitta <em>biraz daha buyur.</em></>
            ) : (
              <>Kitaplar <em>evrenin</em> ilk dijital kapisidir.</>
            )}
          </h2>
          <Link className={styles.primaryButton} href={isEncyclopedia ? "/books" : "/cart"}>
            {isEncyclopedia ? "Kitaplara don" : "Sepete git"}
          </Link>
        </div>
        <footer className={styles.footer}>
          <div className={styles.footerGrid}>
            <div className={styles.footerIntro}>
              <h3>IOH Universe</h3>
              <p>
                {isEncyclopedia
                  ? "IOH Universe karakterleri, sehirleri ve sistemleri icin resmi evren arsivi."
                  : "Samet Yurttas kitap evreninin karanlik ve kozmik katalog deneyimi."}
              </p>
            </div>
            <div>
              <h3>Evren</h3>
              <Link href="/books">Kitaplar</Link>
              <Link href="/encyclopedia">Encyclopedia</Link>
              <Link href="/collections">Koleksiyonlar</Link>
              <Link href="/author">Yazar Hakkinda</Link>
            </div>
            <div>
              <h3>Dijital</h3>
              <Link href="/token-sale">Token Sale</Link>
              <Link href="/nft">NFT Galeri</Link>
              <Link href="/account">Hesabim</Link>
            </div>
            <div>
              <h3>Hukuk</h3>
              <Link href="/legal/pre-info">On Bilgilendirme</Link>
              <Link href="/legal/distance-sales">Mesafeli Satis</Link>
              <Link href="/legal/privacy">Gizlilik / KVKK</Link>
            </div>
          </div>
          <div className={styles.footerMark} aria-hidden="true">
            {isEncyclopedia ? "IOH Archive" : "IOH Books"}
          </div>
          <div className={styles.footerBase}>
            <p>(c) 2026 IOH Universe / Samet Yurttas</p>
            <p>{isEncyclopedia ? "Archive / Systems / Memory" : "Books / System / Conflict"}</p>
          </div>
        </footer>
      </div>
    </section>
  );
}

export function BooksIndexScene({ books, user }: { books: BooksIndexItem[]; user: IohSceneHeaderUser }) {
  return (
    <div className={styles.page}>
      <IohIndexStyles />
      <style dangerouslySetInnerHTML={{ __html: "body{cursor:auto!important}a,button,[data-hover],[data-magnet]{cursor:pointer!important}" }} />
      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />
      <IohSceneHeader user={user} />
      <BooksIndexRail books={books} />
      <main className={styles.main} id="main-content">
        <BooksIndexHero />
        <BooksIndexManifesto />
        {books.map((book, index) => (
          <BooksIndexChapter book={book} index={index} key={book.href} />
        ))}
        <BooksIndexPaths />
        <BooksIndexFooter />
      </main>
    </div>
  );
}
