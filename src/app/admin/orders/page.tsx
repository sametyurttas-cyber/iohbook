import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { OrderDetailDrawer } from "@/features/orders/order-detail-drawer";
import { OrderFilters } from "@/features/orders/order-filters";
import {
  getLatestPayment,
  getLatestShipment,
  listOrdersForAdmin
} from "@/features/orders/queries";
import {
  formatDateTime,
  getBadgeVariant,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  SHIPMENT_STATUS_LABELS
} from "@/features/orders/order-utils";
import { formatMoney } from "@/features/products/product-utils";
import type { OrderStatus, PaymentStatus, ShipmentStatus } from "@/types/database";

type AdminOrdersPageProps = {
  searchParams?: Promise<{
    fulfillment?: ShipmentStatus | "all";
    payment?: PaymentStatus | "all";
    q?: string;
    saved?: string;
    selected?: string;
    status?: OrderStatus | "all";
  }>;
};

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const params = await searchParams;
  const orders = await listOrdersForAdmin({
    fulfillment: params?.fulfillment ?? "all",
    payment: params?.payment ?? "all",
    q: params?.q,
    status: params?.status ?? "all"
  });

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-6 py-10" id="main-content">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-eyebrow uppercase text-muted-foreground">Operations</p>
          <h1 className="mt-3 font-display text-title-lg text-paper">Siparis operasyonlari</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Odeme sinyalini, siparis durumunu ve kargo ilerlemesini tek ekranda izleyin.
            Kritik personel aksiyonlari audit log kaydina yazilir.
          </p>
        </div>
        <div className="rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          <span className="font-semibold text-paper">{orders.length}</span> siparis
        </div>
      </div>

      {params?.saved ? (
        <div className="rounded-md border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
          Operasyon kaydedildi: {params.saved}
        </div>
      ) : null}

      <OrderFilters
        fulfillment={params?.fulfillment ?? "all"}
        payment={params?.payment ?? "all"}
        q={params?.q}
        status={params?.status ?? "all"}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Siparis</TableHead>
            <TableHead>Musteri</TableHead>
            <TableHead>Odeme</TableHead>
            <TableHead>Fulfillment</TableHead>
            <TableHead className="text-right">Tutar</TableHead>
            <TableHead className="text-right">Aksiyon</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell className="py-10 text-center text-muted-foreground" colSpan={6}>
                Filtrelere uygun siparis bulunamadi.
              </TableCell>
            </TableRow>
          ) : null}

          {orders.map((order) => {
            const payment = getLatestPayment(order);
            const shipment = getLatestShipment(order);
            const shipmentStatus = shipment?.status ?? "pending";

            return (
              <TableRow key={order.id}>
                <TableCell>
                  <div className="grid gap-2">
                    <span className="font-medium text-paper">{order.order_number}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(order.created_at)}
                    </span>
                    <Badge variant={getBadgeVariant(order.status)}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="grid gap-1 text-sm">
                    <span className="text-paper">{order.customer_name ?? "Isimsiz musteri"}</span>
                    <span className="text-muted-foreground">{order.customer_email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {payment ? (
                    <div className="grid gap-2">
                      <Badge variant={getBadgeVariant(payment.status)}>
                        {PAYMENT_STATUS_LABELS[payment.status]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {payment.provider}
                        {payment.provider_status ? ` / ${payment.provider_status}` : ""}
                      </span>
                    </div>
                  ) : (
                    <Badge variant="outline">Kayit yok</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="grid gap-2">
                    <Badge variant={getBadgeVariant(shipmentStatus)}>
                      {SHIPMENT_STATUS_LABELS[shipmentStatus]}
                    </Badge>
                    {shipment?.tracking_number ? (
                      <span className="text-xs text-muted-foreground">
                        {shipment.provider ?? "Kargo"} / {shipment.tracking_number}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Tracking bekliyor</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium text-paper">
                  {formatMoney(order.total_minor, order.currency)}
                </TableCell>
                <TableCell className="text-right">
                  <OrderDetailDrawer order={order} selected={params?.selected === order.id} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </main>
  );
}
