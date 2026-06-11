import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { confirmShopierPayment } from "@/features/checkout/shopier-confirmation";
import { GET } from "./route";

vi.mock("@/features/checkout/shopier-confirmation", () => ({
  confirmShopierPayment: vi.fn()
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: vi.fn()
}));

vi.mock("@/lib/observability", () => ({
  captureError: vi.fn()
}));

describe("Shopier callback route", () => {
  it("does not mutate payment state on GET callbacks", async () => {
    const response = await GET(
      new NextRequest("http://localhost:3000/api/payments/shopier/callback?status=success")
    );

    expect(confirmShopierPayment).not.toHaveBeenCalled();
    expect(response.headers.get("location")).toBe("http://localhost:3000/checkout?notice=shopier-return-pending");
  });
});
