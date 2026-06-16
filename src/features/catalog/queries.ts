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
  is_preview?: boolean;
  inventory_items:
    | Pick<InventoryItem, "on_hand" | "reserved" | "safety_stock">
    | Pick<InventoryItem, "on_hand" | "reserved" | "safety_stock">[]
    | null;
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

const iohCollection = {
  accent_color: "#F2C96D",
  id: "preview-collection-ioh",
  slug: "ioh-universe",
  title: "IOH Universe"
};

const previewBooks: StorefrontBook[] = [
  {
    collection_id: null,
    collections: iohCollection,
    description:
      "Algus gozlerini actiginda bir odada, bir deniz sesinin ve Elsa adli kuantum yapay zekanin sesiyle bas basa kalir. Kendi yuzunu tanimaz; gecmis bedeni, hafizasi ve kimligi arasinda kopmus bir bilinc olarak System'in icine yeniden yerlestirildigini ogrenir.\n\nGODCODE, olumden sonra enerji kimliklerinin kuantum sehir sunucularina aktarildigi karanlik bir gelecek evreninde baslar. Hafiza, beden, kod ve gerceklik arasindaki sinirlar cozulurken Algus, kendisinin yalnizca kayip bir insan degil, System'in sakladigi daha buyuk bir kirilmanin parcasi oldugunu fark eder.",
    id: "preview-godcode",
    is_limited: false,
    product_media: [
      {
        alt_text: "GODCODE IOH kitap kapagi",
        id: "preview-godcode-cover",
        kind: "cover",
        sort_order: 0,
        storage_bucket: "local-public",
        storage_path: "/media/books/ioh-godcode-cover.jpeg"
      }
    ],
    product_variants: [
      {
        active: true,
        compare_at_minor: null,
        currency: "TRY",
        edition_label: null,
        format: "standard",
        fulfillment_type: "physical",
        inventory_items: [{ on_hand: 25, reserved: 0, safety_stock: 2 }],
        id: "preview-godcode-standard",
        is_preview: true,
        lead_time_days: 3,
        max_per_order: 3,
        price_minor: 45000,
        sku: "IOH-GODCODE-STD",
        sort_order: 0,
        stock_policy: "track",
        title: "Standart baski",
        weight_grams: 420
      }
    ],
    published_at: now,
    requires_shipping: true,
    seo_description:
      "GODCODE, IOH evreninde hafiza, beden degisimi, kuantum yapay zeka ve System icinde uyanan Algus'un kimlik arayisini anlatan distopik bilimkurgu kitabidir.",
    seo_title: "GODCODE",
    short_description:
      "Olumden sonra bilincin kodlandigi System'de, hafizasini kaybeden Algus kendi kimliginin ve kapatildigi gercekligin izini surer.",
    slug: "godcode",
    status: "active",
    subtitle: "IOH evreninin bilinc ve hafiza cekirdegi",
    title: "GODCODE",
    type: "book",
    updated_at: now
  },
  {
    collection_id: null,
    collections: {
      ...iohCollection,
      accent_color: "#46BDEB"
    },
    description:
      "SYS GOD, IOH evreninin daha sessiz ama daha derin katmanina bakar: guvenlik, duzen, kontrol ve insan bilincinin sistemler tarafindan nasil sekillendirildigi.\n\nMetnin merkezinde teknoloji bir kurtulus vaadi degil, insani sinayan bir basinc olarak durur. Hafiza disari aktarilir, beden koda cevrilir, olum ertelenir; fakat insanin ozgur olup olmadigi sorusu daha da keskinlesir. SYS GOD, System'in mavi cekirdeginde guvenlik ile kafes arasindaki cizgiyi takip eden felsefi ve distopik bir IOH kitabi olarak konumlanir.",
    id: "preview-sysgod",
    is_limited: false,
    product_media: [
      {
        alt_text: "SYSGOD IOH kitap kapagi",
        id: "preview-sysgod-cover",
        kind: "cover",
        sort_order: 0,
        storage_bucket: "local-public",
        storage_path: "/media/books/ioh-sysgod-cover.jpeg"
      }
    ],
    product_variants: [
      {
        active: true,
        compare_at_minor: null,
        currency: "TRY",
        edition_label: null,
        format: "signed",
        fulfillment_type: "physical",
        inventory_items: [{ on_hand: 12, reserved: 0, safety_stock: 1 }],
        id: "preview-sysgod-signed",
        is_preview: true,
        lead_time_days: 5,
        max_per_order: 2,
        price_minor: 65000,
        sku: "IOH-SYSGOD-SIGNED",
        sort_order: 0,
        stock_policy: "track",
        title: "Imzali baski",
        weight_grams: 430
      }
    ],
    published_at: now,
    requires_shipping: true,
    seo_description:
      "SYSGOD, IOH evreninde guvenlik, kontrol, hafiza ve insan bilinci uzerinden System'in mavi mimarisini anlatan distopik bilimkurgu kitabidir.",
    seo_title: "SYSGOD",
    short_description:
      "Guvenlik ile kafes arasindaki ince cizgide, System'in mavi cekirdegi insan bilincini yeniden tanimlar.",
    slug: "sysgod",
    status: "active",
    subtitle: "IOH evreninin sistem ve kontrol katmani",
    title: "SYSGOD",
    type: "book",
    updated_at: now
  },
  {
    collection_id: null,
    collections: {
      ...iohCollection,
      accent_color: "#D64A3A"
    },
    description:
      "CODEWAR, IOH evreninde catismayi merkeze alir. Centrium'un icinde para cekirdekleri, kuantum islem kayitlari, Iohcoin core ve dunya para sistemi birbirine baglanir; Algus ve ekibi ise unhackable diye satilan bir merkezin aslinda ne kadar kirilgan oldugunu gostermek icin harekete gecer.\n\nBu kitapta teknoloji artik yalnizca bir sistem degil, savasin kendisidir. Pocket dimension hamleleri, savunma halkalari, para cekirdekleri ve kontrol mimarisi icinde her secim hem politik hem ahlaki bir bedel tasir. CODEWAR, IOH hattinin kirmizi, sert ve operasyonel bolumudur.",
    id: "preview-codewar",
    is_limited: true,
    product_media: [
      {
        alt_text: "CODEWAR IOH kitap kapagi",
        id: "preview-codewar-cover",
        kind: "cover",
        sort_order: 0,
        storage_bucket: "local-public",
        storage_path: "/media/books/ioh-codewar-cover.jpeg"
      }
    ],
    product_variants: [
      {
        active: true,
        compare_at_minor: null,
        currency: "TRY",
        edition_label: "Limited",
        format: "limited",
        fulfillment_type: "physical",
        inventory_items: [{ on_hand: 8, reserved: 0, safety_stock: 1 }],
        id: "preview-codewar-limited",
        is_preview: true,
        lead_time_days: 7,
        max_per_order: 1,
        price_minor: 90000,
        sku: "IOH-CODEWAR-LTD",
        sort_order: 0,
        stock_policy: "track",
        title: "Koleksiyon baskisi",
        weight_grams: 460
      }
    ],
    published_at: now,
    requires_shipping: true,
    seo_description:
      "CODEWAR, IOH evreninde Algus'un para cekirdekleri, Iohcoin core ve System savunmalarina karsi yurutulen operasyonunu anlatan distopik teknoloji savasi kitabidir.",
    seo_title: "CODEWAR",
    short_description:
      "Centrium'un para cekirdeklerine yonelen operasyon, IOH evreninde teknolojiyi savasin bizzat alanina donusturur.",
    slug: "codewar",
    status: "active",
    subtitle: "IOH evreninin operasyon ve savas katmani",
    title: "CODEWAR",
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
