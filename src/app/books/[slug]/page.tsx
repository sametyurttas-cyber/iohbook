import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { BookGallery } from "@/features/catalog/book-gallery";
import { BookInfoTabs } from "@/features/catalog/book-info-tabs";
import {
  getCoverMedia,
  getLowestPriceLabel,
  getMediaUrl,
  getSortedVariants,
  getStockLabel
} from "@/features/catalog/catalog-utils";
import {
  getPublishedBookBySlug,
  listPublishedBooks
} from "@/features/catalog/queries";
import { VariantSelector } from "@/features/catalog/variant-selector";
import { absoluteUrl, buildPageMetadata, siteConfig } from "@/lib/seo";

type BookDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const revalidate = 300;

export async function generateStaticParams() {
  const books = await listPublishedBooks();

  return books.map((book) => ({
    slug: book.slug
  }));
}

export async function generateMetadata({
  params
}: BookDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const book = await getPublishedBookBySlug(slug);
    const cover = getCoverMedia(book);

    return buildPageMetadata({
      description:
        book.seo_description ??
        book.short_description ??
        "Samet Yurttas IOH evreninden fiziksel kitap.",
      image: getMediaUrl(cover),
      path: `/books/${book.slug}`,
      title: book.seo_title ?? book.title,
      type: "article"
    });
  } catch {
    return buildPageMetadata({
      description: "Aradiginiz IOH kitabi bulunamadi.",
      path: `/books/${slug}`,
      title: "Kitap bulunamadi"
    });
  }
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { slug } = await params;
  let book;

  try {
    book = await getPublishedBookBySlug(slug);
  } catch {
    notFound();
  }

  const variants = getSortedVariants(book);
  const firstVariant = variants[0];
  const cover = getCoverMedia(book);
  const coverUrl = getMediaUrl(cover);
  const lowestVariant = variants.reduce<typeof firstVariant | undefined>((current, variant) => {
    if (!current || variant.price_minor < current.price_minor) {
      return variant;
    }

    return current;
  }, undefined);
  const productKindLabel =
    book.type === "nft" || book.type === "claimable" ? "NFT / claimable" : "Fiziksel kitap";

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": ["Book", "Product"],
              author: {
                "@type": "Person",
                name: siteConfig.author
              },
              description:
                book.seo_description ?? book.short_description ?? book.description ?? undefined,
              image: coverUrl ?? undefined,
              name: book.title,
              offers: lowestVariant
                ? {
                    "@type": "Offer",
                    availability:
                      getStockLabel(lowestVariant) === "Stokta yok"
                        ? "https://schema.org/OutOfStock"
                        : "https://schema.org/InStock",
                    price: (lowestVariant.price_minor / 100).toFixed(2),
                    priceCurrency: lowestVariant.currency,
                    url: absoluteUrl(`/books/${book.slug}`)
                  }
                : undefined,
              sku: lowestVariant?.sku,
              url: absoluteUrl(`/books/${book.slug}`)
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
                  item: absoluteUrl("/books"),
                  name: "Kitaplar",
                  position: 2
                },
                {
                  "@type": "ListItem",
                  item: absoluteUrl(`/books/${book.slug}`),
                  name: book.title,
                  position: 3
                }
              ]
            }
          ]}
        />
        <Section className="pb-12 pt-10">
          <Container>
            <Breadcrumb
              items={[
                { href: "/", label: "Ana Sayfa" },
                { href: "/books", label: "Kitaplar" },
                { label: book.title }
              ]}
            />

            <div className="mt-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <BookGallery book={book} />

              <div className="grid gap-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {book.collections ? (
                      <Badge variant="outline">{book.collections.title}</Badge>
                    ) : null}
                    {book.is_limited ? <Badge variant="gold">Limitli baski</Badge> : null}
                    <Badge variant="secondary">{productKindLabel}</Badge>
                  </div>
                  <h1 className="mt-5 font-display text-display-sm text-paper md:text-display-md">
                    {book.title}
                  </h1>
                  {book.subtitle ? (
                    <p className="mt-3 text-title-md text-muted-foreground">
                      {book.subtitle}
                    </p>
                  ) : null}
                  <p className="mt-5 max-w-2xl text-body text-muted-foreground">
                    {book.short_description ??
                      "IOH evreninin karanlik teknoloji hattindan koleksiyon hissi tasiyan fiziksel baski."}
                  </p>
                </div>

                <div className="grid gap-4 rounded-lg border border-border bg-card p-5 shadow-panel md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      Fiyat
                    </p>
                    <p className="mt-2 font-display text-title-lg text-gold">
                      {getLowestPriceLabel(book)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      Stok
                    </p>
                    <p className="mt-2 text-sm text-paper">
                      {firstVariant ? getStockLabel(firstVariant) : "Yakinda"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      Teslimat
                    </p>
                    <p className="mt-2 text-sm text-paper">
                      {firstVariant?.lead_time_days
                        ? `${firstVariant.lead_time_days} gun hazirlik`
                        : firstVariant?.fulfillment_type === "claimable"
                          ? "Wallet dogrulamasi sonrasi manual teslimat"
                          : "Standart kargo hazirligi"}
                    </p>
                  </div>
                </div>

                <VariantSelector variants={variants} />

                <div className="rounded-lg border border-gold/30 bg-gold/10 p-5">
                  <p className="text-eyebrow uppercase text-gold">Yazar notu</p>
                  <p className="mt-3 text-sm leading-7 text-paper/85">
                    IOH hatti, kodun yalnizca arac degil; hafiza, sistem ve
                    catisma ureten bir evren oldugunu anlatir. Bu sayfa satis
                    oncesi atmosferi kuran editoryal yuzeydir.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="outline">
                    <Link href="/books">Kataloga don</Link>
                  </Button>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        <Section tone="muted">
          <Container>
            <BookInfoTabs book={book} variants={variants} />
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
