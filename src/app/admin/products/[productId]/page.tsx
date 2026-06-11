import Link from "next/link";
import { AdminMediaUploadForm } from "@/features/media/admin-media-upload-form";
import { ProductForm } from "@/features/products/product-form";
import { ProductStatusBadge } from "@/features/products/product-status-badge";
import { VariantForm, type VariantWithInventory } from "@/features/products/variant-form";
import {
  getProductForAdmin,
  listCollectionsForAdmin
} from "@/features/products/queries";
import type { ProductMedia } from "@/types/database";

type ProductDetailPageProps = {
  params: Promise<{
    productId: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    saved?: string;
  }>;
};

type ProductMediaRow = ProductMedia;

export default async function ProductDetailPage({
  params,
  searchParams
}: ProductDetailPageProps) {
  const { productId } = await params;
  const notices = await searchParams;
  const [product, collections] = await Promise.all([
    getProductForAdmin(productId),
    listCollectionsForAdmin()
  ]);

  const variants = (product.product_variants ?? []) as VariantWithInventory[];
  const media = (product.product_media ?? []) as ProductMediaRow[];

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-6 py-10" id="main-content">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <Link className="text-sm text-muted-foreground hover:text-gold" href="/admin/products">
            Urunlere don
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-title-lg text-paper">{product.title}</h1>
            <ProductStatusBadge status={product.status} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">/{product.slug}</p>
        </div>
        <div className="rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          {variants.length} varyant - {media.length} medya kaydi
        </div>
      </div>

      {notices?.saved ? (
        <div className="rounded-md border border-gold/30 bg-gold/10 p-3 text-sm text-gold">
          Degisiklik kaydedildi.
        </div>
      ) : null}
      {notices?.error ? (
        <div className="rounded-md border border-burgundy-bright/30 bg-burgundy-bright/10 p-3 text-sm text-burgundy-soft">
          Islem tamamlanamadi: {notices.error}
        </div>
      ) : null}

      <section className="rounded-lg border border-border bg-card p-6 shadow-panel">
        <div className="mb-6">
          <p className="text-eyebrow uppercase text-muted-foreground">Product</p>
          <h2 className="mt-2 font-display text-title-md text-paper">Urun bilgileri</h2>
        </div>
        <ProductForm collections={collections} product={product} />
      </section>

      <section className="grid gap-5">
        <div>
          <p className="text-eyebrow uppercase text-muted-foreground">Variants</p>
          <h2 className="mt-2 font-display text-title-md text-paper">
            Varyantlar ve stok
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Standart, imzali ve koleksiyon baskilari ayri SKU olarak yonetin.
          </p>
        </div>

        {variants.map((variant) => (
          <VariantForm key={variant.id} productId={product.id} variant={variant} />
        ))}

        <div className="rounded-lg border border-gold/30 bg-gold/5 p-1">
          <VariantForm productId={product.id} />
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-border bg-card p-6 shadow-panel">
          <p className="text-eyebrow uppercase text-muted-foreground">Media</p>
          <h2 className="mt-2 font-display text-title-md text-paper">Medya yonetimi</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Kapak ve galeri gorselleri public-media bucket alanina yuklenir ve
            urun metadata kaydi olusturur.
          </p>
          <div className="mt-6">
            <AdminMediaUploadForm productId={product.id} />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-panel">
          <h3 className="font-display text-title-md text-paper">Medya kayitlari</h3>
          <div className="mt-4 grid gap-3">
            {media.length === 0 ? (
              <p className="text-sm text-muted-foreground">Henuz medya kaydi yok.</p>
            ) : null}
            {media.map((item) => (
              <div
                className="grid gap-2 rounded-md border border-border bg-ink-soft p-3 text-sm"
                key={item.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-paper">{item.kind}</span>
                  <span className="text-muted-foreground">{item.storage_bucket}</span>
                </div>
                <p className="break-all text-muted-foreground">{item.storage_path}</p>
                {item.alt_text ? <p className="text-muted-foreground">{item.alt_text}</p> : null}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
