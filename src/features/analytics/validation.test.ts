import { describe, expect, it } from "vitest";
import {
  isBasicBotUserAgent,
  isTrackableAnalyticsPath,
  parseAnalyticsPayload,
  sanitizeAnalyticsMetadata
} from "@/features/analytics/validation";

describe("analytics payload validation", () => {
  it("keeps only event-specific metadata keys", () => {
    expect(
      sanitizeAnalyticsMetadata("add_to_cart", {
        amount_minor: 45000,
        currency: "TRY",
        product_id: "product-1",
        unexpected: "drop me"
      })
    ).toEqual({ amount_minor: 45000, currency: "TRY", product_id: "product-1" });
  });

  it("drops PII metadata even when supplied by a client", () => {
    expect(
      sanitizeAnalyticsMetadata("signup", {
        email: "person@example.com",
        method: "password",
        phone: "+905551112233"
      })
    ).toEqual({ method: "password" });
  });

  it("accepts a valid page view payload", () => {
    const result = parseAnalyticsPayload({
      eventId: "6f1c8f34-4b8b-4bf4-9f3c-99c33cf3117a",
      eventName: "page_view",
      sessionId: "32079882-9d8e-4468-a7c8-5b0d07530cdf",
      path: "/books"
    });
    expect(result.success).toBe(true);
  });

  it("keeps UTM attribution on a page view", () => {
    const result = parseAnalyticsPayload({
      eventId: "6f1c8f34-4b8b-4bf4-9f3c-99c33cf3117a",
      eventName: "page_view",
      sessionId: "32079882-9d8e-4468-a7c8-5b0d07530cdf",
      path: "/books",
      utmCampaign: "launch",
      utmSource: "instagram"
    });

    expect(result).toMatchObject({
      success: true,
      data: { utmCampaign: "launch", utmSource: "instagram" }
    });
  });

  it("filters bots and technical/admin routes", () => {
    expect(isBasicBotUserAgent("Googlebot/2.1")).toBe(true);
    expect(isBasicBotUserAgent("Mozilla/5.0 Chrome/126 Safari/537.36")).toBe(false);
    expect(isTrackableAnalyticsPath("/admin/orders")).toBe(false);
    expect(isTrackableAnalyticsPath("/api/checkout/webhook")).toBe(false);
    expect(isTrackableAnalyticsPath("/books/godcode")).toBe(true);
  });
});
