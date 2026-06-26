import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata(
  "Ödeme Tamamlanamadı — IOH",
  "Token satın alma işlemi tamamlanamadı."
);

export default function PaymentFailedPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <Section className="py-24">
          <Container className="max-w-2xl">
            {/* Icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 ring-1 ring-red-500/30">
              <svg
                aria-hidden="true"
                className="h-8 w-8 text-red-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h1 className="mt-8 font-display text-display-sm text-paper">
              Ödeme tamamlanamadı.
            </h1>

            <p className="mt-4 text-body leading-relaxed text-muted-foreground">
              Tekrar deneyebilirsiniz. Sorun devam ederse bizimle iletişime
              geçebilirsiniz.
            </p>

            <div className="mt-10">
              <Button asChild size="lg">
                <Link href="/token-sale">Tekrar Dene</Link>
              </Button>
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
