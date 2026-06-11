import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { ContentRenderer } from "@/features/content/content-renderer";
import { getPublishedContentPage } from "@/features/content/queries";
import { absoluteUrl, buildPageMetadata, siteConfig } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedContentPage("home");

  return buildPageMetadata({
    description: page.seoDescription ?? page.excerpt,
    path: "/",
    title: page.seoTitle ?? page.title
  });
}

export default async function HomePage() {
  const page = await getPublishedContentPage("home");

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <JsonLd
          data={[
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: siteConfig.name,
              potentialAction: {
                "@type": "SearchAction",
                "query-input": "required name=search_term_string",
                target: absoluteUrl("/books?search={search_term_string}")
              },
              url: absoluteUrl("/")
            },
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: siteConfig.name,
              url: absoluteUrl("/")
            },
            {
              "@context": "https://schema.org",
              "@type": "Person",
              name: siteConfig.author,
              url: absoluteUrl("/author")
            }
          ]}
        />
        <Container className="pt-8">
          <Breadcrumb items={[{ label: "Ana Sayfa" }]} />
        </Container>
        <ContentRenderer blocks={page.body.blocks} />
      </main>
      <SiteFooter />
    </>
  );
}
