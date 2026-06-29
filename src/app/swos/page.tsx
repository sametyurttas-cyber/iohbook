import { type Metadata } from "next";
import { getHeaderUserView } from "@/features/auth/queries";
// Force rebuild to load updated redesigned mobile layout SWOS Hero typography
import { buildPageMetadata } from "@/lib/seo";
import SwosScene from "@/features/swos/swos-scene";

export const metadata: Metadata = buildPageMetadata({
  path: "/swos",
  title: "SWOS // System World States Union"
});

export default async function SwosPage() {
  const userView = await getHeaderUserView();

  return <SwosScene user={userView} />;
}
