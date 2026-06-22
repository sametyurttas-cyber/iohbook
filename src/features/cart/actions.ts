"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/features/auth/queries";
import { trackServerAnalyticsEvent } from "@/features/analytics/business-events";
import { getAnonymousCartId, getOrCreateAnonymousCartId } from "@/features/cart/cart-cookie";
import { validateCartQuantity } from "@/features/cart/cart-rules";
import { requiresPhysicalDelivery } from "@/features/checkout/fulfillment-utils";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type VariantInventory = { on_hand: number; reserved: number; safety_stock: number };

function getFirstInventory(
  inventoryItems: VariantInventory | VariantInventory[] | null | undefined
) {
  return Array.isArray(inventoryItems) ? inventoryItems[0] : inventoryItems;
}

async function findActiveCart(input: {
  anonymousId: string | null;
  profileId: string | null;
  supabase: ReturnType<typeof createSupabaseServiceRoleClient>;
}) {
  let query = input.supabase.from("carts").select("*").eq("status", "active").limit(1);

  if (input.profileId) {
    query = query.eq("profile_id", input.profileId);
  } else {
    query = query.eq("anonymous_id", input.anonymousId as string);
  }

  return query;
}

async function getOrCreateActiveCart() {
  const user = await getCurrentUser();
  const anonymousId = user ? null : await getOrCreateAnonymousCartId();
  const supabase = createSupabaseServiceRoleClient();
  const owner = {
    anonymousId,
    profileId: user?.id ?? null,
    supabase
  };
  const { data: existing, error: findError } = await findActiveCart(owner);

  if (findError) {
    throw findError;
  }

  if (existing?.[0]) {
    return existing[0];
  }

  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
  const { data, error } = await supabase
    .from("carts")
    .insert({
      anonymous_id: anonymousId,
      currency: "TRY",
      expires_at: expiresAt,
      profile_id: user?.id ?? null,
      status: "active"
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: racedExisting, error: racedFindError } = await findActiveCart(owner);

      if (racedFindError) {
        throw racedFindError;
      }

      if (racedExisting?.[0]) {
        return racedExisting[0];
      }
    }

    throw error;
  }

  return data;
}

async function getActiveCartForCurrentOwner() {
  const user = await getCurrentUser();
  const anonymousId = user ? null : await getAnonymousCartId();

  if (!user && !anonymousId) {
    return null;
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await findActiveCart({
    anonymousId,
    profileId: user?.id ?? null,
    supabase
  });

  if (error) {
    throw error;
  }

  return data?.[0] ?? null;
}

async function getVariantForCart(variantId: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select(
      "id, product_id, sku, title, format, fulfillment_type, price_minor, currency, stock_policy, max_per_order, active, inventory_items(on_hand, reserved, safety_stock), products(id, status, published_at)"
    )
    .eq("id", variantId)
    .single();

  if (error) {
    throw error;
  }

  return data as unknown as {
    active: boolean;
    currency: string;
    fulfillment_type: "physical" | "digital" | "claimable" | "hybrid";
    id: string;
    inventory_items: VariantInventory | VariantInventory[] | null;
    max_per_order: number | null;
    price_minor: number;
    product_id: string;
    products: { id: string; published_at: string | null; status: string };
    sku: string;
    stock_policy: "track" | "continue" | "deny" | "unlimited";
    title: string;
  };
}

export async function addToCart(formData: FormData) {
  const variantId = String(formData.get("variant_id") ?? "");
  const requestedQuantity = Number.parseInt(String(formData.get("quantity") ?? "1"), 10);

  if (!variantId) {
    redirect("/cart?error=missing-variant");
  }

  if (!UUID_PATTERN.test(variantId)) {
    redirect("/cart?error=variant-unavailable");
  }

  const supabase = createSupabaseServiceRoleClient();
  const [cart, variant] = await Promise.all([
    getOrCreateActiveCart(),
    getVariantForCart(variantId)
  ]);

  if (!variant.active || variant.products.status !== "active" || !variant.products.published_at) {
    redirect("/cart?error=variant-unavailable");
  }

  if (requiresPhysicalDelivery(variant.fulfillment_type)) {
    redirect("/cart?error=physical-unavailable");
  }

  if (variant.currency !== cart.currency) {
    redirect("/cart?error=currency-mismatch");
  }

  const { data: existing, error: existingError } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cart.id)
    .eq("variant_id", variantId)
    .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  const nextQuantity = (existing?.quantity ?? 0) + requestedQuantity;
  const inventory = getFirstInventory(variant.inventory_items);
  const validation = validateCartQuantity({
    maxPerOrder: variant.max_per_order,
    onHand: inventory?.on_hand,
    requestedQuantity: nextQuantity,
    reserved: inventory?.reserved,
    safetyStock: inventory?.safety_stock,
    stockPolicy: variant.stock_policy
  });

  if (!validation.ok) {
    redirect(`/cart?error=${encodeURIComponent(validation.reason)}`);
  }

  const mutation = existing
    ? await supabase
        .from("cart_items")
        .update({
          quantity: nextQuantity,
          unit_price_minor: variant.price_minor
        })
        .eq("id", existing.id)
    : await supabase.from("cart_items").insert({
        cart_id: cart.id,
        currency: variant.currency,
        quantity: nextQuantity,
        unit_price_minor: variant.price_minor,
        variant_id: variant.id
      });

  if (mutation.error) {
    throw mutation.error;
  }

  await trackServerAnalyticsEvent({
    anonymousId: cart.anonymous_id,
    eventName: "add_to_cart",
    metadata: {
      amount_minor: variant.price_minor * requestedQuantity,
      currency: variant.currency,
      product_id: variant.product_id,
      quantity: requestedQuantity,
      variant_id: variant.id
    },
    path: "/cart",
    profileId: cart.profile_id
  });

  revalidatePath("/cart");
  revalidatePath("/books");
  if (formData.get("buy_now") === "1") {
    redirect("/checkout");
  }

  redirect("/cart?added=1");
}

export async function updateCartItem(formData: FormData) {
  const cartItemId = String(formData.get("cart_item_id") ?? "");
  const quantity = Number.parseInt(String(formData.get("quantity") ?? "1"), 10);

  if (!cartItemId) {
    redirect("/cart?error=missing-line");
  }

  if (quantity <= 0) {
    return removeCartItem(formData);
  }

  const supabase = createSupabaseServiceRoleClient();
  const cart = await getOrCreateActiveCart();
  const { data: line, error } = await supabase
    .from("cart_items")
    .select(
      "id, cart_id, variant_id, product_variants(stock_policy, max_per_order, inventory_items(on_hand, reserved, safety_stock))"
    )
    .eq("id", cartItemId)
    .single();

  if (error) {
    throw error;
  }

  if (line.cart_id !== cart.id) {
    redirect("/cart?error=line-not-found");
  }

  const variant = line.product_variants as unknown as {
    inventory_items: VariantInventory | VariantInventory[] | null;
    max_per_order: number | null;
    stock_policy: "track" | "continue" | "deny" | "unlimited";
  };
  const inventory = getFirstInventory(variant.inventory_items);
  const validation = validateCartQuantity({
    maxPerOrder: variant.max_per_order,
    onHand: inventory?.on_hand,
    requestedQuantity: quantity,
    reserved: inventory?.reserved,
    safetyStock: inventory?.safety_stock,
    stockPolicy: variant.stock_policy
  });

  if (!validation.ok) {
    redirect(`/cart?error=${encodeURIComponent(validation.reason)}`);
  }

  const update = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", cartItemId);

  if (update.error) {
    throw update.error;
  }

  revalidatePath("/cart");
  redirect("/cart?updated=1");
}

export async function removeCartItem(formData: FormData) {
  const cartItemId = String(formData.get("cart_item_id") ?? "");

  if (!cartItemId) {
    redirect("/cart?error=missing-line");
  }

  const supabase = createSupabaseServiceRoleClient();
  const cart = await getOrCreateActiveCart();
  const { data: line, error: lineError } = await supabase
    .from("cart_items")
    .select("id, cart_id")
    .eq("id", cartItemId)
    .single();

  if (lineError) {
    throw lineError;
  }

  if (line.cart_id !== cart.id) {
    redirect("/cart?error=line-not-found");
  }

  const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId);

  if (error) {
    throw error;
  }

  revalidatePath("/cart");
  redirect("/cart?removed=1");
}

export async function clearCart() {
  const supabase = createSupabaseServiceRoleClient();
  const cart = await getActiveCartForCurrentOwner();

  if (!cart) {
    redirect("/cart?cleared=1");
  }

  const { error } = await supabase.from("cart_items").delete().eq("cart_id", cart.id);

  if (error) {
    throw error;
  }

  revalidatePath("/cart");
  revalidatePath("/checkout");
  redirect("/cart?cleared=1");
}
