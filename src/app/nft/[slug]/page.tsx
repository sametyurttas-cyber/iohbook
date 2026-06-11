import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import {
  buildItemMetadataPreview,
  getNftCollectionBySlug,
  getNftImageUrl,
  listNftCollections
} from "@/features/nft/queries";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";

type NftCollectionPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const collections = await listNftCollections();
  return collections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }: NftCollectionPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const collection = await getNftCollectionBySlug(slug);
    return buildPageMetadata({
      description: collection.description,
      path: `/nft/${collection.slug}`,
      title: collection.title
    });
  } catch {
    return buildPageMetadata({
      description: "NFT-ready koleksiyon bulunamadi.",
      path: `/nft/${slug}`,
      title: "NFT koleksiyonu bulunamadi"
    });
  }
}

export default async function NftCollectionPage({ params }: NftCollectionPageProps) {
  const { slug } = await params;
  let collection;

  try {
    collection = await getNftCollectionBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            hasPart: collection.nft_items.map((item) => ({
              "@type": "CreativeWork",
              name: item.title
            })),
            name: collection.title,
            url: absoluteUrl(`/nft/${collection.slug}`)
          }}
        />
        <Section className="pb-10 pt-10">
          <Container>
            <Breadcrumb
              items={[
                { href: "/", label: "Ana Sayfa" },
                { href: "/nft", label: "NFT Galeri" },
                { label: collection.title }
              ]}
            />
            <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_24rem] lg:items-end">
              <div>
                <Badge variant="gold">NFT-ready collection</Badge>
                <h1 className="mt-5 font-display text-display-sm text-paper md:text-display-md">
                  {collection.title}
                </h1>
                <p className="mt-4 max-w-2xl text-body text-muted-foreground">
                  {collection.description ??
                    "IPFS metadata ve allowlist hazirligi icin koleksiyon galerisi."}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-5 shadow-panel">
                <p className="text-eyebrow uppercase text-muted-foreground">Legal gate</p>
                <p className="mt-2 text-sm leading-6 text-paper">
                  Mint/satis: {collection.mint_enabled ? "hukuk onayli" : "kapali"}
                </p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Bu ekranda zincir islemi baslatan buton bulunmaz.
                </p>
              </div>
            </div>
          </Container>
        </Section>

        <Section tone="muted">
          <Container className="grid gap-4 md:grid-cols-2">
            {collection.nft_items.map((item) => {
              const imageUrl = getNftImageUrl(item);
              const metadata = buildItemMetadataPreview(collection, item);

              return (
                <article className="rounded-lg border border-border bg-card p-5 shadow-panel" key={item.id}>
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={item.title}
                      className="aspect-square w-full rounded-md border border-border object-cover"
                      src={imageUrl}
                    />
                  ) : (
                    <div className="flex aspect-square items-end rounded-md border border-gold/30 bg-gold/10 p-5 shadow-glow">
                      <p className="font-display text-5xl font-bold text-gold">IOH</p>
                    </div>
                  )}
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{item.status}</Badge>
                    {item.token_id ? <Badge variant="secondary">#{item.token_id}</Badge> : null}
                  </div>
                  <h2 className="mt-3 font-display text-title-lg text-paper">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.description ?? "Metadata hazirlik itemi."}
                  </p>
                  <details className="mt-4 rounded-md border border-border bg-ink-soft p-4 text-xs">
                    <summary className="cursor-pointer font-medium text-paper">
                      Metadata preview
                    </summary>
                    <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-muted-foreground">
                      {JSON.stringify(metadata, null, 2)}
                    </pre>
                  </details>
                </article>
              );
            })}
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
