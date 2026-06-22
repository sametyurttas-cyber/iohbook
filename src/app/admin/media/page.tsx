import { AdminMediaUploadForm } from "@/features/media/admin-media-upload-form";
import styles from "@/features/admin/admin-scene.module.css";

export default async function AdminMediaPage() {
  return (
    <main className={styles.main} id="main-content">
      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <div className={styles.heroMain}>
            <div className={styles.heroGhost} aria-hidden="true">MEDIA</div>
            <p className={styles.kicker}>08 / MEDYA YONETIMI</p>
            <h2 className={styles.heroTitle}>Medya Yukleme</h2>
            <p className={styles.heroLead}>
              Kapak, galeri ve banner gorselleri public-media bucket alanina yuklenir
              ve product_media metadata kaydi olusturur. Urun admin ekrani henuz
              eklenmedigi icin bu gecici yuzey product id degerini manuel alir.
            </p>
          </div>
        </div>
      </section>

      <div className={styles.grid2}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>Yukleme Alani</h3>
            <p className={styles.kicker}>UPLOAD</p>
          </div>
          <AdminMediaUploadForm />
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>Bucket Bilgisi</h3>
            <p className={styles.kicker}>STORAGE</p>
          </div>
          <p className={styles.panelLead}>
            Yuklenen gorseller public-media bucket alaninda saklanir. Her yukleme
            icin urun ID ve gorsel turu (cover/gallery/banner) secilmelidir.
          </p>
          <div className={styles.grid}>
            <div className={styles.panel} style={{ padding: "1rem" }}>
              <p className={styles.kicker}>BUCKET</p>
              <p className={styles.dd}>public-media</p>
            </div>
            <div className={styles.panel} style={{ padding: "1rem" }}>
              <p className={styles.kicker}>ERISIM</p>
              <p className={styles.dd}>Public read</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
