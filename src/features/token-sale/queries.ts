import { unstable_cache } from "next/cache";
import { requireAccountUser } from "@/features/account/queries";
import { requireStaff } from "@/features/auth/queries";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  Order,
  PaymentAttempt,
  TokenAllocation,
  TokenSaleCampaign,
  TokenSalePackage,
  UserWallet
} from "@/types/database";

export type TokenCampaignWithPackages = TokenSaleCampaign & {
  token_sale_packages: TokenSalePackage[];
};

export type AccountTokenAllocation = TokenAllocation & {
  token_sale_campaigns: Pick<TokenSaleCampaign, "title" | "slug" | "token_symbol"> | null;
  orders: Pick<Order, "order_number" | "created_at" | "status"> | null;
};

export type AdminTokenAllocation = TokenAllocation & {
  token_sale_campaigns: Pick<TokenSaleCampaign, "title" | "slug" | "token_symbol"> | null;
  orders: (Pick<Order, "order_number" | "customer_email" | "customer_name" | "status" | "total_minor" | "currency" | "created_at"> & {
    payment_attempts: Pick<PaymentAttempt, "provider" | "provider_status" | "status" | "verified_at">[];
  }) | null;
  user_wallets: Pick<UserWallet, "normalized_address" | "provider" | "chain_id"> | null;
};

async function fetchActiveTokenCampaigns() {
  const supabase = createSupabasePublicClient();
  const { data, error } = await supabase
    .from("token_sale_campaigns")
    .select("*, token_sale_packages(*)")
    .eq("status", "active")
    .eq("sales_enabled", true)
    .order("created_at", { ascending: false })
    .order("sort_order", { referencedTable: "token_sale_packages", ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as TokenCampaignWithPackages[];
}

export const listActiveTokenCampaigns = unstable_cache(
  fetchActiveTokenCampaigns,
  ["active-token-campaigns"],
  {
    revalidate: 120,
    tags: ["token-sale"]
  }
);

export async function listTokenCampaignsForAdmin() {
  const staff = await requireStaff(["owner", "admin_ops"]);
  if (!staff) return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("token_sale_campaigns")
    .select("*, token_sale_packages(*)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as TokenCampaignWithPackages[];
}

export async function listAccountTokenAllocations() {
  const user = await requireAccountUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("token_allocations")
    .select("*, token_sale_campaigns(title, slug, token_symbol), orders(order_number, created_at, status)")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as AccountTokenAllocation[];
}

export async function listTokenAllocationsForAdmin() {
  const staff = await requireStaff(["owner", "admin_ops"]);
  if (!staff) return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("token_allocations")
    .select(
      "*, token_sale_campaigns(title, slug, token_symbol), user_wallets(normalized_address, provider, chain_id), orders(order_number, customer_email, customer_name, status, total_minor, currency, created_at, payment_attempts(provider, provider_status, status, verified_at))"
    )
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as AdminTokenAllocation[];
}
