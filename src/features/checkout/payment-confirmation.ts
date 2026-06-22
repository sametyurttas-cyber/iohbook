import {
  IYZICO_CHECKOUT_RETRIEVE_PATH,
  requestIyzico
} from "@/features/checkout/checkout-utils";
import { trackServerAnalyticsEvent } from "@/features/analytics/business-events";
import {
  isIyzicoPaymentPaid,
  type IyzicoCheckoutRetrieveResponse
} from "@/features/checkout/iyzico-types";
import {
  assertOrderTransition,
  assertPaymentTransition
} from "@/features/checkout/payment-state";
import { updateOrThrow } from "@/features/checkout/persistence";
import {
  sendPaymentConfirmedEmail,
  sendDigitalDeliveryReadyEmail,
  sendPaymentFailedEmail
} from "@/features/email/events";
import { createEntitlementsForPaidOrder } from "@/features/entitlements/service";
import { awardBookOrderRewardForPaidOrder } from "@/features/points/service";
import { captureError, logInfo } from "@/lib/observability";
import type { Database, OrderStatus, PaymentStatus } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

type ServiceClient = SupabaseClient<Database>;

export type ConfirmIyzicoPaymentResult = {
  idempotent: boolean;
  orderId: string;
  paid: boolean;
  providerTransactionId: string | null;
};

function getIyzicoPaidPriceMinor(response: IyzicoCheckoutRetrieveResponse) {
  if (response.paidPrice === undefined || response.paidPrice === null) {
    return null;
  }

  const amount = Number(response.paidPrice);
  if (!Number.isFinite(amount)) {
    return null;
  }

  return Math.round(amount * 100);
}

export async function confirmIyzicoCheckoutPayment(input: {
  provider?: "iyzico";
  retrievePayment?: (token: string) => Promise<IyzicoCheckoutRetrieveResponse>;
  source: "callback" | "webhook";
  supabase: ServiceClient;
  token: string;
  webhookPaymentId?: string | null;
}) {
  const provider = input.provider ?? "iyzico";
  const providerTransactionId = input.webhookPaymentId?.trim() || null;
  logInfo("payment.confirmation.started", {
    provider,
    source: input.source,
    has_provider_transaction_id: Boolean(providerTransactionId)
  });

  if (providerTransactionId) {
    const { data: alreadyConfirmed, error: confirmedError } = await input.supabase
      .from("payment_attempts")
      .select("id, order_id, status, provider_transaction_id")
      .eq("provider", provider)
      .eq("provider_transaction_id", providerTransactionId)
      .maybeSingle();

    if (confirmedError) {
      throw confirmedError;
    }

    if (alreadyConfirmed?.status === "paid") {
      return {
        idempotent: true,
        orderId: alreadyConfirmed.order_id,
        paid: true,
        providerTransactionId
      } satisfies ConfirmIyzicoPaymentResult;
    }
  }

  const { data: attempt, error: attemptError } = await input.supabase
    .from("payment_attempts")
    .select("id, order_id, status, provider_transaction_id, provider_reference, amount_minor, currency")
    .eq("provider", provider)
    .eq("provider_reference", input.token)
    .maybeSingle();

  if (attemptError) {
    throw attemptError;
  }

  if (!attempt) {
    captureError(new Error("Payment attempt not found."), {
      operation: "payment.confirmation.find_attempt",
      provider,
      source: input.source
    });
    throw new Error("Payment attempt not found.");
  }

  if (attempt.status === "paid" && attempt.provider_transaction_id) {
    return {
      idempotent: true,
      orderId: attempt.order_id,
      paid: true,
      providerTransactionId: attempt.provider_transaction_id
    } satisfies ConfirmIyzicoPaymentResult;
  }

  const { data: order, error: orderError } = await input.supabase
    .from("orders")
    .select("id, cart_id, profile_id, status")
    .eq("id", attempt.order_id)
    .single();

  if (orderError) {
    throw orderError;
  }

  const response = input.retrievePayment
    ? await input.retrievePayment(input.token)
    : await requestIyzico<IyzicoCheckoutRetrieveResponse>(
        IYZICO_CHECKOUT_RETRIEVE_PATH,
        {
          locale: "en",
          token: input.token
        }
      );
  const paid = isIyzicoPaymentPaid(response);
  const nextPaymentStatus: PaymentStatus = paid ? "paid" : "failed";
  const nextOrderStatus: OrderStatus = paid ? "paid" : "pending_payment";

  assertPaymentTransition(attempt.status, nextPaymentStatus);
  assertOrderTransition(order.status, nextOrderStatus);

  const retrievedPaymentId = response.paymentId ?? providerTransactionId;

  if (providerTransactionId && response.paymentId && response.paymentId !== providerTransactionId) {
    throw new Error("Webhook payment id does not match retrieve response.");
  }

  if (paid) {
    const paidPriceMinor = getIyzicoPaidPriceMinor(response);
    const responseCurrency = response.currency?.toUpperCase();

    if (paidPriceMinor === null || paidPriceMinor !== attempt.amount_minor) {
      throw new Error("iyzico paid price does not match payment attempt.");
    }

    if (!responseCurrency || responseCurrency !== attempt.currency) {
      throw new Error("iyzico currency does not match payment attempt.");
    }
  }

  const { data: lockedRows, error: lockError } = await input.supabase
    .from("payment_attempts")
    .update({
      failure_code: response.errorCode ?? null,
      failure_message: response.errorMessage ?? null,
      failure_reason: response.errorMessage ?? null,
      provider_status: response.paymentStatus ?? response.status ?? null,
      provider_transaction_id: retrievedPaymentId ?? null,
      provider_token: input.token,
      provider_reference: input.token,
      raw_response: {
        retrieve: response,
        source: input.source
      },
      response_payload: {
        retrieve: response,
        source: input.source
      },
      status: nextPaymentStatus,
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
      providerTransactionId: retrievedPaymentId ?? null
    } satisfies ConfirmIyzicoPaymentResult;
  }

  await updateOrThrow(
    input.supabase
      .from("orders")
      .update({
        paid_at: paid ? new Date().toISOString() : null,
        status: nextOrderStatus
      })
      .eq("id", attempt.order_id)
  );

  const stockRpcName = paid ? "commit_order_stock" : "release_order_reservation";
  const { error: stockError } = await input.supabase.rpc(stockRpcName, {
    p_order_id: attempt.order_id
  });

  if (stockError) {
    captureError(stockError, {
      operation: `payment.confirmation.${stockRpcName}`,
      order_id: attempt.order_id,
      provider,
      source: input.source
    });
    throw stockError;
  }

  logInfo("payment.confirmation.completed", {
    order_id: attempt.order_id,
    paid,
    provider,
    provider_transaction_id: retrievedPaymentId ?? null,
    source: input.source
  });

  if (paid && order.cart_id) {
    await input.supabase
      .from("carts")
      .update({ status: "converted" })
      .eq("id", order.cart_id);
  }

  if (paid) {
    await trackServerAnalyticsEvent({
      eventName: "order_paid",
      idempotencyKey: attempt.order_id,
      metadata: {
        currency: attempt.currency,
        order_id: attempt.order_id,
        provider,
        revenue_minor: attempt.amount_minor
      },
      path: "/checkout/success",
      profileId: order.profile_id
    });
    await createEntitlementsForPaidOrder({
      orderId: attempt.order_id,
      supabase: input.supabase
    });
    try {
      await sendDigitalDeliveryReadyEmail(attempt.order_id);
    } catch (error) {
      captureError(error, {
        operation: "email.digital_delivery_ready",
        order_id: attempt.order_id,
        provider,
        source: input.source
      });
    }
    try {
      await awardBookOrderRewardForPaidOrder({
        orderId: attempt.order_id,
        supabase: input.supabase
      });
    } catch (error) {
      captureError(error, {
        operation: "points.book_order_reward",
        order_id: attempt.order_id,
        provider,
        source: input.source
      });
    }
    try {
      await sendPaymentConfirmedEmail(attempt.order_id);
    } catch (error) {
      captureError(error, {
        operation: "email.payment_confirmed",
        order_id: attempt.order_id,
        provider,
        source: input.source
      });
    }
  } else {
    try {
      await sendPaymentFailedEmail(attempt.order_id);
    } catch (error) {
      captureError(error, {
        operation: "email.payment_failed",
        order_id: attempt.order_id,
        provider,
        source: input.source
      });
    }
  }

  return {
    idempotent: false,
    orderId: attempt.order_id,
    paid,
    providerTransactionId: retrievedPaymentId ?? null
  } satisfies ConfirmIyzicoPaymentResult;
}
