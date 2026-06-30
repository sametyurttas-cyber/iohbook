import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { getHeaderUserView } from "@/features/auth/queries";
import { EncyclopediaScene } from "@/features/encyclopedia/encyclopedia-scene";
import { characters, cities, factions, technologies, timeline } from "@/features/encyclopedia/encyclopedia-data";
import { absoluteUrl, buildPageMetadata, siteConfig } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = buildPageMetadata({
  description:
    "IOH Universe karakterlerini, sehirlerini, organizasyonlarini ve teknolojilerini resmi evren arsivinde kesfedin.",
  path: "/encyclopedia",
  title: "Encyclopedia"
});

export default async function EncyclopediaPage() {
  const userView = await getHeaderUserView();

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            about: [
              "IOH Universe",
              "IOH",
              "science fiction characters",
              "future cities",
              "fictional technology"
            ],
            author: {
              "@type": "Person",
              name: siteConfig.author
            },
            description:
              "IOH Universe karakterlerini, sehirlerini, organizasyonlarini ve teknolojilerini iceren resmi evren arsivi.",
            hasPart: [
              ...characters.map((character) => ({
                "@type": "Person",
                affiliation: character.organization,
                description: character.summary,
                name: character.name,
                url: absoluteUrl(`/encyclopedia#${character.id}`)
              })),
              ...cities.map((city) => ({
                "@type": "Place",
                description: city.summary,
                name: city.name,
                url: absoluteUrl(`/encyclopedia#${city.id}`)
              })),
              ...factions.map((faction) => ({
                "@type": "Organization",
                description: faction.summary,
                name: faction.name,
                url: absoluteUrl(`/encyclopedia#${faction.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`)
              })),
              ...technologies.map((technology) => ({
                "@type": "DefinedTerm",
                description: technology.summary,
                name: technology.name,
                termCode: technology.code
              }))
            ],
            inLanguage: "tr",
            isPartOf: {
              "@type": "WebSite",
              name: siteConfig.name,
              url: absoluteUrl("/")
            },
            name: "IOH Universe Encyclopedia",
            url: absoluteUrl("/encyclopedia")
          },
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: [
              ...characters.map((character, index) => ({
                "@type": "ListItem",
                item: {
                  "@type": "Person",
                  name: character.name,
                  url: absoluteUrl(`/encyclopedia#${character.id}`)
                },
                position: index + 1
              })),
              ...cities.map((city, index) => ({
                "@type": "ListItem",
                item: {
                  "@type": "Place",
                  name: city.name,
                  url: absoluteUrl(`/encyclopedia#${city.id}`)
                },
                position: characters.length + index + 1
              })),
              ...timeline.map((entry, index) => ({
                "@type": "ListItem",
                item: {
                  "@type": "CreativeWork",
                  name: `${entry.year} - ${entry.title}`,
                  text: entry.event
                },
                position: characters.length + cities.length + index + 1
              }))
            ],
            name: "IOH Encyclopedia Archive Index"
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                item: absoluteUrl("/"),
                name: "Ana Sayfa",
                position: 1
              },
              {
                "@type": "ListItem",
                item: absoluteUrl("/encyclopedia"),
                name: "Encyclopedia",
                position: 2
              }
            ]
          }
        ]}
      />
      <EncyclopediaScene
        user={userView}
      />
    </>
  );
}
