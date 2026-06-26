import Link from "next/link";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata(
  "Ödeme Bekleniyor — IOH",
  "Shopier ödemeniz doğrulanmayı bekliyor."
);

export default async function PaymentPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const params = await searchParams;
  const orderNumber = params.order ?? null;

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <Section className="py-24">
          <Container className="max-w-2xl">
            {/* Animated pulse icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 ring-1 ring-amber-500/30">
              <svg
                aria-hidden="true"
                className="h-8 w-8 animate-pulse text-amber-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h1 className="mt-8 font-display text-display-sm text-paper">
              Ödeme Bekleniyor
            </h1>

            <p className="mt-4 text-body leading-relaxed text-muted-foreground">
              Shopier ödemeniz doğrulanınca token hakkınız hesabınıza
              işlenecektir.
            </p>

            <p className="mt-3 text-body-sm leading-relaxed text-muted-foreground/80">
              Ödeme Shopier üzerinde tamamlandıktan sonra hesabınıza dönerek{" "}
              <Link
                href="/account/token-allocations"
                className="text-amber-400 underline underline-offset-4 hover:text-amber-300 transition-colors"
              >
                Token Haklarım
              </Link>{" "}
              sekmesinden durumunuzu kontrol edebilirsiniz.
            </p>

            {orderNumber && (
              <div className="mt-8 rounded-lg border border-white/[0.06] bg-white/[0.02] px-5 py-4">
                <span className="text-caption uppercase tracking-wider text-muted-foreground/60">
                  Sipariş No
                </span>
                <p className="mt-1 font-mono text-body-sm text-paper">
                  {orderNumber}
                </p>
              </div>
            )}

            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/account/token-allocations">Token Haklarıma Git</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/token-sale">Token Satışına Dön</Link>
              </Button>
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
