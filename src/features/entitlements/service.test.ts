import { describe, expect, it, vi } from "vitest";
import { createEntitlementsForPaidOrder } from "@/features/entitlements/service";

vi.mock("@/lib/observability", () => ({
  captureError: vi.fn(),
  logInfo: vi.fn()
}));

function createSupabaseMock(existingOrderItemIds: string[] = []) {
  const insertedRows: unknown[] = [];
  const order = {
    id: "order-id",
    profile_id: "profile-id",
    order_items: [
      {
        fulfillment_type: "digital",
        id: "item-digital",
        product_variants: {
          digital_access_expires_at: null,
          digital_access_starts_at: null,
          digital_delivery_bucket: "digital-deliveries",
          digital_delivery_path: "ebooks/code-god.pdf",
          digital_download_limit: 3,
          fulfillment_type: "digital"
        },
        variant_id: "variant-digital"
      },
      {
        fulfillment_type: "physical",
        id: "item-physical",
        product_variants: null,
        variant_id: "variant-physical"
      }
    ]
  };

  return {
    insertedRows,
    supabase: {
      from(table: string) {
        if (table === "orders") {
          return {
            eq() {
              return this;
            },
            select() {
              return this;
            },
            single: async () => ({ data: order, error: null })
          };
        }

        if (table === "entitlements") {
          return {
            in: async () => ({
              data: existingOrderItemIds.map((orderItemId) => ({ order_item_id: orderItemId })),
              error: null
            }),
            insert: async (rows: unknown[]) => {
              insertedRows.push(...rows);
              return { error: null };
            },
            select() {
              return this;
            }
          };
        }

        throw new Error(`Unexpected table ${table}`);
      }
    }
  };
}

describe("digital entitlement creation", () => {
  it("creates active entitlements for paid digital order items", async () => {
    const mock = createSupabaseMock();

    const result = await createEntitlementsForPaidOrder({
      orderId: "order-id",
      supabase: mock.supabase as never
    });

    expect(result).toEqual({ created: 1, skipped: 0 });
    expect(mock.insertedRows).toEqual([
      expect.objectContaining({
        download_limit: 3,
        kind: "digital",
        order_item_id: "item-digital",
        profile_id: "profile-id",
        status: "active",
        storage_bucket: "digital-deliveries",
        storage_path: "ebooks/code-god.pdf",
        variant_id: "variant-digital"
      })
    ]);
  });

  it("does not duplicate existing entitlements for the same order item", async () => {
    const mock = createSupabaseMock(["item-digital"]);

    const result = await createEntitlementsForPaidOrder({
      orderId: "order-id",
      supabase: mock.supabase as never
    });

    expect(result).toEqual({ created: 0, skipped: 1 });
    expect(mock.insertedRows).toEqual([]);
  });
});
