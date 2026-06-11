import type { OrderStatus, PaymentStatus } from "@/types/database";

export const ORDER_STATE_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  cancelled: [],
  completed: ["refunded"],
  draft: ["pending_payment", "cancelled"],
  fulfilled: ["completed", "refunded"],
  paid: ["fulfilled", "refunded"],
  pending_payment: ["paid", "cancelled", "refunded"],
  refunded: []
};

export const PAYMENT_STATE_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  authorized: ["paid", "cancelled", "refunded"],
  cancelled: [],
  failed: [],
  initiated: ["pending", "failed", "cancelled"],
  paid: ["refunded"],
  pending: ["authorized", "paid", "failed", "cancelled"],
  refunded: []
};

export function canTransitionOrder(from: OrderStatus, to: OrderStatus) {
  return from === to || ORDER_STATE_TRANSITIONS[from].includes(to);
}

export function canTransitionPayment(from: PaymentStatus, to: PaymentStatus) {
  return from === to || PAYMENT_STATE_TRANSITIONS[from].includes(to);
}

export function assertOrderTransition(from: OrderStatus, to: OrderStatus) {
  if (!canTransitionOrder(from, to)) {
    throw new Error(`Invalid order state transition: ${from} -> ${to}`);
  }
}

export function assertPaymentTransition(from: PaymentStatus, to: PaymentStatus) {
  if (!canTransitionPayment(from, to)) {
    throw new Error(`Invalid payment state transition: ${from} -> ${to}`);
  }
}

export function mapPaymentStatusToOrderStatus(paymentStatus: PaymentStatus): OrderStatus | null {
  if (paymentStatus === "paid") {
    return "paid";
  }

  if (paymentStatus === "cancelled") {
    return "cancelled";
  }

  if (paymentStatus === "refunded") {
    return "refunded";
  }

  return null;
}

