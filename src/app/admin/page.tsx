import Link from "next/link";
import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  getAdminDashboardData,
  type AdminDashboardData
} from "@/features/admin-dashboard/queries";
import styles from "@/features/admin-dashboard/dashboard.module.css";
import sceneStyles from "@/features/admin/admin-scene.module.css";
import type { AdminDashboardSeriesPoint } from "@/types/database";

export const dynamic = "force-dynamic";

const integerFormatter = new Intl.NumberFormat("tr-TR");
const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  month: "short"
});

function formatCurrency(amountMinor: number, currency = "TRY") {
  return new Intl.NumberFormat("tr-TR", {
    currency,
    maximumFractionDigits: 2,
    style: "currency"
  }).format(amountMinor / 100);
}

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function MetricCard({
  accent = "gold",
  detail,
  label,
  value
}: {
  accent?: "blue" | "gold" | "red";
  detail?: string;
  label: string;
  value: string;
}) {
  return (
    <article className={`${styles.metricCard} ${styles[accent]}`}>
      <p className={styles.metricLabel}>{label}</p>
      <p className={styles.metricValue}>{value}</p>
      {detail ? <p className={styles.metricDetail}>{detail}</p> : null}
    </article>
  );
}

function TrendPanel({
  color,
  data,
  label,
  value,
  valueFormatter = integerFormatter.format
}: {
  color: "blue" | "gold" | "red";
  data: number[];
  label: string;
  value: number;
  valueFormatter?: (value: number) => string;
}) {
  const maximum = Math.max(...data, 1);

  return (
    <article className={styles.trendPanel}>
      <div className={styles.panelHeading}>
        <div>
          <p className={styles.panelKicker}>SON 30 GUN</p>
          <h3 className={styles.panelTitle}>{label}</h3>
        </div>
        <strong className={styles.trendTotal}>{valueFormatter(value)}</strong>
      </div>
      <div className={styles.chart} aria-label={`${label}: son 30 gun`} role="img">
        {data.map((point, index) => (
          <span
            aria-label={`${index + 1}. gun: ${valueFormatter(point)}`}
            className={`${styles.chartBar} ${styles[color]}`}
            key={`${label}-${index}`}
            style={{ height: `${Math.max((point / maximum) * 100, point > 0 ? 5 : 1)}%` }}
            title={valueFormatter(point)}
          />
        ))}
      </div>
    </article>
  );
}

function DataPanel({
  action,
  children,
  title
}: {
  action?: { href: string; label: string };
  children: ReactNode;
  title: string;
}) {
  return (
    <section className={styles.dataPanel}>
      <div className={styles.panelHeading}>
        <h3 className={styles.panelTitle}>{title}</h3>
        {action ? (
          <Link className={styles.panelLink} href={action.href}>
            {action.label}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function EmptyRow({ colSpan }: { colSpan: number }) {
  return (
    <TableRow>
      <TableCell className={styles.emptyCell} colSpan={colSpan}>
        Henuz kayit yok.
      </TableCell>
    </TableRow>
  );
}

function Metrics({ data }: { data: AdminDashboardData }) {
  const { metrics } = data;

  return (
    <section aria-label="Temel metrikler" className={styles.metricsGrid}>
      <MetricCard label="Toplam kullanici" value={integerFormatter.format(metrics.total_users)} />
      <MetricCard
        accent="blue"
        label="Son 7 gun yeni kullanici"
        value={integerFormatter.format(metrics.new_users_7d)}
      />
      <MetricCard label="Paid siparis" value={integerFormatter.format(metrics.paid_orders)} />
      <MetricCard
        accent="blue"
        label="Toplam gelir"
        value={formatCurrency(metrics.total_revenue_minor)}
      />
      <MetricCard label="Dagitilan IOH" value={integerFormatter.format(metrics.total_ioh_distributed)} />
      <MetricCard
        accent={metrics.pending_verifications > 0 ? "red" : "blue"}
        label="Bekleyen dogrulama"
        value={integerFormatter.format(metrics.pending_verifications)}
      />
      <MetricCard label="Toplam indirme" value={integerFormatter.format(metrics.total_downloads)} />
      <MetricCard
        accent="blue"
        detail={`${integerFormatter.format(metrics.page_views_24h)} page_view / son 24 saat`}
        label="Bugunku ziyaretci"
        value={integerFormatter.format(metrics.visitors_today)}
      />
    </section>
  );
}

function Trends({ series }: { series: AdminDashboardSeriesPoint[] }) {
  const sum = (key: keyof Omit<AdminDashboardSeriesPoint, "day">) =>
    series.reduce((total, point) => total + point[key], 0);
  const values = (key: keyof Omit<AdminDashboardSeriesPoint, "day">) =>
    series.map((point) => point[key]);

  return (
    <section className={styles.trendsGrid}>
      <TrendPanel color="blue" data={values("page_views")} label="Sayfa goruntuleme" value={sum("page_views")} />
      <TrendPanel color="gold" data={values("new_users")} label="Yeni kullanici" value={sum("new_users")} />
      <TrendPanel color="gold" data={values("paid_orders")} label="Paid siparis" value={sum("paid_orders")} />
      <TrendPanel
        color="blue"
        data={values("revenue_minor")}
        label="Gelir"
        value={sum("revenue_minor")}
        valueFormatter={(value) => formatCurrency(value)}
      />
      <TrendPanel color="red" data={values("ioh_points")} label="IOH dagitimi" value={sum("ioh_points")} />
    </section>
  );
}

export default async function AdminPage() {
  const data = await getAdminDashboardData();

  return (
    <main className={sceneStyles.main} id="main-content">
      <section className={sceneStyles.hero}>
        <div className={sceneStyles.heroTop}>
          <div className={sceneStyles.heroMain}>
            <div className={sceneStyles.heroGhost} aria-hidden="true">OPS</div>
            <p className={sceneStyles.kicker}>IOH / OPERATIONS CENTER</p>
            <h2 className={sceneStyles.heroTitle}>Operasyon Ozeti</h2>
            <p className={sceneStyles.heroLead}>
              Trafik, satis, dijital teslimat, IOH puan ve dogrulama akislarinin
              guncel durumunu tek ekrandan izle.
            </p>
          </div>
        </div>
      </section>

      <Metrics data={data} />
      <Trends series={data.series} />

      <section className={styles.tablesGrid}>
        <DataPanel action={{ href: "/admin/orders", label: "Tum siparisler" }} title="Son siparisler">
          <Table>
            <TableHeader><TableRow><TableHead>Siparis</TableHead><TableHead>Durum</TableHead><TableHead className="text-right">Tutar</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.recentOrders.length === 0 ? <EmptyRow colSpan={3} /> : data.recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell><Link className={styles.rowLink} href={`/admin/orders?selected=${order.id}`}>{order.orderNumber}</Link><span className={styles.rowMeta}>{order.customerName ?? "Misafir"} / {formatDate(order.createdAt)}</span></TableCell>
                  <TableCell><span className={styles.statusBadge}>{order.status}</span></TableCell>
                  <TableCell className="text-right">{formatCurrency(order.totalMinor, order.currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataPanel>

        <DataPanel action={{ href: "/admin/users", label: "Tum kullanicilar" }} title="Yeni kullanicilar">
          <Table>
            <TableHeader><TableRow><TableHead>Kullanici</TableHead><TableHead>Kayit</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.recentUsers.length === 0 ? <EmptyRow colSpan={2} /> : data.recentUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell><Link className={styles.rowLink} href={`/admin/users/${user.id}`}>{user.fullName ?? "Isimsiz kullanici"}</Link><span className={styles.rowMeta}>{user.email}</span></TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataPanel>

        <DataPanel action={{ href: "/admin/verifications", label: "Tum talepler" }} title="Amazon dogrulamalari">
          <Table>
            <TableHeader><TableRow><TableHead>Talep</TableHead><TableHead>Durum</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.recentVerifications.length === 0 ? <EmptyRow colSpan={2} /> : data.recentVerifications.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell><Link className={styles.rowLink} href={`/admin/verifications/${submission.id}`}>{submission.title}</Link><span className={styles.rowMeta}>{submission.kind} / {formatDate(submission.createdAt)}</span></TableCell>
                  <TableCell><span className={styles.statusBadge}>{submission.status}</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataPanel>

        <DataPanel title="Son IOH hareketleri">
          <Table>
            <TableHeader><TableRow><TableHead>Neden</TableHead><TableHead className="text-right">IOH</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.recentPoints.length === 0 ? <EmptyRow colSpan={2} /> : data.recentPoints.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell><Link className={styles.rowLink} href={`/admin/users/${entry.profileId}`}>{entry.reason}</Link><span className={styles.rowMeta}>{formatDate(entry.createdAt)}</span></TableCell>
                  <TableCell className={`text-right ${entry.amount >= 0 ? styles.positive : styles.negative}`}>{entry.amount >= 0 ? "+" : ""}{integerFormatter.format(entry.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataPanel>

        <DataPanel title="En cok gezilen sayfalar">
          <Table>
            <TableHeader><TableRow><TableHead>Sayfa</TableHead><TableHead className="text-right">Goruntuleme</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.topPages.length === 0 ? <EmptyRow colSpan={2} /> : data.topPages.map((page) => (
                <TableRow key={page.path}>
                  <TableCell><span className={styles.path}>{page.path}</span></TableCell>
                  <TableCell className="text-right">{integerFormatter.format(page.views)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataPanel>
      </section>
    </main>
  );
}
