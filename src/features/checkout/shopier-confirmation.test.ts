import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { sendPaymentConfirmedEmail } from "@/features/email/events";
import { createEntitlementsForPaidOrder } from "@/features/entitlements/service";
import { approveTokenAllocationsForPaidOrder } from "@/features/token-sale/service";
import { confirmShopierPayment } from "./shopier-confirmation";

vi.mock("@/features/email/events", () => ({
  sendPaymentConfirmedEmail: vi.fn()
}));

vi.mock("@/features/entitlements/service", () => ({
  createEntitlementsForPaidOrder: vi.fn()
}));

vi.mock("@/features/token-sale/service", () => ({
  approveTokenAllocationsForPaidOrder: vi.fn()
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
            eq: async () => ({
              data: null,
              error: table === "orders" ? new Error("order update failed") : null
            })
          };
        }
      };
    }
  };
}

describe("shopier confirmation persistence", () => {
  it("stops before entitlement, allocation, and email side effects when order update fails", async () => {
    await expect(
      confirmShopierPayment({
        payload: signedShopierPayload(),
        supabase: createOrderUpdateFailureSupabaseMock() as never
      })
    ).rejects.toThrow("order update failed");

    expect(createEntitlementsForPaidOrder).not.toHaveBeenCalled();
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
    expect(approveTokenAllocationsForPaidOrder).not.toHaveBeenCalled();
    expect(sendPaymentConfirmedEmail).not.toHaveBeenCalled();
  });
});
