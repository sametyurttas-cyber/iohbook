import { Badge } from "@/components/ui/badge";
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

function readSnapshotText(snapshot: Record<string, unknown> | undefined, key: string) {
  const value = snapshot?.[key];
  return typeof value === "string" && value.length > 0 ? value : "-";
}

export default async function AdminNftOrdersPage() {
  const rows = await listAdminNftOrders();

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-eyebrow uppercase text-muted-foreground">NFT operations</p>
        <h1 className="mt-3 font-display text-title-lg text-paper">NFT siparisleri</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Odeme backend tarafinda dogrulansa bile NFT teslimati dogrulanmis wallet
          olmadan aktif edilemez. Bu ekran manual fulfillment/mint takibi icindir.
        </p>
      </div>

      <div className="grid gap-4">
        {rows.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-sm text-muted-foreground shadow-panel">
            NFT siparisi yok.
          </div>
        ) : null}
        {rows.map((row) => {
          const order = row.order_items?.orders;
          const payment = order?.payment_attempts?.[0];
          const wallets = order?.user_wallets ?? [];

          return (
            <article className="rounded-lg border border-border bg-card p-5 shadow-panel" key={row.id}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={row.status === "active" ? "gold" : "outline"}>
                      {row.status}
                    </Badge>
                    <Badge variant="secondary">{payment?.provider ?? "provider yok"}</Badge>
                    <Badge variant="outline">{payment?.status ?? "odeme yok"}</Badge>
                  </div>
                  <h2 className="mt-3 font-display text-title-md text-paper">
                    {readSnapshotText(row.order_items?.product_snapshot, "title")}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {readSnapshotText(row.order_items?.variant_snapshot, "title")} -{" "}
                    {order?.order_number ?? "order yok"}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-paper">
                    {order ? formatMoney(order.total_minor, order.currency) : "-"}
                  </p>
                  <p className="mt-1 text-muted-foreground">{order?.customer_email ?? "-"}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 border-t border-border pt-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    Wallet
                  </p>
                  {wallets.length === 0 ? (
                    <p className="mt-2 text-sm text-burgundy-soft">Dogrulanmis wallet yok</p>
                  ) : (
                    <div className="mt-2 grid gap-2">
                      {wallets.map((wallet) => (
                        <p className="break-all font-mono text-xs text-paper" key={wallet.id}>
                          {wallet.normalized_address} {wallet.is_primary ? "(primary)" : ""}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <form action={updateNftFulfillmentStatus} className="grid gap-3">
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
                  <Button type="submit">Durumu guncelle</Button>
                </form>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
