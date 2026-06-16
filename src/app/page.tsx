import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { IohIndexLanding, IohIndexStyles } from "@/features/home/ioh-index-landing";
import { getCurrentProfile, getCurrentUser } from "@/features/auth/queries";
import { getIohPointBalanceForProfile } from "@/features/points/queries";
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
      "Samet Yurttas'in yazar evreni. GODCODE, SYSGOD ve CODEWAR - kod, sistem ve savas ekseninde premium bir anlati evreni. Cekirdeginde Iohcoin.",
    path: "/",
    title: "IOH Universe - Kod, Sistem ve Savas"
  });
}

export default async function HomePage() {
  const user = await getCurrentUser();
  const [profile, points] = user
    ? await Promise.all([getCurrentProfile(), getIohPointBalanceForProfile(user.id)])
    : [null, null];
  const displayName = profile?.full_name || profile?.email || user?.email || "Hesabim";
  const accountActionsHtml = user
    ? `<div class="head-actions"><a class="head-cta" href="/account" data-hover data-magnet>${escapeHtml(displayName)}</a><a class="head-cta" href="/account/profile" data-hover data-magnet>IOH Puan: ${points?.balance ?? 0}</a></div>`
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
      <IohIndexLanding accountActionsHtml={accountActionsHtml} />
    </>
  );
}
