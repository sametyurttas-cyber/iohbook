import Link from "next/link";
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
import styles from "@/features/admin/admin-scene.module.css";

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
    <main className={styles.main} id="main-content">
      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <div className={styles.heroMain}>
            <div className={styles.heroGhost} aria-hidden="true">USERS</div>
            <p className={styles.kicker}>03 / MINI CRM</p>
            <h2 className={styles.heroTitle}>Kullanicilar</h2>
            <p className={styles.heroLead}>
              Musteri profilini, IOH puanlarini, wallet bilgisini ve siparis ozetini tek
              ekrandan takip edin. Sifre ve hassas auth verileri burada gosterilmez.
            </p>
          </div>
          <div className={styles.heroActions}>
            <span className={styles.statPill}>Toplam <b>{users.length}</b> kullanici</span>
          </div>
        </div>
      </section>

      <div className={styles.grid}>
        {params.error ? (
          <div className={styles.noticeError}>Islem tamamlanamadi: {params.error}</div>
        ) : null}

        <form className={styles.filters}>
          <Input
            defaultValue={params.q ?? ""}
            name="q"
            placeholder="E-posta veya ad soyad ara"
          />
          <Input defaultValue={params.city ?? ""} name="city" placeholder="Sehir" />
          <Input defaultValue={params.country ?? ""} name="country" placeholder="Ulke" />
          <select
            defaultValue={params.wallet ?? "all"}
            name="wallet"
          >
            <option value="all">Wallet: Tumu</option>
            <option value="yes">Wallet bagli</option>
            <option value="no">Wallet yok</option>
          </select>
          <select
            defaultValue={params.hasPoints ?? "all"}
            name="hasPoints"
          >
            <option value="all">Puan: Tumu</option>
            <option value="yes">0 ustu puan</option>
          </select>
          <select
            defaultValue={params.hasOrders ?? "all"}
            name="hasOrders"
          >
            <option value="all">Siparis: Tumu</option>
            <option value="yes">Siparisi olan</option>
            <option value="no">Siparisi olmayan</option>
          </select>
          <select
            defaultValue={params.sort ?? "created_desc"}
            name="sort"
          >
            <option value="created_desc">Yeni kayit once</option>
            <option value="created_asc">Eski kayit once</option>
          </select>
          <Button type="submit" variant="secondary">
            Filtrele
          </Button>
        </form>

        <div className={styles.tableWrap}>
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
                      <span className={styles.badge}>{user.accountStatus}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.city ?? "-"} / {user.countryCode ?? "-"}
                  </TableCell>
                  <TableCell className="font-semibold text-gold">{user.balance}</TableCell>
                  <TableCell>
                    <span className={styles.badge + " " + (user.hasWallet ? styles.badgeGold : "")}>
                      {user.hasWallet ? "Var" : "Yok"}
                    </span>
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
        </div>
      </div>
    </main>
  );
}
