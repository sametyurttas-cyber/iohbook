import { getCurrentUser } from "@/features/auth/queries";
import { getAnonymousCartId } from "@/features/cart/cart-cookie";
import { calculateCartTotals } from "@/features/cart/cart-rules";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Cart, CartItem, InventoryItem, Product, ProductMedia, ProductVariant } from "@/types/database";

export type CartLine = CartItem & {
  product_variants: Pick<
    ProductVariant,
    | "id"
    | "product_id"
    | "sku"
    | "title"
    | "format"
    | "fulfillment_type"
    | "price_minor"
    | "currency"
    | "stock_policy"
    | "max_per_order"
    | "digital_delivery_bucket"
    | "digital_delivery_path"
    | "digital_download_limit"
    | "digital_access_starts_at"
    | "digital_access_expires_at"
    | "metadata"
  > & {
    inventory_items: Pick<InventoryItem, "on_hand" | "reserved" | "safety_stock">[];
    products: Pick<Product, "id" | "slug" | "title" | "is_limited"> & {
      product_media: Pick<ProductMedia, "id" | "kind" | "storage_bucket" | "storage_path" | "alt_text" | "sort_order">[];
    };
  };
};

export type CartSnapshot = {
  cart: Cart | null;
  lines: CartLine[];
  itemCount: number;
  subtotalMinor: number;
};

async function getCartOwner() {
  const user = await getCurrentUser();

  if (user) {
    return {
      profileId: user.id,
      anonymousId: null
    };
  }

  return {
    profileId: null,
    anonymousId: await getAnonymousCartId()
  };
}

export async function getActiveCartSnapshot(): Promise<CartSnapshot> {
  const owner = await getCartOwner();

  if (!owner.profileId && !owner.anonymousId) {
    return {
      cart: null,
      itemCount: 0,
      lines: [],
      subtotalMinor: 0
    };
  }

  const supabase = createSupabaseServiceRoleClient();
  let cartQuery = supabase.from("carts").select("*").eq("status", "active").limit(1);

  if (owner.profileId) {
    cartQuery = cartQuery.eq("profile_id", owner.profileId);
  } else {
    cartQuery = cartQuery.eq("anonymous_id", owner.anonymousId as string);
  }

  const { data: carts, error: cartError } = await cartQuery;

  if (cartError) {
    throw cartError;
  }

  const cart = carts?.[0] ?? null;

  if (!cart) {
    return {
      cart: null,
      itemCount: 0,
      lines: [],
      subtotalMinor: 0
    };
  }

  const { data: lines, error: linesError } = await supabase
    .from("cart_items")
    .select(
      "*, product_variants(id, product_id, sku, title, format, fulfillment_type, price_minor, currency, stock_policy, max_per_order, digital_delivery_bucket, digital_delivery_path, digital_download_limit, digital_access_starts_at, digital_access_expires_at, metadata, inventory_items(on_hand, reserved, safety_stock), products(id, slug, title, is_limited, product_media(id, kind, storage_bucket, storage_path, alt_text, sort_order)))"
    )
    .eq("cart_id", cart.id)
    .order("created_at", { ascending: true });

  if (linesError) {
    throw linesError;
  }

  const typedLines = (lines ?? []) as unknown as CartLine[];
  const totals = calculateCartTotals(
    typedLines.map((line) => ({
      quantity: line.quantity,
      unitPriceMinor: line.unit_price_minor
    }))
  );

  return {
    cart,
    lines: typedLines,
    ...totals
  };
}
