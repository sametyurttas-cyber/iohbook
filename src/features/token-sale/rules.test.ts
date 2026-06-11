import { describe, expect, it } from "vitest";
import { hasAcceptedTokenSaleTerms, validateTokenSaleLimits } from "@/features/token-sale/rules";

const activeCampaign = {
  ends_at: null,
  per_user_limit: "100",
  sales_enabled: true,
  starts_at: null,
  status: "active" as const,
  total_sale_limit: "1000"
};

describe("token sale limit rules", () => {
  it("blocks sales before the start date and after the end date", () => {
    expect(
      validateTokenSaleLimits(
        {
          campaign: {
            ...activeCampaign,
            starts_at: "2026-06-12T00:00:00.000Z"
          },
          campaignAllocated: "0",
          pkg: { max_quantity_per_order: null },
          quantity: 1,
          requestedTotal: "10",
          userAllocated: "0"
        },
        new Date("2026-06-11T00:00:00.000Z")
      )
    ).toBe("sale-not-started");

    expect(
      validateTokenSaleLimits(
        {
          campaign: {
            ...activeCampaign,
            ends_at: "2026-06-10T00:00:00.000Z"
          },
          campaignAllocated: "0",
          pkg: { max_quantity_per_order: null },
          quantity: 1,
          requestedTotal: "10",
          userAllocated: "0"
        },
        new Date("2026-06-11T00:00:00.000Z")
      )
    ).toBe("sale-ended");
  });

  it("blocks total campaign and per-user limit overflows", () => {
    expect(
      validateTokenSaleLimits({
        campaign: activeCampaign,
        campaignAllocated: "995",
        pkg: { max_quantity_per_order: null },
        quantity: 1,
        requestedTotal: "10",
        userAllocated: "0"
      })
    ).toBe("total-limit");

    expect(
      validateTokenSaleLimits({
        campaign: activeCampaign,
        campaignAllocated: "100",
        pkg: { max_quantity_per_order: null },
        quantity: 1,
        requestedTotal: "10",
        userAllocated: "95"
      })
    ).toBe("user-limit");
  });

  it("uses decimal-safe comparisons for fractional limits", () => {
    expect(
      validateTokenSaleLimits({
        campaign: {
          ...activeCampaign,
          total_sale_limit: "0.3"
        },
        campaignAllocated: "0.1",
        pkg: { max_quantity_per_order: null },
        quantity: 1,
        requestedTotal: "0.2",
        userAllocated: "0"
      })
    ).toBeNull();
  });

  it("requires explicit token sale terms acceptance", () => {
    expect(hasAcceptedTokenSaleTerms(new Map([["token_sale_terms", "on"]]) as never)).toBe(true);
    expect(hasAcceptedTokenSaleTerms(new Map() as never)).toBe(false);
  });
});
