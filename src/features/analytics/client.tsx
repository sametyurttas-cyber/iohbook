"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { AnalyticsEventName } from "@/features/analytics/events";
import { isTrackableAnalyticsPath } from "@/features/analytics/validation";

const CONSENT_COOKIE = "ioh_cookie_preferences";
const VISITOR_COOKIE = "ioh_visitor_id";
const SESSION_STORAGE_KEY = "ioh_analytics_session_id";
const ATTRIBUTION_STORAGE_KEY = "ioh_analytics_attribution";

type Attribution = {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
};

function hasAnalyticsConsent() {
  const raw = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CONSENT_COOKIE}=`))
    ?.slice(CONSENT_COOKIE.length + 1);
  if (!raw) return false;
  try {
    return (JSON.parse(decodeURIComponent(raw)) as { analytics?: unknown }).analytics === true;
  } catch {
    return false;
  }
}

function readCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function ensureAnonymousId() {
  const existing = readCookie(VISITOR_COOKIE);
  if (existing) return existing;
  const id = crypto.randomUUID();
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${VISITOR_COOKIE}=${id}; Path=/; Max-Age=15552000; SameSite=Lax${secure}`;
  return id;
}

function ensureSessionId() {
  try {
    const existing = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_STORAGE_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

function getAttribution(): Attribution {
  const params = new URLSearchParams(window.location.search);
  const current: Attribution = {
    utmSource: params.get("utm_source")?.slice(0, 120) ?? null,
    utmMedium: params.get("utm_medium")?.slice(0, 120) ?? null,
    utmCampaign: params.get("utm_campaign")?.slice(0, 160) ?? null,
    utmContent: params.get("utm_content")?.slice(0, 160) ?? null,
    utmTerm: params.get("utm_term")?.slice(0, 160) ?? null
  };

  try {
    const stored = sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Attribution;
    if (Object.values(current).some(Boolean)) {
      sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(current));
    }
  } catch {
    // Storage can be unavailable in strict privacy modes; tracking remains best effort.
  }
  return current;
}

export async function trackEvent(
  eventName: AnalyticsEventName,
  metadata: Record<string, unknown> = {}
) {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return false;
  if (!isTrackableAnalyticsPath(window.location.pathname)) return false;

  ensureAnonymousId();
  const attribution = getAttribution();
  try {
    const response = await fetch("/api/analytics/track", {
      body: JSON.stringify({
        eventId: crypto.randomUUID(),
        eventName,
        sessionId: ensureSessionId(),
        path: window.location.pathname,
        referrer: document.referrer || null,
        ...attribution,
        metadata
      }),
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      keepalive: true,
      method: "POST"
    });
    return response.ok;
  } catch {
    return false;
  }
}

export function trackPageView() {
  return trackEvent("page_view");
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef<string | null>(null);
  const locationKey = `${pathname}?${searchParams.toString()}`;

  useEffect(() => {
    if (!isTrackableAnalyticsPath(pathname) || lastTracked.current === locationKey) return;
    lastTracked.current = locationKey;
    void trackPageView();
  }, [locationKey, pathname]);

  useEffect(() => {
    function handlePreferenceChange(event: Event) {
      const detail = (event as CustomEvent<{ analytics?: boolean }>).detail;
      if (detail?.analytics) {
        lastTracked.current = null;
        void trackPageView();
      }
    }
    window.addEventListener("ioh:cookie-preferences", handlePreferenceChange);
    return () => window.removeEventListener("ioh:cookie-preferences", handlePreferenceChange);
  }, []);

  return null;
}

