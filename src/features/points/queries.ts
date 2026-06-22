import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { IohPointLedger } from "@/types/database";

export type IohPointBalanceSummary = {
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
};

export type IohPointLedgerItem = Pick<
  IohPointLedger,
  "amount" | "created_at" | "id" | "order_id" | "reason"
>;

export async function getIohPointBalanceForProfile(profileId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ioh_point_balances")
    .select("balance, lifetime_earned, lifetime_spent")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    return {
      balance: 0,
      lifetimeEarned: 0,
      lifetimeSpent: 0
    } satisfies IohPointBalanceSummary;
  }

  return {
    balance: data?.balance ?? 0,
    lifetimeEarned: data?.lifetime_earned ?? 0,
    lifetimeSpent: data?.lifetime_spent ?? 0
  } satisfies IohPointBalanceSummary;
}

export async function listIohPointLedgerForProfile(profileId: string, limit = 5) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ioh_point_ledger")
    .select("id, amount, reason, order_id, created_at")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return (data ?? []) as IohPointLedgerItem[];
}

export function formatIohPointReason(reason: IohPointLedger["reason"]) {
  if (reason === "signup_bonus") {
    return "Uyelik bonusu";
  }

  if (reason === "book_order_reward") {
    return "Kitap siparisi odulu";
  }

  if (reason === "manual_adjustment_credit") {
    return "Admin puan ekleme";
  }

  if (reason === "amazon_purchase_verification") {
    return "Amazon satin alma dogrulamasi";
  }

  if (reason === "amazon_review_verification") {
    return "Amazon yorum dogrulamasi";
  }

  return "Admin puan dusme";
}
