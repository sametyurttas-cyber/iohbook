import { NextResponse } from "next/server";
import { refreshAnalyticsRollups } from "@/features/admin-analytics/rollup";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return NextResponse.json({ error: "cron_not_configured" }, { status: 503 });
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const rows = await refreshAnalyticsRollups(90);
  return NextResponse.json({ days: 90, ok: true, rows });
}
