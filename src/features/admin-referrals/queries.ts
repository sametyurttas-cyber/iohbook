import { redirect } from "next/navigation";
import { requireStaff } from "@/features/auth/queries";
import { REFERRAL_REFERRER_REWARD } from "@/features/referrals/config";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Profile, Referral, ReferralStatus } from "@/types/database";

export type AdminReferralFilters = {
  code?: string;
  date?: "7d" | "30d" | "all";
  q?: string;
  status?: ReferralStatus | "all";
};

export type AdminReferralRow = {
  createdAt: string;
  id: string;
  qualifiedAt: string | null;
  referralCode: string;
  referredEmail: string;
  referredName: string | null;
  referredProfileId: string;
  referredRewardLedgerId: string | null;
  referrerEmail: string;
  referrerName: string | null;
  referrerProfileId: string;
  referrerRewardLedgerId: string | null;
  rewardAmount: number;
  rewardedAt: string | null;
  status: ReferralStatus;
};

export type AdminReferralMetrics = {
  mostInvitingUserCount: number;
  pendingReferralCount: number;
  rewardedReferralCount: number;
  totalDistributedIoh: number;
  totalReferralCount: number;
  weeklyReferralCount: number;
};

export type AdminReferralReport = {
  canManage: boolean;
  filters: Required<Pick<AdminReferralFilters, "date" | "status">> &
    Pick<AdminReferralFilters, "code" | "q">;
  metrics: AdminReferralMetrics;
  rows: AdminReferralRow[];
};

type ReferralWithProfiles = Pick<
  Referral,
  | "created_at"
  | "id"
  | "qualified_at"
  | "referral_code"
  | "referred_profile_id"
  | "referred_reward_ledger_id"
  | "referrer_profile_id"
  | "referrer_reward_ledger_id"
  | "rewarded_at"
  | "status"
> & {
  referred_profile: Pick<Profile, "email" | "full_name" | "id"> | null;
  referrer_profile: Pick<Profile, "email" | "full_name" | "id"> | null;
};

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function parseStatus(value: AdminReferralFilters["status"]) {
  return ["pending", "qualified", "rewarded", "rejected"].includes(String(value))
    ? value as ReferralStatus
    : "all";
}

function parseDate(value: AdminReferralFilters["date"]) {
  return value === "7d" || value === "30d" ? value : "all";
}

function getDateCutoff(date: "7d" | "30d" | "all") {
  if (date === "all") return null;
  const days = date === "7d" ? 7 : 30;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff;
}

export async function requireAdminReferralStaff() {
  const staff = await requireStaff(["owner", "admin_ops", "support"]);

  if (!staff) {
    redirect("/unauthorized");
  }

  return {
    ...staff,
    canManage: staff.roles.some((role) => role === "owner" || role === "admin_ops")
  };
}

export function buildAdminReferralRows(referrals: ReferralWithProfiles[]): AdminReferralRow[] {
  return referrals.map((referral) => ({
    createdAt: referral.created_at,
    id: referral.id,
    qualifiedAt: referral.qualified_at,
    referralCode: referral.referral_code,
    referredEmail: referral.referred_profile?.email ?? "profil-silinmis",
    referredName: referral.referred_profile?.full_name ?? null,
    referredProfileId: referral.referred_profile_id,
    referredRewardLedgerId: referral.referred_reward_ledger_id,
    referrerEmail: referral.referrer_profile?.email ?? "profil-silinmis",
    referrerName: referral.referrer_profile?.full_name ?? null,
    referrerProfileId: referral.referrer_profile_id,
    referrerRewardLedgerId: referral.referrer_reward_ledger_id,
    rewardAmount: referral.status === "rewarded" ? REFERRAL_REFERRER_REWARD * 2 : 0,
    rewardedAt: referral.rewarded_at,
    status: referral.status
  }));
}

export function filterAdminReferralRows(
  rows: AdminReferralRow[],
  filters: AdminReferralFilters = {}
) {
  const status = parseStatus(filters.status);
  const date = parseDate(filters.date);
  const code = normalize(filters.code);
  const q = normalize(filters.q);
  const cutoff = getDateCutoff(date);

  return rows.filter((row) => {
    const matchesStatus = status === "all" || row.status === status;
    const matchesDate = !cutoff || Date.parse(row.createdAt) >= cutoff.getTime();
    const matchesCode = !code || normalize(row.referralCode).includes(code);
    const matchesQuery =
      !q ||
      normalize(row.referrerEmail).includes(q) ||
      normalize(row.referrerName).includes(q) ||
      normalize(row.referredEmail).includes(q) ||
      normalize(row.referredName).includes(q);

    return matchesStatus && matchesDate && matchesCode && matchesQuery;
  });
}

export function buildAdminReferralMetrics(rows: AdminReferralRow[]): AdminReferralMetrics {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const inviteCounts = new Map<string, number>();

  for (const row of rows) {
    inviteCounts.set(row.referrerProfileId, (inviteCounts.get(row.referrerProfileId) ?? 0) + 1);
  }

  return {
    mostInvitingUserCount: Math.max(0, ...inviteCounts.values()),
    pendingReferralCount: rows.filter((row) => row.status === "pending").length,
    rewardedReferralCount: rows.filter((row) => row.status === "rewarded").length,
    totalDistributedIoh: rows.reduce((sum, row) => sum + row.rewardAmount, 0),
    totalReferralCount: rows.length,
    weeklyReferralCount: rows.filter(
      (row) => Date.parse(row.createdAt) >= sevenDaysAgo.getTime()
    ).length
  };
}

export async function getAdminReferralReport(
  filters: AdminReferralFilters = {}
): Promise<AdminReferralReport> {
  const staff = await requireAdminReferralStaff();
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("referrals")
    .select(
      "id, referrer_profile_id, referred_profile_id, referral_code, status, qualified_at, rewarded_at, referrer_reward_ledger_id, referred_reward_ledger_id, created_at, referrer_profile:profiles!referrals_referrer_profile_id_fkey(id, email, full_name), referred_profile:profiles!referrals_referred_profile_id_fkey(id, email, full_name)"
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    throw error;
  }

  const allRows = buildAdminReferralRows((data ?? []) as unknown as ReferralWithProfiles[]);
  const rows = filterAdminReferralRows(allRows, filters);

  return {
    canManage: staff.canManage,
    filters: {
      code: filters.code,
      date: parseDate(filters.date),
      q: filters.q,
      status: parseStatus(filters.status)
    },
    metrics: buildAdminReferralMetrics(allRows),
    rows
  };
}
