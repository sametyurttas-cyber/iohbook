import {
  buildShopierPaymentUrl,
  getShopierConfig,
  isShopierClassicFormConfigured,
  isShopierPatConfigured
} from "@/features/checkout/shopier";
import type { PaymentProvider } from "@/features/checkout/providers/types";

const GODCODE_SHOPIER_URL = "https://www.shopier.com/sametyurttas/48021742";
const GODCODE_SKU = "IOH-GODCODE-STD";

function getDirectShopierUrlForCart(context: Parameters<PaymentProvider["startPayment"]>[0]) {
  const [line] = context.cartLines;

  if (context.cartLines.length !== 1 || line?.product_variants.sku !== GODCODE_SKU) {
    return null;
  }

  return GODCODE_SHOPIER_URL;
}

export const shopierProvider: PaymentProvider = {
  availability() {
    return isShopierPatConfigured() || isShopierClassicFormConfigured()
      ? { enabled: true }
      : {
          enabled: true,
          reason: "GODCODE icin Shopier direkt satis linki kullanilir."
        };
  },
  id: "shopier",
  label: "Shopier",
  async startPayment(context) {
    const config = getShopierConfig();

    if (!isShopierClassicFormConfigured()) {
      const directUrl = getDirectShopierUrlForCart(context);

      if (directUrl) {
        return {
          failureReason: null,
          normalizedStatus: "pending",
          providerReference: context.order.order_number,
          providerStatus: "direct_link_pending",
          rawResponse: {
            mode: "direct_product_link",
            provider: "shopier",
            redirect_url: directUrl
          },
          redirectUrl: directUrl,
          requestPayload: {
            mode: "direct_product_link",
            orderNumber: context.order.order_number,
            sku: GODCODE_SKU
          },
          status: "redirect"
        };
      }

      return {
        failureReason: "This cart has no direct Shopier link.",
        normalizedStatus: "failed",
        providerReference: null,
        providerStatus: isShopierPatConfigured() ? "no_direct_link" : "missing_direct_link",
        rawResponse: {
          provider: "shopier",
          reason: isShopierPatConfigured() ? "no_direct_link" : "missing_direct_link"
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
