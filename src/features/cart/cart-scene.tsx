import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { BooksIndexFooter } from "@/features/catalog/books-index-scene";
import { getHeaderUserView } from "@/features/auth/queries";
import { IohIndexStyles } from "@/features/home/ioh-index-landing";
import { clearCart } from "@/features/cart/actions";
import { CartLineControls } from "@/features/cart/cart-line-controls";
import { getActiveCartSnapshot, type CartLine } from "@/features/cart/queries";
import { getMediaUrl } from "@/features/catalog/catalog-utils";
import { isDigitalOnlyOrder } from "@/features/checkout/fulfillment-utils";
import { formatMoney, VARIANT_FORMAT_LABELS } from "@/features/products/product-utils";
import styles from "./cart-scene.module.css";
import { IohSceneHeader } from "@/components/layout/ioh-scene-header";

const cartErrorMessages: Record<string, string> = {
  "out-of-stock":
    "Sepetindeki urunlerden biri icin yeterli stok kalmadi. Devam etmeden once sepeti kontrol et.",
  "price-changed":
    "Sepetindeki urunlerden birinin fiyati guncellendi. Devam etmeden once sepeti kontrol et.",
  "physical-unavailable":
    "Fiziksel kitap satisi bu MVP'de kapali. Lutfen PDF veya EPUB dijital formatini sec.",
  "product-unavailable":
    "Sepetindeki urunlerden biri artik satista degil. Devam etmeden once sepeti kontrol et."
};

const trustItems = [
  "Dijital teslimat",
  "Hesaba otomatik eklenir",
  "PDF ve EPUB erisimi",
  "Siparis gecmisinde saklanir"
] as const;

function Kicker({ children }: { children: ReactNode }) {
  return <p className={styles.kicker}>{children}</p>;
}



function CartHero() {
  return (
    <section className={styles.hero} id="cart">
      <div className={styles.heroGhost} aria-hidden="true">CART</div>
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={styles.heroShell}>
        <Kicker>DIGITAL LIBRARY</Kicker>
        <h1 className={styles.heroTitle}>Sepet</h1>
        <p className={styles.heroLead}>
          Sectiginiz dijital kitaplar odeme sonrasi hesabiniza eklenir ve PDF/EPUB
          olarak erisilebilir hale gelir.
        </p>
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyVisual} aria-hidden="true">
        <span>IOH</span>
      </div>
      <h2 className={styles.emptyTitle}>Henuez bir kitap secmediniz</h2>
      <p className={styles.emptyDesc}>
        IOH Universe kataloğundan dijital kitap secerek kisisel kutuphanenizi
        olusturmaya baslayabilirsiniz.
      </p>
      <Link className={styles.emptyCta} href="/books">
        Kitaplari Incele
      </Link>
    </div>
  );
}

function CartLineRow({ line }: { line: CartLine }) {
  const product = line.product_variants.products;
  const media = [...(product.product_media ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );
  const cover = media.find((item) => item.kind === "cover") ?? media[0] ?? null;
  const coverUrl = getMediaUrl(cover);
  const lineTotal = line.quantity * line.unit_price_minor;
  const formatLabel = VARIANT_FORMAT_LABELS[line.product_variants.format] ?? line.product_variants.format;

  return (
    <article className={styles.line} key={line.id}>
      <div className={styles.lineCover}>
        {coverUrl ? (
          <Image
            alt={cover?.alt_text ?? `${product.title} kapak`}
            className="h-full w-full object-cover"
            fill
            sizes="120px"
            src={coverUrl}
          />
        ) : (
          <div className={styles.lineCoverFallback}>
            <span>IOH</span>
            <b>{product.title}</b>
          </div>
        )}
      </div>
      <div className={styles.lineBody}>
        <div className={styles.lineHead}>
          <div className={styles.lineMeta}>
            <Link className={styles.lineTitle} href={`/books/${product.slug}`}>
              {product.title}
            </Link>
            <p className={styles.lineFormat}>
              Format <b>{formatLabel}</b>
            </p>
          </div>
          <div className={styles.linePrice}>
            <span className={styles.lineTotal}>
              {formatMoney(lineTotal, line.currency)}
            </span>
            <span className={styles.lineUnit}>
              {formatMoney(line.unit_price_minor, line.currency)} / adet
            </span>
          </div>
        </div>
        <div className={styles.lineControls}>
          <CartLineControls cartItemId={line.id} quantity={line.quantity} />
        </div>
      </div>
    </article>
  );
}

function OrderSummary({
  itemCount,
  subtotalMinor,
  digitalOnly
}: {
  itemCount: number;
  subtotalMinor: number;
  digitalOnly: boolean;
}) {
  return (
    <aside className={styles.summary}>
      <div className={styles.summaryHead}>
        <Kicker>SIPARIS OZETI</Kicker>
        <h2 className={styles.summaryTitle}>Ozet</h2>
      </div>

      <div className={styles.summaryRows}>
        <div className={styles.summaryRow}>
          <span>Urun adedi</span>
          <b>{itemCount}</b>
        </div>
        <div className={styles.summaryRow}>
          <span>Ara toplam</span>
          <b>{formatMoney(subtotalMinor)}</b>
        </div>
        <div className={styles.summaryRow}>
          <span>Teslimat turu</span>
          <b>{digitalOnly ? "Dijital Teslimat" : "Checkout adiminda"}</b>
        </div>
        <div className={styles.summaryRow}>
          <span>Format</span>
          <b>{digitalOnly ? "PDF / EPUB" : "Karisik"}</b>
        </div>
        <div className={styles.summaryRow}>
          <span>Odeme sonrasi</span>
          <b>Kutuphaneme Eklenir</b>
        </div>
        <div className={`${styles.summaryRow} ${styles.summaryRowTotal}`}>
          <span>Toplam</span>
          <b>{formatMoney(subtotalMinor)}</b>
        </div>
      </div>

      <div className={styles.trust}>
        {trustItems.map((item) => (
          <div className={styles.trustItem} key={item}>
            <span className={styles.trustCheck} aria-hidden="true">✓</span>
            <span>{item}</span>
          </div>
        ))}
      </div>

      <div className={styles.ctaArea}>
        <Link className={styles.checkoutButton} href="/checkout">
          Odemeye Gec <span aria-hidden="true">-&gt;</span>
        </Link>
        <form action={clearCart}>
          <button className={styles.clearButton} type="submit">
            Sepeti Bosalt
          </button>
        </form>
      </div>
    </aside>
  );
}

export async function CartScene({
  searchParams
}: {
  searchParams?: Promise<{
    added?: string;
    error?: string;
    cleared?: string;
    removed?: string;
    updated?: string;
  }>;
}) {
  const [cart, notices, userView] = await Promise.all([
    getActiveCartSnapshot(),
    searchParams,
    getHeaderUserView()
  ]);
  const digitalOnlyOrder = isDigitalOnlyOrder(cart.lines);

  return (
    <div className={styles.page}>
      <IohIndexStyles />
      <style dangerouslySetInnerHTML={{ __html: "body{cursor:auto!important}a,button,[data-hover],[data-magnet]{cursor:pointer!important}" }} />
      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />
      <IohSceneHeader user={userView} />
      <main className={styles.main} id="main-content">
        <CartHero />

        <section className={styles.cartBody}>
          <div className={styles.shell}>
            {notices?.error || notices?.added || notices?.updated || notices?.removed || notices?.cleared ? (
              <div className={styles.notices}>
                {notices?.error ? (
                  <div className={styles.noticeError}>
                    {cartErrorMessages[notices.error] ?? notices.error}
                  </div>
                ) : null}
                {notices?.added || notices?.updated || notices?.removed || notices?.cleared ? (
                  <div className={styles.noticeSuccess}>
                    {notices.cleared ? "Sepet bosaltildi." : "Sepet guncellendi."}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className={styles.cartGrid}>
              {cart.lines.length === 0 ? (
                <EmptyState />
              ) : (
                <div className={styles.lines}>
                  {cart.lines.map((line) => (
                    <CartLineRow key={line.id} line={line} />
                  ))}
                </div>
              )}

              <OrderSummary
                digitalOnly={digitalOnlyOrder}
                itemCount={cart.itemCount}
                subtotalMinor={cart.subtotalMinor}
              />
            </div>
          </div>
        </section>

        <BooksIndexFooter />
      </main>
    </div>
  );
}
