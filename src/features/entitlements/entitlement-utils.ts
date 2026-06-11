import type { FulfillmentType } from "@/types/database";

export function grantsDigitalAccess(fulfillmentType: FulfillmentType) {
  return fulfillmentType === "digital" || fulfillmentType === "hybrid" || fulfillmentType === "claimable";
}

export function isEntitlementCurrentlyAccessible(input: {
  expiresAt: string | null;
  startsAt: string | null;
  status: string;
}) {
  const now = Date.now();

  if (input.status !== "active") {
    return false;
  }

  if (input.startsAt && new Date(input.startsAt).getTime() > now) {
    return false;
  }

  if (input.expiresAt && new Date(input.expiresAt).getTime() <= now) {
    return false;
  }

  return true;
}
