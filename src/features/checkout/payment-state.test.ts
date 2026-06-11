import { describe, expect, it } from "vitest";
import {
  canTransitionOrder,
  canTransitionPayment,
  mapPaymentStatusToOrderStatus
} from "./payment-state";

describe("payment state machine", () => {
  it("allows the happy order path and blocks skipping to completed", () => {
    expect(canTransitionOrder("draft", "pending_payment")).toBe(true);
    expect(canTransitionOrder("pending_payment", "paid")).toBe(true);
    expect(canTransitionOrder("paid", "fulfilled")).toBe(true);
    expect(canTransitionOrder("fulfilled", "completed")).toBe(true);
    expect(canTransitionOrder("paid", "completed")).toBe(false);
  });

  it("defines cancellation and refund exits", () => {
    expect(canTransitionOrder("draft", "cancelled")).toBe(true);
    expect(canTransitionOrder("pending_payment", "cancelled")).toBe(true);
    expect(canTransitionOrder("paid", "refunded")).toBe(true);
    expect(canTransitionOrder("completed", "refunded")).toBe(true);
  });

  it("maps terminal provider states to order states", () => {
    expect(mapPaymentStatusToOrderStatus("paid")).toBe("paid");
    expect(mapPaymentStatusToOrderStatus("cancelled")).toBe("cancelled");
    expect(mapPaymentStatusToOrderStatus("refunded")).toBe("refunded");
    expect(mapPaymentStatusToOrderStatus("pending")).toBeNull();
  });

  it("allows payment pending to paid but not paid back to pending", () => {
    expect(canTransitionPayment("pending", "paid")).toBe(true);
    expect(canTransitionPayment("paid", "pending")).toBe(false);
  });
});

