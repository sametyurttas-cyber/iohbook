import type { Database, IohPointsReason } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

type ServiceClient = SupabaseClient<Database>;

export const SIGNUP_BONUS_POINTS = 10;
export const BOOK_ORDER_REWARD_POINTS = 30;

type AwardPointsResult = {
  applied: boolean;
  balance: number;
  ledgerId: string | null;
};

type AwardPointsInput = {
  amount: number;
  metadata?: Record<string, unknown>;
  orderId?: string | null;
  profileId: string;
  reason: IohPointsReason;
  supabase: ServiceClient;
};

type OrderRewardLookup = {
  profile_id: string | null;
  order_items?: {
    fulfillment_type: string | null;
    variant_id: string | null;
    product_variants?: unknown;
  }[];
};

function firstRecord(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) {
    return firstRecord(value[0]);
  }

  if (value && typeof value === "object") {
    return value as Record<string, unknown>;
  }

  return null;
}

function getProductTypeFromOrderItem(item: NonNullable<OrderRewardLookup["order_items"]>[number]) {
  const variant = firstRecord(item.product_variants);
  const product = firstRecord(variant?.products);
  const type = product?.type;

  return typeof type === "string" ? type : null;
}

function normalizeAwardRows(
  rows:
    | {
        applied: boolean;
        balance: number;
        ledger_id: string | null;
      }[]
    | null
) {
  const row = rows?.[0];

  return {
    applied: Boolean(row?.applied),
    balance: row?.balance ?? 0,
    ledgerId: row?.ledger_id ?? null
  } satisfies AwardPointsResult;
}

export async function awardIohPoints(input: AwardPointsInput) {
  const { data, error } = await input.supabase.rpc("award_ioh_points", {
    p_amount: input.amount,
    p_metadata: input.metadata ?? {},
    p_order_id: input.orderId ?? null,
    p_profile_id: input.profileId,
    p_reason: input.reason
  });

  if (error) {
    throw error;
  }

  return normalizeAwardRows(data);
}

export async function awardSignupBonus(input: {
  profileId: string;
  supabase: ServiceClient;
}) {
  return awardIohPoints({
    amount: SIGNUP_BONUS_POINTS,
    metadata: {
      source: "auth_signup"
    },
    profileId: input.profileId,
    reason: "signup_bonus",
    supabase: input.supabase
  });
}

export async function awardBookOrderRewardForPaidOrder(input: {
  orderId: string;
  supabase: ServiceClient;
}) {
  const { data, error } = await input.supabase
    .from("orders")
    .select("profile_id, order_items(variant_id, fulfillment_type, product_variants(products(type)))")
    .eq("id", input.orderId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const order = data as unknown as OrderRewardLookup | null;

  if (!order?.profile_id) {
    return {
      applied: false,
      balance: 0,
      ledgerId: null
    } satisfies AwardPointsResult;
  }

  const hasRewardableBookItem = (order.order_items ?? []).some(
    (item) =>
      ["physical", "digital", "hybrid"].includes(String(item.fulfillment_type)) &&
      getProductTypeFromOrderItem(item) === "book"
  );

  if (!hasRewardableBookItem) {
    return {
      applied: false,
      balance: 0,
      ledgerId: null
    } satisfies AwardPointsResult;
  }

  return awardIohPoints({
    amount: BOOK_ORDER_REWARD_POINTS,
    metadata: {
      source: "payment_confirmation"
    },
    orderId: input.orderId,
    profileId: order.profile_id,
    reason: "book_order_reward",
    supabase: input.supabase
  });
}
