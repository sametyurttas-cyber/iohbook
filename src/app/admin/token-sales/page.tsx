import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { updateTokenAllocation } from "@/features/token-sale/actions";
import { listTokenAllocationsForAdmin } from "@/features/token-sale/queries";
import { formatMoney } from "@/features/products/product-utils";
import { formatTokenAmount } from "@/features/token-sale/utils";
import styles from "@/features/admin/admin-scene.module.css";

function badgeClassForStatus(status: string) {
  if (status === "sent") return styles.badgeGold;
  if (status === "approved") return styles.badgeBlue;
  if (status === "cancelled" || status === "refunded") return styles.badgeRed;
  return "";
}

export default async function AdminTokenSalesPage() {
  const allocations = await listTokenAllocationsForAdmin();

  return (
    <main className={styles.main} id="main-content">
      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <div className={styles.heroMain}>
            <div className={styles.heroGhost} aria-hidden="true">ALLOC</div>
            <p className={styles.kicker}>06 / TOKEN SATISLARI</p>
            <h2 className={styles.heroTitle}>Token Satislari</h2>
            <p className={styles.heroLead}>
              Otomatik transfer yok. Admin manuel gonderim durumunu ve transaction
              hash alanini yonetir.
            </p>
          </div>
          <div className={styles.heroActions}>
            <span className={styles.statPill}>Toplam <b>{allocations.length}</b> allocation</span>
          </div>
        </div>
      </section>

      <div className={styles.grid}>
        {allocations.map((allocation) => (
          <article className={styles.panel} key={allocation.id}>
            <div className={styles.panelHead}>
              <div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <span className={styles.badge + " " + badgeClassForStatus(allocation.status)}>
                    {allocation.status}
                  </span>
                  <span className={styles.badge + " " + styles.badgeBlue}>{allocation.token_symbol}</span>
                  <span className={styles.badge}>
                    {allocation.orders?.payment_attempts?.[0]?.status ?? "odeme yok"}
                  </span>
                </div>
                <h3 className={styles.panelTitle} style={{ fontSize: "1.3rem" }}>
                  {allocation.token_sale_campaigns?.title ?? "Token kampanyasi"}
                </h3>
                <p className={styles.detailMeta} style={{ wordBreak: "break-all", fontFamily: "var(--font-mono)" }}>
                  {allocation.normalized_address ?? "Wallet sonradan alinacak"}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p className={styles.ddGold}>
                  {formatTokenAmount(allocation.total_amount)} {allocation.token_symbol}
                </p>
                <p className={styles.detailMeta}>
                  {formatMoney(allocation.total_price_minor, allocation.currency)}
                </p>
              </div>
            </div>

            <form action={updateTokenAllocation} className={styles.formGrid}>
              <input name="allocation_id" type="hidden" value={allocation.id} />
              <div className={styles.formGrid3} style={{ gridTemplateColumns: "1fr 2fr auto", alignItems: "end" }}>
                <label className={styles.formLabel}>
                  <span className={styles.formLabelText}>Durum</span>
                  <Select defaultValue={allocation.status} name="status">
                    <SelectTrigger>
                      <SelectValue placeholder="Allocation durumu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </label>
                <label className={styles.formLabel}>
                  <span className={styles.formLabelText}>Transaction Hash</span>
                  <Input
                    defaultValue={allocation.manual_transfer_tx_hash ?? ""}
                    name="manual_transfer_tx_hash"
                    placeholder="Transaction hash (sent icin zorunlu)"
                  />
                </label>
                <Button type="submit">Guncelle</Button>
              </div>
            </form>
          </article>
        ))}
      </div>
    </main>
  );
}
