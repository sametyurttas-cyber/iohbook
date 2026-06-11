import { describe, expect, it } from "vitest";
import {
  createIyzicoWebhookSignatureV3,
  getIyzicoWebhookPaymentId,
  verifyIyzicoWebhookSignatureV3,
  type IyzicoWebhookPayload
} from "./iyzico-webhook";

describe("iyzico webhook helpers", () => {
  it("verifies HPP signature v3 payloads", () => {
    const payload: IyzicoWebhookPayload = {
      iyziEventType: "CHECKOUT_FORM_AUTH",
      iyziPaymentId: 12345,
      paymentConversationId: "order-id",
      status: "SUCCESS",
      token: "checkout-token"
    };
    const secretKey = "secret";
    const signature = createIyzicoWebhookSignatureV3(payload, secretKey);

    expect(
      verifyIyzicoWebhookSignatureV3({
        payload,
        secretKey,
        signature
      })
    ).toBe(true);
    expect(getIyzicoWebhookPaymentId(payload)).toBe("12345");
  });

  it("rejects a tampered signature", () => {
    const payload: IyzicoWebhookPayload = {
      iyziEventType: "CHECKOUT_FORM_AUTH",
      iyziPaymentId: 12345,
      paymentConversationId: "order-id",
      status: "SUCCESS",
      token: "checkout-token"
    };

    expect(
      verifyIyzicoWebhookSignatureV3({
        payload,
        secretKey: "secret",
        signature: "00"
      })
    ).toBe(false);
  });
});

