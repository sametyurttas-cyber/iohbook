import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  awardReferralIfEligible,
  createReferralFromCode,
  getReferralSummary,
  getOrCreateReferralCode,
  normalizeReferralCode,
  qualifyReferralAfterEmailVerified,
  REFERRAL_REFERRER_REWARD
} from "./service";

vi.mock("@/features/analytics/business-events", () => ({
  trackServerAnalyticsEvent: vi.fn()
}));

vi.mock("@/lib/observability", () => ({
  captureError: vi.fn()
}));

const { trackServerAnalyticsEvent } = await import("@/features/analytics/business-events");

type MockState = {
  awardRows?: {
    applied: boolean;
    referral_id: string | null;
    referred_ledger_id: string | null;
    referrer_ledger_id: string | null;
    status: "pending" | "qualified" | "rewarded" | "rejected" | null;
  }[];
  codeRow?: { code: string; id: string; profile_id: string } | null;
  createCodeError?: { code?: string; message?: string } | null;
  referralRows?: unknown[];
  referralSignupRows?: {
    created: boolean;
    referral_id: string | null;
    status: "pending" | "qualified" | "rewarded" | "rejected" | null;
  }[];
  qualifyRows?: {
    email_verified: boolean;
    qualified: boolean;
    referral_id: string | null;
  }[];
};

function createReferralSupabaseMock(state: MockState = {}) {
  const rpc = vi.fn(async (name: string) => {
    if (name === "record_referral_signup") {
      return {
        data: state.referralSignupRows ?? [
          { created: true, referral_id: "referral-id", status: "pending" }
        ],
        error: null
      };
    }

    if (name === "qualify_referral_after_email_verified") {
      return {
        data: state.qualifyRows ?? [
          { email_verified: true, qualified: true, referral_id: "referral-id" }
        ],
        error: null
      };
    }

    if (name === "award_referral_if_eligible") {
      return {
        data: state.awardRows ?? [
          {
            applied: true,
            referral_id: "referral-id",
            referred_ledger_id: "referred-ledger-id",
            referrer_ledger_id: "referrer-ledger-id",
            status: "rewarded"
          }
        ],
        error: null
      };
    }

    return { data: null, error: new Error(`Unexpected RPC ${name}`) };
  });

  const from = vi.fn((table: string) => ({
    eq() {
      return this;
    },
    insert() {
      return this;
    },
    limit() {
      return this;
    },
    maybeSingle: async () => {
      if (table === "referral_codes") {
        return {
          data: state.codeRow ?? null,
          error: state.createCodeError ?? null
        };
      }

      return { data: null, error: null };
    },
    order() {
      return this;
    },
    select() {
      return this;
    }
  }));

  return { from, rpc };
}

describe("referral service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes referral codes", () => {
    expect(normalizeReferralCode(" iohabc123 ")).toBe("IOHABC123");
  });

  it("creates a unique referral code for a profile", async () => {
    let inserted = false;
    const supabase = {
      from: vi.fn(() => ({
        eq() {
          return this;
        },
        insert(values: { code: string; profile_id: string }) {
          inserted = true;
          expect(values.profile_id).toBe("profile-id");
          expect(values.code).toMatch(/^IOH[A-Z0-9]{8}$/);
          return this;
        },
        maybeSingle: async () => ({
          data: inserted ? { code: "IOHABCDEFGH", id: "code-id", profile_id: "profile-id" } : null,
          error: null
        }),
        select() {
          return this;
        }
      }))
    };

    await expect(getOrCreateReferralCode("profile-id", supabase as never)).resolves.toEqual({
      code: "IOHABCDEFGH",
      id: "code-id",
      profile_id: "profile-id"
    });
  });

  it("does not create a second code for the same profile", async () => {
    const supabase = createReferralSupabaseMock({
      codeRow: { code: "IOHABC123", id: "code-id", profile_id: "profile-id" }
    });

    await expect(getOrCreateReferralCode("profile-id", supabase as never)).resolves.toEqual({
      code: "IOHABC123",
      id: "code-id",
      profile_id: "profile-id"
    });

    expect(supabase.from).toHaveBeenCalledWith("referral_codes");
  });

  it("creates a referral from a valid code", async () => {
    const supabase = createReferralSupabaseMock();

    await expect(
      createReferralFromCode("referred-profile-id", "iohabc123", supabase as never)
    ).resolves.toEqual({
      created: true,
      referralId: "referral-id",
      status: "pending"
    });

    expect(supabase.rpc).toHaveBeenCalledWith("record_referral_signup", {
      p_referral_code: "IOHABC123",
      p_referred_profile_id: "referred-profile-id"
    });
  });

  it("ignores missing or invalid referral codes", async () => {
    const supabase = createReferralSupabaseMock();

    await expect(createReferralFromCode("profile-id", "", supabase as never)).resolves.toEqual({
      created: false,
      referralId: null,
      status: null
    });
    await expect(createReferralFromCode("profile-id", "bad!", supabase as never)).resolves.toEqual({
      created: false,
      referralId: null,
      status: null
    });

    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("returns the existing referral when the referred user already has one", async () => {
    const supabase = createReferralSupabaseMock({
      referralSignupRows: [
        { created: false, referral_id: "existing-referral-id", status: "pending" }
      ]
    });

    await expect(
      createReferralFromCode("referred-profile-id", "IOHABC123", supabase as never)
    ).resolves.toEqual({
      created: false,
      referralId: "existing-referral-id",
      status: "pending"
    });
  });

  it("qualifies a referral only after email verification", async () => {
    const supabase = createReferralSupabaseMock({
      qualifyRows: [{ email_verified: false, qualified: false, referral_id: null }]
    });

    await expect(qualifyReferralAfterEmailVerified("profile-id", supabase as never)).resolves.toEqual({
      emailVerified: false,
      qualified: false,
      referralId: null
    });
  });

  it("awards verified referrals and tracks analytics", async () => {
    const supabase = createReferralSupabaseMock();

    await expect(awardReferralIfEligible("profile-id", supabase as never)).resolves.toEqual({
      applied: true,
      referralId: "referral-id",
      referredLedgerId: "referred-ledger-id",
      referrerLedgerId: "referrer-ledger-id",
      status: "rewarded"
    });

    expect(supabase.rpc).toHaveBeenCalledWith("award_referral_if_eligible", {
      p_profile_id: "profile-id"
    });
    expect(trackServerAnalyticsEvent).toHaveBeenCalledWith({
      eventName: "referral_rewarded",
      idempotencyKey: "referral-id",
      metadata: {
        referral_id: "referral-id",
        referred_reward_ledger_id: "referred-ledger-id",
        referrer_reward_ledger_id: "referrer-ledger-id",
        reward_each: REFERRAL_REFERRER_REWARD
      },
      path: "/sign-up",
      profileId: "profile-id"
    });
  });

  it("does not award a referral twice", async () => {
    const supabase = createReferralSupabaseMock({
      awardRows: [
        {
          applied: false,
          referral_id: "referral-id",
          referred_ledger_id: "referred-ledger-id",
          referrer_ledger_id: "referrer-ledger-id",
          status: "rewarded"
        }
      ]
    });

    await expect(awardReferralIfEligible("profile-id", supabase as never)).resolves.toEqual({
      applied: false,
      referralId: "referral-id",
      referredLedgerId: "referred-ledger-id",
      referrerLedgerId: "referrer-ledger-id",
      status: "rewarded"
    });
    expect(trackServerAnalyticsEvent).not.toHaveBeenCalled();
  });

  it("returns a masked referral summary without referred personal data", async () => {
    const referrals = [
      {
        created_at: "2026-06-23T10:00:00.000Z",
        id: "referral-1",
        qualified_at: null,
        rewarded_at: null,
        status: "pending"
      },
      {
        created_at: "2026-06-22T10:00:00.000Z",
        id: "referral-2",
        qualified_at: "2026-06-22T11:00:00.000Z",
        rewarded_at: "2026-06-22T11:05:00.000Z",
        status: "rewarded"
      }
    ];
    const supabase = {
      from: vi.fn((table: string) => ({
        eq() {
          return this;
        },
        insert() {
          return this;
        },
        limit: async () => ({
          data: table === "referrals" ? referrals : null,
          error: null
        }),
        maybeSingle: async () => ({
          data: table === "referral_codes"
            ? { code: "IOHABC123", id: "code-id", profile_id: "profile-id" }
            : null,
          error: null
        }),
        order() {
          return this;
        },
        select() {
          return this;
        }
      }))
    };

    await expect(getReferralSummary("profile-id", supabase as never)).resolves.toMatchObject({
      code: "IOHABC123",
      invitedCount: 2,
      items: [
        {
          id: "referral-1",
          label: "Kullanici #01",
          rewardStatus: "beklemede",
          status: "pending"
        },
        {
          id: "referral-2",
          label: "Kullanici #02",
          rewardStatus: "odullendirildi",
          status: "rewarded"
        }
      ],
      pendingCount: 1,
      rewardedCount: 1,
      rewardsEarned: REFERRAL_REFERRER_REWARD
    });
  });
});
