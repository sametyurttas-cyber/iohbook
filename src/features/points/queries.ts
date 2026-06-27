import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { IohPointLedger } from "@/types/database";

export type IohPointBalanceSummary = {
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
};

export type IohPointLedgerItem = Pick<
  IohPointLedger,
  "amount" | "created_at" | "id" | "order_id" | "reason" | "metadata"
> & {
  orders?: { order_number: string } | null;
};

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

export async function listIohPointLedgerForProfile(
  profileId: string,
  limit = 5
): Promise<IohPointLedgerItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("ioh_point_ledger")
    .select("id, amount, reason, order_id, created_at, metadata")
    .eq("profile_id", profileId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return (data ?? []).map((entry) => ({
    ...entry,
    orders: null
  })) satisfies IohPointLedgerItem[];
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

  if (reason === "referral_referrer_reward") {
    return "Arkadas daveti odulu";
  }

  if (reason === "referral_referred_reward") {
    return "Davetle katilim odulu";
  }

  return "Admin puan dusme";
}

export function getIohPointLedgerDetail(entry: {
  reason: string;
  metadata?: Record<string, unknown> | null;
  amount: number;
}) {
  const metadata = entry.metadata ?? {};

  if (entry.reason === "signup_bonus") {
    return "Hesap oluşturma hoş geldin puanı.";
  }

  if (metadata.source === "token_purchase") {
    return "Token paketi satın alımınız sonucu hesabınıza aktarılan puan.";
  }

  if (entry.reason === "book_order_reward") {
    return "Başarılı kitap siparişiniz için kazanılan puan.";
  }

  if (entry.reason === "manual_adjustment_credit") {
    const adminNote = metadata?.admin_note;
    if (adminNote) {
      return `Açıklama: ${adminNote}`;
    }
    return entry.amount < 0 
      ? "Yönetici tarafından yapılan puan azaltması."
      : "Yönetici tarafından yapılan puan eklemesi.";
  }

  if (entry.reason === "amazon_purchase_verification") {
    const bookSlug = metadata?.book_slug;
    const adminNote = metadata?.admin_note;
    const bookTitle = bookSlug ? String(bookSlug).toUpperCase().replace(/-/g, " ") : "";
    let text = "Amazon satın alımınız onaylandı.";
    if (bookTitle) {
      text = `Amazon satın alma doğrulaması: ${bookTitle} kitabı.`;
    }
    if (adminNote) {
      text += ` (${adminNote})`;
    }
    return text;
  }

  if (entry.reason === "amazon_review_verification") {
    const bookSlug = metadata?.book_slug;
    const adminNote = metadata?.admin_note;
    const bookTitle = bookSlug ? String(bookSlug).toUpperCase().replace(/-/g, " ") : "";
    let text = "Amazon incelemeniz onaylandı.";
    if (bookTitle) {
      text = `Amazon yorum doğrulaması: ${bookTitle} kitabı.`;
    }
    if (adminNote) {
      text += ` (${adminNote})`;
    }
    return text;
  }

  if (entry.reason === "referral_referrer_reward") {
    return "Davet kodunuzu kullanan bir arkadaşınız üye oldu.";
  }

  if (entry.reason === "referral_referred_reward") {
    return "Arkadaşınızın davet koduyla üye olduğunuz için kazanılan puan.";
  }

  return null;
}

export function getIohPointLedgerTitle(entry: {
  reason: string;
  metadata?: Record<string, unknown> | null;
}) {
  const metadata = entry.metadata ?? {};

  if (metadata.source === "token_purchase") {
    return "Token Satın Alma Ödülü";
  }

  if (entry.reason === "signup_bonus") {
    return "Üyelik Bonusu";
  }

  if (entry.reason === "book_order_reward") {
    return "Kitap Siparişi Ödülü";
  }

  if (entry.reason === "manual_adjustment_credit") {
    return "Admin Puan Ekleme";
  }

  if (entry.reason === "amazon_purchase_verification") {
    return "Amazon Satın Alma Doğrulaması";
  }

  if (entry.reason === "amazon_review_verification") {
    return "Amazon Yorum Doğrulaması";
  }

  if (entry.reason === "referral_referrer_reward") {
    return "Arkadaş Daveti Ödülü";
  }

  if (entry.reason === "referral_referred_reward") {
    return "Davetle Katılım Ödülü";
  }

  return "Admin Puan Düşme";
}
