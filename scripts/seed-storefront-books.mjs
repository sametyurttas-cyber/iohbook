import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(fileName) {
  const filePath = resolve(process.cwd(), fileName);

  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const [key, ...valueParts] = trimmed.split("=");
    const value = valueParts.join("=").trim().replace(/^['"]|['"]$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function requiredEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

const books = [
  {
    accentColor: "#F2C96D",
    coverPath: "/media/books/ioh-godcode-cover.jpeg",
    description:
      "Algus gozlerini actiginda bir odada, bir deniz sesinin ve Elsa adli kuantum yapay zekanin sesiyle bas basa kalir. Kendi yuzunu tanimaz; gecmis bedeni, hafizasi ve kimligi arasinda kopmus bir bilinc olarak System'in icine yeniden yerlestirildigini ogrenir.\n\nGODCODE, olumden sonra enerji kimliklerinin kuantum sehir sunucularina aktarildigi karanlik bir gelecek evreninde baslar. Hafiza, beden, kod ve gerceklik arasindaki sinirlar cozulurken Algus, kendisinin yalnizca kayip bir insan degil, System'in sakladigi daha buyuk bir kirilmanin parcasi oldugunu fark eder.",
    format: "standard",
    isLimited: false,
    leadTimeDays: 3,
    maxPerOrder: 3,
    priceMinor: 45000,
    safetyStock: 2,
    shortDescription:
      "Olumden sonra bilincin kodlandigi System'de, hafizasini kaybeden Algus kendi kimliginin ve kapatildigi gercekligin izini surer.",
    sku: "IOH-GODCODE-STD",
    slug: "godcode",
    stock: 25,
    subtitle: "IOH evreninin bilinc ve hafiza cekirdegi",
    title: "GODCODE",
    variantTitle: "Standart baski",
    weightGrams: 420
  },
  {
    accentColor: "#46BDEB",
    coverPath: "/media/books/ioh-sysgod-cover.jpeg",
    description:
      "SYS GOD, IOH evreninin daha sessiz ama daha derin katmanina bakar: guvenlik, duzen, kontrol ve insan bilincinin sistemler tarafindan nasil sekillendirildigi.\n\nMetnin merkezinde teknoloji bir kurtulus vaadi degil, insani sinayan bir basinc olarak durur. Hafiza disari aktarilir, beden koda cevrilir, olum ertelenir; fakat insanin ozgur olup olmadigi sorusu daha da keskinlesir.",
    format: "signed",
    isLimited: false,
    leadTimeDays: 5,
    maxPerOrder: 2,
    priceMinor: 65000,
    safetyStock: 1,
    shortDescription:
      "Guvenlik ile kafes arasindaki ince cizgide, System'in mavi cekirdegi insan bilincini yeniden tanimlar.",
    sku: "IOH-SYSGOD-SIGNED",
    slug: "sysgod",
    stock: 12,
    subtitle: "IOH evreninin sistem ve kontrol katmani",
    title: "SYSGOD",
    variantTitle: "Imzali baski",
    weightGrams: 430
  },
  {
    accentColor: "#D64A3A",
    coverPath: "/media/books/ioh-codewar-cover.jpeg",
    description:
      "CODEWAR, IOH evreninde catismayi merkeze alir. Centrium'un icinde para cekirdekleri, kuantum islem kayitlari, Iohcoin core ve dunya para sistemi birbirine baglanir; Algus ve ekibi ise unhackable diye satilan bir merkezin aslinda ne kadar kirilgan oldugunu gostermek icin harekete gecer.\n\nBu kitapta teknoloji artik yalnizca bir sistem degil, savasin kendisidir. Pocket dimension hamleleri, savunma halkalari, para cekirdekleri ve kontrol mimarisi icinde her secim hem politik hem ahlaki bir bedel tasir.",
    format: "limited",
    isLimited: true,
    leadTimeDays: 7,
    maxPerOrder: 1,
    priceMinor: 90000,
    safetyStock: 1,
    shortDescription:
      "Centrium'un para cekirdeklerine yonelen operasyon, IOH evreninde teknolojiyi savasin bizzat alanina donusturur.",
    sku: "IOH-CODEWAR-LTD",
    slug: "codewar",
    stock: 8,
    subtitle: "IOH evreninin operasyon ve savas katmani",
    title: "CODEWAR",
    variantTitle: "Koleksiyon baskisi",
    weightGrams: 460
  }
];

async function upsertSingle(supabase, table, payload, conflictColumn) {
  const { data, error } = await supabase
    .from(table)
    .upsert(payload, { onConflict: conflictColumn })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function upsertProductMedia(supabase, payload) {
  const { data: existing, error: findError } = await supabase
    .from("product_media")
    .select("id")
    .eq("product_id", payload.product_id)
    .eq("storage_path", payload.storage_path)
    .limit(1);

  if (findError) {
    throw findError;
  }

  if (existing?.[0]) {
    const { data, error } = await supabase
      .from("product_media")
      .update(payload)
      .eq("id", existing[0].id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  const { data, error } = await supabase.from("product_media").insert(payload).select("*").single();

  if (error) {
    throw error;
  }

  return data;
}

async function main() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  const supabase = createClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        persistSession: false
      }
    }
  );

  const collection = await upsertSingle(
    supabase,
    "collections",
    {
      accent_color: "#F2C96D",
      description: "IOH evreninin fiziksel kitap ve koleksiyon hatti.",
      kind: "series",
      slug: "ioh-universe",
      sort_order: 0,
      status: "published",
      title: "IOH Universe"
    },
    "slug"
  );

  for (const [index, book] of books.entries()) {
    const product = await upsertSingle(
      supabase,
      "products",
      {
        collection_id: collection.id,
        description: book.description,
        is_limited: book.isLimited,
        published_at: new Date().toISOString(),
        requires_shipping: true,
        seo_description: book.shortDescription,
        seo_title: book.title,
        short_description: book.shortDescription,
        slug: book.slug,
        status: "active",
        subtitle: book.subtitle,
        title: book.title,
        type: "book"
      },
      "slug"
    );

    const variant = await upsertSingle(
      supabase,
      "product_variants",
      {
        active: true,
        currency: "TRY",
        format: book.format,
        fulfillment_type: "physical",
        lead_time_days: book.leadTimeDays,
        max_per_order: book.maxPerOrder,
        price_minor: book.priceMinor,
        product_id: product.id,
        sku: book.sku,
        sort_order: 0,
        stock_policy: "track",
        title: book.variantTitle,
        weight_grams: book.weightGrams
      },
      "sku"
    );

    await upsertSingle(
      supabase,
      "inventory_items",
      {
        on_hand: book.stock,
        reserved: 0,
        safety_stock: book.safetyStock,
        variant_id: variant.id,
        warehouse_location: "IOH"
      },
      "variant_id"
    );

    await upsertProductMedia(
      supabase,
      {
        alt_text: `${book.title} IOH kitap kapagi`,
        kind: "cover",
        product_id: product.id,
        sort_order: index,
        storage_bucket: "local-public",
        storage_path: book.coverPath
      }
    );

    console.log(`Seeded ${book.title}: ${variant.id}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
