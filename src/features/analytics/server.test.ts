import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetAnalyticsRateLimitForTests } from "@/features/analytics/rate-limit";
import { ingestAnalyticsEvent, type AnalyticsRpcClient } from "@/features/analytics/server";

const payload = {
  eventId: "6f1c8f34-4b8b-4bf4-9f3c-99c33cf3117a",
  eventName: "page_view" as const,
  sessionId: "32079882-9d8e-4468-a7c8-5b0d07530cdf",
  path: "/books",
  metadata: {}
};

describe("analytics ingestion", () => {
  beforeEach(() => resetAnalyticsRateLimitForTests());

  it("inserts a page view and binds the authenticated profile", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
    const result = await ingestAnalyticsEvent({
      client: { rpc } as AnalyticsRpcClient,
      payload,
      anonymousId: "d8d3e21d-f4fc-4585-a441-e842430aef5e",
      profileId: "a17c4989-0a4b-49c5-970b-9936775d1317",
      userAgent: "Mozilla/5.0 Chrome/126 Safari/537.36",
      siteOrigin: "https://www.iohcoin.com",
      country: "tr"
    });

    expect(result.accepted).toBe(true);
    expect(rpc).toHaveBeenCalledWith(
      "record_analytics_event",
      expect.objectContaining({
        p_event_name: "page_view",
        p_profile_id: "a17c4989-0a4b-49c5-970b-9936775d1317",
        p_country: "TR"
      })
    );
    expect(rpc.mock.calls[0][1].p_user_agent_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(rpc.mock.calls[0][1])).not.toContain("Chrome/126");
  });

  it("generates an anonymous visitor id when the cookie is absent", async () => {
    const rpc = vi.fn().mockResolvedValue({ data: true, error: null });
    const result = await ingestAnalyticsEvent({
      client: { rpc } as AnalyticsRpcClient,
      payload,
      anonymousId: null,
      profileId: null,
      userAgent: "Mozilla/5.0 Firefox/127",
      siteOrigin: "https://www.iohcoin.com",
      country: null
    });

    expect(result.createdAnonymousId).toBe(true);
    expect(result.anonymousId).toMatch(/^[0-9a-f-]{36}$/);
    expect(rpc).toHaveBeenCalledWith(
      "record_analytics_event",
      expect.objectContaining({ p_anonymous_id: result.anonymousId })
    );
  });

  it("does not write events for a bot user-agent", async () => {
    const rpc = vi.fn();
    const result = await ingestAnalyticsEvent({
      client: { rpc } as unknown as AnalyticsRpcClient,
      payload,
      anonymousId: null,
      profileId: null,
      userAgent: "Googlebot/2.1",
      siteOrigin: "https://www.iohcoin.com",
      country: null
    });

    expect(result).toMatchObject({ accepted: false, reason: "bot" });
    expect(rpc).not.toHaveBeenCalled();
  });
});

