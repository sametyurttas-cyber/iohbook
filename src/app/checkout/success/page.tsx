import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { buildNoIndexMetadata } from "@/lib/seo";

export const metadata: Metadata = buildNoIndexMetadata(
  "Siparis sonucu",
  "IOH siparis dogrulama sonucu."
);

export default function CheckoutSuccessPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <Section className="py-16">
          <Container className="max-w-3xl">
            <Badge variant="gold">Verification complete</Badge>
            <h1 className="mt-5 font-display text-display-sm text-paper">
              Thank you for your order
            </h1>
            <p className="mt-4 text-body text-muted-foreground">
              iyzico redirected back to the store and the backend retrieve check marked
              the payment as paid. Fulfillment and tracking details will be handled from
              the admin operations flow.
            </p>
            <Button asChild className="mt-8">
              <Link href="/books">Return to books</Link>
            </Button>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
