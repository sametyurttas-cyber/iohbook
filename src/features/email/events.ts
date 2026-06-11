import { sendTransactionalEmail } from "@/features/email/delivery";
import {
  renderOrderReceivedEmail,
  renderOrderShippedEmail,
  renderPaymentConfirmedEmail,
  renderSecurityNoticeEmail,
  renderPasswordResetEmail,
  type OrderEmailData
} from "@/features/email/templates";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { FulfillmentShipment, Order, OrderItem } from "@/types/database";

type EmailOrder = Order & {
  fulfillment_shipments: FulfillmentShipment[];
  order_items: OrderItem[];
};

function buildSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_URL?.replace(/^/, "https://") ??
    "http://localhost:3000"
  );
}

function snapshotText(snapshot: Record<string, unknown>, key: string, fallback: string) {
  const value = snapshot[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

async function getOrderEmailData(orderId: string): Promise<(OrderEmailData & {
  orderId: string;
  profileId: string | null;
  to: string;
}) | null> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*), fulfillment_shipments(*)")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !data) {
    console.error("order email data failed", error);
    return null;
  }

  const order = data as unknown as EmailOrder;
  const latestShipment = [...(order.fulfillment_shipments ?? [])].sort(
    (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)
  )[0];

  return {
    currency: order.currency,
    customerName: order.customer_name,
    lines: order.order_items.map((item) => ({
      quantity: item.quantity,
      title: snapshotText(item.product_snapshot, "title", "IOH Book"),
      totalMinor: item.total_minor,
      variantTitle: snapshotText(item.variant_snapshot, "title", "Baski")
    })),
    orderId: order.id,
    orderNumber: order.order_number,
    orderUrl: `${buildSiteUrl()}/account/orders/${order.id}`,
    profileId: order.profile_id,
    to: order.customer_email,
    totalMinor: order.total_minor,
    trackingNumber: latestShipment?.tracking_number ?? null,
    trackingUrl: latestShipment?.tracking_url ?? null
  };
}

export async function sendOrderReceivedEmail(orderId: string) {
  const data = await getOrderEmailData(orderId);

  if (!data) {
    return null;
  }

  const template = renderOrderReceivedEmail(data);
  return sendTransactionalEmail({
    ...template,
    eventType: "order_received",
    orderId: data.orderId,
    payload: { order_number: data.orderNumber },
    profileId: data.profileId,
    to: data.to
  });
}

export async function sendPaymentConfirmedEmail(orderId: string) {
  const data = await getOrderEmailData(orderId);

  if (!data) {
    return null;
  }

  const template = renderPaymentConfirmedEmail(data);
  return sendTransactionalEmail({
    ...template,
    eventType: "payment_confirmed",
    orderId: data.orderId,
    payload: { order_number: data.orderNumber },
    profileId: data.profileId,
    to: data.to
  });
}

export async function sendOrderShippedEmail(orderId: string) {
  const data = await getOrderEmailData(orderId);

  if (!data) {
    return null;
  }

  const template = renderOrderShippedEmail(data);
  return sendTransactionalEmail({
    ...template,
    eventType: "order_shipped",
    orderId: data.orderId,
    payload: {
      order_number: data.orderNumber,
      tracking_number: data.trackingNumber,
      tracking_url: data.trackingUrl
    },
    profileId: data.profileId,
    to: data.to
  });
}

export async function sendPasswordResetEmail(input: { email: string; resetUrl: string }) {
  const template = renderPasswordResetEmail(input);
  return sendTransactionalEmail({
    ...template,
    eventType: "password_reset",
    payload: { email: input.email },
    to: input.email
  });
}

export async function sendAccountSecurityEmail(input: { email: string; message: string; profileId?: string | null }) {
  const template = renderSecurityNoticeEmail(input);
  return sendTransactionalEmail({
    ...template,
    eventType: "account_security",
    payload: { message: input.message },
    profileId: input.profileId ?? null,
    to: input.email
  });
}
