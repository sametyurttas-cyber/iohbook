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
const { getCurrentUser } = await import("@/features/auth/queries");
const { createSupabaseServiceRoleClient } = await import("@/lib/supabase/service-role");
const { commitCheckoutPaymentStart } = await import("@/features/checkout/persistence");
const { getPaymentProvider } = await import("@/features/checkout/providers");

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
          currency: "TRY",
          digital_access_expires_at: null,
          digital_access_starts_at: null,
          digital_delivery_bucket: "digital-deliveries",
          digital_delivery_path: "ebooks/godcode.pdf",
          digital_download_limit: 5,
          format: "digital_pdf",
          fulfillment_type: "digital",
          id: "variant-id",
          inventory_items: [{ on_hand: 10, reserved: 0, safety_stock: 0 }],
          max_per_order: null,
          metadata: {},
          products: {
            id: "product-id",
            slug: "godcode",
            title: "GODCODE"
          },
          sku: "IOH-GODCODE-STD",
          stock_policy: "unlimited"
        },
        quantity: 1,
        unit_price_minor: unitPriceMinor,
        variant_id: "variant-id"
      }
    ],
    subtotalMinor: unitPriceMinor
  };
}

function buildDigitalCartSnapshot(unitPriceMinor = 1000) {
  const snapshot = buildCartSnapshot(unitPriceMinor);
  snapshot.lines[0].product_variants.digital_delivery_bucket = "digital-deliveries";
  snapshot.lines[0].product_variants.digital_delivery_path = "ebooks/godcode.pdf";
  snapshot.lines[0].product_variants.digital_download_limit = 5;
  snapshot.lines[0].product_variants.format = "digital_pdf";
  snapshot.lines[0].product_variants.fulfillment_type = "digital";
  snapshot.lines[0].product_variants.stock_policy = "unlimited";
  return snapshot;
}

function buildPhysicalCartSnapshot(unitPriceMinor = 1000) {
  const snapshot = buildCartSnapshot(unitPriceMinor);
  snapshot.lines[0].product_variants.digital_delivery_bucket = null;
  snapshot.lines[0].product_variants.digital_delivery_path = null;
  snapshot.lines[0].product_variants.digital_download_limit = null;
  snapshot.lines[0].product_variants.format = "standard";
  snapshot.lines[0].product_variants.fulfillment_type = "physical";
  snapshot.lines[0].product_variants.stock_policy = "track";
  return snapshot;
}

function buildSupabaseMock(variant: {
  price_minor: number;
  products: { published_at: string | null; status: string } | null;
}) {
  return {
    from(table: string) {
      if (table !== "product_variants") {
        return {
          insert: async () => ({
            data: null,
            error: null
          })
        };
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
    vi.mocked(getCurrentUser).mockResolvedValue(null as never);
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

  it("redirects to cart when a physical line reaches MVP checkout", async () => {
    vi.mocked(getActiveCartSnapshot).mockResolvedValue(buildPhysicalCartSnapshot(1000) as never);
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(
      buildSupabaseMock({
        price_minor: 1000,
        products: { published_at: "2026-06-01T00:00:00.000Z", status: "active" }
      }) as never
    );

    await expect(startCheckoutPayment(buildRequiredLegalFormData())).rejects.toThrow(
      "NEXT_REDIRECT:/cart?error=physical-unavailable"
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

  it("starts a digital-only checkout without requiring shipping address or delivery", async () => {
    const formData = buildRequiredLegalFormData();
    formData.set("customer_email", "customer@example.com");
    formData.set("customer_name", "Samet Yurttas");
    formData.set("customer_phone", "+905551112233");

    vi.mocked(getCurrentUser).mockResolvedValue({ email: "customer@example.com", id: "profile-id" } as never);
    vi.mocked(getActiveCartSnapshot).mockResolvedValue(buildDigitalCartSnapshot(1000) as never);
    vi.mocked(createSupabaseServiceRoleClient).mockReturnValue(
      buildSupabaseMock({
        price_minor: 1000,
        products: { published_at: "2026-06-01T00:00:00.000Z", status: "active" }
      }) as never
    );
    vi.mocked(getPaymentProvider).mockReturnValue({
      availability: () => ({ enabled: true }),
      id: "shopier",
      label: "Shopier",
      startPayment: vi.fn(async () => ({
        failureReason: null,
        normalizedStatus: "pending",
        providerReference: "IOH-TEST",
        providerStatus: "initialized",
        rawResponse: {},
        redirectUrl: "https://shopier.example/pay",
        requestPayload: {},
        status: "redirect"
      })),
      type: "hosted_checkout"
    } as never);

    await expect(startCheckoutPayment(formData)).rejects.toThrow(
      "NEXT_REDIRECT:https://shopier.example/pay"
    );

    expect(commitCheckoutPaymentStart).toHaveBeenCalledTimes(1);
    const [, args] = vi.mocked(commitCheckoutPaymentStart).mock.calls[0];
    const orderPayload = args.p_order as {
      billing_address: unknown;
      shipping_address: unknown;
      shipping_minor: number;
    };
    const orderItemPayload = args.p_order_items[0] as {
      fulfillment_type: string;
      variant_snapshot: {
        digital_delivery_bucket: string | null;
      };
    };

    expect(orderPayload.shipping_address).toBeNull();
    expect(orderPayload.billing_address).toBeNull();
    expect(orderPayload.shipping_minor).toBe(0);
    expect(orderItemPayload.fulfillment_type).toBe("digital");
    expect(orderItemPayload.variant_snapshot.digital_delivery_bucket).toBe("digital-deliveries");
  });
});
