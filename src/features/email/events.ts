import { sendTransactionalEmail as sendNewTransactionalEmail } from "@/features/email/service";
import { sendTransactionalEmail as sendOldTransactionalEmail } from "@/features/email/delivery";
import {
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
      fulfillmentType: item.fulfillment_type,
      quantity: item.quantity,
      title: snapshotText(item.product_snapshot, "title", "IOH Book"),
      totalMinor: item.total_minor,
      variantTitle: snapshotText(item.variant_snapshot, "title", "Baski")
    })),
    orderId: order.id,
    orderNumber: order.order_number,
    orderUrl: `${buildSiteUrl()}/account/orders/${order.id}`,
    downloadsUrl: `${buildSiteUrl()}/account/downloads`,
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

  return sendNewTransactionalEmail({
    templateKey: "order_received",
    to: data.to,
    profileId: data.profileId,
    orderId: data.orderId,
    variables: {
      userName: data.customerName || "Değerli Okurumuz",
      orderCode: data.orderNumber,
      accountUrl: `${buildSiteUrl()}/account/orders/${data.orderId}`
    },
    metadata: {
      order_number: data.orderNumber
    }
  });
}

export async function sendPaymentConfirmedEmail(orderId: string) {
  const data = await getOrderEmailData(orderId);
  if (!data) {
    return null;
  }

  return sendNewTransactionalEmail({
    templateKey: "order_paid",
    to: data.to,
    profileId: data.profileId,
    orderId: data.orderId,
    variables: {
      userName: data.customerName || "Değerli Okurumuz",
      orderCode: data.orderNumber,
      accountUrl: `${buildSiteUrl()}/account/orders/${data.orderId}`
    },
    metadata: {
      order_number: data.orderNumber
    }
  });
}

export async function sendOrderShippedEmail(orderId: string) {
  const data = await getOrderEmailData(orderId);
  if (!data) {
    return null;
  }

  return sendNewTransactionalEmail({
    templateKey: "order_shipped",
    to: data.to,
    profileId: data.profileId,
    orderId: data.orderId,
    variables: {
      userName: data.customerName || "Değerli Okurumuz",
      orderCode: data.orderNumber,
      trackingNumber: data.trackingNumber ?? "Kargo takip numarası hazırlanıyor",
      trackingUrl: data.trackingUrl ?? `${buildSiteUrl()}/account/orders/${data.orderId}`
    },
    metadata: {
      order_number: data.orderNumber,
      tracking_number: data.trackingNumber
    }
  });
}

export async function sendDigitalDeliveryReadyEmail(orderId: string) {
  const data = await getOrderEmailData(orderId);
  if (!data) {
    return null;
  }

  const digitalLines = data.lines.filter(
    (l) => l.fulfillmentType === "digital" || l.fulfillmentType === "hybrid"
  );
  if (digitalLines.length === 0) {
    return null;
  }

  const bookTitle = digitalLines.map((l) => l.title).join(", ");

  return sendNewTransactionalEmail({
    templateKey: "digital_delivery_ready",
    to: data.to,
    profileId: data.profileId,
    orderId: data.orderId,
    variables: {
      userName: data.customerName || "Değerli Okurumuz",
      bookTitle,
      downloadUrl: `${buildSiteUrl()}/account/downloads`
    },
    metadata: {
      order_number: data.orderNumber
    }
  });
}

export async function sendPaymentFailedEmail(orderId: string) {
  const data = await getOrderEmailData(orderId);
  if (!data) {
    return null;
  }

  return sendNewTransactionalEmail({
    templateKey: "payment_failed",
    to: data.to,
    profileId: data.profileId,
    orderId: data.orderId,
    variables: {
      userName: data.customerName || "Değerli Okurumuz",
      orderCode: data.orderNumber,
      checkoutUrl: `${buildSiteUrl()}/checkout`
    },
    metadata: {
      order_number: data.orderNumber
    }
  });
}

export async function sendOrderCancelledEmail(orderId: string) {
  const data = await getOrderEmailData(orderId);
  if (!data) {
    return null;
  }

  return sendNewTransactionalEmail({
    templateKey: "order_cancelled",
    to: data.to,
    profileId: data.profileId,
    orderId: data.orderId,
    variables: {
      userName: data.customerName || "Değerli Okurumuz",
      orderCode: data.orderNumber,
      accountUrl: `${buildSiteUrl()}/account/orders/${data.orderId}`
    },
    metadata: {
      order_number: data.orderNumber
    }
  });
}

export async function sendOrderRefundedEmail(orderId: string) {
  const data = await getOrderEmailData(orderId);
  if (!data) {
    return null;
  }

  return sendNewTransactionalEmail({
    templateKey: "order_refunded",
    to: data.to,
    profileId: data.profileId,
    orderId: data.orderId,
    variables: {
      userName: data.customerName || "Değerli Okurumuz",
      orderCode: data.orderNumber,
      accountUrl: `${buildSiteUrl()}/account/orders/${data.orderId}`
    },
    metadata: {
      order_number: data.orderNumber
    }
  });
}

export async function sendPasswordResetEmail(input: { email: string; resetUrl: string }) {
  const template = renderPasswordResetEmail(input);
  return sendOldTransactionalEmail({
    ...template,
    eventType: "password_reset",
    payload: { email: input.email },
    to: input.email
  });
}

export async function sendAccountSecurityEmail(input: { email: string; message: string; profileId?: string | null }) {
  const template = renderSecurityNoticeEmail(input);
  return sendOldTransactionalEmail({
    ...template,
    eventType: "account_security",
    payload: { message: input.message },
    profileId: input.profileId ?? null,
    to: input.email
  });
}

export async function sendWelcomeEmail(input: {
  email: string;
  userName: string;
  profileId: string;
}) {
  return sendNewTransactionalEmail({
    templateKey: "welcome",
    to: input.email,
    profileId: input.profileId,
    variables: {
      userName: input.userName || "Değerli Okurumuz",
      email: input.email,
      accountUrl: `${buildSiteUrl()}/account`
    }
  });
}
