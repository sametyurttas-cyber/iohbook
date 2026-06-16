import type { PaymentProvider } from "@/features/checkout/providers/types";

export const bankTransferProvider: PaymentProvider = {
  availability() {
    return {
      enabled: true
    };
  },
  id: "bank_transfer",
  label: "Manual bank transfer",
  async startPayment(context) {
    const reference = `BANK-${context.order.order_number}`;

    return {
      failureReason: null,
      normalizedStatus: "pending",
      providerReference: reference,
      providerStatus: "awaiting_transfer",
      rawResponse: {
        provider: "bank_transfer",
        reference
      },
      redirectUrl: null,
      requestPayload: {
        orderNumber: context.order.order_number,
        reference
      },
      status: "manual"
    };
  },
  type: "manual"
};
