import Link from "next/link";
import { listAccountDownloads } from "@/features/account/queries";
import { downloadEntitlement } from "@/features/entitlements/actions";
import { isEntitlementCurrentlyAccessible } from "@/features/entitlements/entitlement-utils";
import { formatDateTime } from "@/features/account/account-utils";
import styles from "@/features/account/account-scene.module.css";

type DownloadsPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

const downloadErrorMessages: Record<string, string> = {
  "download-bucket-invalid": "Dosya guvenli dijital teslimat bucket alaninda degil.",
  "download-file-missing": "Bu dijital hakka henuz dosya baglanmamis.",
  "download-limit-reached": "Indirme limitine ulasildi.",
  "download-log-failed": "Indirme kaydi olusturulamadi.",
  "download-not-active": "Bu indirme hakki aktif degil.",
  "download-not-found": "Bu indirme hakki bulunamadi veya size ait degil.",
  "download-order-not-paid": "Odeme dogrulanmadan indirme acilamaz.",
  "download-url-failed": "Guvenli indirme linki uretilemedi.",
  "missing-entitlement": "Indirme hakki secilemedi."
};

function readSnapshotText(snapshot: Record<string, unknown> | undefined, key: string) {
  const value = snapshot?.[key];
  return typeof value === "string" && value.length > 0 ? value : "-";
}

function getDownloadStatusLabel(status: string) {
  if (status === "active") return "Aktif";
  if (status === "pending") return "Hazirlaniyor";
  if (status === "expired") return "Suresi Doldu";
  if (status === "revoked") return "Iptal Edildi";
  return status;
}

export default async function AccountDownloadsPage({ searchParams }: DownloadsPageProps) {
  const [downloads, params] = await Promise.all([listAccountDownloads(), searchParams]);

  return (
    <div className={styles.cards}>
      <div className={styles.contentHead}>
        <p className={styles.kicker}>02 / INDIRMELERIM</p>
        <h2 className={styles.contentTitle}>Dijital Kutuphanem</h2>
        <p className={styles.contentLead}>
          Dijital urunler odeme backend tarafinda dogrulandiktan sonra burada
          gorunur. Indirme baglantilari her tiklamada kisa sureli ve guvenli
          olarak uretilir.
        </p>
      </div>

      {params?.error ? (
        <div className={styles.notices}>
          <div className={styles.noticeError}>
            Indirme baslatilamadi: {downloadErrorMessages[params.error] ?? params.error}
          </div>
        </div>
      ) : null}

      {downloads.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyVisual}>IOH</div>
          <h3 className={styles.emptyTitle}>Henuz dijital erisim yok</h3>
          <p className={styles.emptyDesc}>
            Dijital veya hibrit bir urun satin aldiginizda erisim haklari burada
            listelenir.
          </p>
          <Link className={styles.emptyCta} href="/books">
            Kitaplari Incele
          </Link>
        </div>
      ) : (
        <div className={styles.cards}>
          {downloads.map((download) => {
            const item = download.order_items;
            const canDownload =
              isEntitlementCurrentlyAccessible({
                expiresAt: download.expires_at,
                startsAt: download.starts_at,
                status: download.status
              }) &&
              Boolean(download.storage_bucket && download.storage_path) &&
              (download.download_limit === null ||
                download.download_count < download.download_limit);

            return (
              <article className={styles.card} key={download.id}>
                <div className={styles.cardRow}>
                  <div className={styles.cardMain}>
                    <div className={styles.cardTop}>
                      <span className={`${styles.badge} ${download.status === "active" ? styles.badgeGold : ""}`}>
                        {getDownloadStatusLabel(download.status)}
                      </span>
                      <span className={styles.badge}>
                        {download.kind === "hybrid" ? "Hibrit" : "Dijital"}
                      </span>
                      {item?.orders ? (
                        <span className={styles.cardMono}>
                          {item.orders.order_number} / {formatDateTime(item.orders.created_at)}
                        </span>
                      ) : null}
                    </div>
                    <h3 className={styles.cardTitle}>
                      {readSnapshotText(item?.product_snapshot, "title")}
                    </h3>
                    <p className={styles.cardMono}>
                      {readSnapshotText(item?.variant_snapshot, "title")} / Format{" "}
                      <b>{readSnapshotText(item?.variant_snapshot, "format")}</b>
                    </p>
                    <p className={styles.cardMono}>
                      Indirme: <b>{download.download_count}</b>
                      {download.download_limit === null ? "" : ` / ${download.download_limit}`}
                      {download.expires_at ? ` / Son: ${formatDateTime(download.expires_at)}` : ""}
                    </p>
                    {download.status === "pending" ? (
                      <p className={styles.cardDesc}>
                        Dosya henuz teslimata baglanmamis. Destek ekibi tamamladiginda
                        indirme aktif olur.
                      </p>
                    ) : null}
                  </div>
                  <form action={downloadEntitlement}>
                    <input name="entitlement_id" type="hidden" value={download.id} />
                    <button className={styles.btnPrimary} disabled={!canDownload} type="submit">
                      Guvenli Indir
                    </button>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
