import {
  buildIyzicoCheckoutPayload,
  IYZICO_CHECKOUT_INITIALIZE_PATH,
  requestIyzico
} from "@/features/checkout/checkout-utils";
import {
  isIyzicoInitializeSuccess,
  type IyzicoCheckoutInitializeResponse
} from "@/features/checkout/iyzico-types";
import type { PaymentProvider } from "@/features/checkout/providers/types";

export const iyzicoProvider: PaymentProvider = {
  availability() {
    return {
      enabled: Boolean(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY),
      reason: "IYZICO_API_KEY and IYZICO_SECRET_KEY are required."
    };
  },
  id: "iyzico",
  label: "iyzico CheckoutForm",
  async startPayment(context) {
    const requestPayload = buildIyzicoCheckoutPayload({
      billingAddress: context.billingAddress,
      buyerId: context.buyerId,
      callbackUrl: context.callbackUrl,
      cartLines: context.cartLines,
      conversationId: context.order.id,
      customerEmail: context.customerEmail,
      customerName: context.customerName,
      customerPhone: context.customerPhone,
      order: context.order,
      shippingAddress: context.shippingAddress
    });

    try {
      const response = await requestIyzico<IyzicoCheckoutInitializeResponse>(
        IYZICO_CHECKOUT_INITIALIZE_PATH,
        requestPayload
      );
      const success = isIyzicoInitializeSuccess(response);

      return {
        failureReason: success ? null : response.errorMessage ?? "iyzico initialize failed",
        normalizedStatus: success ? "pending" : "failed",
        providerReference: response.token ?? null,
        providerStatus: response.status ?? null,
        rawResponse: response as Record<string, unknown>,
        redirectUrl: success ? response.paymentPageUrl : null,
        requestPayload,
        status: success ? "redirect" : "failed"
      };
    } catch (error) {
      return {
        failureReason: error instanceof Error ? error.message : "iyzico initialize failed",
        normalizedStatus: "failed",
        providerReference: null,
        providerStatus: "exception",
        rawResponse: {
          message: error instanceof Error ? error.message : "iyzico initialize failed"
        },
        redirectUrl: null,
        requestPayload,
        status: "failed"
      };
    }
  },
  type: "hosted_checkout"
};

