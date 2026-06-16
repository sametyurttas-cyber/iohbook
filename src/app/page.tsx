import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { IohIndexLanding, IohIndexStyles } from "@/features/home/ioh-index-landing";
import { absoluteUrl, buildPageMetadata, siteConfig } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    description:
      "Samet Yurttas'in yazar evreni. GODCODE, SYSGOD ve CODEWAR - kod, sistem ve savas ekseninde premium bir anlati evreni. Cekirdeginde Iohcoin.",
    path: "/",
    title: "IOH Universe - Kod, Sistem ve Savas"
  });
}

export default async function HomePage() {
  return (
    <>
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
      <IohIndexStyles />
      <IohIndexLanding />
    </>
  );
}
