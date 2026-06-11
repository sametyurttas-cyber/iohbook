import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createProduct, updateProduct } from "@/features/products/actions";
import type { Collection, Product } from "@/types/database";

type ProductFormProps = {
  collections: Pick<Collection, "id" | "title" | "status">[];
  product?: Product;
};

export function ProductForm({ collections, product }: ProductFormProps) {
  const action = product ? updateProduct : createProduct;

  return (
    <form action={action} className="grid gap-6">
      {product ? <input name="product_id" type="hidden" value={product.id} /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">Ürün başlığı</span>
          <Input defaultValue={product?.title} name="title" placeholder="CODE GOD" />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">Slug</span>
          <Input defaultValue={product?.slug} name="slug" placeholder="code-god" />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">Durum</span>
          <Select defaultValue={product?.status ?? "draft"} name="status">
            <SelectTrigger>
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Taslak</SelectItem>
              <SelectItem value="active">Yayında</SelectItem>
              <SelectItem value="archived">Arşiv</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">Ürün tipi</span>
          <Select defaultValue={product?.type ?? "book"} name="type">
            <SelectTrigger>
              <SelectValue placeholder="Ürün tipi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="book">Fiziksel kitap</SelectItem>
              <SelectItem value="bundle">Set / bundle</SelectItem>
              <SelectItem value="digital">Dijital ürün</SelectItem>
              <SelectItem value="claimable">Claimable ürün</SelectItem>
              <SelectItem value="nft">NFT ürünü</SelectItem>
            </SelectContent>
          </Select>
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">Koleksiyon</span>
          <Select defaultValue={product?.collection_id ?? "none"} name="collection_id">
            <SelectTrigger>
              <SelectValue placeholder="Koleksiyon seç" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Koleksiyon yok</SelectItem>
              {collections.map((collection) => (
                <SelectItem key={collection.id} value={collection.id}>
                  {collection.title} ({collection.status})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      </div>

      <label className="grid gap-2 text-sm">
        <span className="font-medium text-paper">Alt başlık</span>
        <Input
          defaultValue={product?.subtitle ?? ""}
          name="subtitle"
          placeholder="Kısa editorial alt başlık"
        />
      </label>

      <label className="grid gap-2 text-sm">
        <span className="font-medium text-paper">Kısa açıklama</span>
        <Textarea
          defaultValue={product?.short_description ?? ""}
          name="short_description"
          placeholder="Liste ve kartlarda kullanılacak kısa metin"
        />
      </label>

      <label className="grid gap-2 text-sm">
        <span className="font-medium text-paper">Açıklama</span>
        <Textarea
          defaultValue={product?.description ?? ""}
          name="description"
          placeholder="Ürün detay sayfası açıklaması"
        />
      </label>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">SEO başlık</span>
          <Input defaultValue={product?.seo_title ?? ""} name="seo_title" />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="font-medium text-paper">SEO açıklama</span>
          <Input defaultValue={product?.seo_description ?? ""} name="seo_description" />
        </label>
      </div>

      <label className="flex items-center gap-3 text-sm text-muted-foreground">
        <input
          className="h-4 w-4 accent-gold"
          defaultChecked={product?.is_limited ?? false}
          name="is_limited"
          type="checkbox"
        />
        Limitli / koleksiyon ürünü olarak işaretle
      </label>

      <div className="flex justify-end">
        <Button type="submit">{product ? "Ürünü Güncelle" : "Ürün Oluştur"}</Button>
      </div>
    </form>
  );
}
