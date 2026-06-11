import type { ProductStatus, VariantFormat } from "@/types/database";

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  active: "Yayinda",
  archived: "Arsiv",
  draft: "Taslak"
};

export const VARIANT_FORMAT_LABELS: Record<VariantFormat, string> = {
  boxed: "Kutulu set",
  claimable: "Claim hakki",
  ebook: "E-kitap",
  limited: "Koleksiyon baskisi",
  preorder: "On siparis",
  signed: "Imzali baski",
  standard: "Standart baski"
};

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0131/g, "i")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function parseOptionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length > 0 ? text : null;
}

export function parseInteger(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseMoneyToMinor(value: FormDataEntryValue | null) {
  const raw = String(value ?? "0")
    .replace(/\s/g, "")
    .replace(",", ".");
  const parsed = Number.parseFloat(raw);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return Math.round(parsed * 100);
}

export function formatMoney(minor: number, currency = "TRY") {
  return new Intl.NumberFormat("tr-TR", {
    currency,
    style: "currency"
  }).format(minor / 100);
}
