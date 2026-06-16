import { createHmac, randomUUID } from "crypto";
import type { CartLine } from "@/features/cart/queries";
import type { Order } from "@/types/database";

export const IYZICO_CHECKOUT_INITIALIZE_PATH =
  "/payment/iyzipos/checkoutform/initialize/auth/ecom";
export const IYZICO_CHECKOUT_RETRIEVE_PATH =
  "/payment/iyzipos/checkoutform/auth/ecom/detail";

export function minorToDecimal(minor: number) {
  return (minor / 100).toFixed(2);
}

export function createOrderNumber() {
  const date = new Date();
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, "");
  return `IOH-${ymd}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

export function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length <= 1) {
    return {
      name: parts[0] ?? "Guest",
      surname: "Customer"
    };
  }

  return {
    name: parts.slice(0, -1).join(" "),
    surname: parts.at(-1) ?? "Customer"
  };
}

export function createIyzicoAuthorization(path: string, body: string) {
  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;

  if (!apiKey || !secretKey) {
    throw new Error("Missing IYZICO_API_KEY or IYZICO_SECRET_KEY");
  }

  const randomKey = `${Date.now()}${Math.floor(Math.random() * 1000000000)}`;
  const signature = createHmac("sha256", secretKey)
    .update(`${randomKey}${path}${body}`)
    .digest("hex");
  const authorization = Buffer.from(
    `apiKey:${apiKey}&randomKey:${randomKey}&signature:${signature}`,
    "utf8"
  ).toString("base64");

  return {
    authorization: `IYZWSv2 ${authorization}`,
    randomKey
  };
}

export async function requestIyzico<TResponse>(
  path: string,
  payload: Record<string, unknown>
) {
  const baseUrl = process.env.IYZICO_BASE_URL ?? "https://sandbox-api.iyzipay.com";
  const body = JSON.stringify(payload);
  const auth = createIyzicoAuthorization(path, body);
  const response = await fetch(`${baseUrl}${path}`, {
    body,
    headers: {
      Authorization: auth.authorization,
      "Content-Type": "application/json",
      "x-iyzi-rnd": auth.randomKey
    },
    method: "POST"
  });

  const data = (await response.json()) as TResponse;

  if (!response.ok) {
    throw new Error(`iyzico request failed with HTTP ${response.status}`);
  }

  return data;
}

export function buildIyzicoCheckoutPayload(input: {
  billingAddress: CheckoutAddress;
  buyerId: string;
  callbackUrl: string;
  cartLines: CartLine[];
  conversationId: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  order: Pick<
    Order,
    "id" | "order_number" | "currency" | "subtotal_minor" | "shipping_minor" | "total_minor"
  >;
  shippingAddress: CheckoutAddress;
}) {
  const name = splitFullName(input.customerName);

  return {
    basketId: input.order.order_number,
    basketItems: input.cartLines.map((line) => ({
      category1: "Books",
      id: line.product_variants.id,
      itemType:
        line.product_variants.fulfillment_type === "physical" ||
        line.product_variants.fulfillment_type === "hybrid"
          ? "PHYSICAL"
          : "VIRTUAL",
      name: `${line.product_variants.products.title} - ${line.product_variants.title}`,
      price: minorToDecimal(line.quantity * line.unit_price_minor)
    })),
    billingAddress: {
      address: formatAddress(input.billingAddress),
      city: input.billingAddress.city,
      contactName: input.customerName,
      country: input.billingAddress.country,
      zipCode: input.billingAddress.postalCode
    },
    buyer: {
      city: input.shippingAddress.city,
      country: input.shippingAddress.country,
      email: input.customerEmail,
      gsmNumber: input.customerPhone,
      id: input.buyerId,
      identityNumber: "11111111111",
      ip: "127.0.0.1",
      name: name.name,
      registrationAddress: formatAddress(input.shippingAddress),
      surname: name.surname,
      zipCode: input.shippingAddress.postalCode
    },
    callbackUrl: input.callbackUrl,
    conversationId: input.conversationId,
    currency: input.order.currency,
    enabledInstallments: [1],
    locale: "en",
    paidPrice: minorToDecimal(input.order.total_minor),
    paymentGroup: "PRODUCT",
    price: minorToDecimal(input.order.subtotal_minor + input.order.shipping_minor),
    shippingAddress: {
      address: formatAddress(input.shippingAddress),
      city: input.shippingAddress.city,
      contactName: input.customerName,
      country: input.shippingAddress.country,
      zipCode: input.shippingAddress.postalCode
    }
  };
}

export type CheckoutAddress = {
  city: string;
  companyName: string | null;
  country: string;
  countryCode: string;
  line1: string;
  line2: string | null;
  postalCode: string;
  region: string | null;
};

export function formatAddress(address: CheckoutAddress) {
  return [address.line1, address.line2, address.region, address.postalCode]
    .filter(Boolean)
    .join(", ");
}
