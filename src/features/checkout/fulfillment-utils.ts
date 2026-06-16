import type { FulfillmentType } from "@/types/database";

type CartLineFulfillment = {
  product_variants: {
    fulfillment_type: FulfillmentType;
  };
};

export function requiresPhysicalDelivery(fulfillmentType: FulfillmentType) {
  return fulfillmentType === "physical" || fulfillmentType === "hybrid";
}

export function isDigitalOnlyOrder(lines: CartLineFulfillment[]) {
  return (
    lines.length > 0 &&
    lines.every((line) => !requiresPhysicalDelivery(line.product_variants.fulfillment_type))
  );
}
