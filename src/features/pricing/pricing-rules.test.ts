import { describe, expect, it } from "vitest";
import {
  calculateDiscountMinor,
  calculateOrderTotal,
  calculateSubtotalMinor
} from "@/features/pricing/pricing-rules";

describe("pricing rules", () => {
  it("calculates subtotal, shipping, tax, discount and final total", () => {
    expect(
      calculateOrderTotal({
        discount: { percentOff: 10, type: "percent" },
        lines: [
          { quantity: 2, unitPriceMinor: 15000 },
          { quantity: 1, unitPriceMinor: 22000 }
        ],
        shippingMinor: 3500,
        taxMinor: 0
      })
    ).toEqual({
      discountMinor: 5200,
      shippingMinor: 3500,
      subtotalMinor: 52000,
      taxMinor: 0,
      totalMinor: 50300
    });
  });

  it("caps fixed amount discounts at subtotal", () => {
    expect(
      calculateOrderTotal({
        discount: { amountMinor: 999999, type: "fixed_amount" },
        lines: [{ quantity: 1, unitPriceMinor: 12000 }],
        shippingMinor: 0
      }).totalMinor
    ).toBe(0);
  });

  it("calculates free shipping discount from shipping only", () => {
    expect(
      calculateDiscountMinor({
        discount: { type: "free_shipping" },
        shippingMinor: 3500,
        subtotalMinor: 52000
      })
    ).toBe(3500);
  });

  it("rejects invalid quantities", () => {
    expect(() =>
      calculateSubtotalMinor([{ quantity: 0, unitPriceMinor: 1000 }])
    ).toThrow("Quantity must be a positive integer.");
  });
});
