import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CartLineControls } from "@/features/cart/cart-line-controls";
import { getActiveCartSnapshot } from "@/features/cart/queries";
import { BookCover } from "@/features/catalog/book-cover";
import { getMediaUrl } from "@/features/catalog/catalog-utils";
import { formatMoney, VARIANT_FORMAT_LABELS } from "@/features/products/product-utils";

type CartPageProps = {
  searchParams?: Promise<{
    added?: string;
    error?: string;
    removed?: string;
    updated?: string;
  }>;
};

export default async function CartPage({ searchParams }: CartPageProps) {
  const [cart, notices] = await Promise.all([getActiveCartSnapshot(), searchParams]);

  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <Section className="pb-10 pt-10">
          <Container>
            <Breadcrumb items={[{ href: "/", label: "Ana Sayfa" }, { label: "Sepet" }]} />
            <div className="mt-10">
              <Badge variant="gold">Cart</Badge>
              <h1 className="mt-5 font-display text-display-sm text-paper">Sepet</h1>
              <p className="mt-4 max-w-2xl text-body text-muted-foreground">
                Sectiginiz baskilari checkout oncesi kontrol edin. Stok dogrulamasi
                her degisiklikte server tarafinda yeniden yapilir.
              </p>
            </div>
          </Container>
        </Section>

        <Section tone="muted">
          <Container className="grid gap-6 lg:grid-cols-[1fr_24rem] lg:items-start">
            <div className="grid gap-4">
              {notices?.error ? (
                <div className="rounded-md border border-burgundy-bright/30 bg-burgundy-bright/10 p-3 text-sm text-burgundy-soft">
                  {notices.error}
                </div>
              ) : null}
              {notices?.added || notices?.updated || notices?.removed ? (
                <div className="rounded-md border border-gold/30 bg-gold/10 p-3 text-sm text-gold">
                  Sepet guncellendi.
                </div>
              ) : null}

              {cart.lines.length === 0 ? (
                <div className="rounded-lg border border-border bg-card p-8 text-center shadow-panel">
                  <h2 className="font-display text-title-lg text-paper">Sepet bos</h2>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                    IOH katalogundan bir baski secerek sepete ekleyebilirsiniz.
                  </p>
                  <Button asChild className="mt-6">
                    <Link href="/books">Kitaplari Incele</Link>
                  </Button>
                </div>
              ) : null}

              {cart.lines.map((line) => {
                const product = line.product_variants.products;
                const media = [...(product.product_media ?? [])].sort(
                  (a, b) => a.sort_order - b.sort_order
                );
                const cover = media.find((item) => item.kind === "cover") ?? media[0] ?? null;
                const lineTotal = line.quantity * line.unit_price_minor;

                return (
                  <article
                    className="grid gap-4 rounded-lg border border-border bg-card p-4 shadow-panel sm:grid-cols-[7rem_1fr]"
                    key={line.id}
                  >
                    <BookCover
                      alt={cover?.alt_text ?? `${product.title} kapak`}
                      className="aspect-[3/4]"
                      title={product.title}
                      url={getMediaUrl(cover)}
                    />
                    <div className="grid gap-4">
                      <div className="flex flex-col justify-between gap-3 md:flex-row">
                        <div>
                          <Link
                            className="font-display text-title-md text-paper hover:text-gold"
                            href={`/books/${product.slug}`}
                          >
                            {product.title}
                          </Link>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {line.product_variants.title} -{" "}
                            {VARIANT_FORMAT_LABELS[line.product_variants.format]}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            SKU: {line.product_variants.sku}
                          </p>
                        </div>
                        <div className="text-left md:text-right">
                          <p className="font-display text-title-md text-gold">
                            {formatMoney(lineTotal, line.currency)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatMoney(line.unit_price_minor, line.currency)} / adet
                          </p>
                        </div>
                      </div>
                      <CartLineControls cartItemId={line.id} quantity={line.quantity} />
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="rounded-lg border border-border bg-card p-5 shadow-panel">
              <p className="text-eyebrow uppercase text-muted-foreground">Siparis ozeti</p>
              <dl className="mt-5 grid gap-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Urun adedi</dt>
                  <dd className="text-paper">{cart.itemCount}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Ara toplam</dt>
                  <dd className="font-display text-title-md text-gold">
                    {formatMoney(cart.subtotalMinor)}
                  </dd>
                </div>
                <div className="border-t border-border pt-3 text-xs leading-5 text-muted-foreground">
                  Kargo ve yasal bilgilendirme checkout adiminda hesaplanacak.
                </div>
              </dl>
              <Button asChild className="mt-5 w-full">
                <Link href="/checkout">Checkout adimina devam et</Link>
              </Button>
            </aside>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
