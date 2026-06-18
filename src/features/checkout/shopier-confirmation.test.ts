import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { sendPaymentConfirmedEmail } from "@/features/email/events";
import { createEntitlementsForPaidOrder } from "@/features/entitlements/service";
import { awardBookOrderRewardForPaidOrder } from "@/features/points/service";
import { approveTokenAllocationsForPaidOrder } from "@/features/token-sale/service";
import { captureError } from "@/lib/observability";
import { retrieveShopierOrder } from "@/features/checkout/shopier";
import { confirmShopierOrderCreatedWebhook, confirmShopierPayment } from "./shopier-confirmation";

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
      productUrl: "https://www.shopier.com/sametyurttas/48021742",
      secret: "secret",
      webhookToken: "webhook"
    }),
    retrieveShopierOrder: vi.fn()
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

function createSuccessfulShopierWebhookSupabaseMock() {
  return {
    from(table: string) {
      const filters = new Map<string, unknown>();
      let operation: "select" | "update" = "select";
      const result = () => {
        if (operation === "update") {
          return { data: [{ id: `${table}-id` }], error: null };
        }

        if (table === "order_items") {
          return {
            data: [
              {
                fulfillment_type: "digital",
                quantity: 1,
                variant_snapshot: { sku: "IOH-GODCODE-PDF" }
              }
            ],
            error: null
          };
        }

        return { data: null, error: null };
      };
      const builder = {
        eq(key: string, value: unknown) {
          filters.set(key, value);
          return builder;
        },
        maybeSingle: async () => ({
          data:
            table === "payment_attempts" && filters.has("provider_reference")
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
          return builder;
        },
        single: async () => ({
          data: {
            cart_id: "cart-id",
            customer_email: "buyer@example.com",
            id: "order-id",
            status: "pending_payment"
          },
          error: null
        }),
        then(
          resolve: (value: ReturnType<typeof result>) => void,
          reject?: (reason: unknown) => void
        ) {
          return Promise.resolve(result()).then(resolve, reject);
        },
        update() {
          operation = "update";
          return builder;
        }
      };

      return builder;
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
    vi.mocked(retrieveShopierOrder).mockResolvedValue({
      currency: "TRY",
      id: "SHOPIER-ORDER-1",
      lineItems: [{ productId: "48021742", quantity: 1 }],
      note: "IOH-1",
      paymentStatus: "paid",
      status: "unfulfilled",
      totals: {
        total: "10.00"
      }
    });
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

  it("confirms a Shopier order.created webhook after REST verification by order note", async () => {
    const payload = {
      id: "SHOPIER-ORDER-1"
    };
    const rawBody = JSON.stringify(payload);
    const signature = createHmac("sha256", "webhook").update(rawBody).digest("hex");

    const result = await confirmShopierOrderCreatedWebhook({
      event: "order.created",
      payload,
      rawBody,
      signature,
      supabase: createSuccessfulShopierWebhookSupabaseMock() as never
    });

    expect(result).toEqual({
      idempotent: false,
      orderId: "order-id",
      paid: true,
      providerTransactionId: "SHOPIER-ORDER-1"
    });
    expect(createEntitlementsForPaidOrder).toHaveBeenCalledWith({
      orderId: "order-id",
      supabase: expect.anything()
    });
    expect(sendPaymentConfirmedEmail).toHaveBeenCalledWith("order-id");
    expect(retrieveShopierOrder).toHaveBeenCalledWith("SHOPIER-ORDER-1");
  });

  it("rejects a Shopier REST order when its amount does not match the noted attempt", async () => {
    vi.mocked(retrieveShopierOrder).mockResolvedValueOnce({
      currency: "TRY",
      id: "SHOPIER-ORDER-1",
      items: [{ product_id: "48021742", quantity: 1 }],
      note: "IOH-1",
      status: "paid",
      total: "9.99"
    });
    const payload = { id: "SHOPIER-ORDER-1" };
    const rawBody = JSON.stringify(payload);
    const signature = createHmac("sha256", "webhook").update(rawBody).digest("hex");

    await expect(
      confirmShopierOrderCreatedWebhook({
        event: "order.created",
        payload,
        rawBody,
        signature,
        supabase: createSuccessfulShopierWebhookSupabaseMock() as never
      })
    ).rejects.toThrow("Shopier REST order amount does not match payment attempt");

    expect(createEntitlementsForPaidOrder).not.toHaveBeenCalled();
    expect(sendPaymentConfirmedEmail).not.toHaveBeenCalled();
  });

  it("rejects Shopier webhooks with an invalid signature", async () => {
    const payload = {
      id: "SHOPIER-ORDER-1",
      currency: "TRY",
      email: "buyer@example.com",
      total: "10.00"
    };
    const rawBody = JSON.stringify(payload);

    await expect(
      confirmShopierOrderCreatedWebhook({
        event: "order.created",
        payload,
        rawBody,
        signature: "bad-signature",
        supabase: createSuccessfulShopierWebhookSupabaseMock() as never
      })
    ).rejects.toThrow("Shopier webhook signature is invalid");
  });
});
