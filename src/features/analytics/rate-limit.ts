const WINDOW_MS = 10_000;
const MAX_EVENTS_PER_WINDOW = 30;
const buckets = new Map<string, { count: number; resetAt: number }>();

export function isAnalyticsRateLimited(key: string, now = Date.now()) {
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  existing.count += 1;
  return existing.count > MAX_EVENTS_PER_WINDOW;
}

export function resetAnalyticsRateLimitForTests() {
  buckets.clear();
}

