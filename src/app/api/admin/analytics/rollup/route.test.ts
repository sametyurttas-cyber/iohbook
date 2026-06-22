import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { refreshAnalyticsRollups } = vi.hoisted(() => ({
  refreshAnalyticsRollups: vi.fn()
}));

vi.mock("@/features/admin-analytics/rollup", () => ({ refreshAnalyticsRollups }));

import { GET } from "@/app/api/admin/analytics/rollup/route";

describe("analytics rollup cron endpoint", () => {
  const originalSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (originalSecret === undefined) {
      delete process.env.CRON_SECRET;
    } else {
      process.env.CRON_SECRET = originalSecret;
    }
  });

  it("does not run when CRON_SECRET is missing", async () => {
    delete process.env.CRON_SECRET;

    const response = await GET(new Request("http://localhost/api/admin/analytics/rollup"));

    expect(response.status).toBe(503);
    expect(refreshAnalyticsRollups).not.toHaveBeenCalled();
  });

  it("rejects requests without the matching bearer secret", async () => {
    process.env.CRON_SECRET = "secret-value";

    const response = await GET(new Request("http://localhost/api/admin/analytics/rollup"));

    expect(response.status).toBe(401);
    expect(refreshAnalyticsRollups).not.toHaveBeenCalled();
  });

  it("refreshes 90 days for an authorized cron request", async () => {
    process.env.CRON_SECRET = "secret-value";
    refreshAnalyticsRollups.mockResolvedValue(90);

    const response = await GET(new Request("http://localhost/api/admin/analytics/rollup", {
      headers: { authorization: "Bearer secret-value" }
    }));

    expect(response.status).toBe(200);
    expect(refreshAnalyticsRollups).toHaveBeenCalledWith(90);
    await expect(response.json()).resolves.toEqual({ days: 90, ok: true, rows: 90 });
  });
});
