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
import styles from "@/features/admin/admin-scene.module.css";

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
    <main className={styles.main} id="main-content">
      <div className={styles.detailHead}>
        <Link className={styles.backLink} href="/admin/products">
          ← Urunlere Don
        </Link>
        <div className={styles.detailTitle}>
          {product.title}
          <ProductStatusBadge status={product.status} />
        </div>
        <p className={styles.detailMeta}>/{product.slug} · {variants.length} varyant · {media.length} medya</p>
      </div>

      <div className={styles.notices} style={{ marginBottom: "1.25rem" }}>
        {notices?.saved ? (
          <div className={styles.noticeSuccess}>Degisiklik kaydedildi.</div>
        ) : null}
        {notices?.error ? (
          <div className={styles.noticeError}>Islem tamamlanamadi: {notices.error}</div>
        ) : null}
      </div>

      <div className={styles.grid}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>Urun Bilgileri</h3>
            <p className={styles.kicker}>TEMEL BILGILER</p>
          </div>
          <ProductForm collections={collections} product={product} />
        </section>

        <section className={styles.panel}>
          <div className={styles.sectionHead}>
            <p className={styles.kicker}>VARYANTLAR VE STOK</p>
            <h3 className={styles.sectionTitle}>Varyantlar</h3>
            <p className={styles.sectionLead}>
              Standart, imzali ve koleksiyon baskilari ayri SKU olarak yonetin.
            </p>
          </div>
          <div className={styles.grid}>
            {variants.map((variant) => (
              <VariantForm key={variant.id} productId={product.id} variant={variant} />
            ))}
          </div>
          <div style={{ border: "1px solid rgba(231,197,116,0.3)", borderRadius: "12px", padding: "0.5rem", background: "rgba(231,197,116,0.04)" }}>
            <VariantForm productId={product.id} />
          </div>
        </section>

        <div className={styles.gridLg3}>
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h3 className={styles.panelTitle}>Medya Yonetimi</h3>
              <p className={styles.kicker}>UPLOAD</p>
            </div>
            <p className={styles.panelLead}>
              Kapak ve galeri gorselleri public-media bucket alanina yuklenir ve
              urun metadata kaydi olusturur.
            </p>
            <AdminMediaUploadForm productId={product.id} />
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h3 className={styles.panelTitle}>Medya Kayitlari</h3>
              <p className={styles.kicker}>{media.length} kayit</p>
            </div>
            <div className={styles.grid}>
              {media.length === 0 ? (
                <p className={styles.sectionLead}>Henuz medya kaydi yok.</p>
              ) : null}
              {media.map((item) => (
                <div className={styles.panel} key={item.id} style={{ padding: "1rem" }}>
                  <div className={styles.panelHead} style={{ padding: 0, border: 0 }}>
                    <span className={styles.badge + " " + styles.badgeGold}>{item.kind}</span>
                    <span className={styles.detailMeta}>{item.storage_bucket}</span>
                  </div>
                  <p className={styles.detailMeta} style={{ wordBreak: "break-all" }}>{item.storage_path}</p>
                  {item.alt_text ? <p className={styles.sectionLead}>{item.alt_text}</p> : null}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
