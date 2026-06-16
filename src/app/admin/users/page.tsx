import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { listAdminUsers, type AdminUsersFilters } from "@/features/admin-users/queries";
import { formatDateTime } from "@/features/orders/order-utils";
import { formatMoney } from "@/features/products/product-utils";

type AdminUsersPageProps = {
  searchParams?: Promise<AdminUsersFilters & { error?: string; saved?: string }>;
};

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const params = (await searchParams) ?? {};
  const users = await listAdminUsers({
    city: params.city,
    country: params.country,
    hasOrders: params.hasOrders ?? "all",
    hasPoints: params.hasPoints ?? "all",
    q: params.q,
    sort: params.sort ?? "created_desc",
    wallet: params.wallet ?? "all"
  });

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-6 py-10" id="main-content">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-eyebrow uppercase text-muted-foreground">Mini CRM</p>
          <h1 className="mt-3 font-display text-title-lg text-paper">Kullanicilar</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Musteri profilini, IOH puanlarini, wallet bilgisini ve siparis ozetini tek
            ekrandan takip edin. Sifre ve hassas auth verileri burada gosterilmez.
          </p>
        </div>
        <div className="rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          <span className="font-semibold text-paper">{users.length}</span> kullanici
        </div>
      </div>

      {params.error ? (
        <div className="rounded-md border border-burgundy-bright/30 bg-burgundy-bright/10 px-4 py-3 text-sm text-burgundy-soft">
          Islem tamamlanamadi: {params.error}
        </div>
      ) : null}

      <form className="grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-panel lg:grid-cols-8">
        <Input
          className="lg:col-span-2"
          defaultValue={params.q ?? ""}
          name="q"
          placeholder="E-posta veya ad soyad ara"
        />
        <Input defaultValue={params.city ?? ""} name="city" placeholder="Sehir" />
        <Input defaultValue={params.country ?? ""} name="country" placeholder="Ulke" />
        <select
          className="h-11 rounded-2xl border border-white/12 bg-ink-soft/80 px-4 text-sm text-foreground"
          defaultValue={params.wallet ?? "all"}
          name="wallet"
        >
          <option value="all">Wallet: Tumu</option>
          <option value="yes">Wallet bagli</option>
          <option value="no">Wallet yok</option>
        </select>
        <select
          className="h-11 rounded-2xl border border-white/12 bg-ink-soft/80 px-4 text-sm text-foreground"
          defaultValue={params.hasPoints ?? "all"}
          name="hasPoints"
        >
          <option value="all">Puan: Tumu</option>
          <option value="yes">0 ustu puan</option>
        </select>
        <select
          className="h-11 rounded-2xl border border-white/12 bg-ink-soft/80 px-4 text-sm text-foreground"
          defaultValue={params.hasOrders ?? "all"}
          name="hasOrders"
        >
          <option value="all">Siparis: Tumu</option>
          <option value="yes">Siparisi olan</option>
          <option value="no">Siparisi olmayan</option>
        </select>
        <select
          className="h-11 rounded-2xl border border-white/12 bg-ink-soft/80 px-4 text-sm text-foreground"
          defaultValue={params.sort ?? "created_desc"}
          name="sort"
        >
          <option value="created_desc">Yeni kayit once</option>
          <option value="created_asc">Eski kayit once</option>
        </select>
        <Button className="lg:col-span-8" type="submit" variant="secondary">
          Filtrele
        </Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kullanici</TableHead>
            <TableHead>Konum</TableHead>
            <TableHead>IOH</TableHead>
            <TableHead>Wallet</TableHead>
            <TableHead>Siparis</TableHead>
            <TableHead>Son Siparis</TableHead>
            <TableHead>Kayit</TableHead>
            <TableHead className="text-right">Detay</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell className="py-10 text-center text-muted-foreground" colSpan={8}>
                Filtrelere uygun kullanici bulunamadi.
              </TableCell>
            </TableRow>
          ) : null}

          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="grid gap-1">
                  <span className="font-medium text-paper">
                    {user.fullName ?? "Isimsiz kullanici"}
                  </span>
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                  <Badge variant="outline">{user.accountStatus}</Badge>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {user.city ?? "-"} / {user.countryCode ?? "-"}
              </TableCell>
              <TableCell className="font-semibold text-gold">{user.balance}</TableCell>
              <TableCell>
                <Badge variant={user.hasWallet ? "gold" : "outline"}>
                  {user.hasWallet ? "Var" : "Yok"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="grid gap-1 text-sm">
                  <span className="text-paper">{user.orderCount}</span>
                  <span className="text-muted-foreground">
                    {formatMoney(user.totalSpentMinor, "TRY")}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDateTime(user.lastOrderAt)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDateTime(user.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/users/${user.id}`}>Ac</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </main>
  );
}
