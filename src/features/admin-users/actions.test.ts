import { beforeEach, describe, expect, it, vi } from "vitest";
import { adjustAdminUserPoints } from "@/features/admin-users/actions";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

vi.mock("@/features/analytics/business-events", () => ({
  trackServerAnalyticsEvent: vi.fn()
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }
}));

vi.mock("@/features/admin-users/queries", () => ({
  requireAdminUsersPointManager: vi.fn(async () => ({
    roles: ["owner"],
    user: { id: "admin-id" }
  })),
  requireAdminUsersReadStaff: vi.fn()
}));

vi.mock("@/lib/observability", () => ({
  captureError: vi.fn(),
  logInfo: vi.fn()
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: vi.fn()
}));

const { createSupabaseServiceRoleClient } = await import("@/lib/supabase/service-role");
const { trackServerAnalyticsEvent } = await import("@/features/analytics/business-events");

function buildForm(amount: string) {
  const formData = new FormData();
  formData.set("profile_id", "profile-id");
  formData.set("amount", amount);
  formData.set("reason", "Destek duzeltmesi");
  return formData;
}

function buildSupabaseMock(balance = 10) {
  const rpc = vi.fn(async () => ({
    data: [{ balance: balance + 5, ledger_id: "ledger-id" }],
    error: null
  }));

  return {
    client: {
      from: vi.fn((table: string) => {
        if (table === "ioh_point_balances") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(async () => ({
                  data: { balance },
                  error: null
                }))
              }))
            }))
          };
        }

        if (table === "profiles") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                maybeSingle: vi.fn(async () => ({
                  data: { email: "customer@example.com", full_name: "Test Customer" },
                  error: null
                }))
              }))
            }))
          };
        }

        if (table === "email_templates") {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                eq: vi.fn(() => ({
                  maybeSingle: vi.fn(async () => ({
                    data: null,
                    error: null
                  }))
                }))
              }))
            }))
          };
        }

        if (table === "email_events") {
          return {
            insert: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn(async () => ({
                  data: { id: "event-id" },
                  error: null
                }))
              }))
            })),
            update: vi.fn(() => ({
              eq: vi.fn(async () => ({
                data: null,
                error: null
              }))
            }))
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }),
      rpc
    },
    rpc
  };
}

describe("admin users actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows admin to add manual IOH points through the ledger and audit RPC", async () => {
    const supabase = buildSupabaseMock(10);
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(supabase.client as never);

    await expect(adjustAdminUserPoints(buildForm("5"))).rejects.toThrow(
      "NEXT_REDIRECT:/admin/users/profile-id?saved=points"
    );

    expect(supabase.rpc).toHaveBeenCalledWith("adjust_ioh_points_manually", {
      p_actor_profile_id: "admin-id",
      p_amount: 5,
      p_metadata: {
        source: "admin_users_module"
      },
      p_profile_id: "profile-id",
      p_reason_text: "Destek duzeltmesi"
    });
    expect(supabase.rpc).toHaveBeenCalledTimes(1);
    expect(trackServerAnalyticsEvent).toHaveBeenCalledWith({
      eventName: "ioh_points_awarded",
      idempotencyKey: "ledger-id",
      metadata: {
        amount: 5,
        ledger_id: "ledger-id",
        order_id: null,
        reason: "manual_adjustment_credit"
      },
      path: "/admin/users",
      profileId: "profile-id"
    });
  });

  it("prevents negative IOH point balances before writing ledger or audit", async () => {
    const supabase = buildSupabaseMock(3);
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(supabase.client as never);

    await expect(adjustAdminUserPoints(buildForm("-5"))).rejects.toThrow(
      "NEXT_REDIRECT:/admin/users/profile-id?error=negative-balance"
    );

    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
