import { describe, expect, it, vi } from "vitest";
import {
  awardBookOrderRewardForPaidOrder,
  awardSignupBonus,
  BOOK_ORDER_REWARD_POINTS,
  SIGNUP_BONUS_POINTS
} from "./service";

vi.mock("@/features/analytics/business-events", () => ({
  trackServerAnalyticsEvent: vi.fn()
}));

const { trackServerAnalyticsEvent } = await import("@/features/analytics/business-events");

function createRpcSupabaseMock(
  row = { applied: true, balance: 10, ledger_id: "ledger-id" as string | null }
) {
  const rpc = vi.fn(async () => ({
    data: [row],
    error: null
  }));

  return {
    rpc
  };
}

function createOrderLookupSupabaseMock(input: {
  awardRow?: {
    applied: boolean;
    balance: number;
    ledger_id: string | null;
  };
  fulfillmentType?: string;
  profileId: string | null;
  productType: string | null;
}) {
  const rpc = vi.fn(async () => ({
    data: [input.awardRow ?? { applied: true, balance: 40, ledger_id: "ledger-id" }],
    error: null
  }));

  return {
    from: vi.fn(() => ({
      select() {
        return this;
      },
      eq() {
        return this;
      },
      maybeSingle: async () => ({
        data: {
          profile_id: input.profileId,
          order_items: [
            {
              fulfillment_type: input.fulfillmentType ?? "physical",
              variant_id: "variant-id",
              product_variants: {
                products: {
                  type: input.productType
                }
              }
            }
          ]
        },
        error: null
      })
    })),
    rpc
  };
}

describe("IOH points service", () => {
  it("awards the signup bonus through the idempotent RPC", async () => {
    const supabase = createRpcSupabaseMock();

    await expect(
      awardSignupBonus({
        profileId: "profile-id",
        supabase: supabase as never
      })
    ).resolves.toEqual({
      applied: true,
      balance: 10,
      ledgerId: "ledger-id"
    });

    expect(supabase.rpc).toHaveBeenCalledWith("award_ioh_points", {
      p_amount: SIGNUP_BONUS_POINTS,
      p_metadata: {
        source: "auth_signup"
      },
      p_order_id: null,
      p_profile_id: "profile-id",
      p_reason: "signup_bonus"
    });
    expect(trackServerAnalyticsEvent).toHaveBeenCalledWith({
      eventName: "ioh_points_awarded",
      idempotencyKey: "ledger-id",
      metadata: {
        amount: SIGNUP_BONUS_POINTS,
        ledger_id: "ledger-id",
        order_id: null,
        reason: "signup_bonus"
      },
      path: "/account/profile",
      profileId: "profile-id"
    });
  });

  it("does not apply the signup bonus twice when the RPC reports an idempotent duplicate", async () => {
    const supabase = createRpcSupabaseMock({
      applied: false,
      balance: 10,
      ledger_id: null
    });

    await expect(
      awardSignupBonus({
        profileId: "profile-id",
        supabase: supabase as never
      })
    ).resolves.toEqual({
      applied: false,
      balance: 10,
      ledgerId: null
    });
  });

  it("awards book order reward only for profile orders containing book products", async () => {
    const supabase = createOrderLookupSupabaseMock({
      productType: "book",
      profileId: "profile-id"
    });

    await awardBookOrderRewardForPaidOrder({
      orderId: "order-id",
      supabase: supabase as never
    });

    expect(supabase.rpc).toHaveBeenCalledWith("award_ioh_points", {
      p_amount: BOOK_ORDER_REWARD_POINTS,
      p_metadata: {
        source: "payment_confirmation"
      },
      p_order_id: "order-id",
      p_profile_id: "profile-id",
      p_reason: "book_order_reward"
    });
  });

  it("awards the book order reward for a digital book", async () => {
    const supabase = createOrderLookupSupabaseMock({
      fulfillmentType: "digital",
      productType: "book",
      profileId: "profile-id"
    });

    await awardBookOrderRewardForPaidOrder({
      orderId: "order-id",
      supabase: supabase as never
    });

    expect(supabase.rpc).toHaveBeenCalledWith(
      "award_ioh_points",
      expect.objectContaining({
        p_amount: BOOK_ORDER_REWARD_POINTS,
        p_order_id: "order-id",
        p_reason: "book_order_reward"
      })
    );
  });

  it("does not apply the same book order reward twice when the RPC reports an idempotent duplicate", async () => {
    const supabase = createOrderLookupSupabaseMock({
      awardRow: {
        applied: false,
        balance: 40,
        ledger_id: null
      },
      productType: "book",
      profileId: "profile-id"
    });

    await expect(
      awardBookOrderRewardForPaidOrder({
        orderId: "order-id",
        supabase: supabase as never
      })
    ).resolves.toEqual({
      applied: false,
      balance: 40,
      ledgerId: null
    });
  });

  it("skips book order reward for guest orders", async () => {
    const supabase = createOrderLookupSupabaseMock({
      productType: "book",
      profileId: null
    });

    await expect(
      awardBookOrderRewardForPaidOrder({
        orderId: "order-id",
        supabase: supabase as never
      })
    ).resolves.toEqual({
      applied: false,
      balance: 0,
      ledgerId: null
    });

    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("skips book order reward when the paid order is not a book order", async () => {
    const supabase = createOrderLookupSupabaseMock({
      productType: "nft",
      profileId: "profile-id"
    });

    await awardBookOrderRewardForPaidOrder({
      orderId: "order-id",
      supabase: supabase as never
    });

    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("skips book order reward for claimable book items", async () => {
    const supabase = createOrderLookupSupabaseMock({
      fulfillmentType: "claimable",
      productType: "book",
      profileId: "profile-id"
    });

    await awardBookOrderRewardForPaidOrder({
      orderId: "order-id",
      supabase: supabase as never
    });

    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
