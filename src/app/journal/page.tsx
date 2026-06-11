import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  description:
    "Samet Yurttas IOH evreni icin yazar notlari, yayin gunlukleri ve kampanya duyurulari.",
  path: "/journal",
  title: "Gunluk ve Blog"
});

export default function JournalPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "IOH Gunluk",
            url: absoluteUrl("/journal")
          }}
        />
        <Section className="pb-10 pt-10">
          <Container>
            <Breadcrumb items={[{ href: "/", label: "Ana Sayfa" }, { label: "Gunluk/Blog" }]} />
            <div className="mt-10 max-w-3xl">
              <Badge variant="gold">Journal</Badge>
              <h1 className="mt-5 font-display text-display-sm text-paper md:text-display-md">
                Gunluk ve Blog
              </h1>
              <p className="mt-4 text-body text-muted-foreground">
                Yayin notlari, evren arka plani ve kampanya duyurulari icin
                ayrilan editoryal alan. Ilk fazda satis deneyimini bolmeden
                sade bir bekleme yuzeyi olarak konumlandirildi.
              </p>
              <Button asChild className="mt-8">
                <Link href="/books">Kitaplari incele</Link>
              </Button>
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
