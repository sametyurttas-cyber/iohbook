import { describe, expect, it, vi } from "vitest";
import { convertPaidOrderCart } from "./cart-finalization";

function createSupabaseMock(input?: { cartId?: string | null; updateError?: Error }) {
  const cartUpdate = vi.fn();

  return {
    cartUpdate,
    from(table: string) {
      return {
        select() {
          return this;
        },
        eq() {
          return this;
        },
        single: async () => ({
          data: { cart_id: input?.cartId ?? "cart-id" },
          error: null
        }),
        update(values: Record<string, unknown>) {
          cartUpdate(table, values);
          return {
            eq: async () => ({
              data: null,
              error: input?.updateError ?? null
            })
          };
        }
      };
    }
  };
}

describe("paid order cart finalization", () => {
  it("converts the paid order cart so it no longer appears as active", async () => {
    const supabase = createSupabaseMock();

    await convertPaidOrderCart({
      cartId: "cart-id",
      orderId: "order-id",
      supabase: supabase as never
    });

    expect(supabase.cartUpdate).toHaveBeenCalledWith("carts", { status: "converted" });
  });

  it("repairs the cart on an idempotent payment confirmation", async () => {
    const supabase = createSupabaseMock({ cartId: "order-cart-id" });

    await convertPaidOrderCart({
      orderId: "order-id",
      supabase: supabase as never
    });

    expect(supabase.cartUpdate).toHaveBeenCalledWith("carts", { status: "converted" });
  });

  it("does not hide a cart persistence failure", async () => {
    const supabase = createSupabaseMock({ updateError: new Error("cart update failed") });

    await expect(
      convertPaidOrderCart({
        cartId: "cart-id",
        orderId: "order-id",
        supabase: supabase as never
      })
    ).rejects.toThrow("cart update failed");
  });
});
