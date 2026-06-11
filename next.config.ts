import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const supabaseHost = (() => {
  try {
    return new URL(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://example.supabase.co"
    ).hostname;
  } catch {
    return "example.supabase.co";
  }
})();

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    remotePatterns: [
      {
        hostname: supabaseHost,
        protocol: "https"
      },
      {
        hostname: "**",
        protocol: "https"
      }
    ]
  }
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true
});
