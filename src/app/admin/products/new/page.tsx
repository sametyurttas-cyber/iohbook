import { ProductForm } from "@/features/products/product-form";
import { listCollectionsForAdmin } from "@/features/products/queries";

export default async function NewProductPage() {
  const collections = await listCollectionsForAdmin();

  return (
    <main className="mx-auto grid max-w-5xl gap-6 px-6 py-10" id="main-content">
      <div>
        <p className="text-eyebrow uppercase text-muted-foreground">New product</p>
        <h1 className="mt-3 font-display text-title-lg text-paper">Ürün Oluştur</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Önce ürün üst kaydını oluşturun; varyant, stok ve medya bir sonraki
          ekranda yönetilecek.
        </p>
      </div>
      <section className="rounded-lg border border-border bg-card p-6 shadow-panel">
        <ProductForm collections={collections} />
      </section>
    </main>
  );
}
