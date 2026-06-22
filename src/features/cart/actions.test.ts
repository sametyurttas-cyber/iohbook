import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }
}));

vi.mock("@/features/auth/queries", () => ({
  getCurrentUser: vi.fn(async () => null)
}));

vi.mock("@/features/analytics/business-events", () => ({
  trackServerAnalyticsEvent: vi.fn()
}));

vi.mock("@/features/cart/cart-cookie", () => ({
  getOrCreateAnonymousCartId: vi.fn(async () => "anon-id")
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: vi.fn()
}));

const { createSupabaseServiceRoleClient } = await import("@/lib/supabase/service-role");
const { trackServerAnalyticsEvent } = await import("@/features/analytics/business-events");
const { addToCart } = await import("./actions");

const variantId = "11111111-1111-4111-8111-111111111111";

function buildFormData(input: { buyNow?: boolean; quantity?: number } = {}) {
  const formData = new FormData();
  formData.set("variant_id", variantId);
  formData.set("quantity", String(input.quantity ?? 1));

  if (input.buyNow) {
    formData.set("buy_now", "1");
  }

  return formData;
}

function buildSupabaseMock(fulfillmentType: "physical" | "digital") {
  const insertCartItem = vi.fn(async () => ({ error: null }));

  return {
    insertCartItem,
    client: {
      from(table: string) {
        if (table === "carts") {
          return {
            eq() {
              return this;
            },
            limit() {
              return this;
            },
            select() {
              return this;
            },
            then(resolve: (value: { data: unknown[]; error: null }) => void) {
              return Promise.resolve({
                data: [
                  {
                    anonymous_id: "anon-id",
                    currency: "TRY",
                    id: "cart-id",
                    profile_id: null,
                    status: "active"
                  }
                ],
                error: null
              }).then(resolve);
            }
          };
        }

        if (table === "product_variants") {
          return {
            eq() {
              return this;
            },
            select() {
              return this;
            },
            single: async () => ({
              data: {
                active: true,
                currency: "TRY",
                fulfillment_type: fulfillmentType,
                id: variantId,
                inventory_items: [{ on_hand: 10, reserved: 0, safety_stock: 0 }],
                max_per_order: null,
                price_minor: 1000,
                product_id: "product-id",
                products: {
                  id: "product-id",
                  published_at: "2026-06-01T00:00:00.000Z",
                  status: "active"
                },
                sku: "IOH-GODCODE-PDF",
                stock_policy: fulfillmentType === "digital" ? "unlimited" : "track",
                title: fulfillmentType === "digital" ? "PDF" : "Standart baski"
              },
              error: null
            })
          };
        }

        if (table === "cart_items") {
          return {
            eq() {
              return this;
            },
            insert: insertCartItem,
            maybeSingle: async () => ({
              data: null,
              error: null
            }),
            select() {
              return this;
            }
          };
        }

        throw new Error(`Unexpected table: ${table}`);
      }
    }
  };
}

describe("addToCart MVP fulfillment guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks physical variants from being added to cart", async () => {
    const supabase = buildSupabaseMock("physical");
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(supabase.client as never);

    await expect(addToCart(buildFormData())).rejects.toThrow(
      "NEXT_REDIRECT:/cart?error=physical-unavailable"
    );

    expect(supabase.insertCartItem).not.toHaveBeenCalled();
  });

  it("allows digital variants to be added to cart", async () => {
    const supabase = buildSupabaseMock("digital");
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(supabase.client as never);

    await expect(addToCart(buildFormData())).rejects.toThrow("NEXT_REDIRECT:/cart?added=1");

    expect(supabase.insertCartItem).toHaveBeenCalledWith({
      cart_id: "cart-id",
      currency: "TRY",
      quantity: 1,
      unit_price_minor: 1000,
      variant_id: variantId
    });
    expect(trackServerAnalyticsEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: "add_to_cart",
        metadata: expect.objectContaining({ quantity: 1, variant_id: variantId })
      })
    );
  });
});
