import { beforeEach, describe, expect, it, vi } from "vitest";
import { createEntitlementsForPaidOrder } from "@/features/entitlements/service";
import { sendPaymentConfirmedEmail } from "@/features/email/events";
import { awardBookOrderRewardForPaidOrder } from "@/features/points/service";
import { captureError } from "@/lib/observability";
import { confirmIyzicoCheckoutPayment } from "./payment-confirmation";

vi.mock("@/features/analytics/business-events", () => ({
  trackServerAnalyticsEvent: vi.fn()
}));

vi.mock("@/features/email/events", () => ({
  sendPaymentConfirmedEmail: vi.fn()
}));

vi.mock("@/features/entitlements/service", () => ({
  createEntitlementsForPaidOrder: vi.fn()
}));

vi.mock("@/features/points/service", () => ({
  awardBookOrderRewardForPaidOrder: vi.fn()
}));

vi.mock("@/lib/observability", () => ({
  captureError: vi.fn(),
  logInfo: vi.fn()
}));

const { trackServerAnalyticsEvent } = await import("@/features/analytics/business-events");

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
            eq() {
              return this;
            },
            select: async () => ({
              data: null,
              error: table === "payment_attempts" ? new Error("payment update failed") : null
            })
          };
        }
      };
    }
  };
}

function createPaymentOptimisticLockMissSupabaseMock() {
  const orderUpdate = vi.fn();
  const cartUpdate = vi.fn();

  return {
    cartUpdate,
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
          if (table === "orders") {
            orderUpdate();
          }

          if (table === "carts") {
            cartUpdate();
          }

          return {
            eq() {
              return this;
            },
            select: async () => ({
              data: table === "payment_attempts" ? [] : [{ id: `${table}-id` }],
              error: null
            })
          };
        }
      };
    },
    orderUpdate
  };
}

function createSuccessfulPaidSupabaseMock() {
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
          const updateResult = {
            eq() {
              return this;
            },
            select: async () => ({
              data: table === "payment_attempts" ? [{ id: "attempt-id" }] : [{ id: `${table}-id` }],
              error: null
            }),
            then(resolve: (value: { data: { id: string }[]; error: null }) => void) {
              return Promise.resolve({
                data: [{ id: `${table}-id` }],
                error: null
              }).then(resolve);
            }
          };

          return updateResult;
        }
      };
    },
    rpc: vi.fn(async () => ({
      data: null,
      error: null
    }))
  };
}

describe("payment confirmation idempotency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    expect(awardBookOrderRewardForPaidOrder).not.toHaveBeenCalled();
    expect(sendPaymentConfirmedEmail).not.toHaveBeenCalled();
  });

  it("returns idempotent without side effects when optimistic payment lock matches no rows", async () => {
    const supabase = createPaymentOptimisticLockMissSupabaseMock();

    const result = await confirmIyzicoCheckoutPayment({
      retrievePayment: async () => ({
        currency: "TRY",
        paidPrice: 10,
        paymentId: "payment-id",
        paymentStatus: "SUCCESS",
        status: "success"
      }),
      source: "callback",
      supabase: supabase as never,
      token: "checkout-token"
    });

    expect(result).toEqual({
      idempotent: true,
      orderId: "order-id",
      paid: true,
      providerTransactionId: "payment-id"
    });
    expect(supabase.orderUpdate).not.toHaveBeenCalled();
    expect(supabase.cartUpdate).not.toHaveBeenCalled();
    expect(createEntitlementsForPaidOrder).not.toHaveBeenCalled();
    expect(awardBookOrderRewardForPaidOrder).not.toHaveBeenCalled();
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
    expect(awardBookOrderRewardForPaidOrder).not.toHaveBeenCalled();
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
    expect(awardBookOrderRewardForPaidOrder).not.toHaveBeenCalled();
    expect(sendPaymentConfirmedEmail).not.toHaveBeenCalled();
  });

  it("keeps payment successful when IOH point reward fails after a paid book order", async () => {
    vi.mocked(awardBookOrderRewardForPaidOrder).mockRejectedValueOnce(new Error("points failed"));

    const result = await confirmIyzicoCheckoutPayment({
      retrievePayment: async () => ({
        currency: "TRY",
        paidPrice: 10,
        paymentId: "payment-id",
        paymentStatus: "SUCCESS",
        status: "success"
      }),
      source: "callback",
      supabase: createSuccessfulPaidSupabaseMock() as never,
      token: "checkout-token"
    });

    expect(result).toEqual({
      idempotent: false,
      orderId: "order-id",
      paid: true,
      providerTransactionId: "payment-id"
    });
    expect(createEntitlementsForPaidOrder).toHaveBeenCalledWith({
      orderId: "order-id",
      supabase: expect.anything()
    });
    expect(awardBookOrderRewardForPaidOrder).toHaveBeenCalledWith({
      orderId: "order-id",
      supabase: expect.anything()
    });
    expect(captureError).toHaveBeenCalledWith(expect.any(Error), {
      operation: "points.book_order_reward",
      order_id: "order-id",
      provider: "iyzico",
      source: "callback"
    });
    expect(sendPaymentConfirmedEmail).toHaveBeenCalledWith("order-id");
    expect(trackServerAnalyticsEvent).toHaveBeenCalledWith({
      eventName: "order_paid",
      idempotencyKey: "order-id",
      metadata: {
        currency: "TRY",
        order_id: "order-id",
        provider: "iyzico",
        revenue_minor: 1000
      },
      path: "/checkout/success",
      profileId: undefined
    });
  });

  it("keeps payment successful when payment confirmation email fails", async () => {
    vi.mocked(sendPaymentConfirmedEmail).mockRejectedValueOnce(new Error("email failed"));

    const result = await confirmIyzicoCheckoutPayment({
      retrievePayment: async () => ({
        currency: "TRY",
        paidPrice: 10,
        paymentId: "payment-id",
        paymentStatus: "SUCCESS",
        status: "success"
      }),
      source: "callback",
      supabase: createSuccessfulPaidSupabaseMock() as never,
      token: "checkout-token"
    });

    expect(result).toEqual({
      idempotent: false,
      orderId: "order-id",
      paid: true,
      providerTransactionId: "payment-id"
    });
    expect(sendPaymentConfirmedEmail).toHaveBeenCalledWith("order-id");
    expect(captureError).toHaveBeenCalledWith(expect.any(Error), {
      operation: "email.payment_confirmed",
      order_id: "order-id",
      provider: "iyzico",
      source: "callback"
    });
  });

  it("keeps payment successful when analytics storage is unavailable", async () => {
    vi.mocked(trackServerAnalyticsEvent).mockResolvedValueOnce(false);

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
        supabase: createSuccessfulPaidSupabaseMock() as never,
        token: "checkout-token"
      })
    ).resolves.toMatchObject({ paid: true, orderId: "order-id" });
    expect(createEntitlementsForPaidOrder).toHaveBeenCalled();
    expect(sendPaymentConfirmedEmail).toHaveBeenCalled();
  });
});
