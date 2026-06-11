import { describe, expect, it, vi } from "vitest";
import { createEntitlementsForPaidOrder } from "@/features/entitlements/service";
import { sendPaymentConfirmedEmail } from "@/features/email/events";
import { confirmIyzicoCheckoutPayment } from "./payment-confirmation";

vi.mock("@/features/email/events", () => ({
  sendPaymentConfirmedEmail: vi.fn()
}));

vi.mock("@/features/entitlements/service", () => ({
  createEntitlementsForPaidOrder: vi.fn()
}));

vi.mock("@/lib/observability", () => ({
  captureError: vi.fn(),
  logInfo: vi.fn()
}));

function createPaidAttemptSupabaseMock() {
  return {
    from(table: string) {
      return {
        eq() {
          return this;
        },
        maybeSingle: async () => ({
          data:
            table === "payment_attempts"
              ? {
                  id: "attempt-id",
                  order_id: "order-id",
                  provider_transaction_id: "payment-id",
                  status: "paid"
                }
              : null,
          error: null
        }),
        select() {
          return this;
        }
      };
    }
  };
}

function createPaymentUpdateFailureSupabaseMock() {
  return {
    from(table: string) {
      return {
        eq() {
          return this;
        },
        maybeSingle: async () => ({
          data:
            table === "payment_attempts"
              ? {
                  amount_minor: 1000,
                  currency: "TRY",
                  id: "attempt-id",
                  order_id: "order-id",
                  provider_reference: "checkout-token",
                  provider_transaction_id: null,
                  status: "pending"
                }
              : null,
          error: null
        }),
        select() {
          return this;
        },
        single: async () => ({
          data: {
            cart_id: "cart-id",
            id: "order-id",
            status: "pending_payment"
          },
          error: null
        }),
        update() {
          return {
            eq: async () => ({
              data: null,
              error: table === "payment_attempts" ? new Error("payment update failed") : null
            })
          };
        }
      };
    }
  };
}

describe("payment confirmation idempotency", () => {
  it("does not retrieve or rewrite an already paid provider transaction", async () => {
    const retrievePayment = vi.fn();
    const result = await confirmIyzicoCheckoutPayment({
      retrievePayment,
      source: "webhook",
      supabase: createPaidAttemptSupabaseMock() as never,
      token: "checkout-token",
      webhookPaymentId: "payment-id"
    });

    expect(result).toEqual({
      idempotent: true,
      orderId: "order-id",
      paid: true,
      providerTransactionId: "payment-id"
    });
    expect(retrievePayment).not.toHaveBeenCalled();
  });

  it("stops before fulfillment side effects when payment update fails", async () => {
    await expect(
      confirmIyzicoCheckoutPayment({
        retrievePayment: async () => ({
          currency: "TRY",
          paidPrice: 10,
          paymentId: "payment-id",
          paymentStatus: "SUCCESS",
          status: "success"
        }),
        source: "callback",
        supabase: createPaymentUpdateFailureSupabaseMock() as never,
        token: "checkout-token"
      })
    ).rejects.toThrow("payment update failed");

    expect(createEntitlementsForPaidOrder).not.toHaveBeenCalled();
    expect(sendPaymentConfirmedEmail).not.toHaveBeenCalled();
  });

  it("rejects paid retrieve responses when amount does not match the payment attempt", async () => {
    await expect(
      confirmIyzicoCheckoutPayment({
        retrievePayment: async () => ({
          currency: "TRY",
          paidPrice: 9.99,
          paymentId: "payment-id",
          paymentStatus: "SUCCESS",
          status: "success"
        }),
        source: "callback",
        supabase: createPaymentUpdateFailureSupabaseMock() as never,
        token: "checkout-token"
      })
    ).rejects.toThrow("iyzico paid price does not match payment attempt");

    expect(createEntitlementsForPaidOrder).not.toHaveBeenCalled();
    expect(sendPaymentConfirmedEmail).not.toHaveBeenCalled();
  });

  it("rejects paid retrieve responses when currency does not match the payment attempt", async () => {
    await expect(
      confirmIyzicoCheckoutPayment({
        retrievePayment: async () => ({
          currency: "USD",
          paidPrice: 10,
          paymentId: "payment-id",
          paymentStatus: "SUCCESS",
          status: "success"
        }),
        source: "callback",
        supabase: createPaymentUpdateFailureSupabaseMock() as never,
        token: "checkout-token"
      })
    ).rejects.toThrow("iyzico currency does not match payment attempt");

    expect(createEntitlementsForPaidOrder).not.toHaveBeenCalled();
    expect(sendPaymentConfirmedEmail).not.toHaveBeenCalled();
  });
});
