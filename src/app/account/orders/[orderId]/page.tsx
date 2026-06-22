import Link from "next/link";
import { notFound } from "next/navigation";
import { getAccountOrderDetail } from "@/features/account/queries";
import {
  formatDateTime,
  ORDER_STATUS_HELP,
  ORDER_STATUS_LABELS,
  SHIPMENT_STATUS_LABELS
} from "@/features/account/account-utils";
import { formatMoney } from "@/features/products/product-utils";
import styles from "@/features/account/account-scene.module.css";

type AccountOrderDetailPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

function readSnapshotText(snapshot: Record<string, unknown>, key: string) {
  const value = snapshot[key];
  return typeof value === "string" && value.length > 0 ? value : "-";
}

function orderHasDigitalItems(order: Awaited<ReturnType<typeof getAccountOrderDetail>>) {
  return Boolean(
    order?.order_items.some(
      (item) => item.fulfillment_type === "digital" || item.fulfillment_type === "hybrid"
    )
  );
}

function statusBadgeClass(status: string) {
  if (status === "paid" || status === "fulfilled" || status === "completed") {
    return styles.badgeGold;
  }

  if (status === "pending_payment" || status === "draft") {
    return styles.badgeBlue;
  }

  if (status === "cancelled" || status === "refunded") {
    return styles.badgeRed;
  }

  return "";
}

export default async function AccountOrderDetailPage({
  params
}: AccountOrderDetailPageProps) {
  const { orderId } = await params;
  const order = await getAccountOrderDetail(orderId);

  if (!order) {
    notFound();
  }

  const hasDigitalItems = orderHasDigitalItems(order);

  return (
    <div className={styles.cards}>
      <div className={styles.contentHead}>
        <Link className={styles.btnLink} href="/account/orders">
          ← Siparislere Don
        </Link>
        <div className={styles.cardTop} style={{ marginTop: "1.25rem" }}>
          <span className={`${styles.badge} ${statusBadgeClass(order.status)}`}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>
          <span className={styles.cardMono}>{formatDateTime(order.created_at)}</span>
        </div>
        <h2 className={styles.contentTitle}>{order.order_number}</h2>
        <p className={styles.contentLead}>{ORDER_STATUS_HELP[order.status]}</p>
      </div>

      <div className={styles.cardRow}>
        <div className={styles.sectionPanel} style={{ flex: 1 }}>
          <p className={styles.kicker}>TOPLAM</p>
          <p className={styles.cardPrice} style={{ fontSize: "2rem" }}>
            {formatMoney(order.total_minor, order.currency)}
          </p>
          <p className={styles.cardDesc}>
            Toplam, checkout aninda snapshot olarak kaydedildi.
          </p>
        </div>
      </div>

      <section className={styles.sectionPanel}>
        <h3 className={styles.sectionTitle}>Urunler</h3>
        {hasDigitalItems && (order.status === "paid" || order.status === "fulfilled" || order.status === "completed") ? (
          <div className={styles.noticeSuccess}>
            <strong>Dijital kitabiniz hazir.</strong> PDF/EPUB dosyalari mail eki
            olarak gonderilmez. Guvenli indirme linkleri Indirmelerim sayfasinda
            uretilir.
            <div style={{ marginTop: "0.75rem" }}>
              <Link className={styles.btnLink} href="/account/downloads">
                Indirmelerime Git
              </Link>
            </div>
          </div>
        ) : null}
        <div className={styles.cards}>
          {order.order_items.map((item) => (
            <div className={styles.cardRow} key={item.id} style={{ borderBottom: "1px solid rgba(242,239,232,0.08)", paddingBottom: "1rem" }}>
              <div className={styles.cardMain}>
                <p className={styles.profileValue}>
                  {readSnapshotText(item.product_snapshot, "title")}
                </p>
                <p className={styles.cardMono}>
                  {readSnapshotText(item.variant_snapshot, "title")} / SKU{" "}
                  {readSnapshotText(item.variant_snapshot, "sku")}
                </p>
                <p className={styles.cardMono}>Adet: <b>{item.quantity}</b></p>
              </div>
              <span className={styles.cardPrice}>
                {formatMoney(item.total_minor, order.currency)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.grid2}>
        <section className={styles.sectionPanel}>
          <h3 className={styles.sectionTitle}>Tutarlar</h3>
          <div className={styles.cards}>
            <div className={styles.cardRow}>
              <span className={styles.cardMono}>Ara toplam</span>
              <span className={styles.profileValue}>{formatMoney(order.subtotal_minor, order.currency)}</span>
            </div>
            <div className={styles.cardRow}>
              <span className={styles.cardMono}>Indirim</span>
              <span className={styles.profileValue}>{formatMoney(order.discount_minor, order.currency)}</span>
            </div>
            <div className={styles.cardRow}>
              <span className={styles.cardMono}>Kargo</span>
              <span className={styles.profileValue}>{formatMoney(order.shipping_minor, order.currency)}</span>
            </div>
            <div className={styles.cardRow}>
              <span className={styles.cardMono}>Vergi</span>
              <span className={styles.profileValue}>{formatMoney(order.tax_minor, order.currency)}</span>
            </div>
            <div className={styles.cardRow} style={{ borderTop: "1px solid rgba(242,239,232,0.08)", paddingTop: "0.75rem" }}>
              <span className={styles.profileValue}>Toplam</span>
              <span className={styles.cardPrice}>{formatMoney(order.total_minor, order.currency)}</span>
            </div>
          </div>
        </section>

        <section className={styles.sectionPanel}>
          <h3 className={styles.sectionTitle}>Kargo</h3>
          {order.fulfillment_shipments.length === 0 ? (
            <p className={styles.cardDesc}>
              Henuz kargo olusturulmadi. Hazirlama basladiginda tasiyici ve takip
              bilgisi burada gorunecek.
            </p>
          ) : (
            <div className={styles.cards}>
              {order.fulfillment_shipments.map((shipment) => (
                <div key={shipment.id} className={styles.card} style={{ padding: "1.25rem" }}>
                  <span className={`${styles.badge} ${styles.badgeGold}`}>
                    {SHIPMENT_STATUS_LABELS[shipment.status]}
                  </span>
                  <div className={styles.cardRow}>
                    <span className={styles.cardMono}>Tasiyici</span>
                    <span className={styles.profileValue}>{shipment.provider ?? "Atanmadi"}</span>
                  </div>
                  <div className={styles.cardRow}>
                    <span className={styles.cardMono}>Takip no</span>
                    <span className={styles.profileValue}>{shipment.tracking_number ?? "Henuz yok"}</span>
                  </div>
                  {shipment.tracking_url ? (
                    <Link className={styles.btnLink} href={shipment.tracking_url}>
                      Takip Linkini Ac
                    </Link>
                  ) : null}
                  <p className={styles.cardMono}>Gonderim: <b>{formatDateTime(shipment.shipped_at)}</b></p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className={styles.sectionPanel}>
        <h3 className={styles.sectionTitle}>Odeme Dogrulama</h3>
        <p className={styles.cardDesc}>
          Odeme provider yonlendirmesi kullanici deneyimi sinyali olarak kabul
          edilir. Siparis yalnizca backend dogrulamasi sonrasi odendi olarak
          isaretlenir.
        </p>
        <div className={styles.cards}>
          {order.payment_attempts.map((attempt) => (
            <div key={attempt.created_at} className={styles.card} style={{ padding: "1.25rem" }}>
              <div className={styles.cardTop}>
                <span className={`${styles.badge} ${styles.badgeBlue}`}>{attempt.provider}</span>
                <span className={styles.badge}>{attempt.status}</span>
              </div>
              <p className={styles.cardMono}>Provider durumu: <b>{attempt.provider_status ?? "Bildirilmedi"}</b></p>
              <p className={styles.cardMono}>Dogrulandi: <b>{formatDateTime(attempt.verified_at)}</b></p>
              {attempt.failure_reason ? (
                <p className={styles.cardDesc} style={{ color: "#f07e72" }}>Sebep: {attempt.failure_reason}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
