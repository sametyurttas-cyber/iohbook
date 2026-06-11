import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { listPublishedBooks } from "@/features/catalog/queries";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  description:
    "IOH evrenindeki kitap koleksiyonlari, limitli baskilar ve tematik yayin hatlari.",
  path: "/collections",
  title: "Koleksiyonlar"
});

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
    <>
      <SiteHeader />
      <main id="main-content">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "IOH Koleksiyonlar",
            url: absoluteUrl("/collections")
          }}
        />
        <Section className="pb-10 pt-10">
          <Container>
            <Breadcrumb items={[{ href: "/", label: "Ana Sayfa" }, { label: "Koleksiyonlar" }]} />
            <div className="mt-10 max-w-3xl">
              <Badge variant="gold">Collections</Badge>
              <h1 className="mt-5 font-display text-display-sm text-paper md:text-display-md">
                Koleksiyonlar
              </h1>
              <p className="mt-4 text-body text-muted-foreground">
                IOH kitaplari tema, evren ve baski hissine gore gruplanir. MVP
                fazinda koleksiyonlar katalog deneyimini sade tutan editoryal bir
                kesif yuzeyidir.
              </p>
            </div>
          </Container>
        </Section>

        <Section tone="muted">
          <Container className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collections.length === 0 ? (
              <article className="rounded-lg border border-border bg-card p-6 shadow-panel">
                <h2 className="font-display text-title-lg text-paper">IOH Universe</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  GODCODE, SYSGOD ve CODEWAR cizgisini ayni evren altinda
                  toparlayan ana koleksiyon.
                </p>
                <Button asChild className="mt-5" variant="secondary">
                  <Link href="/books">Kitaplari incele</Link>
                </Button>
              </article>
            ) : (
              collections.map((collection) => (
                <article
                  className="rounded-lg border border-border bg-card p-6 shadow-panel"
                  key={collection.id}
                >
                  <p className="text-eyebrow uppercase text-gold">Collection</p>
                  <h2 className="mt-3 font-display text-title-lg text-paper">
                    {collection.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Bu koleksiyona bagli kitaplari katalogda kesfedin.
                  </p>
                  <Button asChild className="mt-5" variant="secondary">
                    <Link href="/books">Katalog</Link>
                  </Button>
                </article>
              ))
            )}
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
