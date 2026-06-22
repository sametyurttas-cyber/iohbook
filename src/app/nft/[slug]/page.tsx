import type { Metadata } from "next";
import { NftCollectionScene } from "@/features/nft/nft-collection-scene";
import {
  getNftCollectionBySlug,
  listNftCollections
} from "@/features/nft/queries";
import { buildPageMetadata } from "@/lib/seo";

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
      description: collection.description ?? "IOH Universe dijital koleksiyon on izleme alani.",
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
  return <NftCollectionScene slug={slug} />;
}
