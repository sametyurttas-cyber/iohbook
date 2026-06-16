import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAccountOrderDetail } from "@/features/account/queries";
import {
  formatDateTime,
  ORDER_STATUS_HELP,
  ORDER_STATUS_LABELS,
  SHIPMENT_STATUS_LABELS
} from "@/features/account/account-utils";
import { formatMoney } from "@/features/products/product-utils";

type AccountOrderDetailPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

function readSnapshotText(snapshot: Record<string, unknown>, key: string) {
  const value = snapshot[key];
  return typeof value === "string" && value.length > 0 ? value : "-";
}

function orderHasDigitalItems(order: Awaited<ReturnType<typeof getAccountOrderDetail>>) {
  return Boolean(
    order?.order_items.some(
      (item) => item.fulfillment_type === "digital" || item.fulfillment_type === "hybrid"
    )
  );
}

export default async function AccountOrderDetailPage({
  params
}: AccountOrderDetailPageProps) {
  const { orderId } = await params;
  const order = await getAccountOrderDetail(orderId);

  if (!order) {
    notFound();
  }

  const hasDigitalItems = orderHasDigitalItems(order);

  return (
    <div className="grid gap-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <Button asChild size="sm" variant="outline">
            <Link href="/account/orders">Back to orders</Link>
          </Button>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Badge variant="gold">{ORDER_STATUS_LABELS[order.status]}</Badge>
            <span className="text-xs text-muted-foreground">
              Created {formatDateTime(order.created_at)}
            </span>
          </div>
          <h2 className="mt-3 font-display text-title-lg text-paper">
            {order.order_number}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            {ORDER_STATUS_HELP[order.status]}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-panel lg:min-w-72">
          <p className="text-eyebrow uppercase text-muted-foreground">Total</p>
          <p className="mt-2 font-display text-title-lg text-gold">
            {formatMoney(order.total_minor, order.currency)}
          </p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Totals reflect the order snapshot captured at checkout.
          </p>
        </div>
      </div>

      <section className="rounded-lg border border-border bg-card p-5 shadow-panel">
        <h3 className="font-display text-title-md text-paper">Items</h3>
        {hasDigitalItems && (order.status === "paid" || order.status === "fulfilled" || order.status === "completed") ? (
          <div className="mt-4 rounded-md border border-gold/25 bg-gold/10 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-paper">Dijital kitabiniz hazir.</p>
            <p className="mt-1 leading-6">
              PDF/EPUB dosyalari mail eki olarak gonderilmez. Guvenli indirme linkleri
              hesabinizdaki Indirmelerim sayfasinda uretilir.
            </p>
            <Button asChild className="mt-4" size="sm">
              <Link href="/account/downloads">Indirmelerime git</Link>
            </Button>
          </div>
        ) : null}
        <div className="mt-5 grid gap-3">
          {order.order_items.map((item) => (
            <div
              className="grid gap-3 border-b border-border pb-4 last:border-b-0 last:pb-0 md:grid-cols-[1fr_auto]"
              key={item.id}
            >
              <div>
                <p className="font-medium text-paper">
                  {readSnapshotText(item.product_snapshot, "title")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {readSnapshotText(item.variant_snapshot, "title")} - SKU{" "}
                  {readSnapshotText(item.variant_snapshot, "sku")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Quantity: {item.quantity}
                </p>
              </div>
              <p className="font-display text-title-md text-gold">
                {formatMoney(item.total_minor, order.currency)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-5 shadow-panel">
          <h3 className="font-display text-title-md text-paper">Totals</h3>
          <dl className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="text-paper">{formatMoney(order.subtotal_minor, order.currency)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Discount</dt>
              <dd className="text-paper">{formatMoney(order.discount_minor, order.currency)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="text-paper">{formatMoney(order.shipping_minor, order.currency)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Tax</dt>
              <dd className="text-paper">{formatMoney(order.tax_minor, order.currency)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-border pt-3">
              <dt className="font-medium text-paper">Total</dt>
              <dd className="font-display text-title-md text-gold">
                {formatMoney(order.total_minor, order.currency)}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-lg border border-border bg-card p-5 shadow-panel">
          <h3 className="font-display text-title-md text-paper">Shipping</h3>
          {order.fulfillment_shipments.length === 0 ? (
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              No shipment has been created yet. Once fulfillment starts, carrier and
              tracking information will appear here.
            </p>
          ) : (
            <div className="mt-5 grid gap-4">
              {order.fulfillment_shipments.map((shipment) => (
                <div className="rounded-md border border-border bg-ink-soft p-4" key={shipment.id}>
                  <Badge variant="outline">{SHIPMENT_STATUS_LABELS[shipment.status]}</Badge>
                  <dl className="mt-4 grid gap-2 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Carrier</dt>
                      <dd className="text-paper">{shipment.provider ?? "Not assigned"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Tracking number</dt>
                      <dd className="text-paper">{shipment.tracking_number ?? "Not available yet"}</dd>
                    </div>
                    {shipment.tracking_url ? (
                      <div>
                        <dt className="text-muted-foreground">Tracking link</dt>
                        <dd>
                          <Link className="text-gold hover:underline" href={shipment.tracking_url}>
                            Open carrier tracking
                          </Link>
                        </dd>
                      </div>
                    ) : null}
                    <div>
                      <dt className="text-muted-foreground">Shipped</dt>
                      <dd className="text-paper">{formatDateTime(shipment.shipped_at)}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-lg border border-border bg-card p-5 shadow-panel">
        <h3 className="font-display text-title-md text-paper">Payment verification</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Payment provider redirects are treated as a user experience signal. The order
          is marked paid only after backend verification.
        </p>
        <div className="mt-4 grid gap-3">
          {order.payment_attempts.map((attempt) => (
            <div className="rounded-md border border-border bg-ink-soft p-4 text-sm" key={attempt.created_at}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{attempt.provider}</Badge>
                <Badge variant="outline">{attempt.status}</Badge>
              </div>
              <p className="mt-3 text-muted-foreground">
                Provider status: {attempt.provider_status ?? "not reported"}
              </p>
              <p className="mt-1 text-muted-foreground">
                Verified: {formatDateTime(attempt.verified_at)}
              </p>
              {attempt.failure_reason ? (
                <p className="mt-1 text-burgundy-soft">Reason: {attempt.failure_reason}</p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
