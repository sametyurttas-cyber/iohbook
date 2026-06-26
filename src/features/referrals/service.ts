import { randomInt } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { trackServerAnalyticsEvent } from "@/features/analytics/business-events";
import {
  REFERRAL_CODE_ALPHABET,
  REFERRAL_CODE_LENGTH,
  REFERRAL_CODE_PREFIX,
  REFERRAL_REFERRED_REWARD,
  REFERRAL_REFERRER_REWARD
} from "@/features/referrals/config";
import { captureError } from "@/lib/observability";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database, Referral, ReferralCode, ReferralStatus } from "@/types/database";

type ReferralServiceClient = SupabaseClient<Database>;

export type ReferralRpcResult = {
  created?: boolean;
  referralId: string | null;
  status: ReferralStatus | null;
};

export type ReferralAwardResult = {
  applied: boolean;
  referralId: string | null;
  referredLedgerId: string | null;
  referrerLedgerId: string | null;
  status: ReferralStatus | null;
};

export type ReferralSummary = {
  code: string | null;
  invitedCount: number;
  items: {
    createdAt: string;
    id: string;
    label: string;
    qualifiedAt: string | null;
    rewardStatus: "beklemede" | "hazir" | "odullendirildi" | "reddedildi";
    rewardedAt: string | null;
    status: ReferralStatus;
  }[];
  pendingCount: number;
  rewardedCount: number;
  rewardsEarned: number;
};

function getServiceClient(supabase?: ReferralServiceClient) {
  return supabase ?? createSupabaseServiceRoleClient();
}

function isUniqueViolation(error: { code?: string } | null) {
  return error?.code === "23505";
}

export function normalizeReferralCode(code: string | null | undefined) {
  return String(code ?? "").trim().toUpperCase();
}

function isValidReferralCode(code: string) {
  return /^[A-Z0-9]{6,16}$/.test(code);
}

function generateReferralCode() {
  let suffix = "";

  for (let index = 0; index < REFERRAL_CODE_LENGTH; index += 1) {
    suffix += REFERRAL_CODE_ALPHABET[randomInt(REFERRAL_CODE_ALPHABET.length)];
  }

  return `${REFERRAL_CODE_PREFIX}${suffix}`;
}

async function findReferralCodeByProfile(supabase: ReferralServiceClient, profileId: string) {
  const { data, error } = await supabase
    .from("referral_codes")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as ReferralCode | null;
}

export async function getOrCreateReferralCode(
  profileId: string,
  supabaseInput?: ReferralServiceClient
) {
  const supabase = getServiceClient(supabaseInput);
  const existing = await findReferralCodeByProfile(supabase, profileId);

  if (existing) {
    return existing;
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = generateReferralCode();
    const { data, error } = await supabase
      .from("referral_codes")
      .insert({
        code,
        profile_id: profileId
      })
      .select("*")
      .maybeSingle();

    if (!error && data) {
      return data as ReferralCode;
    }

    if (!isUniqueViolation(error)) {
      throw error;
    }

    const racedExisting = await findReferralCodeByProfile(supabase, profileId);
    if (racedExisting) {
      return racedExisting;
    }
  }

  throw new Error("referral_code_generation_failed");
}

function normalizeReferralRow(
  row:
    | {
        created?: boolean;
        referral_id: string | null;
        status: ReferralStatus | null;
      }
    | null
): ReferralRpcResult {
  return {
    created: row?.created,
    referralId: row?.referral_id ?? null,
    status: row?.status ?? null
  };
}

export async function createReferralFromCode(
  referredProfileId: string,
  code: string | null | undefined,
  supabaseInput?: ReferralServiceClient
) {
  const normalizedCode = normalizeReferralCode(code);

  if (!normalizedCode || !isValidReferralCode(normalizedCode)) {
    return {
      created: false,
      referralId: null,
      status: null
    } satisfies ReferralRpcResult;
  }

  const supabase = getServiceClient(supabaseInput);
  const { data, error } = await supabase.rpc("record_referral_signup", {
    p_referral_code: normalizedCode,
    p_referred_profile_id: referredProfileId
  });

  if (error) {
    throw error;
  }

  return normalizeReferralRow(data?.[0] ?? null);
}

export async function qualifyReferralAfterEmailVerified(
  profileId: string,
  supabaseInput?: ReferralServiceClient
) {
  const supabase = getServiceClient(supabaseInput);
  const { data, error } = await supabase.rpc("qualify_referral_after_email_verified", {
    p_profile_id: profileId
  });

  if (error) {
    throw error;
  }

  const row = data?.[0];
  return {
    emailVerified: Boolean(row?.email_verified),
    qualified: Boolean(row?.qualified),
    referralId: row?.referral_id ?? null
  };
}

function normalizeAwardRow(
  row:
    | {
        applied: boolean;
        referral_id: string | null;
        referred_ledger_id: string | null;
        referrer_ledger_id: string | null;
        status: ReferralStatus | null;
      }
    | null
): ReferralAwardResult {
  return {
    applied: Boolean(row?.applied),
    referralId: row?.referral_id ?? null,
    referredLedgerId: row?.referred_ledger_id ?? null,
    referrerLedgerId: row?.referrer_ledger_id ?? null,
    status: row?.status ?? null
  };
}

export async function awardReferralIfEligible(
  profileId: string,
  supabaseInput?: ReferralServiceClient
) {
  const supabase = getServiceClient(supabaseInput);
  const { data, error } = await supabase.rpc("award_referral_if_eligible", {
    p_profile_id: profileId
  });

  if (error) {
    throw error;
  }

  const result = normalizeAwardRow(data?.[0] ?? null);

  if (result.applied && result.referralId) {
    try {
      await trackServerAnalyticsEvent({
        eventName: "referral_rewarded",
        idempotencyKey: result.referralId,
        metadata: {
          referral_id: result.referralId,
          referred_reward_ledger_id: result.referredLedgerId,
          referrer_reward_ledger_id: result.referrerLedgerId,
          reward_each: REFERRAL_REFERRER_REWARD
        },
        path: "/sign-up",
        profileId
      });
    } catch (analyticsError) {
      captureError(analyticsError, {
        operation: "referrals.analytics_rewarded",
        profile_id: profileId,
        referral_id: result.referralId
      });
    }
  }

  return result;
}

export async function getReferralSummary(
  profileId: string,
  supabaseInput?: ReferralServiceClient
): Promise<ReferralSummary> {
  const supabase = getServiceClient(supabaseInput);
  const [code, referralsResult] = await Promise.all([
    getOrCreateReferralCode(profileId, supabase),
    supabase
      .from("referrals")
      .select("id, status, created_at, qualified_at, rewarded_at")
      .eq("referrer_profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(100)
  ]);

  if (referralsResult.error) {
    throw referralsResult.error;
  }

  const referrals = (referralsResult.data ?? []) as Pick<
    Referral,
    "created_at" | "id" | "qualified_at" | "rewarded_at" | "status"
  >[];
  const rewardedCount = referrals.filter((referral) => referral.status === "rewarded").length;

  return {
    code: code.code,
    invitedCount: referrals.length,
    items: referrals.map((referral, index) => ({
      createdAt: referral.created_at,
      id: referral.id,
      label: `Kullanici #${String(index + 1).padStart(2, "0")}`,
      qualifiedAt: referral.qualified_at,
      rewardStatus:
        referral.status === "rewarded"
          ? "odullendirildi"
          : referral.status === "qualified"
            ? "hazir"
            : referral.status === "rejected"
              ? "reddedildi"
              : "beklemede",
      rewardedAt: referral.rewarded_at,
      status: referral.status
    })),
    pendingCount: referrals.filter((referral) => referral.status === "pending").length,
    rewardedCount,
    rewardsEarned: rewardedCount * REFERRAL_REFERRER_REWARD
  };
}

export {
  REFERRAL_REFERRED_REWARD,
  REFERRAL_REFERRER_REWARD
};
