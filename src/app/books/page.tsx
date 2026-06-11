import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { ResponsiveGrid } from "@/components/layout/responsive-grid";
import { Section } from "@/components/layout/section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { BookCover } from "@/features/catalog/book-cover";
import {
  getCoverMedia,
  getLowestPriceLabel,
  getMediaUrl,
  getSortedVariants
} from "@/features/catalog/catalog-utils";
import { listPublishedBooks } from "@/features/catalog/queries";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = buildPageMetadata({
  description:
    "Samet Yurttas IOH evrenindeki fiziksel kitaplari, imzali baskilari ve koleksiyon varyantlarini kesfedin.",
  path: "/books",
  title: "Kitaplar"
});

export default async function BooksPage() {
  const books = await listPublishedBooks();

  return (
    <>
      <SiteHeader />
      <main id="main-content">
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
        <Section className="pb-10 pt-10">
          <Container>
            <Breadcrumb items={[{ href: "/", label: "Ana Sayfa" }, { label: "Kitaplar" }]} />
            <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_24rem] lg:items-end">
              <div>
                <Badge variant="gold">IOH Catalog</Badge>
                <h1 className="mt-5 font-display text-display-sm text-paper md:text-display-md">
                  Kitaplar
                </h1>
                <p className="mt-4 max-w-2xl text-body text-muted-foreground">
                  Kod, sistem ve savas hatlarinda ilerleyen fiziksel baskilar,
                  NFT/claimable koleksiyon urunleri ve limitli varyantlar.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5 shadow-panel">
                <p className="text-eyebrow uppercase text-muted-foreground">
                  Catalog status
                </p>
                <p className="mt-2 font-display text-title-lg text-gold">
                  {books.length} urun yayinda
                </p>
              </div>
            </div>
          </Container>
        </Section>

        <Section tone="muted">
          <Container>
            {books.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-8 text-center shadow-panel">
                <h2 className="font-display text-title-lg text-paper">
                  Yayinda kitap yok
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                  Admin panelinden aktif ve yayin tarihi gecmis bir fiziksel kitap
                  eklediginde katalog burada gorunur.
                </p>
              </div>
            ) : (
              <ResponsiveGrid columns={3}>
                {books.map((book, index) => {
                  const cover = getCoverMedia(book);
                  const variants = getSortedVariants(book);

                  return (
                    <article
                      className="group overflow-hidden rounded-lg border border-border bg-card shadow-panel"
                      key={book.id}
                    >
                      <Link href={`/books/${book.slug}`}>
                        <BookCover
                          alt={cover?.alt_text ?? `${book.title} kapak gorseli`}
                          className="aspect-[3/4] rounded-none border-0 shadow-none"
                          priority={index === 0}
                          title={book.title}
                          url={getMediaUrl(cover)}
                        />
                      </Link>
                      <div className="grid gap-4 p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          {book.collections ? (
                            <Badge variant="outline">{book.collections.title}</Badge>
                          ) : null}
                          {book.is_limited ? <Badge variant="gold">Limitli</Badge> : null}
                        </div>
                        <div>
                          <Link
                            className="font-display text-title-lg text-paper transition-colors group-hover:text-gold"
                            href={`/books/${book.slug}`}
                          >
                            {book.title}
                          </Link>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            {book.short_description ??
                              book.subtitle ??
                              "IOH evreninden fiziksel baski."}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                              Baslangic
                            </p>
                            <p className="font-display text-title-md text-gold">
                              {getLowestPriceLabel(book)}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {variants.length} varyant
                          </p>
                        </div>
                        <Button asChild variant="secondary">
                          <Link href={`/books/${book.slug}`}>Detay</Link>
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </ResponsiveGrid>
            )}
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
