import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addToCart } from "@/features/cart/actions";
import {
  getStockLabel,
  getVariantAvailableStock,
  getVariantLabel
} from "@/features/catalog/catalog-utils";
import { requiresPhysicalDelivery } from "@/features/checkout/fulfillment-utils";
import type { StorefrontVariant } from "@/features/catalog/queries";
import { formatMoney } from "@/features/products/product-utils";

type VariantSelectorProps = {
  variants: StorefrontVariant[];
};

export function VariantSelector({ variants }: VariantSelectorProps) {
  if (variants.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">
        Bu kitap için aktif varyant henüz eklenmedi.
      </div>
    );
  }

  const hasPreviewVariants = variants.some((variant) => variant.is_preview);

  if (hasPreviewVariants) {
    return (
      <div className="grid gap-4 rounded-lg border border-border bg-card p-5 shadow-panel">
        <div>
          <p className="text-eyebrow uppercase text-muted-foreground">Varyant secimi</p>
          <h2 className="mt-2 font-display text-title-md text-paper">Dijital format hazirlaniyor</h2>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">
          Bu kitap su an katalog on izlemesi olarak gorunuyor. Dijital satin alma
          icin admin panelinden gercek PDF veya EPUB varyanti yayinlanmali.
        </p>
        <div className="grid gap-3 sm:grid-cols-[8rem_1fr_1fr]">
          <Input defaultValue={1} disabled min={1} name="quantity" type="number" />
          <Button disabled type="button">
            Sepete ekle
          </Button>
          <Button disabled type="button" variant="secondary">
            Direkt satin al
          </Button>
        </div>
      </div>
    );
  }

  const firstAvailableIndex = variants.findIndex((variant) => {
    const stock = getVariantAvailableStock(variant);
    const physicalUnavailable = requiresPhysicalDelivery(variant.fulfillment_type);

    return (
      !physicalUnavailable &&
      (stock > 0 || variant.stock_policy === "continue" || variant.stock_policy === "unlimited")
    );
  });

  return (
    <form action={addToCart} className="grid gap-4 rounded-lg border border-border bg-card p-5 shadow-panel">
      <div>
        <p className="text-eyebrow uppercase text-muted-foreground">Dijital format</p>
        <h2 className="mt-2 font-display text-title-md text-paper">PDF / EPUB sec</h2>
      </div>

      <div className="grid gap-3">
        {variants.map((variant, index) => {
          const stock = getVariantAvailableStock(variant);
          const physicalUnavailable = requiresPhysicalDelivery(variant.fulfillment_type);
          const outOfStock =
            stock <= 0 &&
            variant.stock_policy !== "continue" &&
            variant.stock_policy !== "unlimited";
          const disabled = physicalUnavailable || outOfStock;

          return (
            <label
              className="grid cursor-pointer gap-3 rounded-md border border-border bg-ink-soft p-4 transition-colors hover:border-gold/50 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60"
              key={variant.id}
            >
              <div className="flex items-start gap-3">
                <input
                  className="mt-1 h-4 w-4 accent-gold"
                  defaultChecked={index === firstAvailableIndex}
                  disabled={disabled}
                  name="variant_id"
                  type="radio"
                  value={variant.id}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-paper">{variant.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {getVariantLabel(variant)} · {variant.sku}
                      </p>
                    </div>
                    <p className="font-display text-title-md text-gold">
                      {formatMoney(variant.price_minor, variant.currency)}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge variant={disabled ? "red" : "gold"}>
                      {physicalUnavailable ? "Yakinda" : getStockLabel(variant)}
                    </Badge>
                    {physicalUnavailable ? (
                      <Badge variant="outline">Fiziksel satis MVP&apos;de kapali</Badge>
                    ) : null}
                    {variant.edition_label ? (
                      <Badge variant="outline">{variant.edition_label}</Badge>
                    ) : null}
                    {variant.lead_time_days > 0 ? (
                      <Badge variant="outline">{variant.lead_time_days} gün hazırlık</Badge>
                    ) : variant.fulfillment_type === "digital" ? (
                      <Badge variant="outline">Hesabimda indirme</Badge>
                    ) : null}
                  </div>
                </div>
              </div>
            </label>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-[8rem_1fr_1fr]">
        <Input defaultValue={1} min={1} name="quantity" type="number" />
        <Button disabled={firstAvailableIndex < 0} type="submit">
          Sepete ekle
        </Button>
        <Button disabled={firstAvailableIndex < 0} name="buy_now" type="submit" value="1" variant="secondary">
          Direkt satin al
        </Button>
      </div>
    </form>
  );
}
