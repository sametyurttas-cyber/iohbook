import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { ContentRenderer } from "@/features/content/content-renderer";
import { getPublishedContentPage } from "@/features/content/queries";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedContentPage("faq");

  return buildPageMetadata({
    description: page.seoDescription ?? page.excerpt,
    path: "/faq",
    title: page.seoTitle ?? page.title
  });
}

export default async function FaqPage() {
  const page = await getPublishedContentPage("faq");
  const faqItems = page.body.blocks
    .filter((block) => block.type === "faq")
    .flatMap((block) => block.items);

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        {faqItems.length > 0 ? (
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqItems.map((item) => ({
                "@type": "Question",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: item.answer
                },
                name: item.question
              })),
              url: absoluteUrl("/faq")
            }}
          />
        ) : null}
        <Container className="pt-8">
          <Breadcrumb items={[{ href: "/", label: "Ana Sayfa" }, { label: "SSS" }]} />
        </Container>
        <ContentRenderer blocks={page.body.blocks} />
      </main>
      <SiteFooter />
    </>
  );
}
