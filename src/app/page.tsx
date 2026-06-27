import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { IohIndexLanding, IohIndexStyles } from "@/features/home/ioh-index-landing";
import { getHeaderUserView } from "@/features/auth/queries";
import { absoluteUrl, buildPageMetadata, siteConfig } from "@/lib/seo";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata({
    description:
      "Samet Yurttas'in yazar evreni. GODCODE, CODEWAR ve SYSGOD - kod, savas ve sistem ekseninde premium bir anlati evreni. Cekirdeginde Iohcoin.",
    path: "/",
    title: "IOH Universe - Kod, Sistem ve Savas"
  });
}

export default async function HomePage() {
  const userView = await getHeaderUserView();
  const accountActionsHtml = userView
    ? `<div class="head-actions"><a class="head-cta" href="/account" data-hover data-magnet>${escapeHtml(userView.displayName)}</a><a class="head-cta" href="/account/profile" data-hover data-magnet>IOH Puan: ${userView.points}</a></div>`
    : undefined;

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
      <IohIndexLanding accountActionsHtml={accountActionsHtml} user={userView} />
    </>
  );
}
