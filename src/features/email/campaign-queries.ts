import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { requireEmailStaff } from "./admin-queries";

export type CampaignSegmentKey =
  | "all"
  | "recent_30d"
  | "purchased_book"
  | "downloaded_book_1"
  | "approved_amazon_review"
  | "high_points"
  | "no_orders";

export async function getRecipientsForSegment(segmentKey: string) {
  const supabase = createSupabaseServiceRoleClient();

  // Base query: check email_preferences for marketing consent
  const { data: allOptIn, error: optInErr } = await supabase
    .from("email_preferences")
    .select("profile_id, profiles(id, email, full_name, created_at)")
    .eq("marketing_enabled", true);

  if (optInErr) throw optInErr;
  
  const profiles = (allOptIn ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((item: any) => item.profiles)
    .filter(Boolean) as unknown as { id: string; email: string; full_name: string | null; created_at: string }[];

  if (profiles.length === 0) {
    return [];
  }

  const profileIds = profiles.map((p) => p.id);

  switch (segmentKey) {
    case "all": {
      return profiles;
    }

    case "recent_30d": {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      return profiles.filter((p) => new Date(p.created_at).getTime() >= thirtyDaysAgo);
    }

    case "purchased_book": {
      // 1. Get products of type 'book'
      const { data: products, error: pErr } = await supabase
        .from("products")
        .select("id")
        .eq("type", "book");
      if (pErr) throw pErr;
      const productIds = products?.map((p) => p.id) ?? [];
      if (productIds.length === 0) return [];

      // 2. Get variants of those books
      const { data: variants, error: vErr } = await supabase
        .from("product_variants")
        .select("id")
        .in("product_id", productIds);
      if (vErr) throw vErr;
      const variantIds = variants?.map((v) => v.id) ?? [];
      if (variantIds.length === 0) return [];

      // 3. Get order items of those variants
      const { data: orderItems, error: oiErr } = await supabase
        .from("order_items")
        .select("order_id")
        .in("variant_id", variantIds);
      if (oiErr) throw oiErr;
      const orderIds = orderItems?.map((oi) => oi.order_id).filter(Boolean) as string[] ?? [];
      if (orderIds.length === 0) return [];

      // 4. Get paid/fulfilled/completed orders for our opted-in users
      const { data: orders, error: oErr } = await supabase
        .from("orders")
        .select("profile_id")
        .in("id", orderIds)
        .in("profile_id", profileIds)
        .in("status", ["paid", "fulfilled", "completed"]);
      if (oErr) throw oErr;
      const buyerIds = new Set(orders?.map((o) => o.profile_id).filter(Boolean));

      return profiles.filter((p) => buyerIds.has(p.id));
    }

    case "downloaded_book_1": {
      // Get profiles that have download_count > 0 in entitlements
      const { data: entitlements, error: eErr } = await supabase
        .from("entitlements")
        .select("profile_id")
        .in("profile_id", profileIds)
        .gt("download_count", 0);
      if (eErr) throw eErr;
      const downloaderIds = new Set(entitlements?.map((e) => e.profile_id).filter(Boolean));
      return profiles.filter((p) => downloaderIds.has(p.id));
    }

    case "approved_amazon_review": {
      // Get profiles with approved Amazon review submissions
      const { data: submissions, error: sErr } = await supabase
        .from("verification_submissions")
        .select("profile_id")
        .in("profile_id", profileIds)
        .eq("kind", "amazon_review")
        .eq("status", "approved");
      if (sErr) throw sErr;
      const reviewerIds = new Set(submissions?.map((s) => s.profile_id).filter(Boolean));
      return profiles.filter((p) => reviewerIds.has(p.id));
    }

    case "high_points": {
      // IOH point balances > 1000
      const { data: balances, error: bErr } = await supabase
        .from("ioh_point_balances")
        .select("profile_id")
        .in("profile_id", profileIds)
        .gt("balance", 1000);
      if (bErr) throw bErr;
      const highPointIds = new Set(balances?.map((b) => b.profile_id).filter(Boolean));
      return profiles.filter((p) => highPointIds.has(p.id));
    }

    case "no_orders": {
      // Fetch all profile IDs that have orders
      const { data: orders, error: oErr } = await supabase
        .from("orders")
        .select("profile_id")
        .in("profile_id", profileIds);
      if (oErr) throw oErr;
      const orderedIds = new Set(orders?.map((o) => o.profile_id).filter(Boolean));
      return profiles.filter((p) => !orderedIds.has(p.id));
    }

    default:
      return [];
  }
}

export async function listAdminCampaigns() {
  const staff = await requireEmailStaff();
  if (!staff) return [];

  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("email_batches")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to list email campaigns", error);
    return [];
  }

  return data ?? [];
}

export async function getAdminCampaignDetail(campaignId: string) {
  const staff = await requireEmailStaff();
  if (!staff) return null;

  const supabase = createSupabaseServiceRoleClient();
  const { data: campaign, error } = await supabase
    .from("email_batches")
    .select("*")
    .eq("id", campaignId)
    .maybeSingle();

  if (error || !campaign) {
    console.error("Failed to get campaign detail", error);
    return null;
  }

  // Fetch recipients list summary (first 200 for display)
  const { data: recipients, error: recErr } = await supabase
    .from("email_batch_recipients")
    .select("*, profiles(full_name)")
    .eq("batch_id", campaignId)
    .order("created_at", { ascending: true })
    .limit(200);

  if (recErr) {
    console.error("Failed to get campaign recipients", recErr);
  }

  return {
    campaign,
    recipients: recipients ?? []
  };
}
