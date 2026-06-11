import type { Metadata } from "next";

export const siteConfig = {
  author: "Samet Yurttas",
  defaultDescription:
    "Samet Yurttas IOH kitap evreni icin premium, editoryal ve butik e-ticaret deneyimi.",
  name: "IOH",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
};

export function absoluteUrl(path = "/") {
  const baseUrl = siteConfig.url.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
}

export function buildPageMetadata({
  description,
  image,
  path,
  title,
  type = "website"
}: {
  description?: string | null;
  image?: string | null;
  path: string;
  title?: string | null;
  type?: "article" | "website";
}): Metadata {
  const metadataTitle = title || siteConfig.name;
  const socialTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const pageDescription = description || siteConfig.defaultDescription;
  const canonical = absoluteUrl(path);
  const imageUrl = image || absoluteUrl("/opengraph-image");

  return {
    alternates: {
      canonical
    },
    description: pageDescription,
    openGraph: {
      description: pageDescription,
      images: [
        {
          alt: socialTitle,
          height: 630,
          url: imageUrl,
          width: 1200
        }
      ],
      locale: "tr_TR",
      siteName: siteConfig.name,
      title: socialTitle,
      type,
      url: canonical
    },
    title: metadataTitle,
    twitter: {
      card: "summary_large_image",
      description: pageDescription,
      images: [imageUrl],
      title: socialTitle
    }
  };
}

export function jsonLdScript(data: Record<string, unknown> | Array<Record<string, unknown>>) {
  return {
    __html: JSON.stringify(data).replace(/</g, "\\u003c")
  };
}
