import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { listPublishedBooks } from "@/features/catalog/queries";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";
import { IohIndexStyles } from "@/features/home/ioh-index-landing";
import styles from "./collections.module.css";

export const metadata: Metadata = buildPageMetadata({
  description:
    "IOH evrenindeki kitap koleksiyonlari, limitli baskilar ve tematik yayin hatlari.",
  path: "/collections",
  title: "Koleksiyonlar"
});

function getCollectionAccent(title: string) {
  const norm = title.toLowerCase();
  if (norm.includes("sys") || norm.includes("system")) return styles.accentBlue;
  if (norm.includes("war") || norm.includes("conflict")) return styles.accentRed;
  return styles.accentGold;
}

function getCollectionTag(title: string) {
  const norm = title.toLowerCase();
  if (norm.includes("sys") || norm.includes("system")) return "SYS NETWORK";
  if (norm.includes("war") || norm.includes("conflict")) return "WAR MATRIX";
  return "GENESIS CORE";
}

function getCollectionSymbol(title: string) {
  const norm = title.toLowerCase();
  if (norm.includes("sys") || norm.includes("system")) return "SYS";
  if (norm.includes("war") || norm.includes("conflict")) return "WAR";
  return "IOH";
}

export default async function CollectionsPage() {
  const books = await listPublishedBooks();
  const collections = Array.from(
    new Map(
      books
        .filter((book) => book.collections)
        .map((book) => [book.collections!.id, book.collections!])
    ).values()
  );

  return (
    <div className={styles.page}>
      <IohIndexStyles />
      <div className={styles.heroGridLines} aria-hidden="true" />
      <SiteHeader />
      
      <main id="main-content" className={styles.shell}>
        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              description:
                "IOH evrenindeki kitap koleksiyonlari, limitli baskilar ve tematik yayin hatlari.",
              hasPart:
                collections.length > 0
                  ? collections.map((collection) => ({
                      "@type": "CreativeWorkSeries",
                      name: collection.title,
                      url: absoluteUrl("/collections")
                    }))
                  : [
                      {
                        "@type": "CreativeWorkSeries",
                        name: "IOH Universe",
                        url: absoluteUrl("/collections")
                      }
                    ],
              mainEntity: {
                "@type": "ItemList",
                itemListElement: books.map((book, index) => ({
                  "@type": "ListItem",
                  item: {
                    "@type": book.type === "book" ? "Book" : "Product",
                    name: book.title,
                    url: absoluteUrl(`/books/${book.slug}`)
                  },
                  position: index + 1
                }))
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  item: absoluteUrl("/"),
                  name: "Ana Sayfa",
                  position: 1
                },
                {
                  "@type": "ListItem",
                  item: absoluteUrl("/collections"),
                  name: "Koleksiyonlar",
                  position: 2
                }
              ]
            }
          ]}
        />

        <section style={{ paddingTop: "8rem", paddingBottom: "2rem" }}>
          <Breadcrumb items={[{ href: "/", label: "Ana Sayfa" }, { label: "Koleksiyonlar" }]} />
          
          <div style={{ marginTop: "3rem" }}>
            <div className={styles.kickerWrapper}>
              <span className={styles.statusDot} />
              <span className={styles.kicker}>COLLECTIONS / DATA ARCHIVE</span>
            </div>
            
            <h1 className={styles.pageTitle}>Koleksiyonlar</h1>
            
            <p className={styles.pageDescription}>
              IOH kitapları tema, evren ve baskı hissine göre gruplanır. 
              Koleksiyonlar katalog deneyimini sade tutan editoryal bir keşif yüzeyidir.
            </p>
          </div>
        </section>

        <section style={{ paddingBottom: "8rem" }}>
          <div className={styles.collectionsGrid}>
            {collections.length === 0 ? (
              <Link href="/books" className={`${styles.collectionCard} ${styles.accentGold}`}>
                <div className={styles.cardHeader}>
                  <span className={styles.platformSymbol}>IOH</span>
                  <span className={styles.nodeTag}>GENESIS CORE</span>
                </div>
                <h2 className={styles.cardTitle}>IOH Universe</h2>
                <p className={styles.cardDesc}>
                  GODCODE, SYSGOD ve CODEWAR çizgisini aynı evren altında toparlayan ana koleksiyon.
                </p>
                <div className={styles.cardAction}>
                  <span className={styles.btnCmd}>CMD: /view_catalog</span>
                  <span className={styles.btnDivider} />
                  <span className={styles.btnLabel}>EXPLORE CATALOG</span>
                  <span className={styles.btnArrow}>→</span>
                </div>
              </Link>
            ) : (
              collections.map((collection) => {
                const accent = getCollectionAccent(collection.title);
                const tag = getCollectionTag(collection.title);
                const symbol = getCollectionSymbol(collection.title);

                return (
                  <Link
                    href="/books"
                    key={collection.id}
                    className={`${styles.collectionCard} ${accent}`}
                  >
                    <div className={styles.cardHeader}>
                      <span className={styles.platformSymbol}>{symbol}</span>
                      <span className={styles.nodeTag}>{tag}</span>
                    </div>
                    <h2 className={styles.cardTitle}>{collection.title}</h2>
                    <p className={styles.cardDesc}>
                      Bu koleksiyona bağlı kitapları katalogda keşfedin.
                    </p>
                    <div className={styles.cardAction}>
                      <span className={styles.btnCmd}>CMD: /view_catalog</span>
                      <span className={styles.btnDivider} />
                      <span className={styles.btnLabel}>EXPLORE CATALOG</span>
                      <span className={styles.btnArrow}>→</span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
