import { describe, expect, it } from "vitest";
import {
  calculateCartTotals,
  getAvailableQuantity,
  validateCartQuantity
} from "./cart-rules";

describe("cart rules", () => {
  it("calculates available stock after reserved and safety stock", () => {
    expect(
      getAvailableQuantity({
        onHand: 10,
        reserved: 2,
        safetyStock: 1,
        stockPolicy: "track"
      })
    ).toBe(7);
  });

  it("rejects quantities above available stock", () => {
    const result = validateCartQuantity({
      onHand: 3,
      requestedQuantity: 4,
      reserved: 0,
      safetyStock: 0,
      stockPolicy: "track"
    });

    expect(result.ok).toBe(false);
  });

  it("rejects quantities above max per order", () => {
    const result = validateCartQuantity({
      maxPerOrder: 2,
      onHand: 10,
      requestedQuantity: 3,
      reserved: 0,
      safetyStock: 0,
      stockPolicy: "track"
    });

    expect(result.ok).toBe(false);
  });

  it("calculates item count and subtotal", () => {
    expect(
      calculateCartTotals([
        { quantity: 2, unitPriceMinor: 15000 },
        { quantity: 1, unitPriceMinor: 22000 }
      ])
    ).toEqual({
      itemCount: 3,
      subtotalMinor: 52000
    });
  });
});
