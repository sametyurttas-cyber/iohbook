import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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
import { formatDateTime, getBadgeVariant } from "@/features/orders/order-utils";

const statusLabels = {
  archived: "Arsiv",
  draft: "Taslak",
  published: "Yayinda"
};

export default async function AdminContentPage() {
  const pages = await listContentPagesForAdmin();

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-6 py-10" id="main-content">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-eyebrow uppercase text-muted-foreground">Content</p>
          <h1 className="mt-3 font-display text-title-lg text-paper">Icerik yonetimi</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Ana sayfa, yazar hakkinda, iletisim, SSS ve kampanya bloklarini teknik
            bilgi gerektirmeden yonetin.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/content/home">Ana sayfayi duzenle</Link>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sayfa</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Son guncelleme</TableHead>
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
                <Badge variant={getBadgeVariant(page.status)}>
                  {statusLabels[page.status]}
                </Badge>
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
    </main>
  );
}
