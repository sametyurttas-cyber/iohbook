import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  adjustAdminUserPoints,
  saveAdminUserNotes
} from "@/features/admin-users/actions";
import { getAdminUserDetail } from "@/features/admin-users/queries";
import { formatIohPointReason } from "@/features/points/queries";
import { formatDateTime, ORDER_STATUS_LABELS, getBadgeVariant } from "@/features/orders/order-utils";
import { formatMoney } from "@/features/products/product-utils";

type AdminUserDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; saved?: string }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  "amount-required": "Puan miktari 0 olamaz.",
  "negative-balance": "Bu islem negatif bakiye olusturur.",
  "reason-required": "Sebep alani zorunlu."
};

export default async function AdminUserDetailPage({
  params,
  searchParams
}: AdminUserDetailPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const user = await getAdminUserDetail(id);

  if (!user) {
    notFound();
  }

  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-6 py-10" id="main-content">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Link className="text-sm text-gold hover:text-gold-soft" href="/admin/users">
            Kullanicilara don
          </Link>
          <p className="mt-5 text-eyebrow uppercase text-muted-foreground">Kullanici detayi</p>
          <h1 className="mt-3 font-display text-title-lg text-paper">
            {user.fullName ?? user.email}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="gold">{user.balance} IOH</Badge>
          <Badge variant={user.hasWallet ? "blue" : "outline"}>
            {user.hasWallet ? "Wallet bagli" : "Wallet yok"}
          </Badge>
          <Badge variant="outline">{user.accountStatus}</Badge>
        </div>
      </div>

      {query?.saved ? (
        <div className="rounded-md border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-gold">
          Islem kaydedildi: {query.saved}
        </div>
      ) : null}
      {query?.error ? (
        <div className="rounded-md border border-burgundy-bright/30 bg-burgundy-bright/10 px-4 py-3 text-sm text-burgundy-soft">
          {ERROR_MESSAGES[query.error] ?? `Islem tamamlanamadi: ${query.error}`}
        </div>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-panel lg:col-span-2">
          <h2 className="font-display text-title-md text-paper">Profil ozeti</h2>
          <dl className="mt-5 grid gap-4 text-sm md:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Ad soyad</dt>
              <dd className="mt-1 text-paper">{user.fullName ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">E-posta</dt>
              <dd className="mt-1 text-paper">{user.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Telefon</dt>
              <dd className="mt-1 text-paper">{user.phone ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Sehir / Ulke</dt>
              <dd className="mt-1 text-paper">
                {user.city ?? "-"} / {user.countryCode ?? "-"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Toplam siparis</dt>
              <dd className="mt-1 text-paper">{user.orderCount}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Toplam harcama</dt>
              <dd className="mt-1 text-paper">{formatMoney(user.totalSpentMinor, "TRY")}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Son siparis</dt>
              <dd className="mt-1 text-paper">{formatDateTime(user.lastOrderAt)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Kayit tarihi</dt>
              <dd className="mt-1 text-paper">{formatDateTime(user.createdAt)}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-gold/25 bg-gold/10 p-6 shadow-panel">
          <h2 className="font-display text-title-md text-paper">IOH puan</h2>
          <p className="mt-4 font-display text-5xl font-bold text-gold">{user.balance}</p>
          <dl className="mt-5 grid gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Toplam kazanilan</dt>
              <dd className="text-paper">{user.lifetimeEarned} IOH</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Toplam kullanilan</dt>
              <dd className="text-paper">{user.lifetimeSpent} IOH</dd>
            </div>
          </dl>
        </div>
      </section>

      {user.canManagePoints && user.pointsAvailable ? (
        <section className="grid gap-5 lg:grid-cols-2">
          <form action={adjustAdminUserPoints} className="rounded-2xl border border-border bg-card p-6 shadow-panel">
            <input name="profile_id" type="hidden" value={user.id} />
            <h2 className="font-display text-title-md text-paper">Manuel puan islemi</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Arti deger puan ekler, eksi deger puan duser. Negatif bakiye engellenir.
            </p>
            <div className="mt-5 grid gap-3">
              <Input name="amount" placeholder="Orn: 10 veya -5" type="number" />
              <Input name="reason" placeholder="Zorunlu sebep" />
              <Button type="submit">Puan islemini kaydet</Button>
            </div>
          </form>

          <form action={saveAdminUserNotes} className="rounded-2xl border border-border bg-card p-6 shadow-panel">
            <input name="profile_id" type="hidden" value={user.id} />
            <h2 className="font-display text-title-md text-paper">Admin notlari</h2>
            <Textarea
              className="mt-5 min-h-32"
              defaultValue={user.adminNotes ?? ""}
              name="admin_notes"
              placeholder="Sadece admin ekibi gorur."
            />
            <Button className="mt-4" type="submit" variant="secondary">
              Notu kaydet
            </Button>
          </form>
        </section>
      ) : (
        <section className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-panel">
          {user.canManagePoints
            ? "IOH puan tablolari henuz veritabaninda yok. Migration uygulandiktan sonra manuel puan islemleri acilir."
            : "Bu rolde puan veya admin notu degistirme yetkisi yok. Ekran sadece okuma modunda."}
        </section>
      )}

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-panel">
          <h2 className="font-display text-title-md text-paper">Wallet adresleri</h2>
          <div className="mt-5 grid gap-3">
            {user.wallets.length === 0 ? (
              <p className="text-sm text-muted-foreground">Bagli wallet yok.</p>
            ) : null}
            {user.wallets.map((wallet) => (
              <div className="rounded-md border border-white/10 bg-ink-soft p-4" key={wallet.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge variant={wallet.revoked_at ? "red" : "gold"}>
                    {wallet.revoked_at ? "Iptal" : "Dogrulanmis"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {wallet.provider} / chain {wallet.chain_id ?? "-"}
                  </span>
                </div>
                <p className="mt-3 break-all font-mono text-xs text-paper">
                  {wallet.normalized_address}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Baglanma: {formatDateTime(wallet.verified_at)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-panel">
          <h2 className="font-display text-title-md text-paper">Adresler</h2>
          <div className="mt-5 grid gap-3">
            {user.addresses.length === 0 ? (
              <p className="text-sm text-muted-foreground">Kayitli adres yok.</p>
            ) : null}
            {user.addresses.map((address) => (
              <div className="rounded-md border border-white/10 bg-ink-soft p-4" key={address.id}>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{address.type}</Badge>
                  {address.is_default ? <Badge variant="gold">Varsayilan</Badge> : null}
                </div>
                <p className="mt-3 text-sm text-paper">{address.full_name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {address.line1} {address.line2 ?? ""} / {address.city} {address.country_code}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 font-display text-title-md text-paper">Puan hareketleri</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sebep</TableHead>
                <TableHead>Tutar</TableHead>
                <TableHead>Tarih</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.ledger.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center text-muted-foreground" colSpan={3}>
                    Puan hareketi yok.
                  </TableCell>
                </TableRow>
              ) : null}
              {user.ledger.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{formatIohPointReason(entry.reason)}</TableCell>
                  <TableCell className={entry.amount > 0 ? "text-gold" : "text-burgundy-soft"}>
                    {entry.amount > 0 ? "+" : ""}
                    {entry.amount}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(entry.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div>
          <h2 className="mb-4 font-display text-title-md text-paper">Siparis gecmisi</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Siparis</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Tutar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.orders.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center text-muted-foreground" colSpan={3}>
                    Siparis yok.
                  </TableCell>
                </TableRow>
              ) : null}
              {user.orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div className="grid gap-1">
                      <span className="text-paper">{order.order_number}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(order.created_at)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(order.status)}>
                      {ORDER_STATUS_LABELS[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatMoney(order.total_minor, order.currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </main>
  );
}
