import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { createServiceClient, redirect, requireStaff } = vi.hoisted(() => ({
  createServiceClient: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
  requireStaff: vi.fn()
}));

vi.mock("next/navigation", () => ({ redirect }));
vi.mock("@/features/auth/queries", () => ({ requireStaff }));
vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: createServiceClient
}));

import {
  getAdminAnalyticsData,
  normalizeAdminAnalyticsReport,
  parseAnalyticsRange
} from "@/features/admin-analytics/queries";

describe("admin analytics report normalization", () => {
  it("sorts top pages and keeps the funnel in product order", () => {
    const data = normalizeAdminAnalyticsReport({
      funnel: [
        { count: 2, event_name: "order_paid" },
        { count: 100, event_name: "page_view" },
        { count: 8, event_name: "add_to_cart" }
      ],
      top_pages: [
        { path: "/contact", views: 4 },
        { path: "/books", views: 20 },
        { path: "/", views: 12 }
      ]
    }, 30, true);

    expect(data.topPages.map((row) => row.path)).toEqual(["/books", "/", "/contact"]);
    expect(data.funnel.map((row) => row.eventName)).toEqual([
      "page_view",
      "signup",
      "book_view",
      "add_to_cart",
      "checkout_started",
      "order_paid",
      "download_completed",
      "amazon_verification_submitted"
    ]);
    expect(data.funnel.find((row) => row.eventName === "signup")?.count).toBe(0);
  });

  it("returns stable empty data and validates allowed ranges", () => {
    const data = normalizeAdminAnalyticsReport({}, 7, false);

    expect(data.summary.pageViews).toBe(0);
    expect(data.series).toEqual([]);
    expect(data.topPages).toEqual([]);
    expect(parseAnalyticsRange("7")).toBe(7);
    expect(parseAnalyticsRange("90")).toBe(90);
    expect(parseAnalyticsRange("invalid")).toBe(30);
  });
});

describe("admin analytics access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows support to read but marks the report read-only", async () => {
    requireStaff.mockResolvedValue({ roles: ["support"], user: { id: "support-id" } });
    createServiceClient.mockReturnValue({
      rpc: vi.fn().mockResolvedValue({ data: { summary: { page_views: 5 } }, error: null })
    });

    const data = await getAdminAnalyticsData(30);

    expect(requireStaff).toHaveBeenCalledWith(["owner", "admin_ops", "support"]);
    expect(data.canRefresh).toBe(false);
    expect(data.summary.pageViews).toBe(5);
  });

  it("rejects non-admin users before service-role access", async () => {
    requireStaff.mockResolvedValue(null);

    await expect(getAdminAnalyticsData(30)).rejects.toThrow("REDIRECT:/unauthorized");
    expect(createServiceClient).not.toHaveBeenCalled();
  });

  it("keeps the page available when the analytics RPC is not migrated", async () => {
    requireStaff.mockResolvedValue({ roles: ["owner"], user: { id: "owner-id" } });
    createServiceClient.mockReturnValue({
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { code: "PGRST202", message: "Could not find the function" }
      })
    });

    const data = await getAdminAnalyticsData(30);

    expect(data.rollupAvailable).toBe(false);
    expect(data.summary.pageViews).toBe(0);
  });
});

describe("analytics rollup migration", () => {
  const sql = readFileSync(
    join(process.cwd(), "supabase/migrations/20260622150000_analytics_rollups_and_reports.sql"),
    "utf8"
  );

  it("upserts the same day idempotently", () => {
    expect(sql).toContain("on conflict (day) do update set");
    expect(sql).toContain("page_views = excluded.page_views");
    expect(sql).toContain("updated_at = now()");
  });

  it("aggregates every required daily metric", () => {
    for (const metric of [
      "page_views",
      "unique_visitors",
      "signups",
      "orders_paid",
      "revenue_minor",
      "downloads",
      "amazon_submissions",
      "ioh_points_awarded"
    ]) {
      expect(sql).toContain(metric);
    }
  });

  it("counts range visitors once instead of summing daily uniques", () => {
    expect(sql).toContain("select count(distinct coalesce(profile_id::text, anonymous_id))");
    expect(sql).not.toContain("select sum(unique_visitors) from public.analytics_daily_rollups");
  });

  it("keeps rollup execution service-role only and report reads role checked", () => {
    expect(sql).toContain("grant execute on function public.refresh_analytics_daily_rollups(integer) to service_role");
    expect(sql).toContain("sr.role in ('owner', 'admin_ops', 'support')");
    expect(sql).toContain("from public, anon, authenticated");
  });
});

describe("admin analytics navigation", () => {
  it("shows analytics only to owner, admin_ops and support staff", () => {
    const layout = readFileSync(join(process.cwd(), "src/app/admin/layout.tsx"), "utf8");

    expect(layout).toContain('href: "/admin/analytics"');
    expect(layout).toContain('allowedRoles: ["owner", "admin_ops", "support"]');
  });
});
