import { describe, expect, it } from "vitest";
import {
  commitCheckoutPaymentStart,
  commitTokenSalePaymentStart,
  updateOrThrow
} from "@/features/checkout/persistence";

function rpcFailureClient() {
  return {
    rpc() {
      return {
        single: async () => ({
          data: null,
          error: new Error("rpc failed")
        })
      };
    }
  };
}

describe("checkout persistence helpers", () => {
  it("throws when atomic checkout RPC fails", async () => {
    await expect(
      commitCheckoutPaymentStart(rpcFailureClient() as never, {
        p_consent_events: [],
        p_order: {},
        p_order_items: [],
        p_payment_attempt: {},
        p_profile_marketing: {}
      })
    ).rejects.toThrow("rpc failed");
  });

  it("throws when atomic token sale RPC fails", async () => {
    await expect(
      commitTokenSalePaymentStart(rpcFailureClient() as never, {
        p_allocation: {},
        p_order: {},
        p_order_item: {},
        p_package_id: "package-id",
        p_payment_attempt: {},
        p_profile_id: "profile-id",
        p_quantity: 1
      })
    ).rejects.toThrow("rpc failed");
  });

  it("throws on failed payment/order mutations", async () => {
    await expect(
      updateOrThrow(
        Promise.resolve({
          data: null,
          error: new Error("mutation failed")
        })
      )
    ).rejects.toThrow("mutation failed");
  });
});
