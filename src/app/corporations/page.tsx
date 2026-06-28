import { type Metadata } from "next";
import { getHeaderUserView } from "@/features/auth/queries";
import { buildPageMetadata } from "@/lib/seo";
import { CorporationsScene } from "@/features/corporations/corporations-scene";

export const metadata: Metadata = buildPageMetadata({
  path: "/corporations",
  title: "Corporate Union Oligarchy"
});

export default async function CorporationsPage() {
  const userView = await getHeaderUserView();

  return <CorporationsScene user={userView} />;
}
