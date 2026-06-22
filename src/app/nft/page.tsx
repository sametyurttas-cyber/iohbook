import type { Metadata } from "next";
import { NftGalleryScene } from "@/features/nft/nft-gallery-scene";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  description:
    "IOH Universe icin dijital koleksiyon on izleme alani. Mint, satis ve zincir islemi hukuk onayi olmadan kapali kalir.",
  path: "/nft",
  title: "IOH Digital Gallery"
});

export default function NftGalleryPage() {
  return <NftGalleryScene />;
}
