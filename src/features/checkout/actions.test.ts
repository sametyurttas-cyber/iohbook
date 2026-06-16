import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkoutLegalSummaries } from "@/features/legal/legal-content";
import { startCheckoutPayment } from "./actions";

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }
}));

vi.mock("@/features/auth/queries", () => ({
  getCurrentUser: vi.fn(async () => null)
}));

vi.mock("@/features/cart/queries", () => ({
  getActiveCartSnapshot: vi.fn()
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: vi.fn()
}));

vi.mock("@/lib/observability", () => ({
  captureError: vi.fn(),
  logInfo: vi.fn()
}));

vi.mock("@/features/email/events", () => ({
  sendOrderReceivedEmail: vi.fn()
}));

vi.mock("@/features/checkout/persistence", () => ({
  commitCheckoutPaymentStart: vi.fn()
}));

vi.mock("@/features/checkout/providers", () => ({
  getPaymentProvider: vi.fn(() => ({
    availability: () => ({ enabled: true }),
    id: "iyzico",
    startPayment: vi.fn()
  }))
}));

const { getActiveCartSnapshot } = await import("@/features/cart/queries");
const { createSupabaseServiceRoleClient } = await import("@/lib/supabase/service-role");

function buildRequiredLegalFormData() {
  const formData = new FormData();

  for (const summary of checkoutLegalSummaries) {
    formData.set(summary.inputName, "on");
  }

  return formData;
}

function buildValidCheckoutFormData() {
  const formData = buildRequiredLegalFormData();

  formData.set("billing_same_as_shipping", "on");
  formData.set("customer_email", "customer@example.com");
  formData.set("customer_name", "Samet Yurttas");
  formData.set("customer_phone", "+905551112233");
  formData.set("shipping_city", "Istanbul");
  formData.set("shipping_country", "Turkiye");
  formData.set("shipping_country_code", "TR");
  formData.set("shipping_line1", "Ornek Mahalle IOH Sokak No 1");
  formData.set("shipping_postal_code", "34000");

  return formData;
}

function buildCartSnapshot(unitPriceMinor = 1000) {
  return {
    cart: {
      anonymous_id: "anon-id",
      currency: "TRY",
      id: "cart-id"
    },
    itemCount: 1,
    lines: [
      {
        currency: "TRY",
        id: "cart-item-id",
        product_variants: {
          fulfillment_type: "physical",
          inventory_items: [{ on_hand: 10, reserved: 0, safety_stock: 0 }],
          max_per_order: null,
          stock_policy: "track"
        },
        quantity: 1,
        unit_price_minor: unitPriceMinor,
        variant_id: "variant-id"
      }
    ],
    subtotalMinor: unitPriceMinor
  };
}

function buildSupabaseMock(variant: {
  price_minor: number;
  products: { published_at: string | null; status: string } | null;
}) {
  return {
    from(table: string) {
      if (table !== "product_variants") {
        throw new Error(`Unexpected table: ${table}`);
      }

      return {
        in: async () => ({
          data: [{ id: "variant-id", ...variant }],
          error: null
        }),
        select() {
          return this;
        }
      };
    }
  };
}

describe("startCheckoutPayment product re-validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to cart when a cart line price changed after it was added", async () => {
    vi.mocked(getActiveCartSnapshot).mockResolvedValue(buildCartSnapshot(1000) as never);
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(
      buildSupabaseMock({
        price_minor: 1200,
        products: { published_at: "2026-06-01T00:00:00.000Z", status: "active" }
      }) as never
    );

    await expect(startCheckoutPayment(buildRequiredLegalFormData())).rejects.toThrow(
      "NEXT_REDIRECT:/cart?error=price-changed"
    );
  });

  it("redirects to cart when a cart line product is no longer published", async () => {
    vi.mocked(getActiveCartSnapshot).mockResolvedValue(buildCartSnapshot(1000) as never);
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(
      buildSupabaseMock({
        price_minor: 1000,
        products: { published_at: null, status: "archived" }
      }) as never
    );

    await expect(startCheckoutPayment(buildRequiredLegalFormData())).rejects.toThrow(
      "NEXT_REDIRECT:/cart?error=product-unavailable"
    );
  });

  it("redirects to checkout when checkout contact details are invalid", async () => {
    const formData = buildValidCheckoutFormData();
    formData.set("customer_email", "not-an-email");

    vi.mocked(getActiveCartSnapshot).mockResolvedValue(buildCartSnapshot(1000) as never);
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(
      buildSupabaseMock({
        price_minor: 1000,
        products: { published_at: "2026-06-01T00:00:00.000Z", status: "active" }
      }) as never
    );

    await expect(startCheckoutPayment(formData)).rejects.toThrow(
      "NEXT_REDIRECT:/checkout?error=invalid-checkout-details"
    );
  });
});
