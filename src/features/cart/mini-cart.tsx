import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getActiveCartSnapshot } from "@/features/cart/queries";
import { formatMoney } from "@/features/products/product-utils";

export async function MiniCart() {
  const cart = await getActiveCartSnapshot();

  return (
    <Button asChild size="sm" variant="outline">
      <Link href="/cart">
        Sepet
        {cart.itemCount > 0 ? (
          <span className="ml-2 rounded-sm bg-gold px-2 py-0.5 text-xs text-ink">
            {cart.itemCount} · {formatMoney(cart.subtotalMinor)}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}
