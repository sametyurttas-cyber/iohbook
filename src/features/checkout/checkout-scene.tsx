import Link from "next/link";
import type { ReactNode } from "react";
import { BooksIndexFooter } from "@/features/catalog/books-index-scene";
import { getCurrentUser, getHeaderUserView } from "@/features/auth/queries";
import { IohIndexStyles } from "@/features/home/ioh-index-landing";
import { getActiveCartSnapshot, type CartLine } from "@/features/cart/queries";
import { startCheckoutPayment } from "@/features/checkout/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  DEFAULT_DELIVERY_OPTION_ID,
  DELIVERY_OPTIONS
} from "@/features/checkout/delivery-options";
import { isDigitalOnlyOrder } from "@/features/checkout/fulfillment-utils";
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
import styles from "@/features/cart/cart-scene.module.css";
import { IohSceneHeader } from "@/components/layout/ioh-scene-header";

function Kicker({ children }: { children: ReactNode }) {
  return <p className={styles.kicker}>{children}</p>;
}



function CheckoutHero() {
  return (
    <section className={styles.hero} id="checkout">
      <div className={styles.heroGhost} aria-hidden="true">CHECKOUT</div>
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={styles.heroShell}>
        <Kicker>SECURE CHECKOUT / IOH UNIVERSE</Kicker>
        <h1 className={styles.heroTitle}>Guvenli Odeme</h1>
        <p className={styles.heroLead}>
          Bilgilerinizi girin, siparisi gozden gecirin ve secili odeme provider&apos;ina
          devam edin. Kart bilgileri sitemizde saklanmaz.
        </p>
      </div>
    </section>
  );
}

export async function CheckoutScene({
  searchParams
}: {
  searchParams?: Promise<{
    error?: string;
  }>;
}) {
  const [cart, userView, params, user] = await Promise.all([
    getActiveCartSnapshot(),
    getHeaderUserView(),
    searchParams,
    getCurrentUser()
  ]);
  const paymentProviderOptions = Object.values(PAYMENT_PROVIDERS).map((provider) => ({
    availability: provider.availability(),
    provider
  }));
  const digitalOnlyOrder = isDigitalOnlyOrder(cart.lines);
  const defaultEnabledPaymentProviderId =
    paymentProviderOptions.find(({ availability }) => availability.enabled)?.provider.id ??
    DEFAULT_PAYMENT_PROVIDER_ID;

  return (
    <div className={styles.page}>
      <IohIndexStyles />
      <style dangerouslySetInnerHTML={{ __html: "body{cursor:auto!important}a,button,[data-hover],[data-magnet]{cursor:pointer!important}" }} />
      <div className={styles.vignette} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />
      <IohSceneHeader user={userView} />
      <main className={styles.main} id="main-content">
        <CheckoutHero />

        <section className={styles.cartBody}>
          <div className={styles.shell}>
            {cart.lines.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyVisual}>IOH</div>
                <h2 className={styles.emptyTitle}>Sepetiniz bos</h2>
                <p className={styles.emptyDesc}>
                  Odemeye baslamadan once katalogdan bir kitap secin.
                </p>
                <Link className={styles.emptyCta} href="/books">
                  Kitaplari Incele
                </Link>
              </div>
            ) : (
              <div className={styles.cartGrid}>
                <form action={startCheckoutPayment} className={styles.lines}>
                  {params?.error ? (
                    <div className={styles.noticeError}>{params.error}</div>
                  ) : null}

                  {/* Contact */}
                  <div className={styles.panel}>
                    <div className={styles.panelHead}>
                      <h3 className={styles.panelTitle}>Iletisim Bilgileri</h3>
                      <p className={styles.kicker}>01 / CONTACT</p>
                    </div>
                    {digitalOnlyOrder ? (
                      <p className={styles.panelLead}>
                        Dijital kitaplar odeme sonrasinda Hesabim &gt; Indirmelerim
                        alaninda guvenli indirme linkiyle acilir. Kargo adresi gerekmez.
                      </p>
                    ) : null}
                    <div className={styles.formGrid + " " + styles.formGrid2}>
                      <label className={styles.formField}>
                        <span className={styles.formFieldLabel}>Ad Soyad</span>
                        <input name="customer_name" required type="text" />
                      </label>
                      <label className={styles.formField}>
                        <span className={styles.formFieldLabel}>E-posta</span>
                        <input
                          defaultValue={user?.email ?? ""}
                          name="customer_email"
                          required
                          type="email"
                        />
                      </label>
                      <label className={styles.formField} style={{ gridColumn: "span 2" }}>
                        <span className={styles.formFieldLabel}>Telefon (ulke kodu ile)</span>
                        <input name="customer_phone" placeholder="+90..." required type="tel" />
                      </label>
                    </div>
                  </div>

                  {/* Digital delivery notice or shipping address */}
                  {digitalOnlyOrder ? (
                    <div className={styles.panel + " " + styles.panelGold}>
                      <div className={styles.panelHead}>
                        <h3 className={styles.panelTitle}>Dijital Teslimat</h3>
                        <p className={styles.kicker}>DIGITAL</p>
                      </div>
                      <p className={styles.panelLead}>
                        Bu sepet sadece dijital kitap iceriyor. Kargo secimi ve adres
                        adimi atlanir; odeme onayindan sonra indirme hakki hesabiniza tanimlanir.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className={styles.panel}>
                        <div className={styles.panelHead}>
                          <h3 className={styles.panelTitle}>Teslimat Adresi</h3>
                          <p className={styles.kicker}>02 / SHIPPING</p>
                        </div>
                        <div className={styles.formGrid + " " + styles.formGrid2}>
                          <label className={styles.formField}>
                            <span className={styles.formFieldLabel}>Ulke Kodu</span>
                            <input maxLength={2} name="shipping_country_code" placeholder="TR" required type="text" />
                          </label>
                          <label className={styles.formField}>
                            <span className={styles.formFieldLabel}>Ulke</span>
                            <input name="shipping_country" placeholder="Turkiye" required type="text" />
                          </label>
                          <label className={styles.formField}>
                            <span className={styles.formFieldLabel}>Sehir</span>
                            <input name="shipping_city" required type="text" />
                          </label>
                          <label className={styles.formField}>
                            <span className={styles.formFieldLabel}>Eyalet / Bolge</span>
                            <input name="shipping_region" type="text" />
                          </label>
                          <label className={styles.formField} style={{ gridColumn: "span 2" }}>
                            <span className={styles.formFieldLabel}>Adres Satiri 1</span>
                            <textarea name="shipping_line1" required rows={2} />
                          </label>
                          <label className={styles.formField} style={{ gridColumn: "span 2" }}>
                            <span className={styles.formFieldLabel}>Adres Satiri 2</span>
                            <input name="shipping_line2" type="text" />
                          </label>
                          <label className={styles.formField}>
                            <span className={styles.formFieldLabel}>Posta Kodu</span>
                            <input name="shipping_postal_code" required type="text" />
                          </label>
                          <label className={styles.formField}>
                            <span className={styles.formFieldLabel}>Sirket (opsiyonel)</span>
                            <input name="shipping_company_name" type="text" />
                          </label>
                        </div>
                      </div>

                      <div className={styles.panel}>
                        <div className={styles.panelHead}>
                          <h3 className={styles.panelTitle}>Teslimat Secenegi</h3>
                          <p className={styles.kicker}>03 / DELIVERY</p>
                        </div>
                        <div className={styles.lines}>
                          {DELIVERY_OPTIONS.map((option) => (
                            <label className={styles.radioCard} key={option.id}>
                              <input
                                defaultChecked={option.id === DEFAULT_DELIVERY_OPTION_ID}
                                name="delivery_option"
                                type="radio"
                                value={option.id}
                              />
                              <div className={styles.radioCardBody}>
                                <div className={styles.radioCardTitle}>
                                  {option.title}
                                  <span className={styles.radioCardPrice}>
                                    {formatMoney(option.priceMinor)}
                                  </span>
                                </div>
                                <span className={styles.radioCardDesc}>
                                  {option.estimatedWindow}. {option.description}
                                </span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Payment provider */}
                  <div className={styles.panel}>
                    <div className={styles.panelHead}>
                      <h3 className={styles.panelTitle}>Odeme Yontemi</h3>
                      <p className={styles.kicker}>04 / PAYMENT</p>
                    </div>
                    <p className={styles.panelLead}>
                      Shopier yapilandirildiysa kullanilabilir. Kart bilgileri
                      sitemizde saklanmaz.
                    </p>
                    <div className={styles.lines}>
                      {paymentProviderOptions.map(({ availability, provider }) => (
                        <label
                          className={styles.radioCard}
                          key={provider.id}
                          style={!availability.enabled && provider.id !== "shopier" ? { opacity: 0.5 } : undefined}
                        >
                          <input
                            defaultChecked={provider.id === defaultEnabledPaymentProviderId}
                            disabled={!availability.enabled && provider.id !== "shopier"}
                            name="payment_provider"
                            type="radio"
                            value={provider.id}
                          />
                          <div className={styles.radioCardBody}>
                            <div className={styles.radioCardTitle}>{provider.label}</div>
                            <span className={styles.radioCardDesc}>
                              {availability.enabled
                                ? provider.type === "hosted_checkout"
                                  ? "Hosted checkout adapteri kullanilabilir."
                                  : "Manuel odeme adapteri kullanilabilir."
                                : availability.reason}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Billing and legal */}
                  <div className={styles.panel}>
                    <div className={styles.panelHead}>
                      <h3 className={styles.panelTitle}>Yasal Onaylar</h3>
                      <p className={styles.kicker}>05 / LEGAL</p>
                    </div>
                    <input name="billing_same_as_shipping" type="hidden" value="on" />
                    <p className={styles.panelLead}>
                      {digitalOnlyOrder
                        ? "Dijital-only sipariste kargo/adres bilgisi alinmaz. Yasal onaylar ve odeme kaydi siparisle birlikte saklanir."
                        : "Fatura adresi, teslimat adresi olarak kullanilir. Ayri fatura profilleri ileride eklenebilir."}
                    </p>

                    <div className={styles.sectionTitle} style={{ marginTop: "1.5rem", fontSize: "0.9rem" }}>
                      <p className={styles.legalSectionHead}>Zorunlu Yasal Ozetler</p>
                      <p className={styles.panelLead} style={{ marginTop: "0.5rem" }}>
                        Aydinlatma metinleri ve sozlesme kabulu ayri kaydedilir.
                        Pazarlama izni bu alanlarin parcasi degildir.
                      </p>
                    </div>

                    <div className={styles.lines} style={{ marginTop: "1rem" }}>
                      {checkoutLegalSummaries.map((summary) => {
                        const document = legalDocuments[summary.documentSlug];

                        return (
                          <label
                            className={styles.legalCheck}
                            key={summary.inputName}
                          >
                            <div className={styles.legalCheckRow}>
                              <input
                                name={summary.inputName}
                                required={summary.required}
                                type="checkbox"
                              />
                              <div className={styles.legalCheckBody}>
                                <span className={styles.legalCheckLabel}>{summary.label}</span>
                                <span className={styles.legalCheckDesc}>
                                  {summary.summary}{" "}
                                  <Link
                                    className={styles.backLink}
                                    href={document.href}
                                    style={{ color: "var(--c-gold)", display: "inline" }}
                                  >
                                    Metni ac
                                  </Link>
                                </span>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    <div className={styles.panel} style={{ marginTop: "1rem", background: "rgba(5,6,10,0.4)" }}>
                      <p className={styles.legalSectionHead}>Iletisim Izinleri</p>
                      <p className={styles.panelLead} style={{ marginTop: "0.5rem" }}>
                        Bu izinler zorunlu degildir. Secmezseniz siparisinizi
                        tamamlamaya devam edebilirsiniz.
                      </p>
                      <div className={styles.lines} style={{ marginTop: "1rem" }}>
                        {optionalCommunicationConsents.map((consent) => (
                          <label className={styles.legalCheck} key={consent.inputName}>
                            <div className={styles.legalCheckRow}>
                              <input name={consent.inputName} type="checkbox" />
                              <div className={styles.legalCheckBody}>
                                <span className={styles.legalCheckDesc}>{consent.label}</span>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <SubmitButton className={styles.submitBtn} size="lg">
                    Odeme Sayfasina Devam Et
                  </SubmitButton>
                </form>

                {/* Order summary */}
                <aside className={styles.summary}>
                  <div className={styles.summaryHead}>
                    <Kicker>SIPARIS OZETI</Kicker>
                    <h2 className={styles.summaryTitle}>Ozet</h2>
                  </div>

                  <div className={styles.summaryRows}>
                    {cart.lines.map((line: CartLine) => (
                      <div className={styles.summaryRow} key={line.id}>
                        <div>
                          <span style={{ color: "var(--c-ink)", fontWeight: 500 }}>
                            {line.product_variants.products.title}
                          </span>
                          <div style={{ fontSize: "0.72rem", color: "var(--c-muted)", marginTop: "0.2rem" }}>
                            {line.product_variants.title} x {line.quantity}
                          </div>
                        </div>
                        <span style={{ color: "var(--c-gold)" }}>
                          {formatMoney(line.quantity * line.unit_price_minor, line.currency)}
                        </span>
                      </div>
                    ))}
                    <div className={`${styles.summaryRow} ${styles.summaryRowTotal}`} style={{ marginTop: "0.5rem" }}>
                      <span>Ara Toplam</span>
                      <b>{formatMoney(cart.subtotalMinor)}</b>
                    </div>
                    <div className={styles.summaryRow}>
                      <span>Teslimat</span>
                      <b>{digitalOnlyOrder ? "Dijital Teslimat" : "Checkout'da sec"}</b>
                    </div>
                  </div>

                  <div className={styles.trust}>
                    {[
                      "Dijital teslimat",
                      "Hesaba otomatik eklenir",
                      "Kart bilgileri saklanmaz",
                      "Siparis gecmisinde saklanir"
                    ].map((item) => (
                      <div className={styles.trustItem} key={item}>
                        <span className={styles.trustCheck} aria-hidden="true">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <p className={styles.panelLead} style={{ padding: "0.75rem 1rem", border: "1px solid rgba(231,197,116,0.18)", borderRadius: "8px", background: "rgba(231,197,116,0.04)" }}>
                    {digitalOnlyOrder
                      ? "Dosya mail eki olarak gonderilmez; guvenli indirme linki hesabinizda acilir."
                      : "Varsayilan teslimat seceneginde ek ucret yoktur."}
                  </p>
                </aside>
              </div>
            )}
          </div>
        </section>

        <BooksIndexFooter />
      </main>
    </div>
  );
}
