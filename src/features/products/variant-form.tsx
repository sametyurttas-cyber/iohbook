import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { createVariant, updateVariant } from "@/features/products/actions";
import { VARIANT_FORMAT_LABELS } from "@/features/products/product-utils";
import type { InventoryItem, ProductVariant, VariantFormat } from "@/types/database";

export type VariantWithInventory = ProductVariant & {
  inventory_items?: InventoryItem[] | InventoryItem | null;
};

type VariantFormProps = {
  productId: string;
  variant?: VariantWithInventory;
};

const formats: VariantFormat[] = [
  "standard",
  "signed",
  "limited",
  "boxed",
  "preorder",
  "ebook",
  "claimable"
];

function getInventory(variant?: VariantWithInventory) {
  const inventory = variant?.inventory_items;
  return Array.isArray(inventory) ? inventory[0] : inventory;
}

export function VariantForm({ productId, variant }: VariantFormProps) {
  const action = variant ? updateVariant : createVariant;
  const inventory = getInventory(variant);
  const nftMetadata =
    typeof variant?.metadata?.nft === "object" && variant.metadata.nft !== null
      ? (variant.metadata.nft as Record<string, string | null>)
      : {};

  return (
    <form action={action} className="grid gap-4 rounded-lg border border-border bg-card p-5">
      <input name="product_id" type="hidden" value={productId} />
      {variant ? <input name="variant_id" type="hidden" value={variant.id} /> : null}
      {inventory ? <input name="inventory_id" type="hidden" value={inventory.id} /> : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">Varyant adı</span>
          <Input
            defaultValue={variant?.title ?? ""}
            name="variant_title"
            placeholder="İmzalı baskı"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">SKU</span>
          <Input defaultValue={variant?.sku ?? ""} name="sku" placeholder="IOH-CG-SIGNED" />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">Format</span>
          <Select defaultValue={variant?.format ?? "standard"} name="format">
            <SelectTrigger>
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              {formats.map((format) => (
                <SelectItem key={format} value={format}>
                  {VARIANT_FORMAT_LABELS[format]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">Fiyat</span>
          <Input
            defaultValue={variant ? String(variant.price_minor / 100) : ""}
            inputMode="decimal"
            name="price_minor"
            placeholder="350"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">Karşılaştırma fiyatı</span>
          <Input
            defaultValue={variant?.compare_at_minor ? String(variant.compare_at_minor / 100) : ""}
            inputMode="decimal"
            name="compare_at_minor"
            placeholder="450"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">Para birimi</span>
          <Input defaultValue={variant?.currency ?? "TRY"} name="currency" />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">Maks. adet</span>
          <Input
            defaultValue={variant?.max_per_order ?? ""}
            inputMode="numeric"
            name="max_per_order"
            placeholder="2"
          />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">Stok</span>
          <Input
            defaultValue={inventory?.on_hand ?? 0}
            inputMode="numeric"
            name="on_hand"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">Güvenlik stoğu</span>
          <Input
            defaultValue={inventory?.safety_stock ?? 0}
            inputMode="numeric"
            name="safety_stock"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">Stok politikası</span>
          <Select defaultValue={variant?.stock_policy ?? "track"} name="stock_policy">
            <SelectTrigger>
              <SelectValue placeholder="Stok politikası" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="track">Stok takip et</SelectItem>
              <SelectItem value="deny">Stok bitince durdur</SelectItem>
              <SelectItem value="continue">Stok bitse de sürdür</SelectItem>
              <SelectItem value="unlimited">Limitsiz</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">Lokasyon</span>
          <Input
            defaultValue={inventory?.warehouse_location ?? ""}
            name="warehouse_location"
            placeholder="Raf A1"
          />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">Edition etiketi</span>
          <Input
            defaultValue={variant?.edition_label ?? ""}
            name="edition_label"
            placeholder="İmzalı / 100 adet"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">Fulfillment</span>
          <Select defaultValue={variant?.fulfillment_type ?? "physical"} name="fulfillment_type">
            <SelectTrigger>
              <SelectValue placeholder="Fulfillment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="physical">Fiziksel</SelectItem>
              <SelectItem value="digital">Dijital</SelectItem>
              <SelectItem value="claimable">Claimable</SelectItem>
              <SelectItem value="hybrid">Hibrit</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">Ağırlık gr</span>
          <Input
            defaultValue={variant?.weight_grams ?? ""}
            inputMode="numeric"
            name="weight_grams"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">Sıra</span>
          <Input
            defaultValue={variant?.sort_order ?? 0}
            inputMode="numeric"
            name="sort_order"
          />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.4fr_0.8fr]">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">Dijital bucket</span>
          <Input
            defaultValue={variant?.digital_delivery_bucket ?? "digital-deliveries"}
            name="digital_delivery_bucket"
            placeholder="digital-deliveries"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">Dijital dosya yolu</span>
          <Input
            defaultValue={variant?.digital_delivery_path ?? ""}
            name="digital_delivery_path"
            placeholder="ebooks/code-god.pdf"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">Indirme limiti</span>
          <Input
            defaultValue={variant?.digital_download_limit ?? ""}
            inputMode="numeric"
            name="digital_download_limit"
            placeholder="5"
          />
        </label>
      </div>

      <div className="grid gap-4 rounded-md border border-gold/20 bg-gold/10 p-4 lg:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">NFT contract adresi</span>
          <Input
            defaultValue={nftMetadata.contract_address ?? ""}
            name="nft_contract_address"
            placeholder="0x..."
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">NFT token ID</span>
          <Input defaultValue={nftMetadata.token_id ?? ""} name="nft_token_id" />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">Metadata IPFS URI</span>
          <Input
            defaultValue={nftMetadata.metadata_ipfs_uri ?? ""}
            name="nft_metadata_ipfs_uri"
            placeholder="ipfs://..."
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">Gorsel IPFS URI</span>
          <Input
            defaultValue={nftMetadata.image_ipfs_uri ?? ""}
            name="nft_image_ipfs_uri"
            placeholder="ipfs://..."
          />
        </label>
      </div>

      <div className="flex items-center justify-between gap-4">
        <label className="flex items-center gap-3 text-sm text-muted-foreground">
          <input
            className="h-4 w-4 accent-gold"
            defaultChecked={variant?.active ?? true}
            name="active"
            type="checkbox"
          />
          Aktif varyant
        </label>
        <Button type="submit">{variant ? "Varyantı Güncelle" : "Varyant Ekle"}</Button>
      </div>
    </form>
  );
}
