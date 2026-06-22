import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { listContentPagesForAdmin } from "@/features/content/queries";
import { formatDateTime } from "@/features/orders/order-utils";
import styles from "@/features/admin/admin-scene.module.css";

const statusLabels = {
  archived: "Arsiv",
  draft: "Taslak",
  published: "Yayinda"
};

function badgeClassForStatus(status: string) {
  if (status === "published") return styles.badgeGold;
  if (status === "draft") return styles.badgeBlue;
  return "";
}

export default async function AdminContentPage() {
  const pages = await listContentPagesForAdmin();

  return (
    <main className={styles.main} id="main-content">
      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <div className={styles.heroMain}>
            <div className={styles.heroGhost} aria-hidden="true">CONTENT</div>
            <p className={styles.kicker}>07 / ICERIK YONETIMI</p>
            <h2 className={styles.heroTitle}>Icerik Yonetimi</h2>
            <p className={styles.heroLead}>
              Ana sayfa, yazar hakkinda, iletisim, SSS ve kampanya bloklarini teknik
              bilgi gerektirmeden yonetin.
            </p>
          </div>
          <div className={styles.heroActions}>
            <Button asChild>
              <Link href="/admin/content/home">Ana Sayfayi Duzenle</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className={styles.tableWrap}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sayfa</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Son Guncelleme</TableHead>
              <TableHead className="text-right">Aksiyon</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.map((page) => (
              <TableRow key={page.slug}>
                <TableCell>
                  <div className="grid gap-1">
                    <span className="font-medium text-paper">{page.title}</span>
                    <span className="text-xs text-muted-foreground">/{page.slug}</span>
                    {page.excerpt ? (
                      <span className="text-sm text-muted-foreground">{page.excerpt}</span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={styles.badge + " " + badgeClassForStatus(page.status)}>
                    {statusLabels[page.status]}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {page.updated_at ? formatDateTime(page.updated_at) : "Henuz kaydedilmedi"}
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/content/${page.slug}`}>Duzenle</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
