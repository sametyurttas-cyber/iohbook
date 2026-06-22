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
import { ProductFilters } from "@/features/products/product-filters";
import { ProductStatusBadge } from "@/features/products/product-status-badge";
import { formatMoney, VARIANT_FORMAT_LABELS } from "@/features/products/product-utils";
import { listProductsForAdmin } from "@/features/products/queries";
import type { ProductStatus } from "@/types/database";
import styles from "@/features/admin/admin-scene.module.css";

type AdminProductsPageProps = {
  searchParams?: Promise<{
    q?: string;
    status?: ProductStatus | "all";
  }>;
};

type VariantSummary = {
  active: boolean;
  currency: string;
  format: keyof typeof VARIANT_FORMAT_LABELS;
  id: string;
  price_minor: number;
  sku: string;
  title: string;
  inventory_items?: { on_hand: number; reserved: number }[] | null;
};

export default async function AdminProductsPage({
  searchParams
}: AdminProductsPageProps) {
  const params = await searchParams;
  const products = await listProductsForAdmin({
    q: params?.q,
    status: params?.status ?? "all"
  });

  return (
    <main className={styles.main} id="main-content">
      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <div className={styles.heroMain}>
            <div className={styles.heroGhost} aria-hidden="true">CATALOG</div>
            <p className={styles.kicker}>01 / KATALOG YONETIMI</p>
            <h2 className={styles.heroTitle}>Urunler</h2>
            <p className={styles.heroLead}>
              Kitap ust kayitlarini, yayin durumunu, varyantlari, stok ozetini ve
              koleksiyon eslemesini tek yerden izleyin.
            </p>
          </div>
          <div className={styles.heroActions}>
            <span className={styles.statPill}>Toplam <b>{products.length}</b> urun</span>
            <Button asChild>
              <Link href="/admin/products/new">Yeni Urun</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className={styles.grid}>
        <ProductFilters q={params?.q} status={params?.status ?? "all"} />

        <div className={styles.tableWrap}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Urun</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Koleksiyon</TableHead>
                <TableHead>Varyantlar</TableHead>
                <TableHead className="text-right">Stok</TableHead>
                <TableHead className="text-right">Aksiyon</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell className="py-10 text-center text-muted-foreground" colSpan={6}>
                    Urun bulunamadi.
                  </TableCell>
                </TableRow>
              ) : null}
              {products.map((product) => {
                const variants = (product.product_variants ?? []) as VariantSummary[];
                const totalStock = variants.reduce((sum, variant) => {
                  const inventory = variant.inventory_items?.[0];
                  return sum + (inventory?.on_hand ?? 0) - (inventory?.reserved ?? 0);
                }, 0);
                const firstVariant = variants[0];

                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="grid gap-1">
                        <Link
                          className="font-medium text-paper hover:text-gold"
                          href={`/admin/products/${product.id}`}
                        >
                          {product.title}
                        </Link>
                        <span className="text-xs text-muted-foreground">/{product.slug}</span>
                        {product.is_limited ? <ProductStatusBadge status="active" /> : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ProductStatusBadge status={product.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.collections?.title ?? "Yok"}
                    </TableCell>
                    <TableCell>
                      <div className="grid gap-1 text-sm">
                        <span>{variants.length} varyant</span>
                        {firstVariant ? (
                          <span className="text-muted-foreground">
                            {VARIANT_FORMAT_LABELS[firstVariant.format]} ·{" "}
                            {formatMoney(firstVariant.price_minor, firstVariant.currency)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Henuz varyant yok</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{totalStock}</TableCell>
                    <TableCell className="text-right">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/products/${product.id}`}>Duzenle</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </main>
  );
}
