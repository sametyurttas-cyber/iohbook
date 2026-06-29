import type { Metadata } from "next";
import { getHeaderUserView } from "@/features/auth/queries";
import { CharactersScene } from "@/features/characters/characters-scene";
// Force rebuild to load updated character card details side-by-side grid wrapper styles
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  description: "GODCODE takımı Algus, Mina, Kevin, Mike ve Elia detaylı siber güvenlik profil dosyaları.",
  path: "/encyclopedia/characters",
  title: "Karakter Dosyaları | Encyclopedia"
});

export default async function EncyclopediaCharactersPage() {
  const userView = await getHeaderUserView();

  return <CharactersScene user={userView} />;
}
