import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  buildShopierPaymentUrl,
  buildShopierProductUrl,
  getShopierAmountMinor,
  mapShopierStatus,
  verifyShopierCallbackSignature
} from "@/features/checkout/shopier";

describe("shopier payment helpers", () => {
  it("adds quantity and the IOH order reference to a Shopier product URL", () => {
    const url = new URL(
      buildShopierProductUrl({
        note: "IOH-20260618-TEST",
        productUrl: "https://www.shopier.com/sametyurttas/48021742",
        quantity: 2
      })
    );

    expect(url.searchParams.get("quantity")).toBe("2");
    expect(url.searchParams.get("note")).toBe("IOH-20260618-TEST");
  });

  it("builds a signed hosted payment URL", () => {
    const result = buildShopierPaymentUrl({
      amountMinor: 12500,
      apiKey: "api",
      callbackUrl: "https://example.com/api/payments/shopier/callback",
      currency: "TRY",
      email: "buyer@example.com",
      merchantId: "merchant",
      orderNumber: "IOH-123",
      paymentUrl: "https://shopier.example/pay",
      secret: "secret"
    });

    const url = new URL(result.url);
    expect(url.searchParams.get("platform_order_id")).toBe("IOH-123");
    expect(url.searchParams.get("total_order_value")).toBe("125.00");
    expect(url.searchParams.get("signature")).toBeTruthy();
  });

  it("verifies callback signatures and rejects tampering", () => {
    const signature = createHmac("sha256", "secret")
      .update("IOH-123|PAY-1|success|125.00")
      .digest("base64");
    const payload = {
      payment_id: "PAY-1",
      platform_order_id: "IOH-123",
      signature,
      status: "success",
      total_order_value: "125.00"
    };

    expect(verifyShopierCallbackSignature(payload, "secret")).toBe(true);
    expect(verifyShopierCallbackSignature({ ...payload, status: "failed" }, "secret")).toBe(false);
  });

  it("maps terminal Shopier statuses", () => {
    expect(mapShopierStatus({ status: "success" })).toBe("paid");
    expect(mapShopierStatus({ status: "cancelled" })).toBe("cancelled");
    expect(mapShopierStatus({ status: "failed" })).toBe("failed");
  });

  it("normalizes callback amounts to minor units", () => {
    expect(getShopierAmountMinor({ total_order_value: "125.45" })).toBe(12545);
    expect(getShopierAmountMinor({ total_order_value: "125,45" })).toBe(12545);
    expect(getShopierAmountMinor({ total_order_value: "12,34" })).toBe(1234);
    expect(getShopierAmountMinor({ total_order_value: "12.3" })).toBe(1230);
    expect(getShopierAmountMinor({ total_order_value: "abc" })).toBeNull();
    expect(getShopierAmountMinor({ total_order_value: "not-money" })).toBeNull();
  });
});
