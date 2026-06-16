import { getPublicMediaUrlFromPath } from "@/features/media/public-url";
import { formatMoney, VARIANT_FORMAT_LABELS } from "@/features/products/product-utils";
import type { StorefrontBook, StorefrontMedia, StorefrontVariant } from "@/features/catalog/queries";

const publicDigitalFormats = new Set(["digital_pdf", "digital_epub", "digital_bundle", "ebook"]);

export function getSortedMedia(book: StorefrontBook) {
  return [...(book.product_media ?? [])].sort((a, b) => a.sort_order - b.sort_order);
}

export function getCoverMedia(book: StorefrontBook) {
  const media = getSortedMedia(book);
  return media.find((item) => item.kind === "cover") ?? media[0] ?? null;
}

export function getMediaUrl(media: StorefrontMedia | null) {
  if (!media) {
    return null;
  }

  if (media.storage_bucket === "local-public") {
    return media.storage_path;
  }

  if (media.storage_bucket !== "public-media") {
    return null;
  }

  return getPublicMediaUrlFromPath(media.storage_path);
}

export function getSortedVariants(book: StorefrontBook) {
  return [...(book.product_variants ?? [])]
    .filter((variant) => variant.active)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function isPublicDigitalVariant(variant: StorefrontVariant) {
  return (
    variant.active &&
    (variant.fulfillment_type === "digital" || publicDigitalFormats.has(variant.format))
  );
}

export function getPublicDigitalVariants(book: StorefrontBook) {
  return getSortedVariants(book).filter(isPublicDigitalVariant);
}

export function hasPhysicalStorefrontVariants(book: StorefrontBook) {
  return getSortedVariants(book).some(
    (variant) => variant.fulfillment_type === "physical" || variant.fulfillment_type === "hybrid"
  );
}

export function getVariantAvailableStock(variant: StorefrontVariant) {
  const inventory = Array.isArray(variant.inventory_items)
    ? variant.inventory_items[0]
    : variant.inventory_items;

  if (variant.stock_policy === "unlimited") {
    return Number.POSITIVE_INFINITY;
  }

  if (!inventory) {
    return 0;
  }

  return Math.max(0, inventory.on_hand - inventory.reserved - inventory.safety_stock);
}

export function getStockLabel(variant: StorefrontVariant) {
  if (variant.stock_policy === "unlimited") {
    return "Stok sınırı yok";
  }

  const available = getVariantAvailableStock(variant);

  if (available <= 0) {
    return "Stokta yok";
  }

  if (available <= 5) {
    return `Son ${available} adet`;
  }

  return "Stokta var";
}

export function getLowestPriceLabel(book: StorefrontBook) {
  const variants = getPublicDigitalVariants(book);
  const lowest = variants.reduce<StorefrontVariant | null>((current, variant) => {
    if (!current || variant.price_minor < current.price_minor) {
      return variant;
    }

    return current;
  }, null);

  if (!lowest) {
    return "Yakında";
  }

  return formatMoney(lowest.price_minor, lowest.currency);
}

export function getVariantLabel(variant: StorefrontVariant) {
  return VARIANT_FORMAT_LABELS[variant.format] ?? variant.title;
}
