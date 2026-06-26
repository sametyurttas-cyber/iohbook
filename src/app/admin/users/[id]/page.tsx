import Link from "next/link";
import { notFound } from "next/navigation";
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
import { formatIohPointReason, getIohPointLedgerTitle } from "@/features/points/queries";
import { formatDateTime, ORDER_STATUS_LABELS } from "@/features/orders/order-utils";
import { formatMoney } from "@/features/products/product-utils";
import styles from "@/features/admin/admin-scene.module.css";

type AdminUserDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; saved?: string }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  "amount-required": "Puan miktari 0 olamaz.",
  "negative-balance": "Bu islem negatif bakiye olusturur.",
  "reason-required": "Sebep alani zorunlu."
};

function badgeClassForStatus(status: string) {
  if (status === "paid" || status === "completed" || status === "fulfilled") return styles.badgeGold;
  if (status === "cancelled" || status === "refunded") return styles.badgeRed;
  return styles.badgeBlue;
}

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
    <main className={styles.main} id="main-content">
      <div className={styles.detailHead}>
        <Link className={styles.backLink} href="/admin/users">← Kullanicilara Don</Link>
        <div className={styles.detailTitle}>
          {user.fullName ?? user.email}
          <span className={styles.badge + " " + styles.badgeGold}>{user.balance} IOH</span>
          <span className={styles.badge + " " + (user.hasWallet ? styles.badgeBlue : "")}>
            {user.hasWallet ? "Wallet bagli" : "Wallet yok"}
          </span>
          <span className={styles.badge}>{user.accountStatus}</span>
        </div>
        <p className={styles.detailMeta}>{user.email}</p>
      </div>

      <div className={styles.notices} style={{ marginBottom: "1.25rem" }}>
        {query?.saved ? (
          <div className={styles.noticeSuccess}>Islem kaydedildi: {query.saved}</div>
        ) : null}
        {query?.error ? (
          <div className={styles.noticeError}>
            {ERROR_MESSAGES[query.error] ?? `Islem tamamlanamadi: ${query.error}`}
          </div>
        ) : null}
      </div>

      <div className={styles.grid}>
        <div className={styles.gridLg3}>
          <section className={styles.panel} style={{ gridColumn: "span 2" }}>
            <div className={styles.panelHead}>
              <h3 className={styles.panelTitle}>Profil Ozeti</h3>
              <p className={styles.kicker}>KULLANICI</p>
            </div>
            <dl className={styles.dl}>
              <div>
                <dt className={styles.dt}>Ad Soyad</dt>
                <dd className={styles.dd}>{user.fullName ?? "-"}</dd>
              </div>
              <div>
                <dt className={styles.dt}>E-posta</dt>
                <dd className={styles.dd}>{user.email}</dd>
              </div>
              <div>
                <dt className={styles.dt}>Telefon</dt>
                <dd className={styles.dd}>{user.phone ?? "-"}</dd>
              </div>
              <div>
                <dt className={styles.dt}>Sehir / Ulke</dt>
                <dd className={styles.dd}>{user.city ?? "-"} / {user.countryCode ?? "-"}</dd>
              </div>
              <div>
                <dt className={styles.dt}>Toplam Siparis</dt>
                <dd className={styles.dd}>{user.orderCount}</dd>
              </div>
              <div>
                <dt className={styles.dt}>Toplam Harcama</dt>
                <dd className={styles.dd}>{formatMoney(user.totalSpentMinor, "TRY")}</dd>
              </div>
              <div>
                <dt className={styles.dt}>Son Siparis</dt>
                <dd className={styles.dd}>{formatDateTime(user.lastOrderAt)}</dd>
              </div>
              <div>
                <dt className={styles.dt}>Kayit Tarihi</dt>
                <dd className={styles.dd}>{formatDateTime(user.createdAt)}</dd>
              </div>
            </dl>
          </section>

          <section className={styles.panel + " " + styles.panelGold}>
            <div className={styles.panelHead}>
              <h3 className={styles.panelTitle}>IOH Puan</h3>
              <p className={styles.kicker}>PUAN</p>
            </div>
            <p className={styles.ddGold} style={{ fontSize: "3rem", margin: 0 }}>{user.balance}</p>
            <dl className={styles.dl}>
              <div>
                <dt className={styles.dt}>Toplam Kazanilan</dt>
                <dd className={styles.dd}>{user.lifetimeEarned} IOH</dd>
              </div>
              <div>
                <dt className={styles.dt}>Toplam Kullanilan</dt>
                <dd className={styles.dd}>{user.lifetimeSpent} IOH</dd>
              </div>
            </dl>
          </section>
        </div>

        {user.canManagePoints && user.pointsAvailable ? (
          <div className={styles.grid2}>
            <form action={adjustAdminUserPoints} className={styles.panel}>
              <input name="profile_id" type="hidden" value={user.id} />
              <div className={styles.panelHead}>
                <h3 className={styles.panelTitle}>Manuel Puan Islemi</h3>
                <p className={styles.kicker}>AYARLAR</p>
              </div>
              <p className={styles.panelLead}>
                Arti deger puan ekler, eksi deger puan duser. Negatif bakiye engellenir.
              </p>
              <div className={styles.formGrid}>
                <Input name="amount" placeholder="Orn: 10 veya -5" type="number" />
                <Input name="reason" placeholder="Zorunlu sebep" />
                <Button type="submit">Puan islemini kaydet</Button>
              </div>
            </form>

            <form action={saveAdminUserNotes} className={styles.panel}>
              <input name="profile_id" type="hidden" value={user.id} />
              <div className={styles.panelHead}>
                <h3 className={styles.panelTitle}>Admin Notlari</h3>
                <p className={styles.kicker}>INTERNAL</p>
              </div>
              <Textarea
                className="min-h-32"
                defaultValue={user.adminNotes ?? ""}
                name="admin_notes"
                placeholder="Sadece admin ekibi gorur."
              />
              <Button type="submit" variant="secondary">Notu kaydet</Button>
            </form>
          </div>
        ) : (
          <section className={styles.panel}>
            <p className={styles.panelLead}>
              {user.canManagePoints
                ? "IOH puan tablolari henuz veritabaninda yok. Migration uygulandiktan sonra manuel puan islemleri acilir."
                : "Bu rolde puan veya admin notu degistirme yetkisi yok. Ekran sadece okuma modunda."}
            </p>
          </section>
        )}

        <div className={styles.grid2}>
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h3 className={styles.panelTitle}>Wallet Adresleri</h3>
              <p className={styles.kicker}>{user.wallets.length} kayit</p>
            </div>
            <div className={styles.grid}>
              {user.wallets.length === 0 ? (
                <p className={styles.sectionLead}>Bagli wallet yok.</p>
              ) : null}
              {user.wallets.map((wallet) => (
                <div className={styles.panel} key={wallet.id} style={{ padding: "1rem" }}>
                  <div className={styles.panelHead} style={{ padding: 0, border: 0 }}>
                    <span className={styles.badge + " " + (wallet.revoked_at ? styles.badgeRed : styles.badgeGold)}>
                      {wallet.revoked_at ? "Iptal" : "Dogrulanmis"}
                    </span>
                    <span className={styles.detailMeta}>
                      {wallet.provider} / chain {wallet.chain_id ?? "-"}
                    </span>
                  </div>
                  <p className={styles.detailMeta} style={{ wordBreak: "break-all", fontFamily: "var(--font-mono)", fontSize: "0.78rem" }}>
                    {wallet.normalized_address}
                  </p>
                  <p className={styles.detailMeta}>Baglanma: {formatDateTime(wallet.verified_at)}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h3 className={styles.panelTitle}>Adresler</h3>
              <p className={styles.kicker}>{user.addresses.length} kayit</p>
            </div>
            <div className={styles.grid}>
              {user.addresses.length === 0 ? (
                <p className={styles.sectionLead}>Kayitli adres yok.</p>
              ) : null}
              {user.addresses.map((address) => (
                <div className={styles.panel} key={address.id} style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span className={styles.badge}>{address.type}</span>
                    {address.is_default ? <span className={styles.badge + " " + styles.badgeGold}>Varsayilan</span> : null}
                  </div>
                  <p className={styles.dd}>{address.full_name}</p>
                  <p className={styles.sectionLead}>
                    {address.line1} {address.line2 ?? ""} / {address.city} {address.country_code}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className={styles.grid2}>
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <p className={styles.kicker}>PUAN HAREKETLERI</p>
              <h3 className={styles.sectionTitle}>Puan Gecmisi</h3>
            </div>
            <div className={styles.tableWrap}>
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
                      <TableCell>{getIohPointLedgerTitle(entry)}</TableCell>
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
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <p className={styles.kicker}>SIPARIS GECMISI</p>
              <h3 className={styles.sectionTitle}>Siparisler</h3>
            </div>
            <div className={styles.tableWrap}>
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
                        <span className={styles.badge + " " + badgeClassForStatus(order.status)}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </TableCell>
                      <TableCell>{formatMoney(order.total_minor, order.currency)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
