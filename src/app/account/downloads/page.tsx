import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listAccountDownloads } from "@/features/account/queries";
import { downloadEntitlement } from "@/features/entitlements/actions";
import { isEntitlementCurrentlyAccessible } from "@/features/entitlements/entitlement-utils";
import { formatDateTime } from "@/features/account/account-utils";

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
  if (status === "active") {
    return "Aktif";
  }

  if (status === "pending") {
    return "Hazirlaniyor";
  }

  if (status === "expired") {
    return "Suresi doldu";
  }

  if (status === "revoked") {
    return "Iptal edildi";
  }

  return status;
}

export default async function AccountDownloadsPage({ searchParams }: DownloadsPageProps) {
  const [downloads, params] = await Promise.all([listAccountDownloads(), searchParams]);

  return (
    <div className="grid gap-5">
      <div className="max-w-3xl">
        <h2 className="font-display text-title-lg text-paper">Indirmelerim</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Dijital urunler odeme backend tarafinda dogrulandiktan sonra burada
          gorunur. Indirme baglantilari her tiklamada kisa sureli ve guvenli
          olarak uretilir.
        </p>
      </div>

      {params?.error ? (
        <div className="rounded-md border border-burgundy-bright/30 bg-burgundy-bright/10 p-3 text-sm text-burgundy-soft">
          Indirme baslatilamadi: {downloadErrorMessages[params.error] ?? params.error}
        </div>
      ) : null}

      {downloads.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 shadow-panel">
          <h3 className="font-display text-title-md text-paper">Henuz dijital erisim yok</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Dijital veya hibrit bir urun satin aldiginizda erisim haklari burada
            listelenir.
          </p>
          <Button asChild className="mt-6">
            <Link href="/books">Kitaplari incele</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
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
              <article
                className="grid gap-4 rounded-lg border border-border bg-card p-5 shadow-panel md:grid-cols-[1fr_auto] md:items-center"
                key={download.id}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={download.status === "active" ? "gold" : "outline"}>
                      {getDownloadStatusLabel(download.status)}
                    </Badge>
                    <Badge variant="secondary">
                      {download.kind === "hybrid" ? "Hibrit" : "Dijital"}
                    </Badge>
                    {item?.orders ? (
                      <span className="text-xs text-muted-foreground">
                        {item.orders.order_number} - {formatDateTime(item.orders.created_at)}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-3 font-display text-title-md text-paper">
                    {readSnapshotText(item?.product_snapshot, "title")}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {readSnapshotText(item?.variant_snapshot, "title")} - SKU{" "}
                    {readSnapshotText(item?.variant_snapshot, "sku")}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Format: {readSnapshotText(item?.variant_snapshot, "format")}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Indirme: {download.download_count}
                    {download.download_limit === null ? "" : ` / ${download.download_limit}`}
                    {download.expires_at ? ` - Son tarih: ${formatDateTime(download.expires_at)}` : ""}
                  </p>
                  {download.status === "pending" ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Dosya henuz teslimata baglanmamis. Destek ekibi tamamladiginda
                      indirme aktif olur.
                    </p>
                  ) : null}
                </div>
                <form action={downloadEntitlement}>
                  <input name="entitlement_id" type="hidden" value={download.id} />
                  <Button disabled={!canDownload} type="submit">
                    Guvenli indir
                  </Button>
                </form>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
