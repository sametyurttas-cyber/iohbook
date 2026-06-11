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
          "/faq",
          "/journal",
          "/legal"
        ],
        disallow: [
          "/account",
          "/admin",
          "/api",
          "/cart",
          "/checkout",
          "/forgot-password",
          "/sign-in",
          "/sign-up"
        ],
        userAgent: "*"
      }
    ],
    sitemap: absoluteUrl("/sitemap.xml")
  };
}
