import type { MetadataRoute } from "next";
import { listPublishedBooks } from "@/features/catalog/queries";
import { listNftCollections } from "@/features/nft/queries";
import { absoluteUrl } from "@/lib/seo";

const staticRoutes = [
  { path: "/", priority: 1 },
  { path: "/books", priority: 0.9 },
  { path: "/encyclopedia", priority: 0.8 },
  { path: "/author", priority: 0.75 },
  { path: "/collections", priority: 0.65 },
  { path: "/nft", priority: 0.45 },
  { path: "/token-sale", priority: 0.4 },
  { path: "/journal", priority: 0.55 },
  { path: "/contact", priority: 0.55 },
  { path: "/faq", priority: 0.5 },
  { path: "/legal/pre-info", priority: 0.35 },
  { path: "/legal/distance-sales", priority: 0.35 },
  { path: "/legal/privacy", priority: 0.35 },
  { path: "/legal/cookie-preferences", priority: 0.25 }
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [books, nftCollections] = await Promise.all([
    listPublishedBooks(),
    listNftCollections()
  ]);

  return [
    ...staticRoutes.map((route) => ({
      changeFrequency: "weekly" as const,
      lastModified: now,
      priority: route.priority,
      url: absoluteUrl(route.path)
    })),
    ...books.map((book) => ({
      changeFrequency: "weekly" as const,
      lastModified: book.updated_at ? new Date(book.updated_at) : now,
      priority: 0.85,
      url: absoluteUrl(`/books/${book.slug}`)
    })),
    ...nftCollections.map((collection) => ({
      changeFrequency: "monthly" as const,
      lastModified: collection.updated_at ? new Date(collection.updated_at) : now,
      priority: 0.35,
      url: absoluteUrl(`/nft/${collection.slug}`)
    }))
  ];
}
