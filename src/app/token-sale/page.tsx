import type { Metadata } from "next";
import { TokenSaleScene } from "@/features/token-sale/token-sale-scene";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  description:
    "IOHcoin — IOH Universe icin dijital erisim ve topluluk puani. Kitap satin alan okurlar icin puan katmani.",
  path: "/token-sale",
  title: "IOHcoin"
});

export default function TokenSalePage() {
  return <TokenSaleScene />;
}
