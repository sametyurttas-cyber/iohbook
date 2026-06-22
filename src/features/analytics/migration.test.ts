import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260622120000_analytics_foundation.sql"),
  "utf8"
).toLowerCase();
const businessSql = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260622130000_analytics_business_events.sql"),
  "utf8"
).toLowerCase();

describe("analytics migration security", () => {
  it("creates the analytics tables with RLS", () => {
    for (const table of ["analytics_events", "analytics_sessions", "analytics_daily_rollups"]) {
      expect(sql).toContain(`create table public.${table}`);
      expect(sql).toContain(`alter table public.${table} enable row level security`);
    }
  });

  it("allows reads only through owner/admin_ops policies", () => {
    expect(sql).toContain("array['owner', 'admin_ops']::public.staff_role[]");
    expect(sql).toContain("revoke all on public.analytics_events from anon, authenticated");
    expect(sql).not.toContain("analytics_events for insert");
  });

  it("keeps the write RPC service-role only", () => {
    expect(sql).toContain("to service_role");
    expect(sql).toContain("from public, anon, authenticated");
  });

  it("keeps business-event writes service-role only", () => {
    expect(businessSql).toContain("record_business_analytics_event");
    expect(businessSql).toContain("from public, anon, authenticated");
    expect(businessSql).toContain("to service_role");
  });
});
