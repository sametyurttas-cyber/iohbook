import { listAccountTokenAllocations } from "@/features/token-sale/queries";
import {
  getAccountPointBalance,
  listAccountPointLedger
} from "@/features/account/queries";
import { formatIohPointReason, getIohPointLedgerDetail, getIohPointLedgerTitle } from "@/features/points/queries";
import { formatMoney } from "@/features/products/product-utils";
import { formatTokenAmount } from "@/features/token-sale/utils";
import { formatDateTime } from "@/features/account/account-utils";
import styles from "@/features/account/account-scene.module.css";

function allocationStatusBadge(status: string) {
  if (status === "sent") return styles.badgeGold;
  if (status === "approved") return styles.badgeBlue;
  if (status === "cancelled" || status === "refunded") return styles.badgeRed;
  return "";
}

function allocationStatusLabel(status: string) {
  const map: Record<string, string> = {
    pending: "Beklemede",
    approved: "Onaylandi",
    sent: "Gonderildi",
    cancelled: "Iptal",
    refunded: "Iade"
  };
  return map[status] ?? status;
}

export default async function AccountTokenAllocationsPage() {
  const [allocations, points, pointLedger] = await Promise.all([
    listAccountTokenAllocations(),
    getAccountPointBalance(),
    listAccountPointLedger(5)
  ]);

  return (
    <div className={styles.cards}>
      <div className={styles.contentHead}>
        <p className={styles.kicker}>04 / TOKEN HAKLARIM</p>
        <h2 className={styles.contentTitle}>IOH Puan ve Haklarim</h2>
        <p className={styles.contentLead}>
          IOH puanin ve token allocation kayitlarin tek merkezde. Bu alan
          IOH Universe erisim ve puan hakki olarak sunulur; yatirim tavsiyesi
          veya finansal getiri vaadi icermez.
        </p>
      </div>

      <div className={styles.pointsPanel}>
        <div className={styles.pointsHead}>
          <div className={styles.pointsInfo}>
            <span className={`${styles.badge} ${styles.badgeGold}`}>IOH PUAN</span>
            <h3 className={styles.pointsTitle}>Mevcut IOH puanin</h3>
            <p className={styles.pointsDesc}>
              Uye olma ve basarili kitap siparislerinden kazandigin uygulama ici
              puanlar. Yatirim araci degildir.
            </p>
          </div>
          <div className={styles.pointsValue}>
            <span className={styles.pointsNumber}>{points.balance}</span>
            <span className={styles.pointsUnit}>IOH Puan</span>
          </div>
        </div>
        <div className={styles.pointsStats}>
          <div className={styles.pointsStat}>
            <span className={styles.pointsStatLabel}>Toplam Kazanilan</span>
            <span className={styles.pointsStatValue}>{points.lifetimeEarned}</span>
          </div>
          <div className={styles.pointsStat}>
            <span className={styles.pointsStatLabel}>Toplam Kullanilan</span>
            <span className={styles.pointsStatValue}>{points.lifetimeSpent}</span>
          </div>
        </div>
      </div>

      {pointLedger.length > 0 ? (
        <section className={styles.sectionPanel}>
          <h3 className={styles.sectionTitle}>Puan Hareketleri</h3>
          <div className={styles.ledger}>
            {pointLedger.map((entry) => (
              <div className={styles.ledgerItem} key={entry.id}>
                <div className={styles.ledgerInfo}>
                  <span className={styles.ledgerReason}>{getIohPointLedgerTitle(entry)}</span>
                  <span className={styles.ledgerDate}>
                    {formatDateTime(entry.created_at)}
                    {entry.orders?.order_number ? ` / Siparis: ${entry.orders.order_number}` : entry.order_id ? ` / Siparis: ${entry.order_id.slice(0, 8)}` : ""}
                  </span>
                  {getIohPointLedgerDetail(entry) ? (
                    <span className={styles.ledgerDetail}>{getIohPointLedgerDetail(entry)}</span>
                  ) : null}
                </div>
                <span className={`${styles.ledgerAmount} ${entry.amount < 0 ? styles.ledgerAmountNegative : ""}`}>
                  {entry.amount > 0 ? "+" : ""}{entry.amount}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className={styles.contentHead}>
        <p className={styles.kicker}>ALLOCATION KAYITLARI</p>
      </div>

      {allocations.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyVisual}>IOH</div>
          <h3 className={styles.emptyTitle}>Henuz allocation kaydi yok</h3>
          <p className={styles.emptyDesc}>
            IOHcoin paketi satin aldiginda allocation haklari burada gorunur.
            Otomatik transfer yapilmaz; manuel gonderim admin tarafindan tamamlanir.
          </p>
        </div>
      ) : (
        <div className={styles.cards}>
          {allocations.map((allocation) => (
            <article className={styles.card} key={allocation.id}>
              <div className={styles.cardTop}>
                <span className={`${styles.badge} ${allocationStatusBadge(allocation.status)}`}>
                  {allocationStatusLabel(allocation.status)}
                </span>
                <span className={`${styles.badge} ${styles.badgeBlue}`}>{allocation.token_symbol}</span>
                <span className={styles.cardMono}>
                  {allocation.orders?.order_number ?? "-"}
                </span>
              </div>
              <h3 className={styles.cardTitle}>
                {allocation.token_sale_campaigns?.title ?? "Token allocation"}
              </h3>
              <p className={styles.cardMono}>
                Allocation: <b>{formatTokenAmount(allocation.total_amount)} {allocation.token_symbol}</b>
                {" "}({formatMoney(allocation.total_price_minor, allocation.currency)})
              </p>
              {allocation.manual_transfer_tx_hash ? (
                <p className={styles.walletAddress} style={{ color: "var(--a-gold)" }}>
                  TX: {allocation.manual_transfer_tx_hash}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
