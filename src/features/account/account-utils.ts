import type { OrderStatus, ShipmentStatus } from "@/types/database";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  cancelled: "Iptal",
  completed: "Tamamlandi",
  draft: "Taslak",
  fulfilled: "Hazirlandi",
  paid: "Odendi",
  pending_payment: "Odeme Bekliyor",
  refunded: "Iade Edildi"
};

export const ORDER_STATUS_HELP: Record<OrderStatus, string> = {
  cancelled: "Bu siparis iptal edildi. Hatali gorunuyorsa destek ekibine siparis numaranizla basvurun.",
  completed: "Teslimat ve siparis sonrasi sureclar tamamlandi.",
  draft: "Siparis baslatildi ama odeme henuz baslatilmadi.",
  fulfilled: "Siparisiniz hazirliga veya kargoya devredildi.",
  paid: "Odeme dogrulandi. Siparis hazirlama bekliyor.",
  pending_payment: "Odeme baslatildi ama henuz dogrulanmadi. Provider yanitlari backend tarafinda kontrol edilir.",
  refunded: "Bu sipariste iade kaydi var. Banka/provider odeme suresi farkli olabilir."
};

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  cancelled: "Iptal",
  delivered: "Teslim Edildi",
  pending: "Beklemede",
  preparing: "Hazirlaniyor",
  returned: "Iade Edildi",
  shipped: "Gonderildi"
};

export function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("tr", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatAddressLines(address: {
  city?: string | null;
  country_code?: string | null;
  district?: string | null;
  line1?: string | null;
  line2?: string | null;
  postal_code?: string | null;
}) {
  return [
    address.line1,
    address.line2,
    [address.district, address.city, address.postal_code].filter(Boolean).join(" "),
    address.country_code
  ].filter(Boolean);
}

export function shortenWalletAddress(address: string) {
  if (address.length <= 12) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
