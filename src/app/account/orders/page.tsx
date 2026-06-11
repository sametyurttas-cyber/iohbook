import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listAccountOrders } from "@/features/account/queries";
import {
  formatDateTime,
  ORDER_STATUS_HELP,
  ORDER_STATUS_LABELS
} from "@/features/account/account-utils";
import { formatMoney } from "@/features/products/product-utils";

export default async function AccountOrdersPage() {
  const orders = await listAccountOrders();

  return (
    <div className="grid gap-5">
      <div className="max-w-3xl">
        <h2 className="font-display text-title-lg text-paper">Siparislerim</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Odeme ve hazirlama durumlari backend kayitlarindan gosterilir. Odeme
          yonlendirmesi basarili olsa bile backend dogrulamasi bitmeden siparis
          odendi olarak isaretlenmez.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 shadow-panel">
          <h3 className="font-display text-title-md text-paper">Henuz siparis yok</h3>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Checkout tamamlandiginda siparisleriniz odeme ve kargo durumlariyla
            burada gorunur.
          </p>
          <Button asChild className="mt-6">
            <Link href="/books">Kitaplari incele</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {orders.map((order) => (
            <article
              className="grid gap-4 rounded-lg border border-border bg-card p-5 shadow-panel md:grid-cols-[1fr_auto] md:items-center"
              key={order.id}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="gold">{ORDER_STATUS_LABELS[order.status]}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDateTime(order.created_at)}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-title-md text-paper">
                  {order.order_number}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {ORDER_STATUS_HELP[order.status]}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 md:justify-end">
                <p className="font-display text-title-md text-gold">
                  {formatMoney(order.total_minor, order.currency)}
                </p>
                <Button asChild variant="outline">
                  <Link href={`/account/orders/${order.id}`}>Detaylari gor</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
