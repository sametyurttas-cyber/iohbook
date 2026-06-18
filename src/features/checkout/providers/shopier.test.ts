import { describe, expect, it } from "vitest";
import { shopierProvider } from "@/features/checkout/providers/shopier";

describe("Shopier direct product provider", () => {
  it("redirects GODCODE orders with quantity and the internal order number as note", async () => {
    const result = await shopierProvider.startPayment({
      cartLines: [
        {
          product_variants: {
            sku: "IOH-GODCODE-PDF"
          },
          quantity: 2
        }
      ],
      order: {
        order_number: "IOH-20260618-TEST"
      }
    } as never);

    const url = new URL(result.redirectUrl ?? "");
    expect(url.searchParams.get("quantity")).toBe("2");
    expect(url.searchParams.get("note")).toBe("IOH-20260618-TEST");
    expect(result.providerReference).toBe("IOH-20260618-TEST");
    expect(result.providerStatus).toBe("direct_link_pending");
  });
});
