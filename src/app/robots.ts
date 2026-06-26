import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        allow: [
          "/",
          "/author",
          "/books",
          "/collections",
          "/contact",
          "/encyclopedia",
          "/faq",
          "/journal",
          "/legal",
          "/nft",
          "/token-sale"
        ],
        disallow: [
          "/account",
          "/admin",
          "/api",
          "/cart",
          "/checkout",
          "/forgot-password",
          "/sign-in",
          "/sign-up",
          "/style-guide",
          "/unauthorized",
          "/unsubscribe"
        ],
        userAgent: "*"
      }
    ],
    sitemap: absoluteUrl("/sitemap.xml")
  };
}
