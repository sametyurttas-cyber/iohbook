import type { OrderStatus, ShipmentStatus } from "@/types/database";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  cancelled: "Cancelled",
  completed: "Completed",
  draft: "Draft",
  fulfilled: "Fulfilled",
  paid: "Paid",
  pending_payment: "Waiting for payment",
  refunded: "Refunded"
};

export const ORDER_STATUS_HELP: Record<OrderStatus, string> = {
  cancelled: "This order was cancelled. If this looks wrong, contact support with your order number.",
  completed: "Delivery and post-order processing are complete.",
  draft: "This order was started but payment has not been initialized yet.",
  fulfilled: "Your order has been handed to fulfillment or the carrier.",
  paid: "Payment is confirmed. The order is waiting for fulfillment.",
  pending_payment: "Payment has started but is not confirmed yet. We verify provider responses on the backend.",
  refunded: "This order has a refund record. Bank/provider settlement timing may vary."
};

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  cancelled: "Cancelled",
  delivered: "Delivered",
  pending: "Pending",
  preparing: "Preparing",
  returned: "Returned",
  shipped: "Shipped"
};

export function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en", {
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

