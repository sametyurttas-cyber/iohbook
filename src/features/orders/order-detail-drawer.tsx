"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  markOrderCompleted,
  markOrderPreparing,
  markOrderShipped
} from "@/features/orders/actions";
import type { AdminOrder } from "@/features/orders/queries";
import {
  formatDateTime,
  getBadgeVariant,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  SHIPMENT_STATUS_LABELS
} from "@/features/orders/order-utils";
import { formatMoney } from "@/features/products/product-utils";

type OrderDetailDrawerProps = {
  order: AdminOrder;
  selected?: boolean;
};

function formatSnapshotLabel(snapshot: Record<string, unknown>) {
  const title = typeof snapshot.title === "string" ? snapshot.title : "Urun";
  const variant = typeof snapshot.variant_title === "string" ? snapshot.variant_title : null;
  const sku = typeof snapshot.sku === "string" ? snapshot.sku : null;

  return [title, variant, sku ? `SKU ${sku}` : null].filter(Boolean).join(" / ");
}

function StatusBadge({ label, status }: { label: string; status: string }) {
  return <Badge variant={getBadgeVariant(status)}>{label}</Badge>;
}

function AddressBlock({ address }: { address: Record<string, unknown> | null }) {
  if (!address) {
    return <p className="text-sm text-muted-foreground">Adres kaydi yok.</p>;
  }

  const lines = [
    address.full_name,
    address.phone,
    address.line1,
    address.line2,
    [address.district, address.city, address.postal_code].filter(Boolean).join(" / "),
    address.country_code
  ].filter(Boolean);

  return (
    <div className="grid gap-1 text-sm text-muted-foreground">
      {lines.map((line, index) => (
        <span key={`${line}-${index}`}>{String(line)}</span>
      ))}
    </div>
  );
}

export function OrderDetailDrawer({ order, selected = false }: OrderDetailDrawerProps) {
  const latestPayment = [...(order.payment_attempts ?? [])].sort(
    (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)
  )[0];
  const latestShipment = [...(order.fulfillment_shipments ?? [])].sort(
    (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)
  )[0];
  const shipmentStatus = latestShipment?.status ?? "pending";

  return (
    <Sheet defaultOpen={selected}>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline">
          Detay
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
        <SheetHeader>
          <SheetTitle>{order.order_number}</SheetTitle>
          <SheetDescription>
            {order.customer_name ?? "Isimsiz musteri"} / {order.customer_email}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 grid gap-6">
          <section className="grid gap-3 rounded-lg border border-border bg-ink-soft/50 p-4">
            <div className="flex flex-wrap gap-2">
              <StatusBadge label={ORDER_STATUS_LABELS[order.status]} status={order.status} />
              {latestPayment ? (
                <StatusBadge
                  label={PAYMENT_STATUS_LABELS[latestPayment.status]}
                  status={latestPayment.status}
                />
              ) : (
                <Badge variant="outline">Odeme kaydi yok</Badge>
              )}
              <StatusBadge
                label={SHIPMENT_STATUS_LABELS[shipmentStatus]}
                status={shipmentStatus}
              />
            </div>
            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <span>Olusturma: {formatDateTime(order.created_at)}</span>
              <span>Guncelleme: {formatDateTime(order.updated_at)}</span>
              <span>Odenme: {formatDateTime(order.paid_at)}</span>
              <span>Tamamlanma: {formatDateTime(order.completed_at)}</span>
            </div>
          </section>

          <section className="grid gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Satirlar
            </h3>
            <div className="grid gap-2">
              {order.order_items.map((item) => (
                <div
                  className="grid gap-2 rounded-md border border-border bg-card p-3 text-sm sm:grid-cols-[1fr_auto]"
                  key={item.id}
                >
                  <div>
                    <p className="font-medium text-paper">
                      {formatSnapshotLabel({
                        ...item.product_snapshot,
                        ...item.variant_snapshot
                      })}
                    </p>
                    <p className="text-muted-foreground">
                      {item.quantity} adet x {formatMoney(item.unit_price_minor, order.currency)}
                    </p>
                  </div>
                  <p className="font-semibold text-paper">
                    {formatMoney(item.total_minor, order.currency)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-3 rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Toplamlar
            </h3>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ara toplam</span>
                <span>{formatMoney(order.subtotal_minor, order.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Indirim</span>
                <span>{formatMoney(order.discount_minor, order.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kargo</span>
                <span>{formatMoney(order.shipping_minor, order.currency)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-semibold text-paper">
                <span>Genel toplam</span>
                <span>{formatMoney(order.total_minor, order.currency)}</span>
              </div>
            </div>
          </section>

          <section className="grid gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Teslimat adresi
            </h3>
            <AddressBlock address={order.shipping_address} />
          </section>

          <section className="grid gap-3 rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Operasyon
            </h3>
            <form action={markOrderPreparing} className="grid gap-3">
              <input name="order_id" type="hidden" value={order.id} />
              <Textarea name="notes" placeholder="Paketleme notu" />
              <Button type="submit" variant="secondary">
                Paketlendi olarak isaretle
              </Button>
            </form>

            <form action={markOrderShipped} className="grid gap-3 border-t border-border pt-4">
              <input name="order_id" type="hidden" value={order.id} />
              <div className="grid gap-3 sm:grid-cols-3">
                <Input
                  defaultValue={latestShipment?.provider ?? ""}
                  name="provider"
                  placeholder="Kargo firmasi"
                />
                <Input
                  defaultValue={latestShipment?.tracking_number ?? ""}
                  name="tracking_number"
                  placeholder="Tracking kodu"
                />
                <Input
                  defaultValue={latestShipment?.tracking_url ?? ""}
                  name="tracking_url"
                  placeholder="Tracking URL"
                />
              </div>
              <Textarea
                defaultValue={latestShipment?.notes ?? ""}
                name="notes"
                placeholder="Gonderim notu"
              />
              <Button type="submit">Gonderildi olarak isaretle</Button>
            </form>

            <form action={markOrderCompleted} className="grid gap-3 border-t border-border pt-4">
              <input name="order_id" type="hidden" value={order.id} />
              <Textarea name="notes" placeholder="Tamamlama notu" />
              <Button type="submit" variant="outline">
                Tamamlandi olarak isaretle
              </Button>
            </form>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
