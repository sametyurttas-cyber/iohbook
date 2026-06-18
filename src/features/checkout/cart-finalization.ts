import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

type ServiceClient = SupabaseClient<Database>;

export async function convertPaidOrderCart(input: {
  cartId?: string | null;
  orderId: string;
  supabase: ServiceClient;
}) {
  let cartId = input.cartId;

  if (cartId === undefined) {
    const { data: order, error: orderError } = await input.supabase
      .from("orders")
      .select("cart_id")
      .eq("id", input.orderId)
      .single();

    if (orderError) {
      throw orderError;
    }

    cartId = order.cart_id;
  }

  if (!cartId) {
    return;
  }

  const { error } = await input.supabase
    .from("carts")
    .update({ status: "converted" })
    .eq("id", cartId);

  if (error) {
    throw error;
  }
}
