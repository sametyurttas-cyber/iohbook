"use server";

import { getAnonymousCartId } from "@/features/cart/cart-cookie";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Cart, CartItem } from "@/types/database";

export async function mergeAnonymousCartIntoProfileCart(profileId: string) {
  const anonymousId = await getAnonymousCartId();

  if (!anonymousId) {
    return;
  }

  const supabase = createSupabaseServiceRoleClient();
  const { data: anonymousCarts, error: anonymousCartError } = await supabase
    .from("carts")
    .select("*")
    .eq("anonymous_id", anonymousId)
    .eq("status", "active")
    .limit(1);

  if (anonymousCartError) {
    throw anonymousCartError;
  }

  const anonymousCart = anonymousCarts?.[0] as Cart | undefined;

  if (!anonymousCart) {
    return;
  }

  const { data: profileCarts, error: profileCartError } = await supabase
    .from("carts")
    .select("*")
    .eq("profile_id", profileId)
    .eq("status", "active")
    .limit(1);

  if (profileCartError) {
    throw profileCartError;
  }

  const profileCart = profileCarts?.[0] as Cart | undefined;

  if (!profileCart) {
    const { error: claimError } = await supabase
      .from("carts")
      .update({
        anonymous_id: null,
        expires_at: null,
        profile_id: profileId
      })
      .eq("id", anonymousCart.id);

    if (claimError) {
      throw claimError;
    }

    return;
  }

  if (profileCart.currency !== anonymousCart.currency) {
    return;
  }

  const { data: anonymousLines, error: anonymousLinesError } = await supabase
    .from("cart_items")
    .select("*")
    .eq("cart_id", anonymousCart.id);

  if (anonymousLinesError) {
    throw anonymousLinesError;
  }

  if (!anonymousLines?.length) {
    await supabase.from("carts").update({ status: "abandoned" }).eq("id", anonymousCart.id);
    return;
  }

  const { data: profileLines, error: profileLinesError } = await supabase
    .from("cart_items")
    .select("*")
    .eq("cart_id", profileCart.id);

  if (profileLinesError) {
    throw profileLinesError;
  }

  const profileLinesByVariant = new Map(
    ((profileLines ?? []) as CartItem[]).map((line) => [line.variant_id, line])
  );

  for (const line of anonymousLines as CartItem[]) {
    const existingLine = profileLinesByVariant.get(line.variant_id);

    if (existingLine) {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: existingLine.quantity + line.quantity })
        .eq("id", existingLine.id);

      if (error) {
        throw error;
      }

      continue;
    }

    const { error } = await supabase.from("cart_items").insert({
      cart_id: profileCart.id,
      currency: line.currency,
      quantity: line.quantity,
      unit_price_minor: line.unit_price_minor,
      variant_id: line.variant_id
    });

    if (error) {
      throw error;
    }
  }

  const { error: abandonError } = await supabase
    .from("carts")
    .update({ status: "abandoned" })
    .eq("id", anonymousCart.id);

  if (abandonError) {
    throw abandonError;
  }
}
