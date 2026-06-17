import {
  getShopierAmountMinor,
  getShopierOrderReference,
  getShopierTransactionId,
  getShopierConfig,
  mapShopierStatus,
  parseShopierAmountMinor,
  type ShopierCallbackPayload,
  verifyShopierCallbackSignature,
  verifyShopierWebhookSignature
} from "@/features/checkout/shopier";
import {
  assertOrderTransition,
  assertPaymentTransition,
  mapPaymentStatusToOrderStatus
} from "@/features/checkout/payment-state";
import { updateOrThrow } from "@/features/checkout/persistence";
import { sendPaymentConfirmedEmail } from "@/features/email/events";
import { createEntitlementsForPaidOrder } from "@/features/entitlements/service";
import { awardBookOrderRewardForPaidOrder } from "@/features/points/service";
import { approveTokenAllocationsForPaidOrder } from "@/features/token-sale/service";
import { captureError } from "@/lib/observability";
import type { Database, OrderStatus, PaymentStatus } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

type ServiceClient = SupabaseClient<Database>;

type ShopierAttempt = {
  amount_minor: number;
  created_at?: string;
  currency: string;
  id: string;
  order_id: string;
  provider_reference: string | null;
  status: PaymentStatus;
};

type ShopierOrder = {
  cart_id: string | null;
  customer_email: string;
  id: string;
  status: OrderStatus;
};

type ShopierWebhookPayload = Record<string, unknown>;

const DIRECT_LINK_SKUS = new Set(["IOH-GODCODE-PDF"]);

function getNestedString(payload: ShopierWebhookPayload, paths: string[][]) {
  for (const path of paths) {
    let value: unknown = payload;

    for (const key of path) {
      if (!value || typeof value !== "object") {
        value = null;
        break;
      }

      value = (value as Record<string, unknown>)[key];
    }

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return null;
}

function getShopierWebhookOrderId(payload: ShopierWebhookPayload) {
  return getNestedString(payload, [["id"], ["order", "id"], ["data", "id"]]);
}

function getShopierWebhookEmail(payload: ShopierWebhookPayload) {
  return getNestedString(payload, [
    ["email"],
    ["buyerEmail"],
    ["buyer", "email"],
    ["customer", "email"],
    ["shippingInfo", "email"],
    ["billingInfo", "email"],
    ["order", "email"],
    ["order", "buyer", "email"],
    ["data", "email"],
    ["data", "buyer", "email"]
  ])?.toLowerCase();
}

function getShopierWebhookCurrency(payload: ShopierWebhookPayload) {
  return (
    getNestedString(payload, [
      ["currency"],
      ["currencyCode"],
      ["totals", "currency"],
      ["order", "currency"],
      ["data", "currency"]
    ])?.toUpperCase() ?? "TRY"
  );
}

function getShopierWebhookAmountMinor(payload: ShopierWebhookPayload) {
  const rawAmount = getNestedString(payload, [
    ["total"],
    ["totalPrice"],
    ["totalAmount"],
    ["amount"],
    ["totals", "total"],
    ["totals", "grandTotal"],
    ["payment", "amount"],
    ["order", "total"],
    ["order", "amount"],
    ["data", "total"],
    ["data", "amount"]
  ]);

  return parseShopierAmountMinor(rawAmount);
}

async function applyShopierPaymentResult(input: {
  attempt: ShopierAttempt;
  order: ShopierOrder;
  paymentStatus: PaymentStatus;
  providerStatus: string | null;
  providerTransactionId: string | null;
  rawResponse: Record<string, unknown>;
  source: string;
  supabase: ServiceClient;
}) {
  const paid = input.paymentStatus === "paid";
  const orderStatus = mapPaymentStatusToOrderStatus(input.paymentStatus) ?? "pending_payment";

  assertPaymentTransition(input.attempt.status, input.paymentStatus);
  assertOrderTransition(input.order.status, orderStatus);

  const { data: lockedRows, error: lockError } = await input.supabase
    .from("payment_attempts")
    .update({
      failure_reason: paid ? null : "shopier-payment-failed",
      provider_status: input.providerStatus,
      provider_transaction_id: input.providerTransactionId,
      raw_response: {
        ...input.rawResponse,
        source: input.source
      },
      response_payload: {
        ...input.rawResponse,
        source: input.source
      },
      status: input.paymentStatus,
      verified_at: new Date().toISOString()
    })
    .eq("id", input.attempt.id)
    .eq("status", input.attempt.status)
    .select("id");

  if (lockError) {
    throw lockError;
  }

  if (!lockedRows || lockedRows.length === 0) {
    return {
      idempotent: true,
      orderId: input.attempt.order_id,
      paid,
      providerTransactionId: input.providerTransactionId
    };
  }

  await updateOrThrow(
    input.supabase
      .from("orders")
      .update({
        paid_at: paid ? new Date().toISOString() : null,
        status: orderStatus
      })
      .eq("id", input.attempt.order_id)
  );

  const stockRpcName = paid ? "commit_order_stock" : "release_order_reservation";
  const { error: stockError } = await input.supabase.rpc(stockRpcName, {
    p_order_id: input.attempt.order_id
  });

  if (stockError) {
    captureError(stockError, {
      operation: `shopier.confirmation.${stockRpcName}`,
      order_id: input.attempt.order_id,
      provider: "shopier"
    });
    throw stockError;
  }

  if (paid && input.order.cart_id) {
    await input.supabase.from("carts").update({ status: "converted" }).eq("id", input.order.cart_id);
  }

  if (paid) {
    await createEntitlementsForPaidOrder({
      orderId: input.attempt.order_id,
      supabase: input.supabase
    });
    try {
      await awardBookOrderRewardForPaidOrder({
        orderId: input.attempt.order_id,
        supabase: input.supabase
      });
    } catch (error) {
      captureError(error, {
        operation: "points.book_order_reward",
        order_id: input.attempt.order_id,
        provider: "shopier"
      });
    }
    await approveTokenAllocationsForPaidOrder({
      orderId: input.attempt.order_id,
      paymentAttemptId: input.attempt.id,
      supabase: input.supabase
    });
    try {
      await sendPaymentConfirmedEmail(input.attempt.order_id);
    } catch (error) {
      captureError(error, {
        operation: "email.payment_confirmed",
        order_id: input.attempt.order_id,
        provider: "shopier"
      });
    }
  }

  return {
    idempotent: false,
    orderId: input.attempt.order_id,
    paid,
    providerTransactionId: input.providerTransactionId
  };
}

async function orderMatchesEmail(input: {
  email: string;
  orderId: string;
  supabase: ServiceClient;
}) {
  const { data: order, error } = await input.supabase
    .from("orders")
    .select("id, cart_id, customer_email, status")
    .eq("id", input.orderId)
    .single();

  if (error) {
    throw error;
  }

  if (order.customer_email.toLowerCase() !== input.email) {
    return null;
  }

  return order;
}

async function orderHasDirectLinkDigitalItem(input: {
  orderId: string;
  supabase: ServiceClient;
}) {
  const { data: items, error } = await input.supabase
    .from("order_items")
    .select("variant_snapshot, fulfillment_type")
    .eq("order_id", input.orderId);

  if (error) {
    throw error;
  }

  return (items ?? []).some((item) => {
    const snapshot = item.variant_snapshot as Record<string, unknown>;
    return item.fulfillment_type === "digital" && DIRECT_LINK_SKUS.has(String(snapshot.sku ?? ""));
  });
}

async function findShopierWebhookAttempt(input: {
  amountMinor: number;
  currency: string;
  email: string;
  supabase: ServiceClient;
}) {
  const { data: exactCandidates, error: exactCandidatesError } = await input.supabase
    .from("payment_attempts")
    .select("id, order_id, status, provider_reference, amount_minor, currency, created_at")
    .eq("provider", "shopier")
    .eq("status", "pending")
    .eq("amount_minor", input.amountMinor)
    .eq("currency", input.currency)
    .order("created_at", { ascending: false })
    .limit(20);

  if (exactCandidatesError) {
    throw exactCandidatesError;
  }

  for (const candidate of exactCandidates ?? []) {
    const order = await orderMatchesEmail({
      email: input.email,
      orderId: candidate.order_id,
      supabase: input.supabase
    });

    if (order) {
      return { attempt: candidate, order };
    }
  }

  const { data: fallbackCandidates, error: fallbackCandidatesError } = await input.supabase
    .from("payment_attempts")
    .select("id, order_id, status, provider_reference, amount_minor, currency, created_at")
    .eq("provider", "shopier")
    .eq("status", "pending")
    .eq("currency", input.currency)
    .order("created_at", { ascending: false })
    .limit(20);

  if (fallbackCandidatesError) {
    throw fallbackCandidatesError;
  }

  for (const candidate of fallbackCandidates ?? []) {
    const order = await orderMatchesEmail({
      email: input.email,
      orderId: candidate.order_id,
      supabase: input.supabase
    });

    if (!order) {
      continue;
    }

    const hasDirectLinkItem = await orderHasDirectLinkDigitalItem({
      orderId: candidate.order_id,
      supabase: input.supabase
    });

    if (hasDirectLinkItem) {
      return { attempt: candidate, order };
    }
  }

  return null;
}

export async function confirmShopierPayment(input: {
  payload: ShopierCallbackPayload;
  supabase: ServiceClient;
}) {
  const config = getShopierConfig();
  const orderReference = getShopierOrderReference(input.payload);
  const transactionId = getShopierTransactionId(input.payload);

  if (!orderReference) {
    throw new Error("Shopier callback missing order reference.");
  }

  if (!verifyShopierCallbackSignature(input.payload, config.secret)) {
    throw new Error("Shopier callback signature is invalid.");
  }

  if (transactionId) {
    const { data: alreadyPaid, error: alreadyPaidError } = await input.supabase
      .from("payment_attempts")
      .select("id, order_id, status, provider_transaction_id")
      .eq("provider", "shopier")
      .eq("provider_transaction_id", transactionId)
      .maybeSingle();

    if (alreadyPaidError) {
      throw alreadyPaidError;
    }

    if (alreadyPaid?.status === "paid") {
      return {
        idempotent: true,
        orderId: alreadyPaid.order_id,
        paid: true,
        providerTransactionId: transactionId
      };
    }
  }

  const { data: attempt, error: attemptError } = await input.supabase
    .from("payment_attempts")
    .select("id, order_id, status, provider_reference, amount_minor, currency")
    .eq("provider", "shopier")
    .eq("provider_reference", orderReference)
    .maybeSingle();

  if (attemptError) {
    throw attemptError;
  }

  if (!attempt) {
    throw new Error("Shopier payment attempt not found.");
  }

  if (attempt.status === "paid") {
    return {
      idempotent: true,
      orderId: attempt.order_id,
      paid: true,
      providerTransactionId: transactionId
    };
  }

  const { data: order, error: orderError } = await input.supabase
    .from("orders")
    .select("id, cart_id, customer_email, status")
    .eq("id", attempt.order_id)
    .single();

  if (orderError) {
    throw orderError;
  }

  const paymentStatus = mapShopierStatus(input.payload);
  const paid = paymentStatus === "paid";
  const callbackAmountMinor = getShopierAmountMinor(input.payload);
  const callbackCurrency = input.payload.currency?.toUpperCase();

  if (paid && callbackAmountMinor !== null && callbackAmountMinor !== attempt.amount_minor) {
    throw new Error("Shopier callback amount does not match payment attempt.");
  }

  if (paid && callbackCurrency && callbackCurrency !== attempt.currency) {
    throw new Error("Shopier callback currency does not match payment attempt.");
  }

  return applyShopierPaymentResult({
    attempt,
    order,
    paymentStatus,
    providerStatus: input.payload.status ?? input.payload.payment_status ?? null,
    providerTransactionId: transactionId,
    rawResponse: {
      callback: input.payload
    },
    source: "shopier_callback",
    supabase: input.supabase
  });
}

export async function confirmShopierOrderCreatedWebhook(input: {
  event: string | null;
  payload: ShopierWebhookPayload;
  rawBody: string;
  signature: string | null;
  supabase: ServiceClient;
}) {
  const config = getShopierConfig();

  if (input.event && input.event !== "order.created") {
    return {
      idempotent: true,
      orderId: null,
      paid: false,
      providerTransactionId: null
    };
  }

  if (!verifyShopierWebhookSignature({
    rawBody: input.rawBody,
    signature: input.signature,
    webhookToken: config.webhookToken
  })) {
    throw new Error("Shopier webhook signature is invalid.");
  }

  const shopierOrderId = getShopierWebhookOrderId(input.payload);
  const webhookEmail = getShopierWebhookEmail(input.payload);
  const webhookAmountMinor = getShopierWebhookAmountMinor(input.payload);
  const webhookCurrency = getShopierWebhookCurrency(input.payload);

  if (!shopierOrderId) {
    throw new Error("Shopier webhook missing order id.");
  }

  if (!webhookEmail) {
    throw new Error("Shopier webhook missing buyer email.");
  }

  if (webhookAmountMinor === null) {
    throw new Error("Shopier webhook missing order amount.");
  }

  const { data: alreadyPaid, error: alreadyPaidError } = await input.supabase
    .from("payment_attempts")
    .select("id, order_id, status, provider_transaction_id")
    .eq("provider", "shopier")
    .eq("provider_transaction_id", shopierOrderId)
    .maybeSingle();

  if (alreadyPaidError) {
    throw alreadyPaidError;
  }

  if (alreadyPaid?.status === "paid") {
    return {
      idempotent: true,
      orderId: alreadyPaid.order_id,
      paid: true,
      providerTransactionId: shopierOrderId
    };
  }

  const match = await findShopierWebhookAttempt({
    amountMinor: webhookAmountMinor,
    currency: webhookCurrency,
    email: webhookEmail,
    supabase: input.supabase
  });

  if (match) {
    return applyShopierPaymentResult({
      attempt: match.attempt,
      order: match.order,
      paymentStatus: "paid",
      providerStatus:
        match.attempt.amount_minor === webhookAmountMinor ? "order.created" : "order.created_amount_fallback",
      providerTransactionId: shopierOrderId,
      rawResponse: {
        webhook: input.payload
      },
      source: "shopier_order_created_webhook",
      supabase: input.supabase
    });
  }

  throw new Error("Shopier webhook payment attempt not found.");
}
