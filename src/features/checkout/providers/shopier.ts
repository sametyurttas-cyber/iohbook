import {
  buildShopierPaymentUrl,
  getShopierConfig,
  isShopierConfigured
} from "@/features/checkout/shopier";
import type { PaymentProvider } from "@/features/checkout/providers/types";

export const shopierProvider: PaymentProvider = {
  availability() {
    return isShopierConfigured()
      ? { enabled: true }
      : {
          enabled: false,
          reason: "Shopier icin SHOPIER_MERCHANT_ID, SHOPIER_API_KEY ve SHOPIER_SECRET gerekli."
        };
  },
  id: "shopier",
  label: "Shopier",
  async startPayment(context) {
    const config = getShopierConfig();

    if (!isShopierConfigured()) {
      return {
        failureReason: "Shopier credentials are missing.",
        normalizedStatus: "failed",
        providerReference: null,
        providerStatus: "missing_credentials",
        rawResponse: {
          provider: "shopier",
          reason: "missing_credentials"
        },
        redirectUrl: null,
        requestPayload: {},
        status: "failed"
      };
    }

    const payment = buildShopierPaymentUrl({
      amountMinor: context.order.total_minor,
      apiKey: config.apiKey,
      callbackUrl: context.callbackUrl,
      currency: context.order.currency,
      email: context.customerEmail,
      merchantId: config.merchantId,
      orderNumber: context.order.order_number,
      paymentUrl: config.paymentUrl,
      secret: config.secret
    });

    return {
      normalizedStatus: "pending",
      providerReference: context.order.order_number,
      providerStatus: "initialized",
      rawResponse: {
        provider: "shopier",
        redirect_url: payment.url,
        signature: payment.signature
      },
      redirectUrl: payment.url,
      requestPayload: payment.requestPayload,
      status: "redirect"
    };
  },
  type: "hosted_checkout"
};
