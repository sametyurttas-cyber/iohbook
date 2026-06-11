import type { CartLine } from "@/features/cart/queries";
import type { CheckoutAddress } from "@/features/checkout/checkout-utils";
import type { Order, PaymentStatus } from "@/types/database";

export type PaymentProviderId = "iyzico" | "shopier" | "bank_transfer";

export type PaymentStartStatus = "redirect" | "manual" | "failed";

export type PaymentProviderAvailability = {
  enabled: boolean;
  reason?: string;
};

export type StartPaymentContext = {
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
};

export type StartPaymentResult = {
  failureReason?: string | null;
  normalizedStatus: PaymentStatus;
  providerReference?: string | null;
  providerStatus?: string | null;
  rawResponse: Record<string, unknown>;
  redirectUrl?: string | null;
  requestPayload: Record<string, unknown>;
  status: PaymentStartStatus;
};

export type PaymentProvider = {
  availability: () => PaymentProviderAvailability;
  id: PaymentProviderId;
  label: string;
  startPayment: (context: StartPaymentContext) => Promise<StartPaymentResult>;
  type: "hosted_checkout" | "manual";
};
