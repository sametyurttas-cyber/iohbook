import type { TokenAllocationStatus } from "@/types/database";

export type TokenPackageDuplicateCandidate = {
  currency: string;
  price_minor: number;
  title: string;
  token_amount: string;
};

export function validateTokenAllocationUpdate(input: {
  status: TokenAllocationStatus;
  txHash: string | null;
}) {
  if (input.status === "sent" && !input.txHash) {
    return "tx-hash-required";
  }

  return null;
}

export function validateTokenPackageDuplicate(input: {
  currency: string;
  existing: TokenPackageDuplicateCandidate[];
  priceMinor: number;
  title: string;
  tokenAmount: string;
}) {
  const normalizedTitle = input.title.trim().toLowerCase();
  const normalizedCurrency = input.currency.trim().toUpperCase();

  const hasTitleDuplicate = input.existing.some(
    (pkg) => pkg.title.trim().toLowerCase() === normalizedTitle
  );
  if (hasTitleDuplicate) {
    return "duplicate-package-title";
  }

  const hasValueDuplicate = input.existing.some(
    (pkg) =>
      String(pkg.token_amount) === input.tokenAmount &&
      pkg.price_minor === input.priceMinor &&
      pkg.currency.trim().toUpperCase() === normalizedCurrency
  );
  if (hasValueDuplicate) {
    return "duplicate-package-values";
  }

  return null;
}
