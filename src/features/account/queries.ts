import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentProfile, requireUser } from "@/features/auth/queries";
import type {
  Address,
  Entitlement,
  FulfillmentShipment,
  Order,
  OrderItem,
  PaymentAttempt
} from "@/types/database";

export type AccountOrderListItem = Pick<
  Order,
  | "created_at"
  | "currency"
  | "id"
  | "order_number"
  | "status"
  | "total_minor"
  | "updated_at"
>;

export type AccountOrderDetail = Order & {
  fulfillment_shipments: FulfillmentShipment[];
  order_items: OrderItem[];
  payment_attempts: Pick<
    PaymentAttempt,
    | "created_at"
    | "failure_reason"
    | "provider"
    | "provider_status"
    | "status"
    | "verified_at"
  >[];
};

export type AccountDownloadItem = Entitlement & {
  order_items: Pick<
    OrderItem,
    "id" | "order_id" | "product_snapshot" | "quantity" | "variant_snapshot"
  > & {
    orders: Pick<Order, "created_at" | "id" | "order_number"> | null;
  } | null;
};

export async function requireAccountUser() {
  const user = await requireUser();

  if (!user) {
    redirect("/sign-in?next=/account");
  }

  return user;
}

export async function getAccountProfile() {
  await requireAccountUser();
  return getCurrentProfile();
}

export async function listAccountOrders() {
  const user = await requireAccountUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, status, currency, total_minor, created_at, updated_at")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as AccountOrderListItem[];
}

export async function getAccountOrderDetail(orderId: string) {
  const user = await requireAccountUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "*, order_items(*), fulfillment_shipments(*), payment_attempts(provider, provider_status, status, verified_at, failure_reason, created_at)"
    )
    .eq("id", orderId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as AccountOrderDetail | null;
}

export async function listAccountAddresses() {
  const user = await requireAccountUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("profile_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Address[];
}

export async function listAccountDownloads() {
  const user = await requireAccountUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("entitlements")
    .select(
      "*, order_items(id, order_id, product_snapshot, quantity, variant_snapshot, orders(id, order_number, created_at))"
    )
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as AccountDownloadItem[];
}

export async function listAccountNftCollection() {
  const user = await requireAccountUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("entitlements")
    .select(
      "*, order_items(id, order_id, product_snapshot, quantity, variant_snapshot, orders(id, order_number, created_at))"
    )
    .eq("profile_id", user.id)
    .eq("kind", "claimable")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as AccountDownloadItem[];
}
