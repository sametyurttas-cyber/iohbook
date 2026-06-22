import Link from "next/link";
import { formatDateTime } from "@/features/account/account-utils";
import { listAccountNftCollection } from "@/features/account/queries";
import styles from "@/features/account/account-scene.module.css";

function readSnapshotText(snapshot: Record<string, unknown> | undefined, key: string) {
  const value = snapshot?.[key];
  return typeof value === "string" && value.length > 0 ? value : "-";
}

function getNftStatusLabel(status: string) {
  if (status === "active") return "Teslim Edildi";
  if (status === "pending") return "Admin Onayi Bekliyor";
  if (status === "revoked") return "Iptal Edildi";
  if (status === "expired") return "Suresi Doldu";
  return status;
}

export default async function AccountNftCollectionPage() {
  const items = await listAccountNftCollection();

  return (
    <div className={styles.cards}>
      <div className={styles.contentHead}>
        <p className={styles.kicker}>03 / NFT KOLEKSIYONUM</p>
        <h2 className={styles.contentTitle}>Dijital Koleksiyonum</h2>
        <p className={styles.contentLead}>
          Shopier veya diger provider odemesi backend tarafinda dogrulandiktan
          sonra NFT teslimat haklari burada gorunur. Otomatik mint yoksa teslimat
          admin onayi ile tamamlanir.
        </p>
      </div>

      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyVisual}>NFT</div>
          <h3 className={styles.emptyTitle}>Dijital koleksiyon alani henuz bos</h3>
          <p className={styles.emptyDesc}>
            NFT urunu satin aldiginizda teslimat durumu burada listelenir. Su anda
            aktif mint veya satis islemi bulunmuyor.
          </p>
          <Link className={styles.emptyCta} href="/nft">
            Galeriyi Incele
          </Link>
        </div>
      ) : (
        <div className={styles.cards}>
          {items.map((item) => (
            <article className={styles.card} key={item.id}>
              <div className={styles.cardTop}>
                <span className={`${styles.badge} ${item.status === "active" ? styles.badgeGold : ""}`}>
                  {getNftStatusLabel(item.status)}
                </span>
                <span className={`${styles.badge} ${styles.badgeBlue}`}>NFT</span>
                {item.order_items?.orders ? (
                  <span className={styles.cardMono}>
                    {item.order_items.orders.order_number} /{" "}
                    {formatDateTime(item.order_items.orders.created_at)}
                  </span>
                ) : null}
              </div>
              <h3 className={styles.cardTitle}>
                {readSnapshotText(item.order_items?.product_snapshot, "title")}
              </h3>
              <p className={styles.cardMono}>
                {readSnapshotText(item.order_items?.variant_snapshot, "title")}
              </p>
              {item.status === "pending" ? (
                <p className={styles.cardDesc}>
                  Teslimat icin dogrulanmis wallet gereklidir. Admin kontrolu
                  sonrasi mint/teslimat bilgisi guncellenecek.
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
