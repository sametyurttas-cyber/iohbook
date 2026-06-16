import { createHmac, timingSafeEqual } from "node:crypto";
import type { PaymentStatus } from "@/types/database";

export type ShopierCallbackPayload = Record<string, string>;

export function getShopierConfig() {
  const apiKey = process.env.SHOPIER_API_TOKEN ?? process.env.SHOPIER_API_KEY ?? "";

  return {
    apiKey,
    apiBaseUrl: process.env.SHOPIER_API_BASE_URL ?? "https://api.shopier.com/v1",
    merchantId: process.env.SHOPIER_MERCHANT_ID ?? "",
    paymentUrl: process.env.SHOPIER_PAYMENT_URL ?? "https://www.shopier.com/ShowProduct/api_pay4.php",
    secret: process.env.SHOPIER_SECRET ?? ""
  };
}

export function isShopierClassicFormConfigured() {
  const config = getShopierConfig();
  return Boolean(config.apiKey && config.merchantId && config.secret && config.paymentUrl);
}

export function isShopierPatConfigured() {
  return Boolean(getShopierConfig().apiKey);
}

export function isShopierConfigured() {
  return isShopierPatConfigured() || isShopierClassicFormConfigured();
}

export async function requestShopierApi<T>(path: string, init: RequestInit = {}) {
  const config = getShopierConfig();

  if (!config.apiKey) {
    throw new Error("SHOPIER_API_TOKEN or SHOPIER_API_KEY is required.");
  }

  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      accept: "application/json",
      authorization: `Bearer ${config.apiKey}`,
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...init.headers
    }
  });

  if (!response.ok) {
    throw new Error(`Shopier API request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export function createShopierSignature(input: {
  amountMinor: number;
  callbackUrl: string;
  currency: string;
  email: string;
  orderNumber: string;
  secret: string;
}) {
  const canonical = [
    input.orderNumber,
    input.amountMinor,
    input.currency,
    input.email,
    input.callbackUrl
  ].join("|");

  return createHmac("sha256", input.secret).update(canonical).digest("base64");
}

export function buildShopierPaymentUrl(input: {
  amountMinor: number;
  apiKey: string;
  callbackUrl: string;
  currency: string;
  email: string;
  merchantId: string;
  orderNumber: string;
  paymentUrl: string;
  secret: string;
}) {
  const url = new URL(input.paymentUrl);
  const amount = (input.amountMinor / 100).toFixed(2);
  const signature = createShopierSignature(input);

  url.searchParams.set("API_key", input.apiKey);
  url.searchParams.set("merchant_id", input.merchantId);
  url.searchParams.set("platform_order_id", input.orderNumber);
  url.searchParams.set("product_name", input.orderNumber);
  url.searchParams.set("buyer_email", input.email);
  url.searchParams.set("total_order_value", amount);
  url.searchParams.set("currency", input.currency);
  url.searchParams.set("callback_url", input.callbackUrl);
  url.searchParams.set("signature", signature);

  return {
    requestPayload: Object.fromEntries(url.searchParams.entries()),
    signature,
    url: url.toString()
  };
}

export function parseShopierCallback(formData: FormData): ShopierCallbackPayload {
  const payload: ShopierCallbackPayload = {};

  for (const [key, value] of formData.entries()) {
    payload[key] = String(value);
  }

  return payload;
}

export function getShopierOrderReference(payload: ShopierCallbackPayload) {
  return payload.platform_order_id ?? payload.order_id ?? payload.orderid ?? payload.orderId ?? null;
}

export function getShopierTransactionId(payload: ShopierCallbackPayload) {
  return payload.payment_id ?? payload.transaction_id ?? payload.paymentId ?? null;
}

export function getShopierAmountMinor(payload: ShopierCallbackPayload) {
  const rawAmount = payload.total_order_value ?? payload.total_amount ?? payload.amount;
  if (!rawAmount) return null;

  const normalized = rawAmount.replace(",", ".").trim();
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;

  const [major, minor = ""] = normalized.split(".");
  return Number.parseInt(major, 10) * 100 + Number.parseInt(minor.padEnd(2, "0"), 10);
}

export function mapShopierStatus(payload: ShopierCallbackPayload): PaymentStatus {
  const status = String(payload.status ?? payload.payment_status ?? "").toLowerCase();

  if (["success", "paid", "1", "completed"].includes(status)) {
    return "paid";
  }

  if (["cancelled", "canceled", "cancel", "0"].includes(status)) {
    return "cancelled";
  }

  return "failed";
}

export function verifyShopierCallbackSignature(payload: ShopierCallbackPayload, secret: string) {
  const provided = payload.signature ?? payload.hash ?? "";
  const orderReference = getShopierOrderReference(payload) ?? "";
  const transactionId = getShopierTransactionId(payload) ?? "";
  const status = payload.status ?? payload.payment_status ?? "";
  const amount = payload.total_order_value ?? payload.total_amount ?? payload.amount ?? "";
  const canonical = [orderReference, transactionId, status, amount].join("|");
  const expected = createHmac("sha256", secret).update(canonical).digest("base64");

  if (!provided) {
    return false;
  }

  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
}
