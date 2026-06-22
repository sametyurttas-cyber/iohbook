import Link from "next/link";
import { SubmissionForm } from "@/features/verification/submission-form";
import styles from "@/features/account/account-scene.module.css";

type NewSubmissionPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  kind_required: "Talep turu zorunlu.",
  title_required: "Baslik zorunlu.",
  body_required: "Mesaj icerigi zorunlu.",
  book_slug_required: "Kitap secimi zorunlu.",
  book_slug_invalid: "Gecersiz kitap.",
  amazon_order_id_required: "Amazon siparis numarasi zorunlu.",
  amazon_review_url_required: "Amazon yorum linki zorunlu.",
  amazon_review_url_invalid: "Gecersiz URL formati.",
  attachment_required: "Amazon dogrulamasi icin en az bir dosya zorunlu.",
  attachment_mime_type_invalid: "Gecersiz dosya tipi. JPG, PNG, WebP, PDF kabul edilir.",
  attachment_size_exceeded: "Dosya boyutu 10MB ustunde olamaz.",
  attachment_filename_invalid: "Gecersiz dosya adi.",
  setup_required: "Dogrulama modulu veritabani kurulumu henuz tamamlanmadi.",
  insert_failed: "Gonderi olusturulamadi. Lutfen tekrar dene."
};

export default async function NewSubmissionPage({ searchParams }: NewSubmissionPageProps) {
  const params = await searchParams;

  return (
    <div className={styles.cards}>
      <div className={styles.contentHead}>
        <Link className={styles.backLink} href="/account/rewards">
          ← Oduellere Don
        </Link>
        <p className={styles.kicker}>YENI GONDERI</p>
        <h2 className={styles.contentTitle}>Yeni Dogrulama / Mesaj</h2>
        <p className={styles.contentLead}>
          Amazon satin alim veya yorum dogrulamasi gonder, ya da destek ekibine genel
          mesaj yaz. Dogrulama onaylandiginda IOH puani hesabina islenir.
        </p>
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h3 className={styles.panelTitle}>Gonderi Formu</h3>
          <p className={styles.kicker}>FORM</p>
        </div>
        <SubmissionForm error={params?.error ? errorMessages[params.error] ?? params.error : undefined} />
      </section>
    </div>
  );
}
