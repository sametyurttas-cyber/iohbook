import { redirect } from "next/navigation";
import { requireStaff } from "@/features/auth/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  FulfillmentShipment,
  Order,
  OrderItem,
  OrderStatus,
  PaymentAttempt,
  PaymentStatus,
  ShipmentStatus
} from "@/types/database";

export type AdminOrderFilters = {
  fulfillment?: ShipmentStatus | "all";
  payment?: PaymentStatus | "all";
  q?: string;
  status?: OrderStatus | "all";
};

export type AdminOrder = Order & {
  fulfillment_shipments: FulfillmentShipment[];
  order_items: OrderItem[];
  payment_attempts: PaymentAttempt[];
};

export async function requireOrderStaff() {
  const staff = await requireStaff(["owner", "admin_ops", "fulfillment"]);

  if (!staff) {
    redirect("/unauthorized");
  }

  return staff;
}

export function getLatestPayment(order: AdminOrder) {
  return [...(order.payment_attempts ?? [])].sort(
    (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)
  )[0];
}

export function getLatestShipment(order: AdminOrder) {
  return [...(order.fulfillment_shipments ?? [])].sort(
    (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)
  )[0];
}

export async function listOrdersForAdmin(filters: AdminOrderFilters = {}) {
  await requireOrderStaff();
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("orders")
    .select("*, order_items(*), payment_attempts(*), fulfillment_shipments(*)")
    .order("created_at", { ascending: false })
    .limit(50);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const q = filters.q?.trim();
  if (q) {
    query = query.or(
      `order_number.ilike.%${q}%,customer_email.ilike.%${q}%,customer_name.ilike.%${q}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as AdminOrder[]).filter((order) => {
    const payment = getLatestPayment(order);
    const shipment = getLatestShipment(order);
    const paymentMatches =
      !filters.payment || filters.payment === "all" || payment?.status === filters.payment;
    const fulfillmentStatus = shipment?.status ?? "pending";
    const fulfillmentMatches =
      !filters.fulfillment ||
      filters.fulfillment === "all" ||
      fulfillmentStatus === filters.fulfillment;

    return paymentMatches && fulfillmentMatches;
  });
}
