import type { Metadata } from "next";
import { getHeaderUserView } from "@/features/auth/queries";
import { AiScene } from "@/features/system-intelligence/ai-scene";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  description: "System'in varoluş altyapısını, şehir savunmalarını ve quantum veri akışını yöneten yapay zeka birimleri.",
  path: "/encyclopedia/ai",
  title: "Yapay Zeka Birimleri | Encyclopedia"
});

export default async function EncyclopediaAiPage() {
  const userView = await getHeaderUserView();

  return <AiScene user={userView} />;
}
