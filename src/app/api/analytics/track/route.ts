import { NextRequest, NextResponse } from "next/server";
import { ingestAnalyticsEvent, type AnalyticsRpcClient } from "@/features/analytics/server";
import { parseAnalyticsPayload } from "@/features/analytics/validation";
import { getCurrentUser } from "@/features/auth/queries";
import { captureError } from "@/lib/observability";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

const CONSENT_COOKIE = "ioh_cookie_preferences";
const VISITOR_COOKIE = "ioh_visitor_id";
const MAX_BODY_BYTES = 16_384;

function hasAnalyticsConsent(request: NextRequest) {
  const raw = request.cookies.get(CONSENT_COOKIE)?.value;
  if (!raw) return false;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as { analytics?: unknown };
    return parsed.analytics === true;
  } catch {
    return false;
  }
}

function isSameOriginRequest(request: NextRequest) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") return false;
  const origin = request.headers.get("origin");
  return !origin || origin === request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ accepted: false, reason: "forbidden" }, { status: 403 });
  }
  if (!hasAnalyticsConsent(request)) {
    return NextResponse.json({ accepted: false, reason: "consent_required" }, { status: 202 });
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ accepted: false, reason: "payload_too_large" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ accepted: false, reason: "invalid_json" }, { status: 400 });
  }

  const parsed = parseAnalyticsPayload(body);
  if (!parsed.success) {
    return NextResponse.json({ accepted: false, reason: parsed.error }, { status: 400 });
  }

  try {
    const user = await getCurrentUser();
    const serviceRole = createSupabaseServiceRoleClient();
    const result = await ingestAnalyticsEvent({
      client: serviceRole as unknown as AnalyticsRpcClient,
      payload: parsed.data,
      anonymousId: request.cookies.get(VISITOR_COOKIE)?.value ?? null,
      profileId: user?.id ?? null,
      userAgent: request.headers.get("user-agent"),
      siteOrigin: request.nextUrl.origin,
      country: request.headers.get("x-vercel-ip-country")
    });

    const response = NextResponse.json(
      { accepted: result.accepted, reason: result.reason ?? null },
      { status: 202 }
    );
    if (result.createdAnonymousId) {
      response.cookies.set(VISITOR_COOKIE, result.anonymousId, {
        httpOnly: false,
        maxAge: 60 * 60 * 24 * 180,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
      });
    }
    return response;
  } catch (error) {
    captureError(error, { operation: "analytics.track", event: parsed.data.eventName });
    return NextResponse.json({ accepted: false, reason: "storage_error" }, { status: 500 });
  }
}

