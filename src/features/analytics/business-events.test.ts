import { beforeEach, describe, expect, it, vi } from "vitest";
import { trackServerAnalyticsEvent } from "@/features/analytics/business-events";

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: vi.fn()
}));
vi.mock("@/lib/observability", () => ({ captureError: vi.fn() }));

const { createSupabaseServiceRoleClient } = await import("@/lib/supabase/service-role");
const { captureError } = await import("@/lib/observability");

describe("business analytics writer", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sanitizes PII before writing an order event", async () => {
    const rpc = vi.fn(async () => ({ data: true, error: null }));
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue({ rpc } as never);

    await expect(
      trackServerAnalyticsEvent({
        eventName: "order_paid",
        idempotencyKey: "order-id",
        metadata: {
          currency: "TRY",
          email: "reader@example.com",
          order_id: "order-id",
          phone: "+905551112233",
          provider: "shopier",
          revenue_minor: 45000
        },
        path: "/checkout/success",
        profileId: "profile-id"
      })
    ).resolves.toBe(true);

    expect(rpc).toHaveBeenCalledWith(
      "record_business_analytics_event",
      expect.objectContaining({
        p_metadata: {
          currency: "TRY",
          order_id: "order-id",
          provider: "shopier",
          revenue_minor: 45000
        }
      })
    );
  });

  it("captures an insert error and resolves false instead of throwing", async () => {
    const rpc = vi.fn(async () => ({ data: null, error: new Error("analytics unavailable") }));
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue({ rpc } as never);

    await expect(
      trackServerAnalyticsEvent({
        eventName: "download_completed",
        metadata: { entitlement_id: "entitlement-id" },
        path: "/account/downloads",
        profileId: "profile-id"
      })
    ).resolves.toBe(false);
    expect(captureError).toHaveBeenCalledWith(expect.anything(), {
      event: "download_completed",
      operation: "analytics.business_event"
    });
  });
});

