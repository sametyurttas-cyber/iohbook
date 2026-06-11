import { requireAccountUser } from "@/features/account/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ClaimReservation, NftCollection, NftItem, UserWallet, WalletLink } from "@/types/database";

export type WalletReservation = ClaimReservation & {
  nft_collections: Pick<NftCollection, "id" | "slug" | "title"> | null;
  nft_items: Pick<NftItem, "id" | "title" | "token_id"> | null;
};

export async function listAccountWalletLinks() {
  const user = await requireAccountUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("wallet_links")
    .select("*")
    .eq("profile_id", user.id)
    .is("revoked_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as WalletLink[];
}

export async function listAccountUserWallets() {
  const user = await requireAccountUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("user_wallets")
    .select("*")
    .eq("profile_id", user.id)
    .is("revoked_at", null)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as UserWallet[];
}

export async function listAccountClaimReservations() {
  const user = await requireAccountUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("claim_reservations")
    .select("*, nft_collections(id, slug, title), nft_items(id, title, token_id)")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as WalletReservation[];
}
