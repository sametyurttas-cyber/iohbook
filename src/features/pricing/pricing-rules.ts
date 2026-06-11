export type PricingLineInput = {
  quantity: number;
  unitPriceMinor: number;
};

export type DiscountInput =
  | {
      amountMinor: number;
      type: "fixed_amount";
    }
  | {
      percentOff: number;
      type: "percent";
    }
  | {
      type: "free_shipping";
    };

export function calculateSubtotalMinor(lines: PricingLineInput[]) {
  return lines.reduce((sum, line) => {
    if (!Number.isInteger(line.quantity) || line.quantity < 1) {
      throw new Error("Quantity must be a positive integer.");
    }

    if (!Number.isInteger(line.unitPriceMinor) || line.unitPriceMinor < 0) {
      throw new Error("Unit price must be a non-negative integer.");
    }

    return sum + line.quantity * line.unitPriceMinor;
  }, 0);
}

export function calculateDiscountMinor(input: {
  discount: DiscountInput | null;
  shippingMinor: number;
  subtotalMinor: number;
}) {
  if (!input.discount) {
    return 0;
  }

  if (input.discount.type === "free_shipping") {
    return Math.max(0, input.shippingMinor);
  }

  if (input.discount.type === "fixed_amount") {
    return Math.min(Math.max(0, input.discount.amountMinor), input.subtotalMinor);
  }

  const normalizedPercent = Math.min(Math.max(input.discount.percentOff, 0), 100);
  return Math.min(
    input.subtotalMinor,
    Math.round(input.subtotalMinor * (normalizedPercent / 100))
  );
}

export function calculateOrderTotal(input: {
  discount?: DiscountInput | null;
  lines: PricingLineInput[];
  shippingMinor?: number;
  taxMinor?: number;
}) {
  const subtotalMinor = calculateSubtotalMinor(input.lines);
  const shippingMinor = Math.max(0, input.shippingMinor ?? 0);
  const taxMinor = Math.max(0, input.taxMinor ?? 0);
  const discountMinor = calculateDiscountMinor({
    discount: input.discount ?? null,
    shippingMinor,
    subtotalMinor
  });

  return {
    discountMinor,
    shippingMinor,
    subtotalMinor,
    taxMinor,
    totalMinor: Math.max(0, subtotalMinor + shippingMinor + taxMinor - discountMinor)
  };
}
