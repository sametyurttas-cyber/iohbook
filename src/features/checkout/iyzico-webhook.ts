import { createHmac, timingSafeEqual } from "crypto";

export type IyzicoWebhookPayload = {
  iyziEventTime?: number;
  iyziEventType?: string;
  iyziPaymentId?: number | string;
  iyziReferenceCode?: string;
  merchantId?: string;
  paymentConversationId?: string;
  paymentId?: string;
  status?: string;
  token?: string;
};

export function getIyzicoWebhookPaymentId(payload: IyzicoWebhookPayload) {
  return String(payload.iyziPaymentId ?? payload.paymentId ?? "").trim();
}

export function isIyzicoWebhookSuccess(payload: IyzicoWebhookPayload) {
  return payload.status === "SUCCESS";
}

export function createIyzicoWebhookSignatureV3(
  payload: IyzicoWebhookPayload,
  secretKey: string
) {
  const paymentId = getIyzicoWebhookPaymentId(payload);
  const key = [
    secretKey,
    payload.iyziEventType ?? "",
    paymentId,
    payload.token ?? "",
    payload.paymentConversationId ?? "",
    payload.status ?? ""
  ].join("");

  return createHmac("sha256", secretKey).update(key).digest("hex");
}

export function verifyIyzicoWebhookSignatureV3(input: {
  payload: IyzicoWebhookPayload;
  secretKey: string;
  signature: string | null;
}) {
  if (!input.signature) {
    return false;
  }

  const expected = createIyzicoWebhookSignatureV3(input.payload, input.secretKey);
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(input.signature, "hex");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}
