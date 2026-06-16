import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { sendPaymentConfirmedEmail } from "@/features/email/events";
import { createEntitlementsForPaidOrder } from "@/features/entitlements/service";
import { awardBookOrderRewardForPaidOrder } from "@/features/points/service";
import { approveTokenAllocationsForPaidOrder } from "@/features/token-sale/service";
import { captureError } from "@/lib/observability";
import { confirmShopierPayment } from "./shopier-confirmation";

vi.mock("@/features/email/events", () => ({
  sendPaymentConfirmedEmail: vi.fn()
}));

vi.mock("@/features/entitlements/service", () => ({
  createEntitlementsForPaidOrder: vi.fn()
}));

vi.mock("@/features/points/service", () => ({
  awardBookOrderRewardForPaidOrder: vi.fn()
}));

vi.mock("@/features/token-sale/service", () => ({
  approveTokenAllocationsForPaidOrder: vi.fn()
}));

vi.mock("@/lib/observability", () => ({
  captureError: vi.fn()
}));

vi.mock("@/features/checkout/shopier", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/features/checkout/shopier")>();

  return {
    ...original,
    getShopierConfig: () => ({
      apiKey: "api",
      merchantId: "merchant",
      paymentUrl: "https://shopier.example/pay",
      secret: "secret"
    })
  };
});

function signedShopierPayload() {
  const signature = createHmac("sha256", "secret")
    .update("IOH-1|PAY-1|success|10.00")
    .digest("base64");

  return {
    payment_id: "PAY-1",
    platform_order_id: "IOH-1",
    currency: "TRY",
    signature,
    status: "success",
    total_order_value: "10.00"
  };
}

function createOrderUpdateFailureSupabaseMock() {
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
                  provider_reference: "IOH-1",
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
              data: table === "payment_attempts" ? [{ id: "attempt-id" }] : null,
              error: null
            }),
            then(resolve: (value: { data: null; error: Error | null }) => void) {
              return Promise.resolve({
                data: null,
                error: table === "orders" ? new Error("order update failed") : null
              }).then(resolve);
            }
          };
        }
      };
    }
  };
}

function createSuccessfulShopierSupabaseMock() {
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
                  provider_reference: "IOH-1",
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
        }
      };
    },
    rpc: vi.fn(async () => ({
      data: null,
      error: null
    }))
  };
}

describe("shopier confirmation persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stops before entitlement, allocation, and email side effects when order update fails", async () => {
    await expect(
      confirmShopierPayment({
        payload: signedShopierPayload(),
        supabase: createOrderUpdateFailureSupabaseMock() as never
      })
    ).rejects.toThrow("order update failed");

    expect(createEntitlementsForPaidOrder).not.toHaveBeenCalled();
    expect(awardBookOrderRewardForPaidOrder).not.toHaveBeenCalled();
    expect(approveTokenAllocationsForPaidOrder).not.toHaveBeenCalled();
    expect(sendPaymentConfirmedEmail).not.toHaveBeenCalled();
  });

  it("rejects paid callbacks when amount does not match the payment attempt", async () => {
    const payload = {
      ...signedShopierPayload(),
      signature: createHmac("sha256", "secret")
        .update("IOH-1|PAY-1|success|9.99")
        .digest("base64"),
      total_order_value: "9.99"
    };

    await expect(
      confirmShopierPayment({
        payload,
        supabase: createOrderUpdateFailureSupabaseMock() as never
      })
    ).rejects.toThrow("Shopier callback amount does not match payment attempt");

    expect(createEntitlementsForPaidOrder).not.toHaveBeenCalled();
    expect(awardBookOrderRewardForPaidOrder).not.toHaveBeenCalled();
    expect(approveTokenAllocationsForPaidOrder).not.toHaveBeenCalled();
    expect(sendPaymentConfirmedEmail).not.toHaveBeenCalled();
  });

  it("rejects paid callbacks when currency does not match the payment attempt", async () => {
    await expect(
      confirmShopierPayment({
        payload: {
          ...signedShopierPayload(),
          currency: "USD"
        },
        supabase: createOrderUpdateFailureSupabaseMock() as never
      })
    ).rejects.toThrow("Shopier callback currency does not match payment attempt");

    expect(createEntitlementsForPaidOrder).not.toHaveBeenCalled();
    expect(awardBookOrderRewardForPaidOrder).not.toHaveBeenCalled();
    expect(approveTokenAllocationsForPaidOrder).not.toHaveBeenCalled();
    expect(sendPaymentConfirmedEmail).not.toHaveBeenCalled();
  });

  it("keeps Shopier payment successful when IOH point reward fails", async () => {
    vi.mocked(awardBookOrderRewardForPaidOrder).mockRejectedValueOnce(new Error("points failed"));

    const result = await confirmShopierPayment({
      payload: signedShopierPayload(),
      supabase: createSuccessfulShopierSupabaseMock() as never
    });

    expect(result).toEqual({
      idempotent: false,
      orderId: "order-id",
      paid: true,
      providerTransactionId: "PAY-1"
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
      provider: "shopier"
    });
    expect(approveTokenAllocationsForPaidOrder).toHaveBeenCalledWith({
      orderId: "order-id",
      paymentAttemptId: "attempt-id",
      supabase: expect.anything()
    });
    expect(sendPaymentConfirmedEmail).toHaveBeenCalledWith("order-id");
  });

  it("keeps Shopier payment successful when payment confirmation email fails", async () => {
    vi.mocked(sendPaymentConfirmedEmail).mockRejectedValueOnce(new Error("email failed"));

    const result = await confirmShopierPayment({
      payload: signedShopierPayload(),
      supabase: createSuccessfulShopierSupabaseMock() as never
    });

    expect(result).toEqual({
      idempotent: false,
      orderId: "order-id",
      paid: true,
      providerTransactionId: "PAY-1"
    });
    expect(sendPaymentConfirmedEmail).toHaveBeenCalledWith("order-id");
    expect(captureError).toHaveBeenCalledWith(expect.any(Error), {
      operation: "email.payment_confirmed",
      order_id: "order-id",
      provider: "shopier"
    });
  });
});
