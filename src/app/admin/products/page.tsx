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
import { ProductFilters } from "@/features/products/product-filters";
import { ProductStatusBadge } from "@/features/products/product-status-badge";
import { formatMoney, VARIANT_FORMAT_LABELS } from "@/features/products/product-utils";
import { listProductsForAdmin } from "@/features/products/queries";
import type { ProductStatus } from "@/types/database";

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
    <main className="mx-auto grid max-w-7xl gap-6 px-6 py-10" id="main-content">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-eyebrow uppercase text-muted-foreground">Catalog</p>
          <h1 className="mt-3 font-display text-title-lg text-paper">Ürünler</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Kitap üst kayıtlarını, yayın durumunu, varyantları, stok özetini ve
            koleksiyon eşlemesini tek yerden izleyin.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">Yeni Ürün</Link>
        </Button>
      </div>

      <ProductFilters q={params?.q} status={params?.status ?? "all"} />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ürün</TableHead>
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
                Ürün bulunamadı.
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
                    {product.is_limited ? <Badge variant="gold">Limitli</Badge> : null}
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
                      <span className="text-muted-foreground">Henüz varyant yok</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">{totalStock}</TableCell>
                <TableCell className="text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/products/${product.id}`}>Düzenle</Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </main>
  );
}
