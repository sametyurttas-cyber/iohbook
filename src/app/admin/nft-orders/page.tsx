import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { updateNftFulfillmentStatus } from "@/features/nft/admin-actions";
import { listAdminNftOrders } from "@/features/nft/admin-queries";
import { formatMoney } from "@/features/products/product-utils";
import styles from "@/features/admin/admin-scene.module.css";

function readSnapshotText(snapshot: Record<string, unknown> | undefined, key: string) {
  const value = snapshot?.[key];
  return typeof value === "string" && value.length > 0 ? value : "-";
}

export default async function AdminNftOrdersPage() {
  const rows = await listAdminNftOrders();

  return (
    <main className={styles.main} id="main-content">
      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <div className={styles.heroMain}>
            <div className={styles.heroGhost} aria-hidden="true">NFT</div>
            <p className={styles.kicker}>04 / NFT OPERASYONLARI</p>
            <h2 className={styles.heroTitle}>NFT Siparisleri</h2>
            <p className={styles.heroLead}>
              Odeme backend tarafinda dogrulansa bile NFT teslimati dogrulanmis wallet
              olmadan aktif edilemez. Bu ekran manual fulfillment/mint takibi icindir.
            </p>
          </div>
          <div className={styles.heroActions}>
            <span className={styles.statPill}>Toplam <b>{rows.length}</b> siparis</span>
          </div>
        </div>
      </section>

      <div className={styles.grid}>
        {rows.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyVisual}>NFT</div>
            <h3 className={styles.emptyTitle}>NFT siparisi yok</h3>
            <p className={styles.emptyDesc}>
              Henuz NFT teslimat hakki bulunmuyor.
            </p>
          </div>
        ) : null}

        {rows.map((row) => {
          const order = row.order_items?.orders;
          const payment = order?.payment_attempts?.[0];
          const wallets = order?.user_wallets ?? [];

          return (
            <article className={styles.panel} key={row.id}>
              <div className={styles.panelHead}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
                  <span className={styles.badge + " " + (row.status === "active" ? styles.badgeGold : "")}>
                    {row.status}
                  </span>
                  <span className={styles.badge + " " + styles.badgeBlue}>
                    {payment?.provider ?? "provider yok"}
                  </span>
                  <span className={styles.badge}>{payment?.status ?? "odeme yok"}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p className={styles.ddGold}>{order ? formatMoney(order.total_minor, order.currency) : "-"}</p>
                  <p className={styles.detailMeta}>{order?.customer_email ?? "-"}</p>
                </div>
              </div>

              <div>
                <h3 className={styles.panelTitle} style={{ fontSize: "1.3rem" }}>
                  {readSnapshotText(row.order_items?.product_snapshot, "title")}
                </h3>
                <p className={styles.sectionLead}>
                  {readSnapshotText(row.order_items?.variant_snapshot, "title")} ·{" "}
                  {order?.order_number ?? "order yok"}
                </p>
              </div>

              <div className={styles.grid2}>
                <div className={styles.section}>
                  <p className={styles.kicker}>WALLET</p>
                  {wallets.length === 0 ? (
                    <p className={styles.sectionLead} style={{ color: "var(--ad-red)" }}>
                      Dogrulanmis wallet yok
                    </p>
                  ) : (
                    <div className={styles.grid}>
                      {wallets.map((wallet) => (
                        <p key={wallet.id} className={styles.detailMeta} style={{ wordBreak: "break-all", fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>
                          {wallet.normalized_address} {wallet.is_primary ? "(primary)" : ""}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                <form action={updateNftFulfillmentStatus} className={styles.formGrid}>
                  <input name="entitlement_id" type="hidden" value={row.id} />
                  <Select defaultValue={row.status} name="status">
                    <SelectTrigger>
                      <SelectValue placeholder="Teslimat durumu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Admin onayi bekliyor</SelectItem>
                      <SelectItem value="active">Teslim edildi / mint tamam</SelectItem>
                      <SelectItem value="revoked">Iptal edildi</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit">Durumu Guncelle</Button>
                </form>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
