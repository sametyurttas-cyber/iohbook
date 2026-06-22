import { redirect } from "next/navigation";
import { requireStaff } from "@/features/auth/queries";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export type AnalyticsRange = 7 | 30 | 90;

export type AnalyticsSummary = {
  downloads: number;
  ordersPaid: number;
  pageViews: number;
  revenueMinor: number;
  signups: number;
  uniqueVisitors: number;
};

export type AnalyticsSeriesPoint = {
  amazonSubmissions: number;
  day: string;
  downloads: number;
  iohPointsAwarded: number;
  ordersPaid: number;
  pageViews: number;
  revenueMinor: number;
  signups: number;
  uniqueVisitors: number;
};

export type AnalyticsBreakdownRow = { label: string; views: number };
export type AnalyticsTopPage = { path: string; views: number };
export type AnalyticsFunnelRow = { count: number; eventName: string };
export type AnalyticsEncyclopediaRow = {
  entitySlug: string;
  entityTitle: string;
  entityType: "character" | "city" | "faction";
  views: number;
};

export type AdminAnalyticsData = {
  canRefresh: boolean;
  devices: AnalyticsBreakdownRow[];
  encyclopedia: AnalyticsEncyclopediaRow[];
  funnel: AnalyticsFunnelRow[];
  range: AnalyticsRange;
  referrers: AnalyticsBreakdownRow[];
  rollupAvailable: boolean;
  series: AnalyticsSeriesPoint[];
  summary: AnalyticsSummary;
  topPages: AnalyticsTopPage[];
  trafficSources: AnalyticsBreakdownRow[];
  utmCampaigns: AnalyticsBreakdownRow[];
};

const FUNNEL_EVENTS = [
  "page_view",
  "signup",
  "book_view",
  "add_to_cart",
  "checkout_started",
  "order_paid",
  "download_completed",
  "amazon_verification_submitted"
] as const;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function asNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function breakdownRows(value: unknown): AnalyticsBreakdownRow[] {
  return asArray(value)
    .map((item) => {
      const row = asRecord(item);
      return { label: asString(row.label) || "unknown", views: asNumber(row.views) };
    })
    .sort((a, b) => b.views - a.views || a.label.localeCompare(b.label));
}

function isMissingAnalyticsRpc(error: { code?: string; message?: string } | null) {
  return (
    error?.code === "PGRST202" ||
    error?.code === "42883" ||
    error?.message?.includes("Could not find the function")
  );
}

export function parseAnalyticsRange(value: string | string[] | undefined): AnalyticsRange {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === "7" || candidate === "90" ? Number(candidate) as 7 | 90 : 30;
}

export function normalizeAdminAnalyticsReport(
  value: unknown,
  range: AnalyticsRange,
  canRefresh: boolean,
  rollupAvailable = true
): AdminAnalyticsData {
  const root = asRecord(value);
  const summary = asRecord(root.summary);
  const funnelCounts = new Map(
    asArray(root.funnel).map((item) => {
      const row = asRecord(item);
      return [asString(row.event_name), asNumber(row.count)] as const;
    })
  );

  return {
    canRefresh,
    devices: breakdownRows(root.devices),
    encyclopedia: asArray(root.encyclopedia)
      .map((item) => {
        const row = asRecord(item);
        const entityType = asString(row.entity_type);
        if (!(["character", "city", "faction"] as string[]).includes(entityType)) return null;
        return {
          entitySlug: asString(row.entity_slug),
          entityTitle: asString(row.entity_title) || asString(row.entity_slug),
          entityType: entityType as AnalyticsEncyclopediaRow["entityType"],
          views: asNumber(row.views)
        };
      })
      .filter((row): row is AnalyticsEncyclopediaRow => Boolean(row))
      .sort((a, b) => b.views - a.views || a.entityTitle.localeCompare(b.entityTitle)),
    funnel: FUNNEL_EVENTS.map((eventName) => ({
      count: funnelCounts.get(eventName) ?? 0,
      eventName
    })),
    range,
    referrers: breakdownRows(root.referrers),
    rollupAvailable,
    series: asArray(root.series).map((item) => {
      const row = asRecord(item);
      return {
        amazonSubmissions: asNumber(row.amazon_submissions),
        day: asString(row.day),
        downloads: asNumber(row.downloads),
        iohPointsAwarded: asNumber(row.ioh_points_awarded),
        ordersPaid: asNumber(row.orders_paid),
        pageViews: asNumber(row.page_views),
        revenueMinor: asNumber(row.revenue_minor),
        signups: asNumber(row.signups),
        uniqueVisitors: asNumber(row.unique_visitors)
      };
    }),
    summary: {
      downloads: asNumber(summary.downloads),
      ordersPaid: asNumber(summary.orders_paid),
      pageViews: asNumber(summary.page_views),
      revenueMinor: asNumber(summary.revenue_minor),
      signups: asNumber(summary.signups),
      uniqueVisitors: asNumber(summary.unique_visitors)
    },
    topPages: asArray(root.top_pages)
      .map((item) => {
        const row = asRecord(item);
        return { path: asString(row.path), views: asNumber(row.views) };
      })
      .filter((row) => row.path.length > 0)
      .sort((a, b) => b.views - a.views || a.path.localeCompare(b.path)),
    trafficSources: breakdownRows(root.traffic_sources),
    utmCampaigns: breakdownRows(root.utm_campaigns)
  };
}

export async function requireAdminAnalyticsStaff() {
  const staff = await requireStaff(["owner", "admin_ops", "support"]);

  if (!staff) {
    redirect("/unauthorized");
  }

  return staff;
}

export async function getAdminAnalyticsData(range: AnalyticsRange) {
  const staff = await requireAdminAnalyticsStaff();
  const canRefresh = staff.roles.some((role) => role === "owner" || role === "admin_ops");
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.rpc("get_admin_analytics_report", {
    p_actor_profile_id: staff.user.id,
    p_days: range
  });

  if (error) {
    if (isMissingAnalyticsRpc(error)) {
      return normalizeAdminAnalyticsReport({}, range, canRefresh, false);
    }
    throw error;
  }

  return normalizeAdminAnalyticsReport(data, range, canRefresh);
}
