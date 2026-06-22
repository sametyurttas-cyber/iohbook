import Link from "next/link";
import { ContentEditor } from "@/features/content/content-editor";
import type { ContentBody } from "@/features/content/content-types";
import { getContentPageForAdmin } from "@/features/content/queries";
import styles from "@/features/admin/admin-scene.module.css";

type AdminContentEditPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export default async function AdminContentEditPage({
  params,
  searchParams
}: AdminContentEditPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const page = await getContentPageForAdmin(slug);
  const body = page.body as ContentBody;

  return (
    <main className={styles.main} id="main-content">
      <div className={styles.detailHead}>
        <Link className={styles.backLink} href="/admin/content">← Icerik Listesi</Link>
        <div className={styles.detailTitle}>{page.title}</div>
        <p className={styles.detailMeta}>/{page.slug}</p>
      </div>

      <div className={styles.notices} style={{ marginBottom: "1.25rem" }}>
        {query?.saved ? (
          <div className={styles.noticeSuccess}>Icerik kaydedildi.</div>
        ) : null}
        {query?.error ? (
          <div className={styles.noticeError}>Kayit sirasinda hata olustu: {query.error}</div>
        ) : null}
      </div>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h3 className={styles.panelTitle}>Icerik Editoru</h3>
          <p className={styles.kicker}>EDITOR</p>
        </div>
        <ContentEditor
          initial={{
            blocks: Array.isArray(body.blocks) ? body.blocks : [],
            excerpt: page.excerpt ?? "",
            seoDescription: page.seo_description ?? "",
            seoTitle: page.seo_title ?? "",
            slug: page.slug,
            status: page.status,
            title: page.title
          }}
        />
      </section>
    </main>
  );
}
