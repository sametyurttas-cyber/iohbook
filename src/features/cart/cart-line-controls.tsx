import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { removeCartItem, updateCartItem } from "@/features/cart/actions";

type CartLineControlsProps = {
  cartItemId: string;
  quantity: number;
};

export function CartLineControls({ cartItemId, quantity }: CartLineControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={updateCartItem}>
        <input name="cart_item_id" type="hidden" value={cartItemId} />
        <input name="quantity" type="hidden" value={Math.max(0, quantity - 1)} />
        <Button size="sm" type="submit" variant="outline">
          -
        </Button>
      </form>
      <form action={updateCartItem} className="flex items-center gap-2">
        <input name="cart_item_id" type="hidden" value={cartItemId} />
        <Input
          className="h-9 w-20 text-center"
          defaultValue={quantity}
          inputMode="numeric"
          min={1}
          name="quantity"
          type="number"
        />
        <Button size="sm" type="submit" variant="secondary">
          Güncelle
        </Button>
      </form>
      <form action={updateCartItem}>
        <input name="cart_item_id" type="hidden" value={cartItemId} />
        <input name="quantity" type="hidden" value={quantity + 1} />
        <Button size="sm" type="submit" variant="outline">
          +
        </Button>
      </form>
      <form action={removeCartItem}>
        <input name="cart_item_id" type="hidden" value={cartItemId} />
        <Button size="sm" type="submit" variant="ghost">
          Sil
        </Button>
      </form>
    </div>
  );
}
