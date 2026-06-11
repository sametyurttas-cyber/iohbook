import type { StockPolicy } from "@/types/database";

export type CartStockInput = {
  maxPerOrder?: number | null;
  onHand?: number | null;
  requestedQuantity: number;
  reserved?: number | null;
  safetyStock?: number | null;
  stockPolicy: StockPolicy;
};

export function getAvailableQuantity(input: Omit<CartStockInput, "requestedQuantity">) {
  if (input.stockPolicy === "unlimited" || input.stockPolicy === "continue") {
    return Number.POSITIVE_INFINITY;
  }

  const onHand = input.onHand ?? 0;
  const reserved = input.reserved ?? 0;
  const safetyStock = input.safetyStock ?? 0;

  return Math.max(0, onHand - reserved - safetyStock);
}

export function validateCartQuantity(input: CartStockInput) {
  if (!Number.isInteger(input.requestedQuantity) || input.requestedQuantity < 1) {
    return {
      ok: false,
      reason: "Quantity must be at least 1."
    } as const;
  }

  if (input.maxPerOrder && input.requestedQuantity > input.maxPerOrder) {
    return {
      ok: false,
      reason: `Maximum quantity is ${input.maxPerOrder}.`
    } as const;
  }

  const available = getAvailableQuantity(input);

  if (input.stockPolicy !== "continue" && input.requestedQuantity > available) {
    return {
      ok: false,
      reason: available <= 0 ? "Variant is out of stock." : `Only ${available} left.`
    } as const;
  }

  return {
    ok: true
  } as const;
}

export function calculateCartTotals(
  lines: Array<{ quantity: number; unitPriceMinor: number }>
) {
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotalMinor = lines.reduce(
    (sum, line) => sum + line.quantity * line.unitPriceMinor,
    0
  );

  return {
    itemCount,
    subtotalMinor
  };
}
