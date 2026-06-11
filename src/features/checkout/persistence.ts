import type { Database } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

type ServiceClient = SupabaseClient<Database>;

export async function commitCheckoutPaymentStart(
  supabase: ServiceClient,
  args: Database["public"]["Functions"]["commit_checkout_payment_start"]["Args"]
) {
  const { data, error } = await supabase.rpc("commit_checkout_payment_start", args).single();

  if (error) {
    throw error;
  }

  return data;
}

export async function commitTokenSalePaymentStart(
  supabase: ServiceClient,
  args: Database["public"]["Functions"]["commit_token_sale_payment_start"]["Args"]
) {
  const { data, error } = await supabase.rpc("commit_token_sale_payment_start", args).single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateOrThrow<T>(
  operation: PromiseLike<{ data?: T | null; error: unknown }>
) {
  const result = await operation;

  if (result.error) {
    throw result.error;
  }

  return result.data ?? null;
}
