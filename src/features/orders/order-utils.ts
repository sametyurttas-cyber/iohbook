import type { OrderStatus, PaymentStatus, ShipmentStatus } from "@/types/database";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  cancelled: "Iptal",
  completed: "Tamamlandi",
  draft: "Taslak",
  fulfilled: "Gonderildi",
  paid: "Odendi",
  pending_payment: "Odeme bekliyor",
  refunded: "Iade"
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  authorized: "Onaylandi",
  cancelled: "Iptal",
  failed: "Basarisiz",
  initiated: "Baslatildi",
  paid: "Odendi",
  pending: "Bekliyor",
  refunded: "Iade"
};

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  cancelled: "Iptal",
  delivered: "Teslim edildi",
  pending: "Bekliyor",
  preparing: "Paketleniyor",
  returned: "Iade dondu",
  shipped: "Gonderildi"
};

export function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function getBadgeVariant(status: string) {
  if (["paid", "fulfilled", "completed", "shipped", "delivered"].includes(status)) {
    return "gold" as const;
  }

  if (["pending", "pending_payment", "preparing", "initiated", "draft"].includes(status)) {
    return "blue" as const;
  }

  if (["failed", "cancelled", "refunded", "returned"].includes(status)) {
    return "red" as const;
  }

  return "outline" as const;
}
