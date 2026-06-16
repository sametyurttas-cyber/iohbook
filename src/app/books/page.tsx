import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getCoverMedia,
  getLowestPriceLabel,
  getMediaUrl,
  getSortedVariants
} from "@/features/catalog/catalog-utils";
import { listPublishedBooks } from "@/features/catalog/queries";
import { IohIndexStyles } from "@/features/home/ioh-index-landing";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = buildPageMetadata({
  description:
    "Samet Yurttas IOH evrenindeki fiziksel kitaplari, imzali baskilari ve koleksiyon varyantlarini kesfedin.",
  path: "/books",
  title: "Kitaplar"
});

const fallbackBooks = [
  {
    accent: "var(--gold)",
    description:
      "Kodun kutsal mimariye donustugu ilk hat. Hafiza, bilinç ve sistemin altin cekirdegi.",
    href: "/books/godcode",
    label: "01 / GODCODE",
    title: "GODCODE"
  },
  {
    accent: "var(--blue)",
    description:
      "Sistemin kendini kurdugu mavi esik. Aglar, protokoller ve sessiz iktidar dili.",
    href: "/books/sysgod",
    label: "02 / SYSGOD",
    title: "SYSGOD"
  },
  {
    accent: "var(--red)",
    description:
      "Catismanin kirmizi cephesi. Kodun savasa, savasin bilince donustugu karanlik bolge.",
    href: "/books/codewar",
    label: "03 / CODEWAR",
    title: "CODEWAR"
  }
];

function getBookAccent(title: string, index: number) {
  const normalized = title.toLowerCase();

  if (normalized.includes("sys")) {
    return "var(--blue)";
  }

  if (normalized.includes("war")) {
    return "var(--red)";
  }

  if (normalized.includes("godcode") || normalized.includes("god code")) {
    return "var(--gold)";
  }

  return index % 3 === 1 ? "var(--blue)" : index % 3 === 2 ? "var(--red)" : "var(--gold)";
}

export default async function BooksPage() {
  const books = await listPublishedBooks();
  const visibleBooks =
    books.length > 0
      ? books.map((book, index) => {
          const cover = getCoverMedia(book);
          const variants = getSortedVariants(book);

          return {
            accent: getBookAccent(book.title, index),
            coverUrl: getMediaUrl(cover),
            description:
              book.short_description ??
              book.subtitle ??
              "IOH evreninden fiziksel baski, limitli varyant ve koleksiyon hissi.",
            href: `/books/${book.slug}`,
            label: `${String(index + 1).padStart(2, "0")} / ${book.title}`,
            price: getLowestPriceLabel(book),
            title: book.title,
            variants: variants.length
          };
        })
      : fallbackBooks.map((book) => ({
          ...book,
          coverUrl: null,
          price: "Yakinda",
          variants: 3
        }));

  return (
    <>
      <IohIndexStyles />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          hasPart: books.map((book) => ({
            "@type": book.type === "nft" || book.type === "claimable" ? "Product" : "Book",
            name: book.title,
            url: absoluteUrl(`/books/${book.slug}`)
          })),
          name: "IOH Kitaplar",
          url: absoluteUrl("/books")
        }}
      />

      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />

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
          <Link className="head-cta" href="/sign-in" data-hover="" data-magnet="">
            Giris
          </Link>
          <Link className="head-cta" href="/collections" data-hover="" data-magnet="">
            Koleksiyona Gir
          </Link>
        </div>
      </header>

      <nav className="rail" aria-label="Kitap bolumleri">
        <a className="is-active" href="#catalog" data-hover="">
          <span className="r-dot" />
          <span className="r-tag">00 / KITAPLAR</span>
        </a>
        {visibleBooks.slice(0, 3).map((book, index) => (
          <a href={`#book-${index + 1}`} key={book.href} data-hover="">
            <span className="r-dot" />
            <span className="r-tag">{book.label}</span>
          </a>
        ))}
      </nav>

      <main id="main-content">
        <section className="hero" id="catalog">
          <div className="shell">
            <p className="kicker mono hero-kicker">Samet Yurttas — IOH katalogu</p>
            <h1 className="hero-title">
              <span className="t-row">IOH</span>
              <span className="t-row serif">Books</span>
            </h1>
            <p className="hero-sub">
              Uc kitap, tek cekirdek. Kod, sistem ve savas ayni evrenin farkli
              kapilarindan iceri girer.
            </p>
            <div className="hero-actions">
              <a className="btn btn-fill" href="#book-1">
                Ilk kitabi ac
              </a>
              <Link className="btn btn-ghost" href="/collections">
                Koleksiyonlara git
              </Link>
            </div>
          </div>
          <div className="scroll-hint" aria-hidden="true">
            <span className="mono">Scroll</span>
            <span className="s-line" />
          </div>
        </section>

        <section className="manifesto">
          <div className="shell">
            <p>
              Bu katalog bir raf degil; <em>IOH Universe</em> icindeki uc ana
              kuvvetin giris kapisidir.
            </p>
            <p className="m-note">
              GODCODE altin cekirdegi, SYSGOD mavi sistem katmanini, CODEWAR ise
              kirmizi catisma hattini tasir. Her baski, anlatinin fiziksel bir
              parcasi gibi konumlanir.
            </p>
          </div>
        </section>

        <div className="marquee" aria-hidden="true">
          <div className="m-track">
            <span>
              GODCODE <i>/</i> SYSGOD <i>/</i> CODEWAR <i>/</i> IOH UNIVERSE <i>/</i>
            </span>
            <span>
              GODCODE <i>/</i> SYSGOD <i>/</i> CODEWAR <i>/</i> IOH UNIVERSE <i>/</i>
            </span>
          </div>
        </div>

        {visibleBooks.map((book, index) => (
          <section
            className="chapter is-active"
            id={`book-${index + 1}`}
            key={book.href}
            style={{ "--accent": book.accent } as CSSProperties}
          >
            <div className="glow" />
            <div className="shell">
              <span className="ch-index">{book.label}</span>
              <div className="ghost">{String(index + 1).padStart(2, "0")}</div>
              <p className="kicker mono ch-kicker">IOH book chapter</p>
              <h2 className="ch-title">
                {book.title.split(" ").slice(0, -1).join(" ") || book.title}{" "}
                <em>{book.title.split(" ").slice(-1)[0]}</em>
              </h2>
              <p className="ch-lead">
                <strong>{book.title}</strong> — {book.description}
              </p>
              <ul className="tags">
                <li>{book.price}</li>
                <li>{book.variants} varyant</li>
                <li>{book.coverUrl ? "Kapak hazir" : "Kapak bekleniyor"}</li>
              </ul>
              <Link className="btn-line" href={book.href}>
                Kitabi incele <span className="b-arrow">-&gt;</span>
              </Link>
            </div>
          </section>
        ))}

        <section className="coin" id="catalog-paths">
          <div className="shell">
            <p className="kicker mono">Katalog rotalari</p>
            <h2 className="coin-title no-split">IOH PATHS</h2>
            <p className="coin-lead">
              Katalog yalnizca kitap listesi degil. Baski, koleksiyon ve dijital
              evren ayni cekirdegin farkli erisim katmanlari olarak okunur.
            </p>
            <div className="coin-cards">
              <Link className="c-card" href="/collections">
                <span className="c-no">/ 01</span>
                <span className="c-soon">Butik</span>
                <h3>Koleksiyonlar</h3>
                <p>Imzali baskilar, limitli nesneler ve evren odakli setler.</p>
              </Link>
              <Link className="c-card" href="/nft">
                <span className="c-no">/ 02</span>
                <span className="c-soon">Galeri</span>
                <h3>NFT Galeri</h3>
                <p>Kitaplardan tureyen dijital eser ve metadata hazirlik alani.</p>
              </Link>
              <Link className="c-card" href="/token-sale">
                <span className="c-no">/ 03</span>
                <span className="c-soon">Aktif</span>
                <h3>Token Sale</h3>
                <p>IOH cekirdegine baglanan allocation ve wallet dogrulama hatti.</p>
              </Link>
            </div>
          </div>
        </section>

        <section className="outro">
          <div className="shell">
            <h2 id="outroTitle">
              Kitaplar <em>evrenin</em> ilk fiziksel kapisidir.
            </h2>
            <Link className="btn btn-fill" href="/cart">
              Sepete git
            </Link>

            <footer className="site-foot">
              <div className="foot-grid">
                <div className="foot-brand">
                  <h4>IOH Universe</h4>
                  <p>
                    Samet Yurttas kitap evreni icin premium, karanlik ve kozmik
                    bir butik katalog deneyimi.
                  </p>
                </div>
                <div>
                  <h4>Evren</h4>
                  <ul>
                    <li>
                      <Link href="/books">Kitaplar</Link>
                    </li>
                    <li>
                      <Link href="/collections">Koleksiyonlar</Link>
                    </li>
                    <li>
                      <Link href="/author">Yazar Hakkinda</Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4>Digital</h4>
                  <ul>
                    <li>
                      <Link href="/token-sale">Token Sale</Link>
                    </li>
                    <li>
                      <Link href="/nft">NFT Galeri</Link>
                    </li>
                    <li>
                      <Link href="/account">Hesabim</Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4>Hukuk</h4>
                  <ul>
                    <li>
                      <Link href="/legal/pre-info">On Bilgilendirme</Link>
                    </li>
                    <li>
                      <Link href="/legal/distance-sales">Mesafeli Satis</Link>
                    </li>
                    <li>
                      <Link href="/legal/privacy">Gizlilik / KVKK</Link>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="foot-mark" aria-hidden="true">
                <span>IOH Books</span>
              </div>
              <div className="foot-base">
                <p>(c) 2026 IOH Universe - Samet Yurttas</p>
                <p>Books / System / Conflict</p>
              </div>
            </footer>
          </div>
        </section>
      </main>
    </>
  );
}
