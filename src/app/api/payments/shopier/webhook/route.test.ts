import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { confirmShopierOrderCreatedWebhook } from "@/features/checkout/shopier-confirmation";
import { POST } from "./route";

vi.mock("@/features/checkout/shopier-confirmation", () => ({
  confirmShopierOrderCreatedWebhook: vi.fn()
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: vi.fn(() => ({ service: true }))
}));

vi.mock("@/lib/observability", () => ({
  captureError: vi.fn()
}));

describe("Shopier webhook route", () => {
  it("passes signed order.created webhooks to confirmation", async () => {
    vi.mocked(confirmShopierOrderCreatedWebhook).mockResolvedValueOnce({
      idempotent: false,
      orderId: "order-id",
      paid: true,
      providerTransactionId: "SHOPIER-ORDER-1"
    });

    const response = await POST(
      new NextRequest("http://localhost:3000/api/payments/shopier/webhook", {
        body: JSON.stringify({ id: "SHOPIER-ORDER-1" }),
        headers: {
          "content-type": "application/json",
          "shopier-event": "order.created",
          "shopier-signature": "signature"
        },
        method: "POST"
      })
    );

    expect(response.status).toBe(200);
    expect(confirmShopierOrderCreatedWebhook).toHaveBeenCalledWith({
      event: "order.created",
      payload: { id: "SHOPIER-ORDER-1" },
      rawBody: "{\"id\":\"SHOPIER-ORDER-1\"}",
      signature: "signature",
      supabase: { service: true }
    });
  });

  it("returns 400 when webhook confirmation fails", async () => {
    vi.mocked(confirmShopierOrderCreatedWebhook).mockRejectedValueOnce(new Error("bad signature"));

    const response = await POST(
      new NextRequest("http://localhost:3000/api/payments/shopier/webhook", {
        body: JSON.stringify({ id: "SHOPIER-ORDER-1" }),
        headers: {
          "content-type": "application/json",
          "shopier-event": "order.created",
          "shopier-signature": "bad"
        },
        method: "POST"
      })
    );

    expect(response.status).toBe(400);
  });
});
