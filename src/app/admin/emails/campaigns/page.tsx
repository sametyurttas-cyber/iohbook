import Link from "next/link";
import { requireEmailStaff } from "@/features/email/admin-queries";
import { listAdminCampaigns } from "@/features/email/campaign-queries";
import sceneStyles from "@/features/admin/admin-scene.module.css";
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

const segmentLabels: Record<string, string> = {
  all: "Tüm Kullanıcılar",
  recent_30d: "Son 30 Gün Kayıt Olanlar",
  purchased_book: "Kitap Satın Alanlar",
  downloaded_book_1: "Book I İndirenler",
  approved_amazon_review: "Amazon Yorumu Onaylananlar",
  high_points: "IOH Puanı > 1000 Olanlar",
  no_orders: "Hiç Sipariş Vermeyenler"
};

const statusLabels: Record<string, { label: string; style: string }> = {
  draft: { label: "Taslak", style: "bg-gray-800 text-gray-400 border border-gray-700" },
  scheduled: { label: "Planlandı", style: "bg-blue-950 text-blue-400 border border-blue-800" },
  sending: { label: "Gönderiliyor", style: "bg-yellow-950 text-yellow-500 border border-yellow-800 animate-pulse" },
  completed: { label: "Tamamlandı", style: "bg-green-950 text-green-400 border border-green-800" },
  failed: { label: "Hata Aldı", style: "bg-red-950 text-red-400 border border-red-800" },
  cancelled: { label: "İptal Edildi", style: "bg-amber-950 text-amber-500 border border-amber-800" }
};

export default async function AdminEmailCampaignsPage() {
  const staff = await requireEmailStaff();
  if (!staff) {
    return (
      <main className={sceneStyles.main}>
        <div className="p-8 text-center text-red-500 font-mono">
          Bu sayfaya erişim yetkiniz bulunmamaktadır.
        </div>
      </main>
    );
  }

  const campaigns = await listAdminCampaigns();
  const canManage = staff.roles.includes("owner") || staff.roles.includes("admin_ops");

  return (
    <main className={sceneStyles.main} id="main-content">
      <section className={sceneStyles.hero}>
        <div className={sceneStyles.heroTop}>
          <div className={sceneStyles.heroMain}>
            <div className={sceneStyles.heroGhost} aria-hidden="true">CAMPAIGNS</div>
            <p className={sceneStyles.kicker}>OPERATIONS / KAMPANYALAR</p>
            <h2 className={sceneStyles.heroTitle}>Toplu E-posta Kampanyaları</h2>
            <p className={sceneStyles.heroLead}>
              Belirli alıcı segmentlerine toplu e-posta kampanyaları oluşturun, test edin ve gönderim sürecini yönetin.
            </p>
          </div>
          {canManage && (
            <div className="flex gap-4 items-center">
              <Link
                href="/admin/emails/campaigns/new"
                className="px-6 py-3 border border-[#e7c574] text-[#08090d] bg-[#e7c574] hover:bg-transparent hover:text-[#e7c574] text-xs font-mono uppercase tracking-wider rounded transition-all font-bold"
              >
                Yeni Kampanya Oluştur
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className="px-8 max-w-[1480px] mx-auto mb-12">
        <EmailSubNav active="campaigns" />

        <section className="border border-[rgba(242,239,232,0.12)] rounded-lg bg-[linear-gradient(145deg,rgba(255,255,255,0.025),rgba(255,255,255,0.006))] p-6">
          {campaigns.length === 0 ? (
            <div className="text-center py-12 text-sm text-[#8a8fa0] font-mono">
              Henüz oluşturulmuş kampanya bulunmamaktadır.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[rgba(242,239,232,0.08)]">
                    <TableHead className="text-xs text-[#8a8fa0] py-3 font-mono">Kampanya Başlığı</TableHead>
                    <TableHead className="text-xs text-[#8a8fa0] py-3 font-mono">Konu (Subject)</TableHead>
                    <TableHead className="text-xs text-[#8a8fa0] py-3 font-mono">Hedef Segment</TableHead>
                    <TableHead className="text-xs text-[#8a8fa0] py-3 font-mono">Durum</TableHead>
                    <TableHead className="text-xs text-[#8a8fa0] py-3 font-mono text-center">İlerleme</TableHead>
                    <TableHead className="text-xs text-[#8a8fa0] py-3 font-mono">Oluşturma Tarihi</TableHead>
                    <TableHead className="text-xs text-[#8a8fa0] py-3 font-mono text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((c) => {
                    const statusInfo = statusLabels[c.status] || { label: c.status, style: "bg-gray-800 text-gray-400" };
                    const progressPercentage = c.total_recipients > 0
                      ? Math.round(((c.sent_count + c.failed_count + c.skipped_count) / c.total_recipients) * 100)
                      : 0;

                    return (
                      <TableRow key={c.id} className="border-b border-[rgba(242,239,232,0.04)] hover:bg-[rgba(255,255,255,0.015)]">
                        <TableCell className="py-3 text-xs font-mono text-[#f2efe8] font-semibold">
                          {c.title}
                        </TableCell>
                        <TableCell className="py-3 text-xs text-[#8a8fa0] font-sans max-w-[200px] truncate">
                          {c.subject}
                        </TableCell>
                        <TableCell className="py-3 text-xs text-[#8a8fa0] font-mono">
                          {segmentLabels[c.segment_key] || c.segment_key}
                        </TableCell>
                        <TableCell className="py-3 text-xs font-mono">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase ${statusInfo.style}`}>
                            {statusInfo.label}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 text-xs font-mono text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] text-[#f2efe8]">
                              {c.sent_count + c.failed_count + c.skipped_count} / {c.total_recipients} ({progressPercentage}%)
                            </span>
                            <div className="w-24 bg-gray-800 rounded-full h-1 overflow-hidden">
                              <div
                                className="bg-[#e7c574] h-1 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-xs font-mono text-[#8a8fa0]">
                          {new Intl.DateTimeFormat("tr-TR", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit"
                          }).format(new Date(c.created_at))}
                        </TableCell>
                        <TableCell className="py-3 text-xs font-mono text-right">
                          <Link
                            href={`/admin/emails/campaigns/${c.id}`}
                            className="inline-flex items-center justify-center px-4 py-1.5 border border-[#e7c574]/20 hover:border-[#e7c574] text-[#8a8fa0] hover:text-[#e7c574] rounded text-[10px] uppercase tracking-wider font-mono transition-all font-semibold"
                          >
                            {canManage && c.status !== "completed" && c.status !== "cancelled" ? "Yönet" : "Detayları Gör"}
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
