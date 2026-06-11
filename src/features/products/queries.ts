import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Collection,
  InventoryItem,
  Product,
  ProductMedia,
  ProductStatus,
  ProductVariant
} from "@/types/database";

export type ProductListFilters = {
  q?: string;
  status?: ProductStatus | "all";
};

export type AdminProductListItem = Pick<
  Product,
  "id" | "title" | "slug" | "status" | "type" | "is_limited" | "published_at" | "updated_at"
> & {
  collections: Pick<Collection, "id" | "title"> | null;
  product_media: Pick<
    ProductMedia,
    "id" | "kind" | "storage_bucket" | "storage_path" | "alt_text"
  >[];
  product_variants: (Pick<
    ProductVariant,
    "id" | "sku" | "title" | "format" | "price_minor" | "currency" | "active"
  > & {
    inventory_items: Pick<InventoryItem, "on_hand" | "reserved">[];
  })[];
};

export type AdminProductDetail = Product & {
  collections: Pick<Collection, "id" | "title"> | null;
  product_media: ProductMedia[];
  product_variants: (ProductVariant & {
    inventory_items: InventoryItem[];
  })[];
};

export async function listCollectionsForAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("collections")
    .select("id, title, slug, status")
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  if (error) {
    throw error;
  }

  return data as Pick<Collection, "id" | "title" | "slug" | "status">[];
}

export async function listProductsForAdmin(filters: ProductListFilters) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("products")
    .select(
      "id, title, slug, status, type, is_limited, published_at, updated_at, collections(id, title), product_variants(id, sku, title, format, price_minor, currency, active, inventory_items(on_hand, reserved)), product_media(id, kind, storage_bucket, storage_path, alt_text)"
    )
    .order("updated_at", { ascending: false });

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.q) {
    query = query.or(`title.ilike.%${filters.q}%,slug.ilike.%${filters.q}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data as unknown as AdminProductListItem[];
}

export async function getProductForAdmin(productId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "*, collections(id, title), product_variants(*, inventory_items(*)), product_media(*)"
    )
    .eq("id", productId)
    .single();

  if (error) {
    throw error;
  }

  return data as unknown as AdminProductDetail;
}
