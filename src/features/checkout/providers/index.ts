import { bankTransferProvider } from "@/features/checkout/providers/bank-transfer";
import { iyzicoProvider } from "@/features/checkout/providers/iyzico";
import { shopierProvider } from "@/features/checkout/providers/shopier";
import type {
  PaymentProvider,
  PaymentProviderId
} from "@/features/checkout/providers/types";

export const DEFAULT_PAYMENT_PROVIDER_ID: PaymentProviderId = "iyzico";

export const PAYMENT_PROVIDERS: Record<PaymentProviderId, PaymentProvider> = {
  bank_transfer: bankTransferProvider,
  iyzico: iyzicoProvider,
  shopier: shopierProvider
};

export const PAYMENT_PROVIDER_OPTIONS = Object.values(PAYMENT_PROVIDERS).map(
  (provider) => ({
    id: provider.id,
    label: provider.label,
    type: provider.type
  })
);

export function getPaymentProvider(id: FormDataEntryValue | null) {
  const providerId = String(id ?? DEFAULT_PAYMENT_PROVIDER_ID) as PaymentProviderId;
  return PAYMENT_PROVIDERS[providerId] ?? PAYMENT_PROVIDERS[DEFAULT_PAYMENT_PROVIDER_ID];
}
