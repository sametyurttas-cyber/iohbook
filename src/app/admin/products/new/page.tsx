import { ProductForm } from "@/features/products/product-form";
import { listCollectionsForAdmin } from "@/features/products/queries";
import styles from "@/features/admin/admin-scene.module.css";

export default async function NewProductPage() {
  const collections = await listCollectionsForAdmin();

  return (
    <main className={styles.main} id="main-content">
      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <div className={styles.heroMain}>
            <div className={styles.heroGhost} aria-hidden="true">NEW</div>
            <p className={styles.kicker}>KATALOG / YENI URUN</p>
            <h2 className={styles.heroTitle}>Urun Olustur</h2>
            <p className={styles.heroLead}>
              Once urun ust kaydini olusturun; varyant, stok ve medya bir sonraki
              ekranda yonetilecek.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h3 className={styles.panelTitle}>Urun Bilgileri</h3>
          <p className={styles.kicker}>TEMEL BILGILER</p>
        </div>
        <ProductForm collections={collections} />
      </section>
    </main>
  );
}
