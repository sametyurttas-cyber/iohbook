import { describe, expect, it, vi } from "vitest";
import {
  buildAdminReferralMetrics,
  buildAdminReferralRows,
  filterAdminReferralRows,
  getAdminReferralReport,
  requireAdminReferralStaff
} from "@/features/admin-referrals/queries";

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }
}));

vi.mock("@/features/auth/queries", () => ({
  requireStaff: vi.fn()
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: vi.fn()
}));

const { requireStaff } = await import("@/features/auth/queries");
const { createSupabaseServiceRoleClient } = await import("@/lib/supabase/service-role");

const rawReferrals = [
  {
    created_at: new Date().toISOString(),
    id: "referral-1",
    qualified_at: null,
    referral_code: "IOHABC123",
    referred_profile: {
      email: "new@example.com",
      full_name: "New User",
      id: "referred-1"
    },
    referred_profile_id: "referred-1",
    referred_reward_ledger_id: null,
    referrer_profile: {
      email: "referrer@example.com",
      full_name: "Referrer User",
      id: "referrer-1"
    },
    referrer_profile_id: "referrer-1",
    referrer_reward_ledger_id: null,
    rewarded_at: null,
    status: "pending"
  },
  {
    created_at: "2026-06-20T10:00:00.000Z",
    id: "referral-2",
    qualified_at: "2026-06-20T11:00:00.000Z",
    referral_code: "IOHABC123",
    referred_profile: {
      email: "rewarded@example.com",
      full_name: null,
      id: "referred-2"
    },
    referred_profile_id: "referred-2",
    referred_reward_ledger_id: "ledger-referred",
    referrer_profile: {
      email: "referrer@example.com",
      full_name: "Referrer User",
      id: "referrer-1"
    },
    referrer_profile_id: "referrer-1",
    referrer_reward_ledger_id: "ledger-referrer",
    rewarded_at: "2026-06-20T11:05:00.000Z",
    status: "rewarded"
  }
] satisfies Array<Record<string, unknown>>;

function createReferralQueryMock(data: unknown[] = rawReferrals) {
  return {
    from: vi.fn(() => ({
      limit: vi.fn(async () => ({ data, error: null })),
      order() {
        return this;
      },
      select() {
        return this;
      }
    }))
  };
}

describe("admin referral report", () => {
  it("allows owner/admin_ops/support staff to read the report", async () => {
    vi.mocked(requireStaff).mockResolvedValueOnce({
      roles: ["support"],
      user: { id: "support-id" }
    } as never);

    await expect(requireAdminReferralStaff()).resolves.toMatchObject({
      canManage: false,
      roles: ["support"]
    });
    expect(requireStaff).toHaveBeenCalledWith(["owner", "admin_ops", "support"]);
  });

  it("redirects customers and unauthorized roles", async () => {
    vi.mocked(requireStaff).mockResolvedValueOnce(null);

    await expect(requireAdminReferralStaff()).rejects.toThrow("NEXT_REDIRECT:/unauthorized");
  });

  it("calculates report metrics from referral rows", () => {
    const rows = buildAdminReferralRows(rawReferrals as never);

    expect(buildAdminReferralMetrics(rows)).toMatchObject({
      mostInvitingUserCount: 2,
      pendingReferralCount: 1,
      rewardedReferralCount: 1,
      totalDistributedIoh: 200,
      totalReferralCount: 2
    });
  });

  it("filters by status, code and user search", () => {
    const rows = buildAdminReferralRows(rawReferrals as never);

    expect(filterAdminReferralRows(rows, { status: "rewarded" })).toHaveLength(1);
    expect(filterAdminReferralRows(rows, { code: "abc" })).toHaveLength(2);
    expect(filterAdminReferralRows(rows, { q: "new@example.com" })).toHaveLength(1);
  });

  it("returns empty state data without breaking", async () => {
    vi.mocked(requireStaff).mockResolvedValueOnce({
      roles: ["owner"],
      user: { id: "owner-id" }
    } as never);
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValueOnce(
      createReferralQueryMock([]) as never
    );

    await expect(getAdminReferralReport()).resolves.toMatchObject({
      canManage: true,
      metrics: {
        totalReferralCount: 0
      },
      rows: []
    });
  });
});
