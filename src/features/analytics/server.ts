import { createHash, randomUUID } from "node:crypto";
import type { AnalyticsTrackPayload } from "@/features/analytics/events";
import { isAnalyticsRateLimited } from "@/features/analytics/rate-limit";
import {
  getAnalyticsDeviceType,
  getAnalyticsRouteGroup,
  isBasicBotUserAgent,
  isTrackableAnalyticsPath,
  isUuid,
  sanitizeReferrer
} from "@/features/analytics/validation";

export type AnalyticsRpcClient = {
  rpc: (
    name: "record_analytics_event",
    args: Record<string, unknown>
  ) => PromiseLike<{ data: boolean | null; error: { message: string } | null }>;
};

type IngestAnalyticsInput = {
  client: AnalyticsRpcClient;
  payload: AnalyticsTrackPayload;
  anonymousId: string | null;
  profileId: string | null;
  userAgent: string | null;
  siteOrigin: string;
  country: string | null;
};

export type AnalyticsIngestResult = {
  accepted: boolean;
  anonymousId: string;
  createdAnonymousId: boolean;
  reason?: "bot" | "rate_limited" | "excluded_path" | "duplicate";
};

export async function ingestAnalyticsEvent(
  input: IngestAnalyticsInput
): Promise<AnalyticsIngestResult> {
  const anonymousId = isUuid(input.anonymousId) ? input.anonymousId! : randomUUID();
  const createdAnonymousId = anonymousId !== input.anonymousId;

  if (isBasicBotUserAgent(input.userAgent)) {
    return { accepted: false, anonymousId, createdAnonymousId, reason: "bot" };
  }
  if (!isTrackableAnalyticsPath(input.payload.path)) {
    return { accepted: false, anonymousId, createdAnonymousId, reason: "excluded_path" };
  }
  if (isAnalyticsRateLimited(`${anonymousId}:${input.payload.sessionId}`)) {
    return { accepted: false, anonymousId, createdAnonymousId, reason: "rate_limited" };
  }

  const userAgent = input.userAgent ?? "";
  const country = input.country?.toUpperCase().match(/^[A-Z]{2}$/)?.[0] ?? null;
  const { data, error } = await input.client.rpc("record_analytics_event", {
    p_event_id: input.payload.eventId,
    p_event_name: input.payload.eventName,
    p_profile_id: input.profileId,
    p_anonymous_id: anonymousId,
    p_session_id: input.payload.sessionId,
    p_path: input.payload.path,
    p_route_group: getAnalyticsRouteGroup(input.payload.path),
    p_referrer: sanitizeReferrer(input.payload.referrer, input.siteOrigin),
    p_utm_source: input.payload.utmSource ?? null,
    p_utm_medium: input.payload.utmMedium ?? null,
    p_utm_campaign: input.payload.utmCampaign ?? null,
    p_utm_content: input.payload.utmContent ?? null,
    p_utm_term: input.payload.utmTerm ?? null,
    p_device_type: getAnalyticsDeviceType(userAgent),
    p_user_agent_hash: createHash("sha256").update(userAgent).digest("hex"),
    p_country: country,
    // City-level inference is intentionally disabled until a documented need exists.
    p_city: null,
    p_metadata: input.payload.metadata ?? {}
  });

  if (error) throw new Error(error.message);
  return {
    accepted: data === true,
    anonymousId,
    createdAnonymousId,
    ...(data === false ? { reason: "duplicate" as const } : {})
  };
}

