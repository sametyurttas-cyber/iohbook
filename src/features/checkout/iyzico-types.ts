export type IyzicoCheckoutInitializeResponse = {
  checkoutFormContent?: string;
  errorCode?: string;
  errorMessage?: string;
  paymentPageUrl?: string;
  status?: string;
  systemTime?: number;
  token?: string;
};

export type IyzicoCheckoutRetrieveResponse = {
  conversationId?: string;
  currency?: string;
  errorCode?: string;
  errorMessage?: string;
  paidPrice?: number;
  paymentId?: string;
  paymentStatus?: string;
  status?: string;
  systemTime?: number;
  token?: string;
};

export function isIyzicoInitializeSuccess(
  response: IyzicoCheckoutInitializeResponse
): response is IyzicoCheckoutInitializeResponse & {
  paymentPageUrl: string;
  token: string;
} {
  return response.status === "success" && Boolean(response.paymentPageUrl && response.token);
}

export function isIyzicoPaymentPaid(response: IyzicoCheckoutRetrieveResponse) {
  return response.status === "success" && response.paymentStatus === "SUCCESS";
}
