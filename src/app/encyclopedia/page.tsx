import type { Metadata } from "next";
import { getCurrentProfile, getCurrentUser } from "@/features/auth/queries";
import { EncyclopediaScene } from "@/features/encyclopedia/encyclopedia-scene";
import { getIohPointBalanceForProfile } from "@/features/points/queries";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = buildPageMetadata({
  description:
    "IOH Universe karakterlerini, sehirlerini, organizasyonlarini ve teknolojilerini resmi evren arsivinde kesfedin.",
  path: "/encyclopedia",
  title: "Encyclopedia"
});

export default async function EncyclopediaPage() {
  const user = await getCurrentUser();
  const [profile, points] = await Promise.all([
    user ? getCurrentProfile() : Promise.resolve(null),
    user ? getIohPointBalanceForProfile(user.id) : Promise.resolve(null)
  ]);
  const displayName = profile?.full_name || profile?.email || user?.email || "Hesabim";

  return (
    <EncyclopediaScene
      user={
        user
          ? {
              displayName,
              points: points?.balance ?? 0
            }
          : null
      }
    />
  );
}
