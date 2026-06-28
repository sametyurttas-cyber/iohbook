import { type Metadata } from "next";
import { getHeaderUserView } from "@/features/auth/queries";
import { buildPageMetadata } from "@/lib/seo";
import SwosScene from "@/features/swos/swos-scene";

export const metadata: Metadata = buildPageMetadata({
  path: "/encyclopedia/swos",
  title: "SWOS // System World States Union | Encyclopedia"
});

export default async function EncyclopediaSwosPage() {
  const userView = await getHeaderUserView();

  return <SwosScene user={userView} />;
}
