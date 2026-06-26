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
import {
  getAdminReferralReport,
  type AdminReferralReport,
  type AdminReferralFilters
} from "@/features/admin-referrals/queries";
import { isReferralSchemaUnavailableError } from "@/features/referrals/errors";
import { formatDateTime } from "@/features/orders/order-utils";
import styles from "@/features/admin/admin-scene.module.css";

type AdminReferralsPageProps = {
  searchParams?: Promise<AdminReferralFilters>;
};

const statusLabels = {
  all: "Tum durumlar",
  pending: "Beklemede",
  qualified: "Dogrulandi",
  rejected: "Reddedildi",
  rewarded: "Odullendirildi"
};

function statusBadgeClass(status: string) {
  if (status === "rewarded") {
    return styles.badgeGold;
  }

  if (status === "qualified") {
    return styles.badgeBlue;
  }

  if (status === "rejected") {
    return styles.badgeRed;
  }

  return "";
}

export default async function AdminReferralsPage({ searchParams }: AdminReferralsPageProps) {
  const params = (await searchParams) ?? {};
  let setupRequired = false;
  let report: AdminReferralReport;

  try {
    report = await getAdminReferralReport({
      code: params.code,
      date: params.date ?? "all",
      q: params.q,
      status: params.status ?? "all"
    });
  } catch (error) {
    if (!isReferralSchemaUnavailableError(error)) {
      throw error;
    }

    setupRequired = true;
    report = {
      canManage: false,
      filters: {
        code: params.code,
        date: params.date ?? "all",
        q: params.q,
        status: params.status ?? "all"
      },
      metrics: {
        mostInvitingUserCount: 0,
        pendingReferralCount: 0,
        rewardedReferralCount: 0,
        totalDistributedIoh: 0,
        totalReferralCount: 0,
        weeklyReferralCount: 0
      },
      rows: []
    };
  }

  const statCards = [
    { label: "Toplam Referral", value: report.metrics.totalReferralCount },
    { label: "Pending Referral", value: report.metrics.pendingReferralCount },
    { label: "Rewarded Referral", value: report.metrics.rewardedReferralCount },
    { label: "Dagitilan IOH", value: `${report.metrics.totalDistributedIoh} IOH` },
    { label: "Son 7 Gun", value: report.metrics.weeklyReferralCount },
    { label: "En Cok Davet", value: report.metrics.mostInvitingUserCount }
  ];

  return (
    <main className={styles.main} id="main-content">
      <section className={styles.hero}>
        <div className={styles.heroTop}>
          <div className={styles.heroMain}>
            <div className={styles.heroGhost} aria-hidden="true">REFERRAL</div>
            <p className={styles.kicker}>09 / DAVET RAPORU</p>
            <h2 className={styles.heroTitle}>Davetler</h2>
            <p className={styles.heroLead}>
              Arkadas daveti iliskilerini, odul durumunu ve iki tarafli IOH puan
              dagitimini izleyin. Bu ekran sadece raporlama yapar; manuel odul
              veya status degisikligi yapmaz.
            </p>
          </div>
          <div className={styles.heroActions}>
            <span className={styles.statPill}>
              Yetki <b>{report.canManage ? "Yonetici" : "Read-only"}</b>
            </span>
          </div>
        </div>
      </section>

      <div className={styles.grid}>
        {setupRequired ? (
          <div className={styles.noticeError}>
            Davet raporu kodda hazir, ancak Supabase veritabani kurulumu henuz
            uygulanmadi. Referral migration uygulandiginda bu ekran veri gosterecek.
          </div>
        ) : null}

        <div className={styles.statsGrid}>
          {statCards.map((card) => (
            <div className={styles.statCard} key={card.label}>
              <span className={styles.statLabel}>{card.label}</span>
              <strong className={styles.statValue}>{card.value}</strong>
            </div>
          ))}
        </div>

        <form className={styles.filters}>
          <Input
            defaultValue={report.filters.q ?? ""}
            name="q"
            placeholder="Kullanici veya e-posta ara"
          />
          <Input
            defaultValue={report.filters.code ?? ""}
            name="code"
            placeholder="Referral code"
          />
          <select defaultValue={report.filters.status} name="status">
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select defaultValue={report.filters.date} name="date">
            <option value="all">Tarih: Tumu</option>
            <option value="7d">Son 7 gun</option>
            <option value="30d">Son 30 gun</option>
          </select>
          <Button type="submit" variant="secondary">
            Filtrele
          </Button>
        </form>

        <div className={styles.tableWrap}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Davet Eden</TableHead>
                <TableHead>Davet Edilen</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Qualified</TableHead>
                <TableHead>Rewarded</TableHead>
                <TableHead>Puan</TableHead>
                <TableHead>Ledger</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.rows.length === 0 ? (
                <TableRow>
                  <TableCell className="py-10 text-center text-muted-foreground" colSpan={9}>
                    Filtrelere uygun referral kaydi bulunamadi.
                  </TableCell>
                </TableRow>
              ) : null}

              {report.rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(row.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="grid gap-1">
                      <span className="font-medium text-paper">
                        {row.referrerName ?? "Isimsiz kullanici"}
                      </span>
                      <span className="text-sm text-muted-foreground">{row.referrerEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="grid gap-1">
                      <span className="font-medium text-paper">
                        {row.referredName ?? "Isimsiz kullanici"}
                      </span>
                      <span className="text-sm text-muted-foreground">{row.referredEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gold">{row.referralCode}</TableCell>
                  <TableCell>
                    <span className={`${styles.badge} ${statusBadgeClass(row.status)}`}>
                      {statusLabels[row.status]}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(row.qualifiedAt)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDateTime(row.rewardedAt)}
                  </TableCell>
                  <TableCell className="font-semibold text-gold">{row.rewardAmount} IOH</TableCell>
                  <TableCell>
                    <div className="grid gap-1 text-xs text-muted-foreground">
                      <span>Referrer: {row.referrerRewardLedgerId?.slice(0, 8) ?? "-"}</span>
                      <span>Referred: {row.referredRewardLedgerId?.slice(0, 8) ?? "-"}</span>
                    </div>
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
