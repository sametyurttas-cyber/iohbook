import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/features/account/account-utils";
import { listAccountNftCollection } from "@/features/account/queries";

function readSnapshotText(snapshot: Record<string, unknown> | undefined, key: string) {
  const value = snapshot?.[key];
  return typeof value === "string" && value.length > 0 ? value : "-";
}

function getNftStatusLabel(status: string) {
  if (status === "active") return "Teslim edildi";
  if (status === "pending") return "Admin onayi bekliyor";
  if (status === "revoked") return "Iptal edildi";
  if (status === "expired") return "Suresi doldu";
  return status;
}

export default async function AccountNftCollectionPage() {
  const items = await listAccountNftCollection();

  return (
    <div className="grid gap-5">
      <div className="max-w-3xl">
        <h2 className="font-display text-title-lg text-paper">NFT Koleksiyonum</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Shopier veya diger provider odemesi backend tarafinda dogrulandiktan sonra
          NFT teslimat haklari burada gorunur. Otomatik mint yoksa teslimat admin
          onayi ile tamamlanir.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 shadow-panel">
          <h3 className="font-display text-title-md text-paper">Henuz NFT satin alimi yok</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            NFT urunu satin aldiginizda teslimat durumu burada listelenir.
          </p>
          <Button asChild className="mt-6">
            <Link href="/books">Katalogu incele</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <article
              className="rounded-lg border border-border bg-card p-5 shadow-panel"
              key={item.id}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={item.status === "active" ? "gold" : "outline"}>
                  {getNftStatusLabel(item.status)}
                </Badge>
                <Badge variant="secondary">NFT</Badge>
                {item.order_items?.orders ? (
                  <span className="text-xs text-muted-foreground">
                    {item.order_items.orders.order_number} -{" "}
                    {formatDateTime(item.order_items.orders.created_at)}
                  </span>
                ) : null}
              </div>
              <h3 className="mt-3 font-display text-title-md text-paper">
                {readSnapshotText(item.order_items?.product_snapshot, "title")}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {readSnapshotText(item.order_items?.variant_snapshot, "title")} - SKU{" "}
                {readSnapshotText(item.order_items?.variant_snapshot, "sku")}
              </p>
              {item.status === "pending" ? (
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  Teslimat icin dogrulanmis wallet gereklidir. Admin kontrolu sonrasi
                  mint/teslimat bilgisi guncellenecek.
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
