import { describe, expect, it } from "vitest";
import {
  validateTokenAllocationUpdate,
  validateTokenPackageDuplicate
} from "@/features/token-sale/admin-rules";

describe("token allocation admin rules", () => {
  it("requires a transaction hash before marking an allocation as sent", () => {
    expect(validateTokenAllocationUpdate({ status: "sent", txHash: null })).toBe("tx-hash-required");
    expect(validateTokenAllocationUpdate({ status: "sent", txHash: "0xabc" })).toBeNull();
    expect(validateTokenAllocationUpdate({ status: "approved", txHash: null })).toBeNull();
  });

  it("rejects duplicate package titles in the same campaign", () => {
    expect(
      validateTokenPackageDuplicate({
        currency: "usd",
        existing: [{ currency: "USD", price_minor: 100, title: "Starter", token_amount: "10" }],
        priceMinor: 200,
        title: " starter ",
        tokenAmount: "20"
      })
    ).toBe("duplicate-package-title");
  });

  it("rejects duplicate package value combinations in the same campaign", () => {
    expect(
      validateTokenPackageDuplicate({
        currency: "usd",
        existing: [{ currency: "USD", price_minor: 100, title: "Starter", token_amount: "10" }],
        priceMinor: 100,
        title: "Launch",
        tokenAmount: "10"
      })
    ).toBe("duplicate-package-values");
  });
});
