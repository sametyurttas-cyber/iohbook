import { describe, expect, it } from "vitest";
import {
  DEFAULT_PAYMENT_PROVIDER_ID,
  getPaymentProvider,
  PAYMENT_PROVIDERS
} from "./index";

describe("payment provider registry", () => {
  it("defaults checkout to iyzico", () => {
    expect(DEFAULT_PAYMENT_PROVIDER_ID).toBe("iyzico");
    expect(getPaymentProvider(null).id).toBe("iyzico");
  });

  it("registers future provider slots without enabling them for MVP", () => {
    expect(PAYMENT_PROVIDERS.shopier.id).toBe("shopier");
    expect(PAYMENT_PROVIDERS.bank_transfer.id).toBe("bank_transfer");
    expect(PAYMENT_PROVIDERS.shopier.availability().enabled).toBe(false);
    expect(PAYMENT_PROVIDERS.bank_transfer.availability().enabled).toBe(false);
  });
});
