export type DeliveryOption = {
  id: string;
  title: string;
  description: string;
  estimatedWindow: string;
  priceMinor: number;
};

export const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    description: "Tracked shipping where available. Customs, duties, and import taxes remain the customer's responsibility.",
    estimatedWindow: "7-21 business days",
    id: "global_standard",
    priceMinor: 0,
    title: "Global standard"
  },
  {
    description: "Priority handling and faster carrier routing for eligible destinations.",
    estimatedWindow: "3-10 business days",
    id: "global_priority",
    priceMinor: 3500,
    title: "Global priority"
  }
];

export const DEFAULT_DELIVERY_OPTION_ID = "global_standard";

export function getDeliveryOption(id: FormDataEntryValue | null) {
  return (
    DELIVERY_OPTIONS.find((option) => option.id === String(id ?? "")) ??
    DELIVERY_OPTIONS.find((option) => option.id === DEFAULT_DELIVERY_OPTION_ID) ??
    DELIVERY_OPTIONS[0]
  );
}

