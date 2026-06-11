import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { listNftCollections } from "@/features/nft/queries";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  description:
    "IOH evreni icin NFT-ready koleksiyon galerileri. Mint, satis ve odeme akisi hukuk onayi olmadan kapali kalir.",
  path: "/nft",
  title: "NFT-ready Galeri"
});

export default async function NftGalleryPage() {
  const collections = await listNftCollections();

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "IOH NFT-ready Galeri",
            url: absoluteUrl("/nft")
          }}
        />
        <Section className="pb-10 pt-10">
          <Container>
            <Breadcrumb items={[{ href: "/", label: "Ana Sayfa" }, { label: "NFT Galeri" }]} />
            <div className="mt-10 max-w-3xl">
              <Badge variant="gold">NFT-ready</Badge>
              <h1 className="mt-5 font-display text-display-sm text-paper md:text-display-md">
                NFT-ready galeri
              </h1>
              <p className="mt-4 text-body text-muted-foreground">
                Bu alan IPFS metadata, koleksiyon gorseli ve allowlist hazirligi
                icindir. Hukuk onayi gelmeden mint, token satisi, odeme veya
                zincir uzerinde claim acilmaz.
              </p>
            </div>
          </Container>
        </Section>

        <Section tone="muted">
          <Container className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <article
                className="rounded-lg border border-border bg-card p-6 shadow-panel"
                key={collection.id}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={collection.mint_enabled ? "gold" : "outline"}>
                    {collection.mint_enabled ? "Hukuk onayi var" : "Mint kapali"}
                  </Badge>
                  <Badge variant="secondary">{collection.contract_standard}</Badge>
                </div>
                <h2 className="mt-5 font-display text-title-lg text-paper">
                  {collection.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {collection.description ?? "IOH NFT-ready koleksiyon hazirligi."}
                </p>
                <dl className="mt-4 grid gap-2 text-xs text-muted-foreground">
                  <div className="flex justify-between gap-3">
                    <dt>Item</dt>
                    <dd className="text-paper">{collection.nft_items.length}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>IPFS</dt>
                    <dd className="text-paper">{collection.ipfs_metadata_cid ?? "Hazirlik"}</dd>
                  </div>
                </dl>
                <Button asChild className="mt-5" variant="secondary">
                  <Link href={`/nft/${collection.slug}`}>Galeriyi ac</Link>
                </Button>
              </article>
            ))}
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
