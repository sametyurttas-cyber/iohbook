import type { Metadata } from "next";
import { JournalScene } from "@/features/journal/journal-scene";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  description:
    "IOH Chronicle — Samet Yurttas IOH evreni icin arka plan notlari, kitap guncellemeleri, karakter kayitlari ve dijital evren duyurulari.",
  path: "/journal",
  title: "IOH Chronicle"
});

export default function JournalPage() {
  return <JournalScene />;
}
