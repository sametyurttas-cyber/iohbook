import {
  getShopierAmountMinor,
  getShopierOrderReference,
  getShopierTransactionId,
  getShopierConfig,
  mapShopierStatus,
  parseShopierAmountMinor,
  retrieveShopierOrder,
  isShopierPatConfigured,
  type ShopierCallbackPayload,
  verifyShopierCallbackSignature,
  verifyShopierWebhookSignature
} from "@/features/checkout/shopier";
import { trackServerAnalyticsEvent } from "@/features/analytics/business-events";
import {
  assertOrderTransition,
  assertPaymentTransition,
  mapPaymentStatusToOrderStatus
} from "@/features/checkout/payment-state";
import { convertPaidOrderCart } from "@/features/checkout/cart-finalization";
import { updateOrThrow } from "@/features/checkout/persistence";
import {
  sendPaymentConfirmedEmail,
  sendDigitalDeliveryReadyEmail,
  sendPaymentFailedEmail
} from "@/features/email/events";
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
  profile_id: string | null;
  status: OrderStatus;
};

type ShopierWebhookPayload = Record<string, unknown>;

export type ShopierConfirmationResult = {
  idempotent: boolean;
  orderId: string | null;
  paid: boolean;
  providerTransactionId: string | null;
  isTokenSale?: boolean;
};

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
  return getNestedString(payload, [
    ["id"],
    ["order", "id"],
    ["data", "id"],
    ["data", "order", "id"]
  ]);
}

function getShopierRestNote(payload: ShopierWebhookPayload) {
  return getNestedString(payload, [
    ["note"],
    ["customerNote"],
    ["customer_note"],
    ["orderNote"],
    ["order_note"],
    ["order", "note"],
    ["data", "note"],
    ["data", "order", "note"],
    ["data", "customerNote"],
    ["data", "customer_note"]
  ]);
}

function getShopierRestCurrency(payload: ShopierWebhookPayload) {
  return getNestedString(payload, [
    ["currency"],
    ["currencyCode"],
    ["currency_code"],
    ["totals", "currency"],
    ["order", "currency"],
    ["data", "currency"],
    ["data", "order", "currency"]
  ])?.toUpperCase();
}

function getShopierRestAmountMinor(payload: ShopierWebhookPayload) {
  const rawAmount = getNestedString(payload, [
    ["total"],
    ["totalPrice"],
    ["total_price"],
    ["totalAmount"],
    ["total_amount"],
    ["amount"],
    ["totals", "total"],
    ["totals", "grandTotal"],
    ["payment", "amount"],
    ["order", "total"],
    ["order", "amount"],
    ["data", "total"],
    ["data", "amount"],
    ["data", "order", "total"],
    ["data", "order", "amount"]
  ]);

  return parseShopierAmountMinor(rawAmount);
}

function getShopierRestStatus(payload: ShopierWebhookPayload) {
  return getNestedString(payload, [
    ["paymentStatus"],
    ["payment_status"],
    ["status"],
    ["order", "paymentStatus"],
    ["order", "payment_status"],
    ["order", "status"],
    ["data", "paymentStatus"],
    ["data", "payment_status"],
    ["data", "status"],
    ["data", "order", "paymentStatus"],
    ["data", "order", "payment_status"],
    ["data", "order", "status"]
  ])?.toLowerCase();
}

function getShopierRestItems(payload: ShopierWebhookPayload) {
  const candidates: unknown[] = [
    payload.lineItems,
    payload.items,
    payload.products,
    payload.orderItems,
    payload.order_items,
    (payload.order as Record<string, unknown> | undefined)?.lineItems,
    (payload.order as Record<string, unknown> | undefined)?.items,
    (payload.data as Record<string, unknown> | undefined)?.lineItems,
    (payload.data as Record<string, unknown> | undefined)?.items,
    (payload.data as Record<string, unknown> | undefined)?.products,
    ((payload.data as Record<string, unknown> | undefined)?.order as Record<string, unknown> | undefined)
      ?.lineItems,
    ((payload.data as Record<string, unknown> | undefined)?.order as Record<string, unknown> | undefined)
      ?.items
  ];

  return candidates.find(Array.isArray) as Record<string, unknown>[] | undefined;
}

function getShopierRestQuantity(payload: ShopierWebhookPayload) {
  const direct = getNestedString(payload, [
    ["quantity"],
    ["totalQuantity"],
    ["total_quantity"],
    ["data", "quantity"]
  ]);

  if (direct && /^\d+$/.test(direct)) {
    return Number.parseInt(direct, 10);
  }

  const items = getShopierRestItems(payload);
  if (!items?.length) return null;

  return items.reduce((total, item) => {
    const value = item.quantity ?? item.qty ?? item.count;
    const quantity = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
    return Number.isInteger(quantity) && quantity > 0 ? total + quantity : total;
  }, 0);
}

function getShopierRestProductIds(payload: ShopierWebhookPayload) {
  return (getShopierRestItems(payload) ?? [])
    .map(
      (item) =>
        item.productId ??
        item.product_id ??
        (item.product as Record<string, unknown> | undefined)?.id ??
        item.id
    )
    .filter((value): value is string | number => typeof value === "string" || typeof value === "number")
    .map(String);
}

function getConfiguredShopierProductId(productUrl: string) {
  try {
    const segments = new URL(productUrl).pathname.split("/").filter(Boolean);
    return segments.at(-1) ?? null;
  } catch {
    return null;
  }
}

async function isTokenSaleOrder(orderId: string, supabase: ServiceClient): Promise<boolean> {
  const { data, error } = await supabase
    .from("order_items")
    .select("fulfillment_type")
    .eq("order_id", orderId);

  if (error || !data) {
    return false;
  }

  return data.some((item) => item.fulfillment_type === "claimable");
}

async function reconcilePaidBookAccess(input: {
  orderId: string;
  supabase: ServiceClient;
}) {
  await createEntitlementsForPaidOrder({
    orderId: input.orderId,
    supabase: input.supabase
  });

  try {
    await sendDigitalDeliveryReadyEmail(input.orderId);
  } catch (error) {
    captureError(error, {
      operation: "email.digital_delivery_ready",
      order_id: input.orderId,
      provider: "shopier"
    });
  }

  try {
    await awardBookOrderRewardForPaidOrder({
      orderId: input.orderId,
      supabase: input.supabase
    });
  } catch (error) {
    captureError(error, {
      operation: "points.book_order_reward",
      order_id: input.orderId,
      provider: "shopier"
    });
  }
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

  const isTokenSale = await isTokenSaleOrder(input.attempt.order_id, input.supabase);

  if (!lockedRows || lockedRows.length === 0) {
    return {
      idempotent: true,
      orderId: input.attempt.order_id,
      paid,
      providerTransactionId: input.providerTransactionId,
      isTokenSale
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

  // Write audit log
  try {
    await input.supabase.from("audit_logs").insert({
      action: `shopier.payment_${input.paymentStatus}`,
      actor_profile_id: input.order.profile_id,
      entity_id: input.attempt.order_id,
      entity_type: "order",
      before_data: {
        order_status: input.order.status,
        payment_status: input.attempt.status
      },
      after_data: {
        order_status: orderStatus,
        payment_status: input.paymentStatus
      },
      metadata: {
        payment_attempt_id: input.attempt.id,
        provider_transaction_id: input.providerTransactionId,
        source: input.source,
        is_token_sale: isTokenSale
      }
    });
  } catch (auditError) {
    captureError(auditError, {
      operation: "shopier.confirmation.audit_log",
      order_id: input.attempt.order_id,
      provider: "shopier"
    });
  }

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

  if (paid) {
    await convertPaidOrderCart({
      cartId: input.order.cart_id,
      orderId: input.attempt.order_id,
      supabase: input.supabase
    });
  }

  if (paid) {
    await trackServerAnalyticsEvent({
      eventName: "order_paid",
      idempotencyKey: input.attempt.order_id,
      metadata: {
        currency: input.attempt.currency,
        order_id: input.attempt.order_id,
        provider: "shopier",
        revenue_minor: input.attempt.amount_minor,
        is_token_sale: isTokenSale
      },
      path: isTokenSale ? "/token-sale/success" : "/checkout/success",
      profileId: input.order.profile_id
    });

    await reconcilePaidBookAccess({
      orderId: input.attempt.order_id,
      supabase: input.supabase
    });

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
  } else {
    try {
      await sendPaymentFailedEmail(input.attempt.order_id);
    } catch (error) {
      captureError(error, {
        operation: "email.payment_failed",
        order_id: input.attempt.order_id,
        provider: "shopier"
      });
    }
  }

  return {
    idempotent: false,
    orderId: input.attempt.order_id,
    paid,
    providerTransactionId: input.providerTransactionId,
    isTokenSale
  };
}

async function validateShopierOrderItems(input: {
  orderId: string;
  productId: string | null;
  quantity: number;
  restOrder: ShopierWebhookPayload;
  supabase: ServiceClient;
}) {
  const { data: items, error } = await input.supabase
    .from("order_items")
    .select("quantity, variant_snapshot, fulfillment_type")
    .eq("order_id", input.orderId);

  if (error) {
    throw error;
  }

  if (!items || items.length === 0) {
    throw new Error("Shopier order has no items.");
  }

  const isTokenSale = items.some((item) => item.fulfillment_type === "claimable");

  if (isTokenSale) {
    const nonClaimable = items.filter((item) => item.fulfillment_type !== "claimable");
    if (nonClaimable.length > 0) {
      throw new Error("Token sale order contains non-claimable items.");
    }

    const expectedQuantity = items.reduce((total, item) => total + item.quantity, 0);
    if (input.quantity !== expectedQuantity) {
      throw new Error(`Shopier order quantity "${input.quantity}" does not match order quantity "${expectedQuantity}".`);
    }

    const productIds = getShopierRestProductIds(input.restOrder);
    if (input.productId && productIds.length > 0 && !productIds.includes(input.productId)) {
      throw new Error("Shopier order product does not match configured token sale product.");
    }
  } else {
    const directItems = items.filter((item) => {
      const snapshot = item.variant_snapshot as Record<string, unknown>;
      return item.fulfillment_type === "digital" && DIRECT_LINK_SKUS.has(String(snapshot.sku ?? ""));
    });

    if (directItems.length !== 1 || directItems.length !== items.length) {
      throw new Error("Shopier order does not contain the expected digital product.");
    }

    const expectedQuantity = directItems.reduce((total, item) => total + item.quantity, 0);
    if (input.quantity !== expectedQuantity) {
      throw new Error("Shopier order quantity does not match payment attempt.");
    }

    const productIds = getShopierRestProductIds(input.restOrder);
    if (input.productId && productIds.length > 0 && !productIds.includes(input.productId)) {
      throw new Error("Shopier order product does not match configured product.");
    }
  }
}

export async function confirmShopierPayment(input: {
  payload: ShopierCallbackPayload;
  supabase: ServiceClient;
}): Promise<ShopierConfirmationResult> {
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
      await convertPaidOrderCart({
        orderId: alreadyPaid.order_id,
        supabase: input.supabase
      });
      await reconcilePaidBookAccess({
        orderId: alreadyPaid.order_id,
        supabase: input.supabase
      });
      const isTokenSale = await isTokenSaleOrder(alreadyPaid.order_id, input.supabase);
      if (isTokenSale) {
        await approveTokenAllocationsForPaidOrder({
          orderId: alreadyPaid.order_id,
          paymentAttemptId: alreadyPaid.id,
          supabase: input.supabase
        });
      }
      return {
        idempotent: true,
        orderId: alreadyPaid.order_id,
        paid: true,
        providerTransactionId: transactionId,
        isTokenSale
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

  const isTokenSale = await isTokenSaleOrder(attempt.order_id, input.supabase);

  if (attempt.status === "paid") {
    await convertPaidOrderCart({
      orderId: attempt.order_id,
      supabase: input.supabase
    });
    await reconcilePaidBookAccess({
      orderId: attempt.order_id,
      supabase: input.supabase
    });
    if (isTokenSale) {
      await approveTokenAllocationsForPaidOrder({
        orderId: attempt.order_id,
        paymentAttemptId: attempt.id,
        supabase: input.supabase
      });
    }
    return {
      idempotent: true,
      orderId: attempt.order_id,
      paid: true,
      providerTransactionId: transactionId,
      isTokenSale
    };
  }

  const { data: order, error: orderError } = await input.supabase
    .from("orders")
    .select("id, cart_id, customer_email, profile_id, status")
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

  // PAT API Verification in Callback
  if (paid && transactionId) {
    if (isTokenSale && !isShopierPatConfigured()) {
      throw new Error("Shopier Personal Access Token (PAT) is not configured for token sale verification.");
    }

    if (isShopierPatConfigured()) {
      const restOrder = await retrieveShopierOrder<ShopierWebhookPayload>(transactionId);

      // note doğrulaması
      const restNote = getShopierRestNote(restOrder);
      if (!restNote || restNote !== attempt.provider_reference) {
        throw new Error(`Shopier PAT verification failed: note "${restNote}" does not match payment attempt reference "${attempt.provider_reference}".`);
      }

      // quantity doğrulaması
      const restQuantity = getShopierRestQuantity(restOrder);
      if (restQuantity === null || restQuantity < 1) {
        throw new Error("Shopier PAT verification failed: quantity is missing or invalid.");
      }

      // amount_minor doğrulaması
      const restAmountMinor = getShopierRestAmountMinor(restOrder);
      if (restAmountMinor === null || restAmountMinor !== attempt.amount_minor) {
        throw new Error(`Shopier PAT verification failed: amount_minor "${restAmountMinor}" does not match payment attempt amount "${attempt.amount_minor}".`);
      }

      // currency doğrulaması
      const restCurrency = getShopierRestCurrency(restOrder);
      if (!restCurrency || restCurrency !== attempt.currency) {
        throw new Error(`Shopier PAT verification failed: currency "${restCurrency}" does not match payment attempt currency "${attempt.currency}".`);
      }

      // Product id / items doğrulaması
      const configuredProductId = isTokenSale
        ? getConfiguredShopierProductId(process.env.SHOPIER_TOKEN_SALE_PRODUCT_URL ?? "")
        : getConfiguredShopierProductId(config.productUrl);

      await validateShopierOrderItems({
        orderId: attempt.order_id,
        productId: configuredProductId,
        quantity: restQuantity,
        restOrder,
        supabase: input.supabase
      });
    }
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
}): Promise<ShopierConfirmationResult> {
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

  if (!shopierOrderId) {
    throw new Error("Shopier webhook missing order id.");
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
    await convertPaidOrderCart({
      orderId: alreadyPaid.order_id,
      supabase: input.supabase
    });
    await reconcilePaidBookAccess({
      orderId: alreadyPaid.order_id,
      supabase: input.supabase
    });
    const isTokenSale = await isTokenSaleOrder(alreadyPaid.order_id, input.supabase);
    if (isTokenSale) {
      await approveTokenAllocationsForPaidOrder({
        orderId: alreadyPaid.order_id,
        paymentAttemptId: alreadyPaid.id,
        supabase: input.supabase
      });
    }
    return {
      idempotent: true,
      orderId: alreadyPaid.order_id,
      paid: true,
      providerTransactionId: shopierOrderId,
      isTokenSale
    };
  }

  const restOrder = await retrieveShopierOrder<ShopierWebhookPayload>(shopierOrderId);
  const orderReference = getShopierRestNote(restOrder);
  const amountMinor = getShopierRestAmountMinor(restOrder);
  const currency = getShopierRestCurrency(restOrder);
  const quantity = getShopierRestQuantity(restOrder);
  const providerStatus = getShopierRestStatus(restOrder);

  if (!orderReference) {
    throw new Error("Shopier REST order missing note reference.");
  }

  if (amountMinor === null) {
    throw new Error("Shopier REST order missing amount.");
  }

  if (!currency) {
    throw new Error("Shopier REST order missing currency.");
  }

  if (quantity === null || quantity < 1) {
    throw new Error("Shopier REST order missing quantity.");
  }

  if (providerStatus && ["cancelled", "canceled", "failed", "refunded"].includes(providerStatus)) {
    throw new Error(`Shopier REST order is not payable: ${providerStatus}`);
  }

  const { data: attempt, error: attemptError } = await input.supabase
    .from("payment_attempts")
    .select("id, order_id, status, provider_reference, amount_minor, currency, created_at")
    .eq("provider", "shopier")
    .eq("provider_reference", orderReference)
    .maybeSingle();

  if (attemptError) {
    throw attemptError;
  }

  if (!attempt) {
    throw new Error("Shopier payment attempt not found for order note.");
  }

  const isTokenSale = await isTokenSaleOrder(attempt.order_id, input.supabase);

  if (attempt.status === "paid") {
    await convertPaidOrderCart({
      orderId: attempt.order_id,
      supabase: input.supabase
    });
    await reconcilePaidBookAccess({
      orderId: attempt.order_id,
      supabase: input.supabase
    });
    if (isTokenSale) {
      await approveTokenAllocationsForPaidOrder({
        orderId: attempt.order_id,
        paymentAttemptId: attempt.id,
        supabase: input.supabase
      });
    }
    return {
      idempotent: true,
      orderId: attempt.order_id,
      paid: true,
      providerTransactionId: shopierOrderId,
      isTokenSale
    };
  }

  if (attempt.status !== "pending") {
    throw new Error(`Shopier payment attempt is not pending: ${attempt.status}`);
  }

  // note doğrulaması
  if (orderReference !== attempt.provider_reference) {
    throw new Error(`Shopier REST order note "${orderReference}" does not match payment attempt reference "${attempt.provider_reference}".`);
  }

  // quantity doğrulaması
  if (attempt.amount_minor !== amountMinor) {
    throw new Error("Shopier REST order amount does not match payment attempt.");
  }

  // currency doğrulaması
  if (attempt.currency !== currency) {
    throw new Error("Shopier REST order currency does not match payment attempt.");
  }

  const { data: order, error: orderError } = await input.supabase
    .from("orders")
    .select("id, cart_id, customer_email, profile_id, status")
    .eq("id", attempt.order_id)
    .single();

  if (orderError) {
    throw orderError;
  }

  if (isTokenSale && !isShopierPatConfigured()) {
    throw new Error("Shopier Personal Access Token (PAT) is not configured for token sale verification.");
  }

  const configuredProductId = isTokenSale
    ? getConfiguredShopierProductId(process.env.SHOPIER_TOKEN_SALE_PRODUCT_URL ?? "")
    : getConfiguredShopierProductId(config.productUrl);

  await validateShopierOrderItems({
    orderId: attempt.order_id,
    productId: configuredProductId,
    quantity,
    restOrder,
    supabase: input.supabase
  });

  return applyShopierPaymentResult({
    attempt,
    order,
    paymentStatus: "paid",
    providerStatus: providerStatus ? `order.created:${providerStatus}` : "order.created:verified",
    providerTransactionId: shopierOrderId,
    rawResponse: {
      retrieved_order: restOrder,
      webhook: input.payload
    },
    source: "shopier_order_created_webhook_rest_verified",
    supabase: input.supabase
  });
}

export async function confirmShopierPaymentByOrderId(input: {
  shopierOrderId: string;
  supabase: ServiceClient;
}): Promise<ShopierConfirmationResult> {
  const config = getShopierConfig();

  const { data: alreadyPaid, error: alreadyPaidError } = await input.supabase
    .from("payment_attempts")
    .select("id, order_id, status, provider_transaction_id")
    .eq("provider", "shopier")
    .eq("provider_transaction_id", input.shopierOrderId)
    .maybeSingle();

  if (alreadyPaidError) {
    throw alreadyPaidError;
  }

  if (alreadyPaid?.status === "paid") {
    await convertPaidOrderCart({
      orderId: alreadyPaid.order_id,
      supabase: input.supabase
    });
    await reconcilePaidBookAccess({
      orderId: alreadyPaid.order_id,
      supabase: input.supabase
    });
    const isTokenSale = await isTokenSaleOrder(alreadyPaid.order_id, input.supabase);
    if (isTokenSale) {
      await approveTokenAllocationsForPaidOrder({
        orderId: alreadyPaid.order_id,
        paymentAttemptId: alreadyPaid.id,
        supabase: input.supabase
      });
    }
    return {
      idempotent: true,
      orderId: alreadyPaid.order_id,
      paid: true,
      providerTransactionId: input.shopierOrderId,
      isTokenSale
    };
  }

  const restOrder = await retrieveShopierOrder<ShopierWebhookPayload>(input.shopierOrderId);
  const orderReference = getShopierRestNote(restOrder);
  const amountMinor = getShopierRestAmountMinor(restOrder);
  const currency = getShopierRestCurrency(restOrder);
  const quantity = getShopierRestQuantity(restOrder);
  const providerStatus = getShopierRestStatus(restOrder);

  if (!orderReference) {
    throw new Error("Shopier REST order missing note reference.");
  }

  if (amountMinor === null) {
    throw new Error("Shopier REST order missing amount.");
  }

  if (!currency) {
    throw new Error("Shopier REST order missing currency.");
  }

  if (quantity === null || quantity < 1) {
    throw new Error("Shopier REST order missing quantity.");
  }

  if (providerStatus && ["cancelled", "canceled", "failed", "refunded"].includes(providerStatus)) {
    throw new Error(`Shopier REST order is not payable: ${providerStatus}`);
  }

  const { data: attempt, error: attemptError } = await input.supabase
    .from("payment_attempts")
    .select("id, order_id, status, provider_reference, amount_minor, currency, created_at")
    .eq("provider", "shopier")
    .eq("provider_reference", orderReference)
    .maybeSingle();

  if (attemptError) {
    throw attemptError;
  }

  if (!attempt) {
    throw new Error("Shopier payment attempt not found for order note.");
  }

  const isTokenSale = await isTokenSaleOrder(attempt.order_id, input.supabase);

  if (attempt.status === "paid") {
    await convertPaidOrderCart({
      orderId: attempt.order_id,
      supabase: input.supabase
    });
    await reconcilePaidBookAccess({
      orderId: attempt.order_id,
      supabase: input.supabase
    });
    if (isTokenSale) {
      await approveTokenAllocationsForPaidOrder({
        orderId: attempt.order_id,
        paymentAttemptId: attempt.id,
        supabase: input.supabase
      });
    }
    return {
      idempotent: true,
      orderId: attempt.order_id,
      paid: true,
      providerTransactionId: input.shopierOrderId,
      isTokenSale
    };
  }

  if (attempt.status !== "pending") {
    throw new Error(`Shopier payment attempt is not pending: ${attempt.status}`);
  }

  // note doğrulaması
  if (orderReference !== attempt.provider_reference) {
    throw new Error(`Shopier REST order note "${orderReference}" does not match payment attempt reference "${attempt.provider_reference}".`);
  }

  // amount_minor doğrulaması
  if (attempt.amount_minor !== amountMinor) {
    throw new Error("Shopier REST order amount does not match payment attempt.");
  }

  // currency doğrulaması
  if (attempt.currency !== currency) {
    throw new Error("Shopier REST order currency does not match payment attempt.");
  }

  const { data: order, error: orderError } = await input.supabase
    .from("orders")
    .select("id, cart_id, customer_email, profile_id, status")
    .eq("id", attempt.order_id)
    .single();

  if (orderError) {
    throw orderError;
  }

  if (isTokenSale && !isShopierPatConfigured()) {
    throw new Error("Shopier Personal Access Token (PAT) is not configured for token sale verification.");
  }

  const configuredProductId = isTokenSale
    ? getConfiguredShopierProductId(process.env.SHOPIER_TOKEN_SALE_PRODUCT_URL ?? "")
    : getConfiguredShopierProductId(config.productUrl);

  await validateShopierOrderItems({
    orderId: attempt.order_id,
    productId: configuredProductId,
    quantity,
    restOrder,
    supabase: input.supabase
  });

  return applyShopierPaymentResult({
    attempt,
    order,
    paymentStatus: "paid",
    providerStatus: providerStatus ? `query:${providerStatus}` : "query:verified",
    providerTransactionId: input.shopierOrderId,
    rawResponse: {
      retrieved_order: restOrder
    },
    source: "shopier_query_on_return",
    supabase: input.supabase
  });
}


