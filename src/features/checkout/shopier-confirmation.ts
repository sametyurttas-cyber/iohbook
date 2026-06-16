import {
  getShopierAmountMinor,
  getShopierOrderReference,
  getShopierTransactionId,
  getShopierConfig,
  mapShopierStatus,
  type ShopierCallbackPayload,
  verifyShopierCallbackSignature
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
import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

type ServiceClient = SupabaseClient<Database>;

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
    .select("id, cart_id, status")
    .eq("id", attempt.order_id)
    .single();

  if (orderError) {
    throw orderError;
  }

  const paymentStatus = mapShopierStatus(input.payload);
  const paid = paymentStatus === "paid";
  const orderStatus = mapPaymentStatusToOrderStatus(paymentStatus) ?? "pending_payment";
  const callbackAmountMinor = getShopierAmountMinor(input.payload);
  const callbackCurrency = input.payload.currency?.toUpperCase();

  if (paid && callbackAmountMinor !== null && callbackAmountMinor !== attempt.amount_minor) {
    throw new Error("Shopier callback amount does not match payment attempt.");
  }

  if (paid && callbackCurrency && callbackCurrency !== attempt.currency) {
    throw new Error("Shopier callback currency does not match payment attempt.");
  }

  assertPaymentTransition(attempt.status, paymentStatus);
  assertOrderTransition(order.status, orderStatus);

  const { data: lockedRows, error: lockError } = await input.supabase
    .from("payment_attempts")
    .update({
      failure_reason: paid ? null : input.payload.error_message ?? input.payload.reason ?? "shopier-payment-failed",
      provider_status: input.payload.status ?? input.payload.payment_status ?? null,
      provider_transaction_id: transactionId,
      raw_response: {
        callback: input.payload,
        source: "shopier_callback"
      },
      response_payload: {
        callback: input.payload,
        source: "shopier_callback"
      },
      status: paymentStatus,
      verified_at: new Date().toISOString()
    })
    .eq("id", attempt.id)
    .eq("status", attempt.status)
    .select("id");

  if (lockError) {
    throw lockError;
  }

  if (!lockedRows || lockedRows.length === 0) {
    return {
      idempotent: true,
      orderId: attempt.order_id,
      paid,
      providerTransactionId: transactionId
    };
  }

  await updateOrThrow(
    input.supabase
      .from("orders")
      .update({
        paid_at: paid ? new Date().toISOString() : null,
        status: orderStatus
      })
      .eq("id", attempt.order_id)
  );

  const stockRpcName = paid ? "commit_order_stock" : "release_order_reservation";
  const { error: stockError } = await input.supabase.rpc(stockRpcName, {
    p_order_id: attempt.order_id
  });

  if (stockError) {
    captureError(stockError, {
      operation: `shopier.confirmation.${stockRpcName}`,
      order_id: attempt.order_id,
      provider: "shopier"
    });
    throw stockError;
  }

  if (paid && order.cart_id) {
    await input.supabase.from("carts").update({ status: "converted" }).eq("id", order.cart_id);
  }

  if (paid) {
    await createEntitlementsForPaidOrder({
      orderId: attempt.order_id,
      supabase: input.supabase
    });
    try {
      await awardBookOrderRewardForPaidOrder({
        orderId: attempt.order_id,
        supabase: input.supabase
      });
    } catch (error) {
      captureError(error, {
        operation: "points.book_order_reward",
        order_id: attempt.order_id,
        provider: "shopier"
      });
    }
    await approveTokenAllocationsForPaidOrder({
      orderId: attempt.order_id,
      paymentAttemptId: attempt.id,
      supabase: input.supabase
    });
    try {
      await sendPaymentConfirmedEmail(attempt.order_id);
    } catch (error) {
      captureError(error, {
        operation: "email.payment_confirmed",
        order_id: attempt.order_id,
        provider: "shopier"
      });
    }
  }

  return {
    idempotent: false,
    orderId: attempt.order_id,
    paid,
    providerTransactionId: transactionId
  };
}
