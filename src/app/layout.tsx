import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.author }],
  category: "books",
  description: siteConfig.defaultDescription,
  formatDetection: {
    telephone: false
  },
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    description: siteConfig.defaultDescription,
    images: [
      {
        alt: "IOH kitap evreni",
        height: 630,
        url: "/opengraph-image",
        width: 1200
      }
    ],
    locale: "tr_TR",
    siteName: siteConfig.name,
    title: siteConfig.name,
    type: "website",
    url: "/"
  },
  robots: {
    follow: true,
    googleBot: {
      follow: true,
      index: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    },
    index: true
  },
  title: {
    default: `${siteConfig.name} | Samet Yurttas`,
    template: `%s | ${siteConfig.name}`
  },
  twitter: {
    card: "summary_large_image",
    description: siteConfig.defaultDescription,
    images: ["/opengraph-image"],
    title: `${siteConfig.name} | Samet Yurttas`
  }
};

export const viewport: Viewport = {
  colorScheme: "dark",
  initialScale: 1,
  themeColor: "#050507",
  width: "device-width"
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html className="dark" lang="tr">
      <body className="bg-background text-foreground antialiased">
        <a
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-gold focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-ink"
          href="#main-content"
        >
          Icerige gec
        </a>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
