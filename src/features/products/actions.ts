"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/features/auth/queries";
import {
  parseInteger,
  parseMoneyToMinor,
  parseOptionalString,
  slugify
} from "@/features/products/product-utils";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { captureError, logInfo } from "@/lib/observability";
import type {
  FulfillmentType,
  ProductStatus,
  ProductType,
  StockPolicy,
  VariantFormat
} from "@/types/database";

async function requireProductStaff() {
  const staff = await requireStaff(["owner", "admin_ops", "editor"]);

  if (!staff) {
    redirect("/unauthorized");
  }

  return staff;
}

function readProductPayload(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const slug = parseOptionalString(formData.get("slug")) ?? slugify(title);
  const status = String(formData.get("status") ?? "draft") as ProductStatus;
  const type = String(formData.get("type") ?? "book") as ProductType;
  const collectionId = parseOptionalString(formData.get("collection_id"));

  return {
    collection_id: collectionId === "none" ? null : collectionId,
    description: parseOptionalString(formData.get("description")),
    is_claimable: type === "claimable" || type === "nft",
    is_digital: type === "digital",
    is_limited: formData.get("is_limited") === "on",
    published_at: status === "active" ? new Date().toISOString() : null,
    requires_shipping: type === "book" || type === "bundle",
    seo_description: parseOptionalString(formData.get("seo_description")),
    seo_title: parseOptionalString(formData.get("seo_title")),
    short_description: parseOptionalString(formData.get("short_description")),
    slug,
    status,
    subtitle: parseOptionalString(formData.get("subtitle")),
    title,
    type
  };
}

export async function createProduct(formData: FormData) {
  await requireProductStaff();
  const payload = readProductPayload(formData);

  if (!payload.title || !payload.slug) {
    redirect("/admin/products/new?error=missing-title");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    captureError(error, {
      operation: "admin.product_create",
      slug: payload.slug
    });
    redirect(`/admin/products/new?error=${encodeURIComponent(error.code ?? "create-failed")}`);
  }

  logInfo("admin.product_created", {
    product_id: data.id,
    slug: payload.slug
  });
  revalidatePath("/admin/products");
  redirect(`/admin/products/${data.id}`);
}

export async function updateProduct(formData: FormData) {
  await requireProductStaff();
  const productId = String(formData.get("product_id") ?? "");
  const payload = readProductPayload(formData);

  if (!productId || !payload.title || !payload.slug) {
    redirect("/admin/products?error=missing-product");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("products").update(payload).eq("id", productId);

  if (error) {
    captureError(error, {
      operation: "admin.product_update",
      product_id: productId
    });
    redirect(`/admin/products/${productId}?error=${encodeURIComponent(error.code ?? "update-failed")}`);
  }

  logInfo("admin.product_updated", {
    product_id: productId,
    slug: payload.slug
  });
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  redirect(`/admin/products/${productId}?saved=product`);
}

function readVariantPayload(formData: FormData) {
  const format = String(formData.get("format") ?? "standard") as VariantFormat;
  const fulfillmentType = String(
    formData.get("fulfillment_type") ?? "physical"
  ) as FulfillmentType;
  const stockPolicy = String(formData.get("stock_policy") ?? "track") as StockPolicy;
  const nftMetadata = {
    contract_address: parseOptionalString(formData.get("nft_contract_address")),
    image_ipfs_uri: parseOptionalString(formData.get("nft_image_ipfs_uri")),
    metadata_ipfs_uri: parseOptionalString(formData.get("nft_metadata_ipfs_uri")),
    token_id: parseOptionalString(formData.get("nft_token_id"))
  };

  return {
    active: formData.get("active") === "on",
    compare_at_minor: formData.get("compare_at_minor")
      ? parseMoneyToMinor(formData.get("compare_at_minor"))
      : null,
    currency: String(formData.get("currency") ?? "TRY").trim() || "TRY",
    digital_access_expires_at: parseOptionalString(formData.get("digital_access_expires_at")),
    digital_access_starts_at: parseOptionalString(formData.get("digital_access_starts_at")),
    digital_delivery_bucket:
      fulfillmentType === "digital" || fulfillmentType === "hybrid"
        ? parseOptionalString(formData.get("digital_delivery_bucket")) ?? "digital-deliveries"
        : null,
    digital_delivery_path:
      fulfillmentType === "digital" || fulfillmentType === "hybrid"
        ? parseOptionalString(formData.get("digital_delivery_path"))
        : null,
    digital_download_limit:
      fulfillmentType === "digital" || fulfillmentType === "hybrid"
        ? formData.get("digital_download_limit")
          ? parseInteger(formData.get("digital_download_limit"), 0)
          : 5
        : null,
    edition_label: parseOptionalString(formData.get("edition_label")),
    format,
    fulfillment_type: fulfillmentType,
    lead_time_days: parseInteger(formData.get("lead_time_days"), 0),
    max_per_order: formData.get("max_per_order")
      ? parseInteger(formData.get("max_per_order"), 0)
      : null,
    metadata: Object.fromEntries(
      Object.entries({
        nft: nftMetadata
      }).filter(([, value]) =>
        typeof value === "object" && value !== null
          ? Object.values(value).some(Boolean)
          : Boolean(value)
      )
    ),
    price_minor: parseMoneyToMinor(formData.get("price_minor")),
    sku: String(formData.get("sku") ?? "").trim(),
    sort_order: parseInteger(formData.get("sort_order"), 0),
    stock_policy: stockPolicy,
    title: String(formData.get("variant_title") ?? "").trim(),
    weight_grams: formData.get("weight_grams")
      ? parseInteger(formData.get("weight_grams"), 0)
      : null
  };
}

export async function createVariant(formData: FormData) {
  await requireProductStaff();
  const productId = String(formData.get("product_id") ?? "");
  const payload = readVariantPayload(formData);

  if (!productId || !payload.title || !payload.sku) {
    redirect(`/admin/products/${productId}?error=missing-variant`);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("product_variants")
    .insert({
      ...payload,
      product_id: productId
    })
    .select("id")
    .single();

  if (error) {
    captureError(error, {
      operation: "admin.variant_create",
      product_id: productId,
      sku: payload.sku
    });
    redirect(`/admin/products/${productId}?error=${encodeURIComponent(error.code ?? "variant-create-failed")}`);
  }

  const onHand = parseInteger(formData.get("on_hand"), 0);
  const safetyStock = parseInteger(formData.get("safety_stock"), 0);
  const warehouseLocation = parseOptionalString(formData.get("warehouse_location"));
  const inventory = await supabase.from("inventory_items").insert({
    on_hand: onHand,
    reserved: 0,
    safety_stock: safetyStock,
    variant_id: data.id,
    warehouse_location: warehouseLocation
  });

  if (inventory.error) {
    captureError(inventory.error, {
      operation: "admin.variant_inventory_create",
      product_id: productId,
      variant_id: data.id
    });
    redirect(`/admin/products/${productId}?error=${encodeURIComponent(inventory.error.code ?? "inventory-create-failed")}`);
  }

  logInfo("admin.variant_created", {
    product_id: productId,
    sku: payload.sku,
    variant_id: data.id
  });
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  redirect(`/admin/products/${productId}?saved=variant`);
}

export async function updateVariant(formData: FormData) {
  await requireProductStaff();
  const productId = String(formData.get("product_id") ?? "");
  const variantId = String(formData.get("variant_id") ?? "");
  const inventoryId = parseOptionalString(formData.get("inventory_id"));
  const payload = readVariantPayload(formData);

  if (!productId || !variantId || !payload.title || !payload.sku) {
    redirect(`/admin/products/${productId}?error=missing-variant`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("product_variants")
    .update(payload)
    .eq("id", variantId);

  if (error) {
    captureError(error, {
      operation: "admin.variant_update",
      product_id: productId,
      variant_id: variantId
    });
    redirect(`/admin/products/${productId}?error=${encodeURIComponent(error.code ?? "variant-update-failed")}`);
  }

  const inventoryPayload = {
    on_hand: parseInteger(formData.get("on_hand"), 0),
    safety_stock: parseInteger(formData.get("safety_stock"), 0),
    warehouse_location: parseOptionalString(formData.get("warehouse_location"))
  };

  const inventory = inventoryId
    ? await supabase.from("inventory_items").update(inventoryPayload).eq("id", inventoryId)
    : await supabase.from("inventory_items").insert({
        ...inventoryPayload,
        reserved: 0,
        variant_id: variantId
      });

  if (inventory.error) {
    captureError(inventory.error, {
      operation: "admin.variant_inventory_update",
      product_id: productId,
      variant_id: variantId
    });
    redirect(`/admin/products/${productId}?error=${encodeURIComponent(inventory.error.code ?? "inventory-update-failed")}`);
  }

  logInfo("admin.variant_updated", {
    product_id: productId,
    sku: payload.sku,
    variant_id: variantId
  });
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  redirect(`/admin/products/${productId}?saved=variant`);
}
