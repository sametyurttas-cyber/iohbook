import Link from "next/link";
import type { ReactNode } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { refreshAnalyticsRollupsAction } from "@/features/admin-analytics/actions";
import {
  getAdminAnalyticsData,
  parseAnalyticsRange,
  type AnalyticsBreakdownRow
} from "@/features/admin-analytics/queries";
import styles from "@/features/admin-analytics/analytics.module.css";
import sceneStyles from "@/features/admin/admin-scene.module.css";

export const dynamic = "force-dynamic";

const integerFormatter = new Intl.NumberFormat("tr-TR");

function formatCurrency(amountMinor: number) {
  return new Intl.NumberFormat("tr-TR", {
    currency: "TRY",
    maximumFractionDigits: 2,
    style: "currency"
  }).format(amountMinor / 100);
}

function Panel({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeading}>
        <h3 className={styles.panelTitle}>{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className={styles.metric}>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}

function Breakdown({ rows }: { rows: AnalyticsBreakdownRow[] }) {
  const maximum = Math.max(...rows.map((row) => row.views), 1);

  if (rows.length === 0) {
    return <p className={styles.empty}>Bu tarih araliginda veri yok.</p>;
  }

  return (
    <div className={styles.breakdown}>
      {rows.map((row) => (
        <div className={styles.breakdownRow} key={row.label}>
          <div className={styles.breakdownMeta}>
            <span>{row.label}</span>
            <strong>{integerFormatter.format(row.views)}</strong>
          </div>
          <div className={styles.barTrack}>
            <span className={styles.barFill} style={{ width: `${(row.views / maximum) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function AdminAnalyticsPage({
  searchParams
}: {
  searchParams: Promise<{ range?: string | string[] }>;
}) {
  const params = await searchParams;
  const range = parseAnalyticsRange(params.range);
  const data = await getAdminAnalyticsData(range);
  const chartMaximum = Math.max(...data.series.map((point) => point.pageViews), 1);

  return (
    <main className={sceneStyles.main} id="main-content">
      <section className={sceneStyles.hero}>
        <div className={sceneStyles.heroTop}>
          <div className={sceneStyles.heroMain}>
            <div className={sceneStyles.heroGhost} aria-hidden="true">DATA</div>
            <p className={sceneStyles.kicker}>IOH / ANALYTICS</p>
            <h2 className={sceneStyles.heroTitle}>Analitik Merkezi</h2>
            <p className={sceneStyles.heroLead}>
              Trafik kaynaklarini, donusum adimlarini ve evren icerigi etkilesimini
              privacy-safe toplamlardan izle.
            </p>
          </div>
          <div className={styles.heroActions}>
            <nav aria-label="Analitik tarih araligi" className={styles.rangeNav}>
              {[7, 30, 90].map((days) => (
                <Link
                  aria-current={range === days ? "page" : undefined}
                  className={`${styles.rangeLink} ${range === days ? styles.rangeActive : ""}`}
                  href={`/admin/analytics?range=${days}`}
                  key={days}
                >
                  {days} gun
                </Link>
              ))}
            </nav>
            {data.canRefresh ? (
              <form action={refreshAnalyticsRollupsAction}>
                <SubmitButton size="sm">Rollup&apos;i Guncelle</SubmitButton>
              </form>
            ) : (
              <span className={styles.readOnly}>Salt okunur</span>
            )}
          </div>
        </div>
      </section>

      {!data.rollupAvailable ? (
        <div className={styles.notice} role="status">
          Analitik migration&apos;i henuz uygulanmadi. Sayfa guvenli bos durumla acildi.
        </div>
      ) : null}

      <section aria-label="Analitik ozeti" className={styles.metrics}>
        <Metric label="Page view" value={integerFormatter.format(data.summary.pageViews)} />
        <Metric label="Unique visitor" value={integerFormatter.format(data.summary.uniqueVisitors)} />
        <Metric label="Kayit" value={integerFormatter.format(data.summary.signups)} />
        <Metric label="Paid siparis" value={integerFormatter.format(data.summary.ordersPaid)} />
        <Metric label="Gelir" value={formatCurrency(data.summary.revenueMinor)} />
        <Metric label="Indirme" value={integerFormatter.format(data.summary.downloads)} />
      </section>

      <Panel title={`${range} Gunluk Trafik`}>
        {data.series.length === 0 ? <p className={styles.empty}>Rollup verisi bulunmuyor.</p> : (
          <div className={styles.timeline} aria-label={`${range} gunluk page view grafigi`} role="img">
            {data.series.map((point) => (
              <span
                className={styles.timelineBar}
                key={point.day}
                style={{ height: `${Math.max((point.pageViews / chartMaximum) * 100, point.pageViews ? 4 : 1)}%` }}
                title={`${point.day}: ${point.pageViews} page view`}
              />
            ))}
          </div>
        )}
      </Panel>

      <section className={styles.grid2}>
        <Panel title="Trafik Kaynaklari"><Breakdown rows={data.trafficSources} /></Panel>
        <Panel title="Cihaz Dagilimi"><Breakdown rows={data.devices} /></Panel>
        <Panel title="UTM Kampanyalari"><Breakdown rows={data.utmCampaigns} /></Panel>
        <Panel title="Referrer Alanlari"><Breakdown rows={data.referrers} /></Panel>
      </section>

      <section className={styles.grid2}>
        <Panel title="Donusum Funnel">
          <div className={styles.funnel}>
            {data.funnel.map((step, index) => {
              const previous = data.funnel[index - 1]?.count;
              const conversion = previous ? Math.min((step.count / previous) * 100, 999) : null;
              return (
                <div className={styles.funnelRow} key={step.eventName}>
                  <span className={styles.stepNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.funnelName}>{step.eventName}</span>
                  <strong>{integerFormatter.format(step.count)}</strong>
                  <span className={styles.conversion}>{conversion === null ? "Baslangic" : `%${conversion.toFixed(1)}`}</span>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title="En Cok Gezilen Sayfalar">
          <Table>
            <TableHeader><TableRow><TableHead>Sayfa</TableHead><TableHead className="text-right">View</TableHead></TableRow></TableHeader>
            <TableBody>
              {data.topPages.length === 0 ? (
                <TableRow><TableCell className={styles.emptyCell} colSpan={2}>Veri yok.</TableCell></TableRow>
              ) : data.topPages.map((page) => (
                <TableRow key={page.path}>
                  <TableCell><span className={styles.mono}>{page.path}</span></TableCell>
                  <TableCell className="text-right">{integerFormatter.format(page.views)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Panel>
      </section>

      <Panel title="Encyclopedia Etkilesimi">
        <Table>
          <TableHeader><TableRow><TableHead>Tip</TableHead><TableHead>Varlik</TableHead><TableHead className="text-right">View</TableHead></TableRow></TableHeader>
          <TableBody>
            {data.encyclopedia.length === 0 ? (
              <TableRow><TableCell className={styles.emptyCell} colSpan={3}>Encyclopedia etkilesimi henuz yok.</TableCell></TableRow>
            ) : data.encyclopedia.map((entity) => (
              <TableRow key={`${entity.entityType}:${entity.entitySlug}`}>
                <TableCell><span className={styles.typeBadge}>{entity.entityType}</span></TableCell>
                <TableCell>{entity.entityTitle}<span className={styles.subtle}>{entity.entitySlug}</span></TableCell>
                <TableCell className="text-right">{integerFormatter.format(entity.views)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>
    </main>
  );
}
