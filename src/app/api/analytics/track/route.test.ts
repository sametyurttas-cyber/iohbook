import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  captureError: vi.fn(),
  getCurrentUser: vi.fn(),
  ingestAnalyticsEvent: vi.fn(),
  serviceRole: {}
}));

vi.mock("@/features/analytics/server", () => ({
  ingestAnalyticsEvent: mocks.ingestAnalyticsEvent
}));
vi.mock("@/features/auth/queries", () => ({ getCurrentUser: mocks.getCurrentUser }));
vi.mock("@/lib/observability", () => ({ captureError: mocks.captureError }));
vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => mocks.serviceRole
}));

const { POST } = await import("@/app/api/analytics/track/route");

function createRequest() {
  return new NextRequest("https://www.iohcoin.com/api/analytics/track", {
    body: JSON.stringify({
      eventId: "6f1c8f34-4b8b-4bf4-9f3c-99c33cf3117a",
      eventName: "page_view",
      sessionId: "32079882-9d8e-4468-a7c8-5b0d07530cdf",
      path: "/books"
    }),
    headers: {
      "content-type": "application/json",
      cookie: `ioh_cookie_preferences=${encodeURIComponent(JSON.stringify({ analytics: true }))}`,
      origin: "https://www.iohcoin.com",
      "user-agent": "Mozilla/5.0 Chrome/126 Safari/537.36"
    },
    method: "POST"
  });
}

describe("POST /api/analytics/track", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentUser.mockResolvedValue({ id: "a17c4989-0a4b-49c5-970b-9936775d1317" });
    mocks.ingestAnalyticsEvent.mockResolvedValue({
      accepted: true,
      anonymousId: "d8d3e21d-f4fc-4585-a441-e842430aef5e",
      createdAnonymousId: true
    });
  });

  it("uses the authenticated server identity instead of client profile data", async () => {
    const response = await POST(createRequest());
    expect(response.status).toBe(202);
    expect(mocks.ingestAnalyticsEvent).toHaveBeenCalledWith(
      expect.objectContaining({ profileId: "a17c4989-0a4b-49c5-970b-9936775d1317" })
    );
    expect(response.headers.get("set-cookie")).toContain("ioh_visitor_id=");
  });

  it("does not collect without analytics consent", async () => {
    const request = new NextRequest("https://www.iohcoin.com/api/analytics/track", {
      body: JSON.stringify({}),
      headers: { origin: "https://www.iohcoin.com" },
      method: "POST"
    });
    const response = await POST(request);
    expect(response.status).toBe(202);
    expect(mocks.ingestAnalyticsEvent).not.toHaveBeenCalled();
  });
});

