import { describe, expect, it } from "vitest";
import {
  calculateBonusAmount,
  calculateTotalTokenAmount,
  formatTokenAmount
} from "@/features/token-sale/utils";

describe("token sale utils", () => {
  it("calculates bonus allocations using basis points", () => {
    expect(calculateBonusAmount("100", 1500)).toBe("15");
    expect(calculateTotalTokenAmount("100", 1500)).toBe("115");
  });

  it("keeps token math in fixed decimal strings", () => {
    expect(calculateTotalTokenAmount("0.1", 20000)).toBe("0.3");
    expect(calculateBonusAmount("1.23456789", 1500)).toBe("0.18518518");
  });

  it("formats token amounts with fractional precision", () => {
    expect(formatTokenAmount("1234.56789")).toBe("1,234.56789");
  });
});
