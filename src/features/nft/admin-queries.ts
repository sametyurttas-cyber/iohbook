import { requireStaff } from "@/features/auth/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Entitlement, Order, OrderItem, PaymentAttempt, UserWallet } from "@/types/database";

export type AdminNftOrder = Entitlement & {
  order_items: (OrderItem & {
    orders: (Pick<
      Order,
      | "id"
      | "profile_id"
      | "order_number"
      | "customer_email"
      | "customer_name"
      | "status"
      | "total_minor"
      | "currency"
      | "created_at"
    > & {
      payment_attempts: Pick<
        PaymentAttempt,
        "provider" | "provider_status" | "status" | "verified_at" | "raw_response"
      >[];
      user_wallets?: Pick<UserWallet, "id" | "normalized_address" | "provider" | "chain_id" | "is_primary">[];
    }) | null;
  }) | null;
};

export async function listAdminNftOrders() {
  const staff = await requireStaff(["owner", "admin_ops", "fulfillment"]);

  if (!staff) {
    return [];
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("entitlements")
    .select(
      "*, order_items(*, orders(id, profile_id, order_number, customer_email, customer_name, status, total_minor, currency, created_at, payment_attempts(provider, provider_status, status, verified_at, raw_response)))"
    )
    .eq("kind", "claimable")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as unknown as AdminNftOrder[];
  const profileIds = Array.from(
    new Set(
      rows
        .map((row) => row.order_items?.orders?.profile_id)
        .filter((profileId): profileId is string => Boolean(profileId))
    )
  );

  if (profileIds.length === 0) {
    return rows;
  }

  const { data: wallets, error: walletError } = await supabase
    .from("user_wallets")
    .select("id, profile_id, normalized_address, provider, chain_id, is_primary")
    .in("profile_id", profileIds)
    .is("revoked_at", null);

  if (walletError) {
    throw walletError;
  }

  const walletsByProfile = new Map<string, Pick<UserWallet, "id" | "normalized_address" | "provider" | "chain_id" | "is_primary">[]>();
  for (const wallet of wallets ?? []) {
    const list = walletsByProfile.get(wallet.profile_id) ?? [];
    list.push(wallet);
    walletsByProfile.set(wallet.profile_id, list);
  }

  return rows.map((row) => {
    const profileId = row.order_items?.orders?.profile_id;
    if (row.order_items?.orders && profileId) {
      row.order_items.orders.user_wallets = walletsByProfile.get(profileId) ?? [];
    }
    return row;
  });
}
