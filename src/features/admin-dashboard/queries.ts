import { redirect } from "next/navigation";
import { requireStaff } from "@/features/auth/queries";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type {
  AdminDashboardMetrics,
  AdminDashboardSeriesPoint,
  AdminDashboardTopPage,
  IohPointsReason,
  OrderStatus,
  SubmissionKind,
  SubmissionStatus
} from "@/types/database";

const EMPTY_METRICS: AdminDashboardMetrics = {
  new_users_7d: 0,
  page_views_24h: 0,
  paid_orders: 0,
  pending_verifications: 0,
  total_downloads: 0,
  total_ioh_distributed: 0,
  total_revenue_minor: 0,
  total_users: 0,
  visitors_today: 0
};

function isMissingDashboardRpc(error: { code?: string; message?: string } | null) {
  return (
    error?.code === "PGRST202" ||
    error?.code === "42883" ||
    error?.message?.includes("Could not find the function")
  );
}

export type DashboardRecentOrder = {
  createdAt: string;
  currency: string;
  customerName: string | null;
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalMinor: number;
};

export type DashboardRecentUser = {
  createdAt: string;
  email: string;
  fullName: string | null;
  id: string;
};

export type DashboardRecentVerification = {
  createdAt: string;
  id: string;
  kind: SubmissionKind;
  status: SubmissionStatus;
  title: string;
};

export type DashboardRecentPoint = {
  amount: number;
  createdAt: string;
  id: string;
  profileId: string;
  reason: IohPointsReason;
};

export type AdminDashboardData = {
  metrics: AdminDashboardMetrics;
  recentOrders: DashboardRecentOrder[];
  recentPoints: DashboardRecentPoint[];
  recentUsers: DashboardRecentUser[];
  recentVerifications: DashboardRecentVerification[];
  series: AdminDashboardSeriesPoint[];
  topPages: AdminDashboardTopPage[];
};

export async function requireAdminDashboardStaff() {
  const staff = await requireStaff(["owner", "admin_ops"]);

  if (!staff) {
    redirect("/unauthorized");
  }

  return staff;
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const staff = await requireAdminDashboardStaff();
  const supabase = createSupabaseServiceRoleClient();
  const actorId = staff.user.id;

  const [
    metricsResult,
    seriesResult,
    topPagesResult,
    ordersResult,
    usersResult,
    verificationsResult,
    pointsResult
  ] = await Promise.all([
    supabase.rpc("get_admin_dashboard_metrics", { p_actor_profile_id: actorId }),
    supabase.rpc("get_admin_dashboard_series", {
      p_actor_profile_id: actorId,
      p_days: 30
    }),
    supabase.rpc("get_admin_dashboard_top_pages", {
      p_actor_profile_id: actorId,
      p_limit: 10
    }),
    supabase
      .from("orders")
      .select("id, order_number, customer_name, status, total_minor, currency, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("profiles")
      .select("id, email, full_name, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("verification_submissions")
      .select("id, title, kind, status, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("ioh_point_ledger")
      .select("id, profile_id, amount, reason, created_at")
      .order("created_at", { ascending: false })
      .limit(10)
  ]);

  const operationalResults = [ordersResult, usersResult, verificationsResult, pointsResult];
  const failed = operationalResults.find((result) => result.error);

  if (failed?.error) {
    throw failed.error;
  }

  for (const result of [metricsResult, seriesResult, topPagesResult]) {
    if (result.error && !isMissingDashboardRpc(result.error)) {
      throw result.error;
    }
  }

  return {
    metrics: metricsResult.error ? EMPTY_METRICS : (metricsResult.data?.[0] ?? EMPTY_METRICS),
    recentOrders: (ordersResult.data ?? []).map((order) => ({
      createdAt: order.created_at,
      currency: order.currency,
      customerName: order.customer_name,
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      totalMinor: order.total_minor
    })),
    recentPoints: (pointsResult.data ?? []).map((entry) => ({
      amount: entry.amount,
      createdAt: entry.created_at,
      id: entry.id,
      profileId: entry.profile_id,
      reason: entry.reason
    })),
    recentUsers: (usersResult.data ?? []).map((profile) => ({
      createdAt: profile.created_at,
      email: profile.email,
      fullName: profile.full_name,
      id: profile.id
    })),
    recentVerifications: (verificationsResult.data ?? []).map((submission) => ({
      createdAt: submission.created_at,
      id: submission.id,
      kind: submission.kind,
      status: submission.status,
      title: submission.title
    })),
    series: seriesResult.error ? [] : (seriesResult.data ?? []),
    topPages: topPagesResult.error ? [] : (topPagesResult.data ?? [])
  };
}
