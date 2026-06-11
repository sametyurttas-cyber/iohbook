import { describe, expect, it } from "vitest";
import { isIyzicoInitializeSuccess, isIyzicoPaymentPaid } from "./iyzico-types";

describe("iyzico provider response model", () => {
  it("requires token and payment page URL for initialize success", () => {
    expect(
      isIyzicoInitializeSuccess({
        paymentPageUrl: "https://sandbox-api.iyzipay.com/pay/demo",
        status: "success",
        token: "token"
      })
    ).toBe(true);

    expect(
      isIyzicoInitializeSuccess({
        status: "success"
      })
    ).toBe(false);
  });

  it("treats redirect success as paid only after retrieve returns SUCCESS", () => {
    expect(
      isIyzicoPaymentPaid({
        paymentStatus: "SUCCESS",
        status: "success"
      })
    ).toBe(true);

    expect(
      isIyzicoPaymentPaid({
        paymentStatus: "FAILURE",
        status: "success"
      })
    ).toBe(false);
  });
});
