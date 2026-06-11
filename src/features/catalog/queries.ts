import { unstable_cache } from "next/cache";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import type {
  Collection,
  InventoryItem,
  Product,
  ProductMedia,
  ProductVariant
} from "@/types/database";

export type StorefrontVariant = Pick<
  ProductVariant,
  | "id"
  | "sku"
  | "title"
  | "edition_label"
  | "format"
  | "fulfillment_type"
  | "price_minor"
  | "compare_at_minor"
  | "currency"
  | "weight_grams"
  | "stock_policy"
  | "lead_time_days"
  | "max_per_order"
  | "sort_order"
  | "active"
> & {
  inventory_items: Pick<InventoryItem, "on_hand" | "reserved" | "safety_stock">[];
};

export type StorefrontMedia = Pick<
  ProductMedia,
  "id" | "kind" | "storage_bucket" | "storage_path" | "alt_text" | "sort_order"
>;

export type StorefrontBook = Pick<
  Product,
  | "id"
  | "collection_id"
  | "slug"
  | "title"
  | "subtitle"
  | "type"
  | "status"
  | "description"
  | "short_description"
  | "seo_title"
  | "seo_description"
  | "requires_shipping"
  | "is_limited"
  | "published_at"
  | "updated_at"
> & {
  collections: Pick<Collection, "id" | "title" | "slug" | "accent_color"> | null;
  product_media: StorefrontMedia[];
  product_variants: StorefrontVariant[];
};

const now = new Date().toISOString();

const previewBooks: StorefrontBook[] = [
  {
    collection_id: null,
    collections: {
      accent_color: "#F2C96D",
      id: "preview-collection-ioh",
      slug: "ioh-universe",
      title: "IOH Universe"
    },
    description:
      "Altin isik, yaratici zeka ve kodun kutsal duzeni uzerine koleksiyon hissi tasiyan fiziksel kitap.",
    id: "preview-code-god",
    is_limited: false,
    product_media: [],
    product_variants: [
      {
        active: true,
        compare_at_minor: null,
        currency: "TRY",
        edition_label: null,
        format: "standard",
        fulfillment_type: "physical",
        inventory_items: [{ on_hand: 25, reserved: 0, safety_stock: 2 }],
        id: "preview-code-god-standard",
        lead_time_days: 3,
        max_per_order: 3,
        price_minor: 45000,
        sku: "IOH-CODE-GOD-STD",
        sort_order: 0,
        stock_policy: "track",
        title: "Standart baski",
        weight_grams: 420
      }
    ],
    published_at: now,
    requires_shipping: true,
    seo_description: "CODE GOD fiziksel kitap.",
    seo_title: "CODE GOD",
    short_description: "Altin isik, yaratici zeka ve kodun kutsal duzeni uzerine.",
    slug: "code-god",
    status: "active",
    subtitle: "IOH hattinin altin cekirdegi",
    title: "CODE GOD",
    type: "book",
    updated_at: now
  },
  {
    collection_id: null,
    collections: {
      accent_color: "#46BDEB",
      id: "preview-collection-ioh",
      slug: "ioh-universe",
      title: "IOH Universe"
    },
    description:
      "Sistemlerin hafizasi, mavi cekirdek ve sessiz mimari uzerine editoryal bir teknoloji anlatısı.",
    id: "preview-sys-god",
    is_limited: false,
    product_media: [],
    product_variants: [
      {
        active: true,
        compare_at_minor: null,
        currency: "TRY",
        edition_label: null,
        format: "signed",
        fulfillment_type: "physical",
        inventory_items: [{ on_hand: 12, reserved: 0, safety_stock: 1 }],
        id: "preview-sys-god-signed",
        lead_time_days: 5,
        max_per_order: 2,
        price_minor: 65000,
        sku: "IOH-SYS-GOD-SIGNED",
        sort_order: 0,
        stock_policy: "track",
        title: "Imzali baski",
        weight_grams: 430
      }
    ],
    published_at: now,
    requires_shipping: true,
    seo_description: "SYS GOD fiziksel kitap.",
    seo_title: "SYS GOD",
    short_description: "Sistemlerin hafizasi, mavi cekirdek ve sessiz mimari.",
    slug: "sys-god",
    status: "active",
    subtitle: "IOH hattinin mavi sistem katmani",
    title: "SYS GOD",
    type: "book",
    updated_at: now
  },
  {
    collection_id: null,
    collections: {
      accent_color: "#D64A3A",
      id: "preview-collection-ioh",
      slug: "ioh-universe",
      title: "IOH Universe"
    },
    description:
      "Kirmizi cephe, carpisan protokoller ve savasin dili uzerinden IOH evreninin catismali hatti.",
    id: "preview-code-war",
    is_limited: true,
    product_media: [],
    product_variants: [
      {
        active: true,
        compare_at_minor: null,
        currency: "TRY",
        edition_label: "Limited",
        format: "limited",
        fulfillment_type: "physical",
        inventory_items: [{ on_hand: 8, reserved: 0, safety_stock: 1 }],
        id: "preview-code-war-limited",
        lead_time_days: 7,
        max_per_order: 1,
        price_minor: 90000,
        sku: "IOH-CODE-WAR-LTD",
        sort_order: 0,
        stock_policy: "track",
        title: "Koleksiyon baskisi",
        weight_grams: 460
      }
    ],
    published_at: now,
    requires_shipping: true,
    seo_description: "CODE WAR fiziksel kitap.",
    seo_title: "CODE WAR",
    short_description: "Kirmizi cephe, carpisan protokoller ve savasin dili.",
    slug: "code-war",
    status: "active",
    subtitle: "IOH hattinin savas katmani",
    title: "CODE WAR",
    type: "book",
    updated_at: now
  }
];

async function fetchPublishedBooks() {
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, collection_id, slug, title, subtitle, type, status, description, short_description, seo_title, seo_description, requires_shipping, is_limited, published_at, updated_at, collections(id, title, slug, accent_color), product_media(id, kind, storage_bucket, storage_path, alt_text, sort_order), product_variants(id, sku, title, edition_label, format, fulfillment_type, price_minor, compare_at_minor, currency, weight_grams, stock_policy, lead_time_days, max_per_order, sort_order, active, inventory_items(on_hand, reserved, safety_stock))"
      )
      .eq("status", "active")
      .in("type", ["book", "nft", "claimable"])
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .order("sort_order", { referencedTable: "product_variants", ascending: true })
      .order("sort_order", { referencedTable: "product_media", ascending: true });

    if (error) {
      throw error;
    }

    return (data?.length ? data : previewBooks) as unknown as StorefrontBook[];
  } catch {
    return previewBooks;
  }
}

async function fetchPublishedBookBySlug(slug: string) {
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(
        "id, collection_id, slug, title, subtitle, type, status, description, short_description, seo_title, seo_description, requires_shipping, is_limited, published_at, updated_at, collections(id, title, slug, accent_color), product_media(id, kind, storage_bucket, storage_path, alt_text, sort_order), product_variants(id, sku, title, edition_label, format, fulfillment_type, price_minor, compare_at_minor, currency, weight_grams, stock_policy, lead_time_days, max_per_order, sort_order, active, inventory_items(on_hand, reserved, safety_stock))"
      )
      .eq("status", "active")
      .in("type", ["book", "nft", "claimable"])
      .eq("slug", slug)
      .not("published_at", "is", null)
      .single();

    if (error) {
      throw error;
    }

    return data as unknown as StorefrontBook;
  } catch {
    const fallback = previewBooks.find((book) => book.slug === slug);

    if (!fallback) {
      throw new Error("Book not found");
    }

    return fallback;
  }
}

export const listPublishedBooks = unstable_cache(fetchPublishedBooks, ["published-books"], {
  revalidate: 300,
  tags: ["products", "catalog"]
});

export function getPublishedBookBySlug(slug: string) {
  return unstable_cache(() => fetchPublishedBookBySlug(slug), ["published-book", slug], {
    revalidate: 300,
    tags: ["products", "catalog", `book:${slug}`]
  })();
}
