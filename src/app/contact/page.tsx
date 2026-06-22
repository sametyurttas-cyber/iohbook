import type { Metadata } from "next";
import { ContactScene } from "@/features/contact/contact-scene";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  description:
    "IOH Universe iletisim merkezi — basin, is birligi, okuyucu destegi ve teknik destek icin merkezi baglanti noktasi.",
  path: "/contact",
  title: "Iletisim"
});

export default function ContactPage() {
  return <ContactScene />;
}
