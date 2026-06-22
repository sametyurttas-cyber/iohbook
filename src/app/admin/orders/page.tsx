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
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  SHIPMENT_STATUS_LABELS
} from "@/features/orders/order-utils";
import { formatMoney } from "@/features/products/product-utils";
import type { OrderStatus, PaymentStatus, ShipmentStatus } from "@/types/database";
import styles from "@/features/admin/admin-scene.module.css";

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
    <main className={styles.main} id="main-content">
      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <div className={styles.heroMain}>
            <div className={styles.heroGhost} aria-hidden="true">ORDERS</div>
            <p className={styles.kicker}>02 / SIPARIS OPERASYONLARI</p>
            <h2 className={styles.heroTitle}>Siparis Operasyonlari</h2>
            <p className={styles.heroLead}>
              Odeme sinyalini, siparis durumunu ve kargo ilerlemesini tek ekranda izleyin.
              Kritik personel aksiyonlari audit log kaydina yazilir.
            </p>
          </div>
          <div className={styles.heroActions}>
            <span className={styles.statPill}>Toplam <b>{orders.length}</b> siparis</span>
          </div>
        </div>
      </section>

      <div className={styles.grid}>
        {params?.saved ? (
          <div className={styles.noticeSuccess}>Operasyon kaydedildi: {params.saved}</div>
        ) : null}

        <OrderFilters
          fulfillment={params?.fulfillment ?? "all"}
          payment={params?.payment ?? "all"}
          q={params?.q}
          status={params?.status ?? "all"}
        />

        <div className={styles.tableWrap}>
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
                        <span className={styles.badge + " " + (
                          order.status === "paid" || order.status === "completed" || order.status === "fulfilled"
                            ? styles.badgeGold
                            : order.status === "cancelled" || order.status === "refunded"
                              ? styles.badgeRed
                              : styles.badgeBlue
                        )}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
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
                          <span className={styles.badge + " " + (
                            payment.status === "paid" ? styles.badgeGold :
                            payment.status === "failed" || payment.status === "cancelled" ? styles.badgeRed :
                            styles.badgeBlue
                          )}>
                            {PAYMENT_STATUS_LABELS[payment.status]}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {payment.provider}
                            {payment.provider_status ? ` / ${payment.provider_status}` : ""}
                          </span>
                        </div>
                      ) : (
                        <span className={styles.badge}>Kayit yok</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="grid gap-2">
                        <span className={styles.badge + " " + (
                          shipmentStatus === "delivered" ? styles.badgeGold :
                          shipmentStatus === "cancelled" || shipmentStatus === "returned" ? styles.badgeRed :
                          styles.badgeBlue
                        )}>
                          {SHIPMENT_STATUS_LABELS[shipmentStatus]}
                        </span>
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
        </div>
      </div>
    </main>
  );
}
