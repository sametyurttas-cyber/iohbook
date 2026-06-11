import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { startTokenSalePayment } from "@/features/token-sale/actions";
import { listActiveTokenCampaigns } from "@/features/token-sale/queries";
import { formatMoney } from "@/features/products/product-utils";
import { formatTokenAmount } from "@/features/token-sale/utils";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  description: "IOH token allocation packages.",
  path: "/token-sale",
  title: "Token Sale"
});

export default async function TokenSalePage() {
  const campaigns = await listActiveTokenCampaigns();

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <Section className="pb-10 pt-10">
          <Container>
            <Badge variant="gold">Token allocations</Badge>
            <h1 className="mt-5 font-display text-display-sm text-paper">Token sale</h1>
            <p className="mt-4 max-w-3xl text-body text-muted-foreground">
              Paket sec, wallet adresini hesabinda dogrula ve Shopier ile odeme baslat.
              Odeme onayindan sonra token otomatik gonderilmez; hesabinda allocation
              olarak gorunur ve admin manuel gonderim yapar.
            </p>
            <Button asChild className="mt-6" variant="outline">
              <Link href="/account/wallets">Wallet dogrula</Link>
            </Button>
          </Container>
        </Section>

        <Section tone="muted">
          <Container className="grid gap-5">
            {campaigns.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-8 shadow-panel">
                <h2 className="font-display text-title-md text-paper">Aktif kampanya yok</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Admin panelinden aktif ve satisi acik bir token kampanyasi olusturuldugunda burada gorunur.
                </p>
              </div>
            ) : null}
            {campaigns.map((campaign) => (
              <section className="rounded-lg border border-border bg-card p-6 shadow-panel" key={campaign.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Badge variant="secondary">{campaign.token_symbol}</Badge>
                    <h2 className="mt-3 font-display text-title-lg text-paper">{campaign.title}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                      {campaign.description}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Bonus: %{campaign.bonus_bps / 100}</p>
                    <p>Limit: {formatTokenAmount(campaign.total_sale_limit)}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {campaign.token_sale_packages.map((pkg) => (
                    <form action={startTokenSalePayment} className="grid gap-4 rounded-md border border-border bg-ink-soft p-4" key={pkg.id}>
                      <input name="package_id" type="hidden" value={pkg.id} />
                      <div>
                        <h3 className="font-display text-title-md text-paper">{pkg.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {formatTokenAmount(pkg.token_amount)} {campaign.token_symbol}
                        </p>
                      </div>
                      <p className="font-display text-title-md text-gold">
                        {formatMoney(pkg.price_minor, pkg.currency)}
                      </p>
                      <Input
                        defaultValue={1}
                        max={pkg.max_quantity_per_order ?? undefined}
                        min={1}
                        name="quantity"
                        type="number"
                      />
                      <label className="flex gap-3 text-xs leading-5 text-muted-foreground">
                        <input
                          className="mt-1 size-4 accent-gold"
                          name="token_sale_terms"
                          required
                          type="checkbox"
                        />
                        <span>
                          Token haklarinin odeme sonrasi allocation olarak acilacagini,
                          otomatik transfer yapilmayacagini ve manuel gonderim icin
                          dogrulanmis wallet gerektigini kabul ediyorum.
                        </span>
                      </label>
                      <Button type="submit">Shopier ile odeme yap</Button>
                    </form>
                  ))}
                </div>
              </section>
            ))}
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
