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

import { getAdminDashboardData } from "@/features/admin-dashboard/queries";

type QueryResult = { data: unknown[]; error: null };

function createQueryClient(input?: {
  metrics?: unknown[];
  orders?: unknown[];
  points?: unknown[];
  rpcError?: { code: string; message: string };
  series?: unknown[];
  topPages?: unknown[];
  users?: unknown[];
  verifications?: unknown[];
}) {
  const tableData: Record<string, unknown[]> = {
    ioh_point_ledger: input?.points ?? [],
    orders: input?.orders ?? [],
    profiles: input?.users ?? [],
    verification_submissions: input?.verifications ?? []
  };
  const limits: Record<string, ReturnType<typeof vi.fn>> = {};

  const client = {
    from: vi.fn((table: string) => {
      const result: QueryResult = { data: tableData[table] ?? [], error: null };
      const builder = {
        limit: vi.fn(async () => result),
        order: vi.fn()
      };
      builder.order.mockReturnValue(builder);
      limits[table] = builder.limit;

      return {
        select: vi.fn(() => builder)
      };
    }),
    rpc: vi.fn(async (name: string) => {
      if (input?.rpcError) {
        return { data: null, error: input.rpcError };
      }
      if (name === "get_admin_dashboard_metrics") {
        return { data: input?.metrics ?? [], error: null };
      }
      if (name === "get_admin_dashboard_series") {
        return { data: input?.series ?? [], error: null };
      }
      return { data: input?.topPages ?? [], error: null };
    })
  };

  return { client, limits };
}

describe("admin dashboard queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireStaff.mockResolvedValue({ roles: ["owner"], user: { id: "admin-id" } });
  });

  it("returns the expected dashboard shape and limits operational lists", async () => {
    const { client, limits } = createQueryClient({
      metrics: [{
        new_users_7d: 4,
        page_views_24h: 23,
        paid_orders: 8,
        pending_verifications: 3,
        total_downloads: 11,
        total_ioh_distributed: 420,
        total_revenue_minor: 90000,
        total_users: 16,
        visitors_today: 12
      }],
      orders: [{
        created_at: "2026-06-22T10:00:00Z",
        currency: "TRY",
        customer_name: "Samet",
        id: "order-id",
        order_number: "IOH-1",
        status: "paid",
        total_minor: 100
      }],
      points: [{
        amount: 30,
        created_at: "2026-06-22T10:00:00Z",
        id: "ledger-id",
        profile_id: "profile-id",
        reason: "book_order_reward"
      }],
      series: [{
        day: "2026-06-22",
        ioh_points: 30,
        new_users: 1,
        page_views: 10,
        paid_orders: 1,
        revenue_minor: 100
      }],
      topPages: [{ path: "/books", views: 10 }],
      users: [{
        created_at: "2026-06-22T10:00:00Z",
        email: "reader@example.com",
        full_name: "Reader",
        id: "profile-id"
      }],
      verifications: [{
        created_at: "2026-06-22T10:00:00Z",
        id: "submission-id",
        kind: "amazon_review",
        status: "pending",
        title: "Godcode review"
      }]
    });
    createServiceClient.mockReturnValue(client);

    const result = await getAdminDashboardData();

    expect(result.metrics.pending_verifications).toBe(3);
    expect(result.metrics.total_ioh_distributed).toBe(420);
    expect(result.topPages).toEqual([{ path: "/books", views: 10 }]);
    expect(result.recentOrders[0]).toMatchObject({ orderNumber: "IOH-1", totalMinor: 100 });
    expect(result.series).toHaveLength(1);
    expect(Object.keys(result).sort()).toEqual([
      "metrics",
      "recentOrders",
      "recentPoints",
      "recentUsers",
      "recentVerifications",
      "series",
      "topPages"
    ]);
    expect(Object.values(limits).every((limit) => limit.mock.calls[0]?.[0] === 10)).toBe(true);
  });

  it("rejects non-admin access before creating a service-role client", async () => {
    requireStaff.mockResolvedValue(null);

    await expect(getAdminDashboardData()).rejects.toThrow("REDIRECT:/unauthorized");
    expect(requireStaff).toHaveBeenCalledWith(["owner", "admin_ops"]);
    expect(createServiceClient).not.toHaveBeenCalled();
  });

  it("returns stable zero and empty states when no data exists", async () => {
    const { client } = createQueryClient();
    createServiceClient.mockReturnValue(client);

    const result = await getAdminDashboardData();

    expect(result.metrics).toMatchObject({
      paid_orders: 0,
      pending_verifications: 0,
      total_ioh_distributed: 0,
      total_users: 0
    });
    expect(result.series).toEqual([]);
    expect(result.topPages).toEqual([]);
    expect(result.recentOrders).toEqual([]);
  });

  it("keeps the dashboard available before the aggregate migration is applied", async () => {
    const { client } = createQueryClient({
      rpcError: { code: "PGRST202", message: "Could not find the function" }
    });
    createServiceClient.mockReturnValue(client);

    const result = await getAdminDashboardData();

    expect(result.metrics.total_users).toBe(0);
    expect(result.series).toEqual([]);
    expect(result.topPages).toEqual([]);
  });
});

describe("admin dashboard aggregate migration", () => {
  const sql = readFileSync(
    join(process.cwd(), "supabase/migrations/20260622140000_admin_dashboard_queries.sql"),
    "utf8"
  );

  it("guards every aggregate with owner/admin_ops authorization", () => {
    expect(sql.match(/sr\.role in \('owner', 'admin_ops'\)/g)).toHaveLength(3);
    expect(sql).toContain("grant execute on function public.get_admin_dashboard_metrics(uuid) to service_role");
    expect(sql).toContain("from public, anon, authenticated");
  });

  it("calculates pending verifications, positive IOH distribution and top pages", () => {
    expect(sql).toContain("status in ('pending', 'under_review')");
    expect(sql).toContain("sum(greatest(amount, 0))");
    expect(sql).toContain("group by e.path");
    expect(sql).toContain("limit least(greatest(p_limit, 1), 50)");
  });

  it("prefers daily rollups and falls back to raw page view events", () => {
    expect(sql).toContain("from public.analytics_daily_rollups r");
    expect(sql).toContain("from public.analytics_events e where e.event_name = 'page_view'");
  });
});
