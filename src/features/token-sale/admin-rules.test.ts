import { describe, expect, it } from "vitest";
import { validateTokenAllocationUpdate } from "@/features/token-sale/admin-rules";

describe("token allocation admin rules", () => {
  it("requires a transaction hash before marking an allocation as sent", () => {
    expect(validateTokenAllocationUpdate({ status: "sent", txHash: null })).toBe("tx-hash-required");
    expect(validateTokenAllocationUpdate({ status: "sent", txHash: "0xabc" })).toBeNull();
    expect(validateTokenAllocationUpdate({ status: "approved", txHash: null })).toBeNull();
  });
});
