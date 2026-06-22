import Link from "next/link";
import { listAccountOrders } from "@/features/account/queries";
import {
  formatDateTime,
  ORDER_STATUS_HELP,
  ORDER_STATUS_LABELS
} from "@/features/account/account-utils";
import { formatMoney } from "@/features/products/product-utils";
import styles from "@/features/account/account-scene.module.css";

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

export default async function AccountOrdersPage() {
  const orders = await listAccountOrders();

  return (
    <div className={styles.cards}>
      <div className={styles.contentHead}>
        <p className={styles.kicker}>01 / SIPARISLERIM</p>
        <h2 className={styles.contentTitle}>Siparis Arşivi</h2>
        <p className={styles.contentLead}>
          Odeme ve hazirlama durumlari backend kayitlarindan gosterilir. Odeme
          yonlendirmesi basarili olsa bile backend dogrulamasi bitmeden siparis
          odendi olarak isaretlenmez.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyVisual}>IOH</div>
          <h3 className={styles.emptyTitle}>Henuz siparis yok</h3>
          <p className={styles.emptyDesc}>
            Checkout tamamlandiginda siparisleriniz odeme ve teslimat
            durumlariyla burada gorunur.
          </p>
          <Link className={styles.emptyCta} href="/books">
            Kitaplari Incele
          </Link>
        </div>
      ) : (
        <div className={styles.cards}>
          {orders.map((order) => (
            <article className={styles.card} key={order.id}>
              <div className={styles.cardRow}>
                <div className={styles.cardMain}>
                  <div className={styles.cardTop}>
                    <span className={`${styles.badge} ${statusBadgeClass(order.status)}`}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    <span className={styles.cardMono}>
                      {formatDateTime(order.created_at)}
                    </span>
                  </div>
                  <h3 className={styles.cardTitle}>{order.order_number}</h3>
                  <p className={styles.cardDesc}>{ORDER_STATUS_HELP[order.status]}</p>
                </div>
                <div className={styles.cardActions}>
                  <span className={styles.cardPrice}>
                    {formatMoney(order.total_minor, order.currency)}
                  </span>
                  <Link
                    className={`${styles.btnLink} ${styles.btnLinkGold}`}
                    href={`/account/orders/${order.id}`}
                  >
                    Detaylari Gor
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
