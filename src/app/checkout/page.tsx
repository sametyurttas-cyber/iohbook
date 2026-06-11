import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getCurrentUser } from "@/features/auth/queries";
import { getActiveCartSnapshot } from "@/features/cart/queries";
import { startCheckoutPayment } from "@/features/checkout/actions";
import {
  DEFAULT_DELIVERY_OPTION_ID,
  DELIVERY_OPTIONS
} from "@/features/checkout/delivery-options";
import {
  DEFAULT_PAYMENT_PROVIDER_ID,
  PAYMENT_PROVIDERS
} from "@/features/checkout/providers";
import {
  checkoutLegalSummaries,
  legalDocuments,
  optionalCommunicationConsents
} from "@/features/legal/legal-content";
import { formatMoney } from "@/features/products/product-utils";

type CheckoutPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const [cart, user, params] = await Promise.all([
    getActiveCartSnapshot(),
    getCurrentUser(),
    searchParams
  ]);

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <Section className="pb-10 pt-10">
          <Container>
            <Breadcrumb
              items={[
                { href: "/", label: "Home" },
                { href: "/cart", label: "Cart" },
                { label: "Checkout" }
              ]}
            />
            <div className="mt-10 max-w-3xl">
              <Badge variant="gold">Global checkout</Badge>
              <h1 className="mt-5 font-display text-display-sm text-paper">
                Secure checkout
              </h1>
              <p className="mt-4 text-body text-muted-foreground">
                Enter your details, review the order, then continue to the selected
                hosted payment provider. Card details are not stored by this site.
              </p>
            </div>
          </Container>
        </Section>

        <Section tone="muted">
          <Container className="grid gap-6 lg:grid-cols-[1fr_24rem] lg:items-start">
            {cart.lines.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-8 shadow-panel">
                <h2 className="font-display text-title-lg text-paper">Your cart is empty</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Add a book before starting checkout.
                </p>
                <Button asChild className="mt-6">
                  <Link href="/books">Browse books</Link>
                </Button>
              </div>
            ) : (
              <form action={startCheckoutPayment} className="grid gap-5">
                {params?.error ? (
                  <div className="rounded-md border border-burgundy-bright/30 bg-burgundy-bright/10 p-3 text-sm text-burgundy-soft">
                    {params.error}
                  </div>
                ) : null}

                <section className="rounded-lg border border-border bg-card p-5 shadow-panel">
                  <h2 className="font-display text-title-md text-paper">Contact</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm">
                      <span className="text-muted-foreground">Full name</span>
                      <Input name="customer_name" required />
                    </label>
                    <label className="grid gap-2 text-sm">
                      <span className="text-muted-foreground">Email</span>
                      <Input
                        defaultValue={user?.email ?? ""}
                        name="customer_email"
                        required
                        type="email"
                      />
                    </label>
                    <label className="grid gap-2 text-sm sm:col-span-2">
                      <span className="text-muted-foreground">Phone with country code</span>
                      <Input name="customer_phone" placeholder="+90..." required />
                    </label>
                  </div>
                </section>

                <section className="rounded-lg border border-border bg-card p-5 shadow-panel">
                  <h2 className="font-display text-title-md text-paper">Shipping address</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="grid gap-2 text-sm">
                      <span className="text-muted-foreground">Country code</span>
                      <Input maxLength={2} name="shipping_country_code" placeholder="TR" required />
                    </label>
                    <label className="grid gap-2 text-sm">
                      <span className="text-muted-foreground">Country</span>
                      <Input name="shipping_country" placeholder="Turkiye" required />
                    </label>
                    <label className="grid gap-2 text-sm">
                      <span className="text-muted-foreground">City</span>
                      <Input name="shipping_city" required />
                    </label>
                    <label className="grid gap-2 text-sm">
                      <span className="text-muted-foreground">State / region</span>
                      <Input name="shipping_region" />
                    </label>
                    <label className="grid gap-2 text-sm sm:col-span-2">
                      <span className="text-muted-foreground">Address line 1</span>
                      <Textarea name="shipping_line1" required />
                    </label>
                    <label className="grid gap-2 text-sm sm:col-span-2">
                      <span className="text-muted-foreground">Address line 2</span>
                      <Input name="shipping_line2" />
                    </label>
                    <label className="grid gap-2 text-sm">
                      <span className="text-muted-foreground">Postal code</span>
                      <Input name="shipping_postal_code" required />
                    </label>
                    <label className="grid gap-2 text-sm">
                      <span className="text-muted-foreground">Company, optional</span>
                      <Input name="shipping_company_name" />
                    </label>
                  </div>
                </section>

                <section className="rounded-lg border border-border bg-card p-5 shadow-panel">
                  <h2 className="font-display text-title-md text-paper">Delivery</h2>
                  <div className="mt-4 grid gap-3">
                    {DELIVERY_OPTIONS.map((option) => (
                      <label
                        className="flex items-start gap-3 rounded-md border border-border bg-ink-soft p-4"
                        key={option.id}
                      >
                        <input
                          className="mt-1 h-4 w-4 accent-gold"
                          defaultChecked={option.id === DEFAULT_DELIVERY_OPTION_ID}
                          name="delivery_option"
                          type="radio"
                          value={option.id}
                        />
                        <span className="grid flex-1 gap-1">
                          <span className="flex flex-wrap items-center justify-between gap-3 font-medium text-paper">
                            {option.title}
                            <span className="text-gold">{formatMoney(option.priceMinor)}</span>
                          </span>
                          <span className="text-xs leading-5 text-muted-foreground">
                            {option.estimatedWindow}. {option.description}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </section>

                <section className="rounded-lg border border-border bg-card p-5 shadow-panel">
                  <h2 className="font-display text-title-md text-paper">Payment provider</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    iyzico is the default provider. Shopier becomes available when
                    its merchant keys are configured.
                  </p>
                  <div className="mt-4 grid gap-3">
                    {Object.values(PAYMENT_PROVIDERS).map((provider) => {
                      const availability = provider.availability();

                      return (
                        <label
                          className="flex items-start gap-3 rounded-md border border-border bg-ink-soft p-4"
                          key={provider.id}
                        >
                          <input
                            className="mt-1 h-4 w-4 accent-gold disabled:opacity-40"
                            defaultChecked={provider.id === DEFAULT_PAYMENT_PROVIDER_ID}
                            disabled={!availability.enabled}
                            name="payment_provider"
                            type="radio"
                            value={provider.id}
                          />
                          <span className="grid gap-1">
                            <span className="font-medium text-paper">{provider.label}</span>
                            <span className="text-xs leading-5 text-muted-foreground">
                              {availability.enabled
                                ? provider.type === "hosted_checkout"
                                  ? "Hosted checkout adapter is available."
                                  : "Manual payment adapter is available."
                                : availability.reason}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </section>

                <section className="rounded-lg border border-border bg-card p-5 shadow-panel">
                  <h2 className="font-display text-title-md text-paper">Billing and legal</h2>
                  <input name="billing_same_as_shipping" type="hidden" value="on" />
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    Billing address uses the shipping address for MVP checkout. Separate
                    billing profiles can be added in a later account flow.
                  </p>

                  <div className="mt-5 grid gap-4 border-t border-border pt-5">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gold">
                        Zorunlu yasal ozetler
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Aydinlatma metinleri ve sozlesme kabulu ayri kaydedilir.
                        Pazarlama izni bu alanlarin parcasi degildir.
                      </p>
                    </div>

                    {checkoutLegalSummaries.map((summary) => {
                      const document = legalDocuments[summary.documentSlug];

                      return (
                        <label
                          className="grid gap-3 rounded-md border border-border bg-ink-soft p-4 text-sm"
                          key={summary.inputName}
                        >
                          <span className="flex items-start gap-3">
                            <input
                              className="mt-1 h-4 w-4 accent-gold"
                              name={summary.inputName}
                              required={summary.required}
                              type="checkbox"
                            />
                            <span className="grid gap-1">
                              <span className="font-medium text-paper">{summary.label}</span>
                              <span className="leading-6 text-muted-foreground">
                                {summary.summary}{" "}
                                <Link className="text-gold underline-offset-4 hover:underline" href={document.href}>
                                  Metni ac
                                </Link>
                              </span>
                            </span>
                          </span>
                        </label>
                      );
                    })}

                    <div className="rounded-md border border-border bg-ink-soft p-4">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Iletisim izinleri
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Bu izinler zorunlu degildir. Secmezseniz siparisinizi
                        tamamlamaya devam edebilirsiniz.
                      </p>
                      <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
                        {optionalCommunicationConsents.map((consent) => (
                          <label className="flex items-start gap-3" key={consent.inputName}>
                            <input
                              className="mt-1 h-4 w-4 accent-gold"
                              name={consent.inputName}
                              type="checkbox"
                            />
                            <span>{consent.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <Button size="lg" type="submit">
                Odeme sayfasina devam et
                </Button>
              </form>
            )}

            <aside className="rounded-lg border border-border bg-card p-5 shadow-panel">
              <p className="text-eyebrow uppercase text-muted-foreground">Order summary</p>
              <div className="mt-5 grid gap-4">
                {cart.lines.map((line) => (
                  <div className="flex justify-between gap-4 text-sm" key={line.id}>
                    <div>
                      <p className="font-medium text-paper">
                        {line.product_variants.products.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {line.product_variants.title} x {line.quantity}
                      </p>
                    </div>
                    <p className="text-gold">
                      {formatMoney(line.quantity * line.unit_price_minor, line.currency)}
                    </p>
                  </div>
                ))}
              </div>
              <dl className="mt-5 grid gap-3 border-t border-border pt-5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="text-paper">{formatMoney(cart.subtotalMinor)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd className="text-paper">Selected in checkout</dd>
                </div>
              </dl>
              <p className="mt-4 rounded-md border border-gold/20 bg-gold/10 p-3 text-xs leading-5 text-gold">
                The default delivery option has no added fee. Paid priority delivery is only charged if manually selected.
              </p>
            </aside>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
