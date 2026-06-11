import { describe, expect, it } from "vitest";
import {
  DEFAULT_DELIVERY_OPTION_ID,
  DELIVERY_OPTIONS,
  getDeliveryOption
} from "./delivery-options";

describe("delivery options", () => {
  it("does not default to a paid delivery option", () => {
    const defaultOption = DELIVERY_OPTIONS.find(
      (option) => option.id === DEFAULT_DELIVERY_OPTION_ID
    );

    expect(defaultOption?.priceMinor).toBe(0);
  });

  it("falls back to the default delivery option for unknown values", () => {
    expect(getDeliveryOption("unknown").id).toBe(DEFAULT_DELIVERY_OPTION_ID);
  });
});
