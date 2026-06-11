import type { Metadata } from "next";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ContentRenderer } from "@/features/content/content-renderer";
import { getPublishedContentPage } from "@/features/content/queries";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPublishedContentPage("contact");

  return buildPageMetadata({
    description: page.seoDescription ?? page.excerpt,
    path: "/contact",
    title: page.seoTitle ?? page.title
  });
}

export default async function ContactPage() {
  const page = await getPublishedContentPage("contact");

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <Container className="pt-8">
          <Breadcrumb items={[{ href: "/", label: "Ana Sayfa" }, { label: "Iletisim" }]} />
        </Container>
        <ContentRenderer blocks={page.body.blocks} />
      </main>
      <SiteFooter />
    </>
  );
}
