import {
  ANALYTICS_EVENT_NAMES,
  ANALYTICS_METADATA_KEYS,
  type AnalyticsDeviceType,
  type AnalyticsEventName,
  type AnalyticsTrackPayload
} from "@/features/analytics/events";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PII_KEY_PATTERN = /(email|e_mail|phone|telephone|address|full_?name|first_?name|last_?name|password|secret|token|wallet)/i;
const BOT_PATTERN = /bot|crawler|spider|slurp|headless|lighthouse|pagespeed|preview|facebookexternalhit|whatsapp|telegrambot|curl|wget/i;

type ParseResult =
  | { success: true; data: AnalyticsTrackPayload }
  | { success: false; error: string };

function nullableString(value: unknown, maxLength: number) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized ? normalized.slice(0, maxLength) : null;
}

function sanitizeMetadataValue(value: unknown): string | number | boolean | null | string[] | null {
  if (value === null || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") return value.slice(0, 200);
  if (Array.isArray(value) && value.length <= 10 && value.every((item) => typeof item === "string")) {
    return value.map((item) => item.slice(0, 100));
  }
  return null;
}

export function sanitizeAnalyticsMetadata(
  eventName: AnalyticsEventName,
  metadata: unknown
): Record<string, unknown> {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return {};

  const allowedKeys = new Set(ANALYTICS_METADATA_KEYS[eventName]);
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(metadata)) {
    if (!allowedKeys.has(key) || PII_KEY_PATTERN.test(key)) continue;
    const cleanValue = sanitizeMetadataValue(value);
    if (cleanValue !== null || value === null) sanitized[key] = cleanValue;
  }

  return JSON.stringify(sanitized).length <= 2048 ? sanitized : {};
}

export function parseAnalyticsPayload(input: unknown): ParseResult {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { success: false, error: "invalid_payload" };
  }

  const raw = input as Record<string, unknown>;
  if (!ANALYTICS_EVENT_NAMES.includes(raw.eventName as AnalyticsEventName)) {
    return { success: false, error: "invalid_event_name" };
  }
  if (typeof raw.eventId !== "string" || !UUID_PATTERN.test(raw.eventId)) {
    return { success: false, error: "invalid_event_id" };
  }
  if (typeof raw.sessionId !== "string" || !UUID_PATTERN.test(raw.sessionId)) {
    return { success: false, error: "invalid_session_id" };
  }
  if (typeof raw.path !== "string" || !raw.path.startsWith("/") || raw.path.length > 500) {
    return { success: false, error: "invalid_path" };
  }

  const eventName = raw.eventName as AnalyticsEventName;
  return {
    success: true,
    data: {
      eventId: raw.eventId,
      eventName,
      sessionId: raw.sessionId,
      path: raw.path,
      referrer: nullableString(raw.referrer, 500),
      utmSource: nullableString(raw.utmSource, 120),
      utmMedium: nullableString(raw.utmMedium, 120),
      utmCampaign: nullableString(raw.utmCampaign, 160),
      utmContent: nullableString(raw.utmContent, 160),
      utmTerm: nullableString(raw.utmTerm, 160),
      metadata: sanitizeAnalyticsMetadata(eventName, raw.metadata)
    }
  };
}

export function isBasicBotUserAgent(userAgent: string | null) {
  return !userAgent || BOT_PATTERN.test(userAgent);
}

export function getAnalyticsDeviceType(userAgent: string): AnalyticsDeviceType {
  if (/ipad|tablet|kindle|silk/i.test(userAgent)) return "tablet";
  if (/mobile|iphone|ipod|android/i.test(userAgent)) return "mobile";
  return userAgent ? "desktop" : "unknown";
}

export function sanitizeReferrer(referrer: string | null | undefined, siteOrigin: string) {
  if (!referrer) return null;
  try {
    const parsed = new URL(referrer);
    if (parsed.origin === siteOrigin) return null;
    return parsed.hostname.toLowerCase().slice(0, 255);
  } catch {
    return null;
  }
}

export function getAnalyticsRouteGroup(path: string) {
  if (!isTrackableAnalyticsPath(path)) return null;
  const firstSegment = path.split("/").filter(Boolean)[0];
  return firstSegment ?? "home";
}

export function isTrackableAnalyticsPath(path: string) {
  const excludedPrefixes = [
    "/admin",
    "/api",
    "/_next",
    "/auth/callback",
    "/checkout/callback",
    "/checkout/webhook",
    "/payments/callback",
    "/payments/webhook"
  ];
  return path.startsWith("/") && !excludedPrefixes.some((prefix) => path.startsWith(prefix));
}

export function isUuid(value: string | null | undefined) {
  return Boolean(value && UUID_PATTERN.test(value));
}

