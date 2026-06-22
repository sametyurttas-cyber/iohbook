import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  awardBookOrderRewardForPaidOrder,
  awardSignupBonus,
  BOOK_ORDER_REWARD_POINTS,
  SIGNUP_BONUS_POINTS,
  POINTS_EMAIL_CONFIG
} from "./service";

vi.mock("@/features/analytics/business-events", () => ({
  trackServerAnalyticsEvent: vi.fn()
}));

vi.mock("@/features/email/service", () => ({
  sendTransactionalEmail: vi.fn(() => Promise.resolve({ ok: true, provider: "resend", messageId: "msg-id" }))
}));

vi.mock("@/lib/observability", () => ({
  captureError: vi.fn(),
  logInfo: vi.fn(),
  logWarning: vi.fn(),
  observeAsync: vi.fn((_name, _context, op) => op())
}));

const { trackServerAnalyticsEvent } = await import("@/features/analytics/business-events");
const { sendTransactionalEmail } = await import("@/features/email/service");

function createRpcSupabaseMock(
  row = { applied: true, balance: 10, ledger_id: "ledger-id" as string | null },
  profileRow = { email: "customer@example.com", full_name: "Test Customer" }
) {
  const rpc = vi.fn(async () => ({
    data: [row],
    error: null
  }));

  const from = vi.fn(() => ({
    select() {
      return this;
    },
    eq() {
      return this;
    },
    maybeSingle: async () => ({
      data: profileRow,
      error: null
    })
  }));

  return {
    rpc,
    from
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
  profileRow?: { email: string; full_name: string } | null;
}) {
  const rpc = vi.fn(async () => ({
    data: [input.awardRow ?? { applied: true, balance: 40, ledger_id: "ledger-id" }],
    error: null
  }));

  const from = vi.fn((table: string) => {
    if (table === "profiles") {
      return {
        select() {
          return this;
        },
        eq() {
          return this;
        },
        maybeSingle: async () => ({
          data: input.profileRow !== undefined ? input.profileRow : { email: "customer@example.com", full_name: "Test Customer" },
          error: null
        })
      };
    }
    return {
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
    };
  });

  return {
    from,
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

  describe("points email notifications", () => {
    beforeEach(() => {
      vi.clearAllMocks();
      // Restore default config before each test
      POINTS_EMAIL_CONFIG.sendEmailForPointReasons = [
        "amazon_review_verification",
        "amazon_purchase_verification",
        "manual_adjustment_credit",
        "bulk_campaign_reward"
      ];
      POINTS_EMAIL_CONFIG.minimumPointsForEmail = 1;
    });

    it("triggers email for allowed reasons and points amount", async () => {
      const supabase = createRpcSupabaseMock();

      const { awardIohPoints } = await import("./service");
      await awardIohPoints({
        amount: 30,
        profileId: "profile-id",
        reason: "amazon_review_verification",
        supabase: supabase as never
      });

      expect(sendTransactionalEmail).toHaveBeenCalledWith({
        templateKey: "points_awarded",
        to: "customer@example.com",
        profileId: "profile-id",
        orderId: null,
        variables: {
          userName: "Test Customer",
          pointsAmount: 30,
          pointsReason: "Amazon yorum doğrulaması",
          currentBalance: 10,
          accountUrl: expect.stringContaining("/account")
        },
        metadata: {
          ledger_id: "ledger-id"
        }
      });
    });

    it("skips email if point reason is not configured in sendEmailForPointReasons", async () => {
      const supabase = createRpcSupabaseMock();

      const { awardIohPoints } = await import("./service");
      await awardIohPoints({
        amount: 30,
        profileId: "profile-id",
        reason: "signup_bonus",
        supabase: supabase as never
      });

      expect(sendTransactionalEmail).not.toHaveBeenCalled();
    });

    it("skips email if point amount is less than minimumPointsForEmail", async () => {
      POINTS_EMAIL_CONFIG.minimumPointsForEmail = 50;
      const supabase = createRpcSupabaseMock();

      const { awardIohPoints } = await import("./service");
      await awardIohPoints({
        amount: 30,
        profileId: "profile-id",
        reason: "amazon_review_verification",
        supabase: supabase as never
      });

      expect(sendTransactionalEmail).not.toHaveBeenCalled();
    });

    it("skips email on duplicate/not-applied point transactions", async () => {
      const supabase = createRpcSupabaseMock({
        applied: false,
        balance: 10,
        ledger_id: null
      });

      const { awardIohPoints } = await import("./service");
      await awardIohPoints({
        amount: 30,
        profileId: "profile-id",
        reason: "amazon_review_verification",
        supabase: supabase as never
      });

      expect(sendTransactionalEmail).not.toHaveBeenCalled();
    });

    it("isolates side-effects and does not fail point award even if email fails", async () => {
      vi.mocked(sendTransactionalEmail).mockRejectedValueOnce(new Error("Email server dead"));
      const supabase = createRpcSupabaseMock();

      const { awardIohPoints } = await import("./service");
      const result = await awardIohPoints({
        amount: 30,
        profileId: "profile-id",
        reason: "amazon_review_verification",
        supabase: supabase as never
      });

      expect(result.applied).toBe(true);
      expect(sendTransactionalEmail).toHaveBeenCalled();
    });
  });
});
