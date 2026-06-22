import { createHash, randomUUID } from "node:crypto";
import type { AnalyticsEventName } from "@/features/analytics/events";
import { sanitizeAnalyticsMetadata } from "@/features/analytics/validation";
import { captureError } from "@/lib/observability";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

type BusinessAnalyticsInput = {
  anonymousId?: string | null;
  eventName: Exclude<AnalyticsEventName, "page_view">;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
  path: string;
  profileId?: string | null;
};

function deterministicEventId(key: string) {
  const hash = createHash("sha256").update(key).digest("hex").slice(0, 32).split("");
  hash[12] = "5";
  hash[16] = ((Number.parseInt(hash[16], 16) & 0x3) | 0x8).toString(16);
  const value = hash.join("");
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}

export async function trackServerAnalyticsEvent(input: BusinessAnalyticsInput) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const eventId = input.idempotencyKey
      ? deterministicEventId(`${input.eventName}:${input.idempotencyKey}`)
      : randomUUID();
    const anonymousId = input.profileId ? input.anonymousId ?? null : input.anonymousId ?? randomUUID();
    const routeGroup = input.path.split("/").filter(Boolean)[0] ?? "home";
    const { data, error } = await supabase.rpc("record_business_analytics_event", {
      p_anonymous_id: anonymousId,
      p_event_id: eventId,
      p_event_name: input.eventName,
      p_metadata: sanitizeAnalyticsMetadata(input.eventName, input.metadata),
      p_path: input.path,
      p_profile_id: input.profileId ?? null,
      p_route_group: routeGroup
    });

    if (error) throw error;
    return data === true;
  } catch (error) {
    captureError(error, {
      event: input.eventName,
      operation: "analytics.business_event"
    });
    return false;
  }
}

