import Link from "next/link";
import { notFound } from "next/navigation";
import { requireEmailStaff } from "@/features/email/admin-queries";
import { getAdminCampaignDetail } from "@/features/email/campaign-queries";
import { getCurrentUser } from "@/features/auth/queries";
import { CampaignManager } from "./campaign-manager";
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

type CampaignDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

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

export default async function AdminCampaignDetailPage({ params }: CampaignDetailPageProps) {
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

  const { id } = await params;
  const campaignDetail = await getAdminCampaignDetail(id);

  if (!campaignDetail) {
    notFound();
  }

  const { campaign, recipients } = campaignDetail;
  const user = await getCurrentUser();
  const canManage = staff.roles.includes("owner") || staff.roles.includes("admin_ops");

  return (
    <main className={sceneStyles.main} id="main-content">
      <section className={sceneStyles.hero}>
        <div className={sceneStyles.heroTop}>
          <div className={sceneStyles.heroMain}>
            <div className={sceneStyles.heroGhost} aria-hidden="true">MANAGE</div>
            <p className={sceneStyles.kicker}>OPERATIONS / KAMPANYALAR / KAMPANYA YÖNETİMİ</p>
            <h2 className={sceneStyles.heroTitle}>Kampanya Yönetimi</h2>
            <p className={sceneStyles.heroLead}>
              Seçilen segmentteki alıcılara toplu gönderim sürecini izleyin, test edin, duraklatın ve hatalı gönderimleri tekrar deneyin.
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <Link
              href="/admin/emails/campaigns"
              className="px-5 py-2.5 border border-[rgba(242,239,232,0.12)] text-[#8a8fa0] hover:border-[rgba(242,239,232,0.3)] hover:text-[#f2efe8] text-xs font-mono uppercase tracking-wider rounded transition-all"
            >
              Listeye Geri Dön
            </Link>
          </div>
        </div>
      </section>

      <div className="px-8 max-w-[1480px] mx-auto mb-12 space-y-8">
        <EmailSubNav active="campaigns" />

        {/* Campaign Manager Controls and Summary */}
        <CampaignManager
          campaign={campaign}
          adminEmail={user?.email || ""}
          canManage={canManage}
        />

        {/* Recipients Audit Log */}
        <section className="border border-[rgba(242,239,232,0.12)] rounded-lg bg-[linear-gradient(145deg,rgba(255,255,255,0.025),rgba(255,255,255,0.006))] p-6">
          <h3 className="text-sm font-mono text-[#e7c574] mb-4 border-b border-[rgba(242,239,232,0.08)] pb-2 uppercase tracking-wider">
            Kampanya Alıcıları (Son 200 Kayıt)
          </h3>

          {recipients.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#8a8fa0] font-mono">
              Bu kampanyaya eklenmiş alıcı kaydı bulunamadı.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[rgba(242,239,232,0.08)]">
                    <TableHead className="text-xs text-[#8a8fa0] py-2 font-mono">E-posta</TableHead>
                    <TableHead className="text-xs text-[#8a8fa0] py-2 font-mono">Alıcı Adı</TableHead>
                    <TableHead className="text-xs text-[#8a8fa0] py-2 font-mono">Durum</TableHead>
                    <TableHead className="text-xs text-[#8a8fa0] py-2 font-mono">Gönderim Tarihi</TableHead>
                    <TableHead className="text-xs text-[#8a8fa0] py-2 font-mono">Mesaj Kimliği / Hata Mesajı</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipients.map((r) => (
                    <TableRow key={r.id} className="border-b border-[rgba(242,239,232,0.04)] hover:bg-[rgba(255,255,255,0.015)]">
                      <TableCell className="py-2.5 text-xs font-mono text-[#f2efe8]">
                        {r.email}
                      </TableCell>
                      <TableCell className="py-2.5 text-xs text-[#8a8fa0] font-sans">
                        {r.profiles?.full_name || "-"}
                      </TableCell>
                      <TableCell className="py-2.5 text-xs font-mono">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[9px] font-mono uppercase ${
                            r.status === "sent"
                              ? "bg-green-950 text-green-400 border border-green-800"
                              : r.status === "failed"
                              ? "bg-red-950 text-red-400 border border-red-800"
                              : r.status === "skipped"
                              ? "bg-amber-950 text-amber-500 border border-amber-800"
                              : "bg-gray-800 text-gray-400 border border-gray-700"
                          }`}
                        >
                          {r.status === "sent"
                            ? "Sent"
                            : r.status === "failed"
                            ? "Failed"
                            : r.status === "skipped"
                            ? "Skipped"
                            : "Pending"}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5 text-xs font-mono text-[#8a8fa0]">
                        {r.sent_at
                          ? new Intl.DateTimeFormat("tr-TR", {
                              year: "numeric",
                              month: "short",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit"
                            }).format(new Date(r.sent_at))
                          : "-"}
                      </TableCell>
                      <TableCell className="py-2.5 text-xs font-mono max-w-[300px] truncate" title={r.error_message || r.provider_message_id || ""}>
                        {r.status === "failed" && (
                          <span className="text-red-400">{r.error_message || "Bilinmeyen Hata"}</span>
                        )}
                        {r.status === "sent" && (
                          <span className="text-[#8a8fa0]">{r.provider_message_id || "-"}</span>
                        )}
                        {r.status === "skipped" && (
                          <span className="text-amber-500">{r.error_message || "Atlandı"}</span>
                        )}
                        {r.status === "pending" && (
                          <span className="text-[#8a8fa0]/40">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
