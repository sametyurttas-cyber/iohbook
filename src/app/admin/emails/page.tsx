import Link from "next/link";
import { getAdminEmailStats } from "@/features/email/admin-queries";
import sceneStyles from "@/features/admin/admin-scene.module.css";
import dashboardStyles from "@/features/admin-dashboard/dashboard.module.css";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

function EmailSubNav({ active }: { active: "dashboard" | "logs" | "templates" | "send" | "campaigns" }) {
  return (
    <nav aria-label="Mail Alt Navigasyonu" className="flex flex-wrap gap-2 mb-8 border-b border-[rgba(242,239,232,0.08)] pb-4">
      <Link
        href="/admin/emails"
        className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-full border transition-all ${
          active === "dashboard"
            ? "border-[#e7c574] text-[#08090d] bg-[#e7c574]"
            : "border-[rgba(242,239,232,0.12)] text-[#8a8fa0] hover:border-[rgba(242,239,232,0.3)] hover:text-[#f2efe8]"
        }`}
      >
        Özet Dashboard
      </Link>
      <Link
        href="/admin/emails/logs"
        className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-full border transition-all ${
          active === "logs"
            ? "border-[#e7c574] text-[#08090d] bg-[#e7c574]"
            : "border-[rgba(242,239,232,0.12)] text-[#8a8fa0] hover:border-[rgba(242,239,232,0.3)] hover:text-[#f2efe8]"
        }`}
      >
        Gönderim Günlükleri
      </Link>
      <Link
        href="/admin/emails/templates"
        className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-full border transition-all ${
          active === "templates"
            ? "border-[#e7c574] text-[#08090d] bg-[#e7c574]"
            : "border-[rgba(242,239,232,0.12)] text-[#8a8fa0] hover:border-[rgba(242,239,232,0.3)] hover:text-[#f2efe8]"
        }`}
      >
        E-posta Şablonları
      </Link>
      <Link
        href="/admin/emails/send"
        className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-full border transition-all ${
          active === "send"
            ? "border-[#e7c574] text-[#08090d] bg-[#e7c574]"
            : "border-[rgba(242,239,232,0.12)] text-[#8a8fa0] hover:border-[rgba(242,239,232,0.3)] hover:text-[#f2efe8]"
        }`}
      >
        Manuel Gönderim
      </Link>
      <Link
        href="/admin/emails/campaigns"
        className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-full border transition-all ${
          active === "campaigns"
            ? "border-[#e7c574] text-[#08090d] bg-[#e7c574]"
            : "border-[rgba(242,239,232,0.12)] text-[#8a8fa0] hover:border-[rgba(242,239,232,0.3)] hover:text-[#f2efe8]"
        }`}
      >
        Kampanyalar
      </Link>
    </nav>
  );
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
    <article className={`${dashboardStyles.metricCard} ${dashboardStyles[accent]}`}>
      <p className={dashboardStyles.metricLabel}>{label}</p>
      <p className={dashboardStyles.metricValue}>{value}</p>
      {detail ? <p className={dashboardStyles.metricDetail}>{detail}</p> : null}
    </article>
  );
}

type EmailEventRow = {
  id: string;
  recipient: string;
  template_key: string | null;
  event_type: string;
  status: string;
  created_at: string;
};

function EmailListTable({ title, events }: { title: string; events: EmailEventRow[] }) {
  return (
    <section className="border border-[rgba(242,239,232,0.12)] rounded-lg bg-[linear-gradient(145deg,rgba(255,255,255,0.025),rgba(255,255,255,0.006))] p-6 min-h-[300px] flex flex-col">
      <h3 className="text-sm font-mono text-[#e7c574] mb-4 uppercase tracking-wider border-b border-[rgba(242,239,232,0.08)] pb-2">{title}</h3>
      {events.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-[#8a8fa0] font-mono">
          Kayıt bulunamadı.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[rgba(242,239,232,0.08)]">
                <TableHead className="text-left text-xs text-[#8a8fa0] py-2 font-mono">Alıcı</TableHead>
                <TableHead className="text-left text-xs text-[#8a8fa0] py-2 font-mono">Şablon</TableHead>
                <TableHead className="text-left text-xs text-[#8a8fa0] py-2 font-mono">Durum</TableHead>
                <TableHead className="text-right text-xs text-[#8a8fa0] py-2 font-mono">Tarih</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((ev) => (
                <TableRow key={ev.id} className="border-b border-[rgba(242,239,232,0.04)] hover:bg-[rgba(255,255,255,0.02)]">
                  <TableCell className="py-2 text-xs font-mono text-[#f2efe8] truncate max-w-[150px]" title={ev.recipient}>
                    {ev.recipient}
                  </TableCell>
                  <TableCell className="py-2 text-xs font-mono text-[#8a8fa0]">
                    {ev.template_key || ev.event_type}
                  </TableCell>
                  <TableCell className="py-2 text-xs font-mono">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono ${
                        ev.status === "sent"
                          ? "bg-green-950 text-green-400 border border-green-800"
                          : ev.status === "failed"
                          ? "bg-red-950 text-red-400 border border-red-800"
                          : ev.status === "skipped"
                          ? "bg-gray-800 text-gray-400 border border-gray-700"
                          : "bg-yellow-950 text-yellow-400 border border-yellow-800"
                      }`}
                    >
                      {ev.status}
                    </span>
                  </TableCell>
                  <TableCell className="py-2 text-xs font-mono text-[#8a8fa0] text-right">
                    {new Intl.DateTimeFormat("tr-TR", {
                      month: "short",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit"
                    }).format(new Date(ev.created_at))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}

export default async function AdminEmailsPage() {
  const stats = await getAdminEmailStats();

  if (!stats) {
    return (
      <main className={sceneStyles.main}>
        <div className="p-8 text-center text-red-500 font-mono">
          Erişim Yetkisi Yok veya Yükleme Hatası.
        </div>
      </main>
    );
  }

  return (
    <main className={sceneStyles.main} id="main-content">
      <section className={sceneStyles.hero}>
        <div className={sceneStyles.heroTop}>
          <div className={sceneStyles.heroMain}>
            <div className={sceneStyles.heroGhost} aria-hidden="true">MAILS</div>
            <p className={sceneStyles.kicker}>OPERATIONS / MAIL MERKEZI</p>
            <h2 className={sceneStyles.heroTitle}>Mail Merkezi</h2>
            <p className={sceneStyles.heroLead}>
              Gönderilen ve kuyrukta bekleyen tüm transactional e-postaları izleyin. Logları denetleyin, şablonları test edin ve hatalı gönderimleri yeniden deneyin.
            </p>
          </div>
        </div>
      </section>

      <div className="px-8 max-w-[1480px] mx-auto">
        <EmailSubNav active="dashboard" />

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Toplam Gönderim"
            value={stats.totalCount.toLocaleString("tr-TR")}
            detail="Tüm zamanlar e-posta günlükleri"
          />
          <MetricCard
            accent="blue"
            label="Son 24 Saat"
            value={stats.last24hCount.toLocaleString("tr-TR")}
            detail="Son 24 saatte işlenen e-postalar"
          />
          <MetricCard
            accent="red"
            label="Başarısız E-Posta"
            value={stats.failedCount.toLocaleString("tr-TR")}
            detail="Hatalı e-posta gönderimleri"
          />
          <MetricCard
            accent="gold"
            label="E-Posta Sağlayıcısı"
            value={stats.provider}
            detail="Resend API bağlantı durumu"
          />
        </div>

        {/* Dashboard Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <EmailListTable title="Son 10 Gönderim" events={stats.last10Processed} />
          <EmailListTable title="Son 10 Hatalı Gönderim" events={stats.last10Failed} />
        </div>
      </div>
    </main>
  );
}
