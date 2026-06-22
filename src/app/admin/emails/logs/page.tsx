import Link from "next/link";
import { listAdminEmailLogs, listAdminEmailTemplates, requireEmailStaff } from "@/features/email/admin-queries";
import { RetryButton } from "./retry-button";
import { MetadataInspector } from "./metadata-inspector";
import sceneStyles from "@/features/admin/admin-scene.module.css";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

type LogsPageProps = {
  searchParams?: Promise<{
    status?: string;
    templateKey?: string;
    q?: string;
    startDate?: string;
    endDate?: string;
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

const statusOptions = [
  { label: "Tümü", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Queued", value: "queued" },
  { label: "Sent", value: "sent" },
  { label: "Failed", value: "failed" },
  { label: "Skipped", value: "skipped" }
];

export default async function AdminEmailLogsPage({ searchParams }: LogsPageProps) {
  const staff = await requireEmailStaff();

  if (!staff) {
    return (
      <main className={sceneStyles.main}>
        <div className="p-8 text-center text-red-500 font-mono">
          Erişim Yetkisi Yok.
        </div>
      </main>
    );
  }

  const isReadOnly =
    staff.roles.includes("support") &&
    !staff.roles.includes("owner") &&
    !staff.roles.includes("admin_ops");

  const params = await searchParams;
  const status = params?.status ?? "all";
  const templateKey = params?.templateKey ?? "all";
  const q = params?.q ?? "";
  const startDate = params?.startDate ?? "";
  const endDate = params?.endDate ?? "";

  const [logs, templates] = await Promise.all([
    listAdminEmailLogs({ status, templateKey, q, startDate, endDate }),
    listAdminEmailTemplates()
  ]);

  return (
    <main className={sceneStyles.main} id="main-content">
      <section className={sceneStyles.hero}>
        <div className={sceneStyles.heroTop}>
          <div className={sceneStyles.heroMain}>
            <div className={sceneStyles.heroGhost} aria-hidden="true">LOGS</div>
            <p className={sceneStyles.kicker}>OPERATIONS / GÖNDERİM GÜNLÜKLERİ</p>
            <h2 className={sceneStyles.heroTitle}>Gönderim Günlükleri</h2>
            <p className={sceneStyles.heroLead}>
              Tüm e-posta gönderim denemelerini inceleyin, arama ve filtreler uygulayın, hatalı gönderimleri tekrar sıraya alın.
            </p>
          </div>
        </div>
      </section>

      <div className="px-8 max-w-[1480px] mx-auto">
        <EmailSubNav active="logs" />

        {/* Filters Form */}
        <form method="GET" className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 border border-[rgba(242,239,232,0.12)] rounded-lg bg-black/20">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#8a8fa0]">Alıcı E-posta</label>
            <Input
              name="q"
              defaultValue={q}
              placeholder="Alıcı e-posta adresi..."
              className="bg-black/40 border-[rgba(242,239,232,0.12)] text-[#f2efe8] h-9"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#8a8fa0]">Durum</label>
            <select
              name="status"
              defaultValue={status}
              className="bg-black/40 border border-[rgba(242,239,232,0.12)] rounded px-3 h-9 text-xs text-[#f2efe8] focus:border-[#e7c574] focus:outline-none"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#05060a]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#8a8fa0]">Şablon</label>
            <select
              name="templateKey"
              defaultValue={templateKey}
              className="bg-black/40 border border-[rgba(242,239,232,0.12)] rounded px-3 h-9 text-xs text-[#f2efe8] focus:border-[#e7c574] focus:outline-none"
            >
              <option value="all" className="bg-[#05060a]">Tümü</option>
              {templates.map((tpl) => (
                <option key={tpl.key} value={tpl.key} className="bg-[#05060a]">
                  {tpl.key}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono uppercase tracking-wider text-[#8a8fa0]">Başlangıç Tarihi</label>
            <Input
              type="date"
              name="startDate"
              defaultValue={startDate}
              className="bg-black/40 border-[rgba(242,239,232,0.12)] text-[#f2efe8] h-9"
            />
          </div>

          <div className="flex flex-col gap-1 justify-end">
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-[#e7c574] hover:bg-[#d4b05d] text-[#08090d] text-xs h-9">
                Filtrele
              </Button>
              <Link
                href="/admin/emails/logs"
                className="inline-flex items-center justify-center px-3 border border-[rgba(242,239,232,0.12)] hover:border-[rgba(242,239,232,0.3)] text-[#8a8fa0] hover:text-[#f2efe8] rounded text-xs transition-all h-9"
              >
                Temizle
              </Link>
            </div>
          </div>
        </form>

        {/* Logs Table */}
        <section className="border border-[rgba(242,239,232,0.12)] rounded-lg bg-[linear-gradient(145deg,rgba(255,255,255,0.025),rgba(255,255,255,0.006))] p-6 mb-12">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-sm text-[#8a8fa0] font-mono">
              Filtrelere uygun e-posta kaydı bulunamadı.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[rgba(242,239,232,0.08)]">
                    <TableHead className="text-xs text-[#8a8fa0] py-3 font-mono">Tarih</TableHead>
                    <TableHead className="text-xs text-[#8a8fa0] py-3 font-mono">Alıcı</TableHead>
                    <TableHead className="text-xs text-[#8a8fa0] py-3 font-mono">Şablon Key</TableHead>
                    <TableHead className="text-xs text-[#8a8fa0] py-3 font-mono">Konu</TableHead>
                    <TableHead className="text-xs text-[#8a8fa0] py-3 font-mono">Durum</TableHead>
                    <TableHead className="text-xs text-[#8a8fa0] py-3 font-mono">Provider Bilgisi</TableHead>
                    <TableHead className="text-xs text-[#8a8fa0] py-3 font-mono">Metadata</TableHead>
                    <TableHead className="text-xs text-[#8a8fa0] py-3 font-mono text-right">İşlem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} className="border-b border-[rgba(242,239,232,0.04)] hover:bg-[rgba(255,255,255,0.015)] align-top">
                      <TableCell className="py-3 text-xs font-mono text-[#8a8fa0]">
                        {new Intl.DateTimeFormat("tr-TR", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit"
                        }).format(new Date(log.created_at))}
                      </TableCell>
                      <TableCell className="py-3 text-xs font-mono text-[#f2efe8] break-all max-w-[180px]">
                        {log.recipient}
                      </TableCell>
                      <TableCell className="py-3 text-xs font-mono text-[#8a8fa0]">
                        {log.template_key || log.event_type}
                      </TableCell>
                      <TableCell className="py-3 text-xs text-[#f2efe8] font-sans font-medium max-w-[200px] truncate" title={log.subject}>
                        {log.subject}
                      </TableCell>
                      <TableCell className="py-3 text-xs font-mono">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                              log.status === "sent"
                                ? "bg-green-950 text-green-400 border border-green-800"
                                : log.status === "failed"
                                ? "bg-red-950 text-red-400 border border-red-800"
                                : log.status === "skipped"
                                ? "bg-gray-800 text-gray-400 border border-gray-700"
                                : "bg-yellow-950 text-yellow-400 border border-yellow-800"
                            }`}
                          >
                            {log.status}
                          </span>
                          {log.status === "failed" && log.error_message && (
                            <span className="text-[10px] text-red-400/80 font-mono mt-1 block max-w-[180px] break-words">
                              Hata: {log.error_message}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-xs font-mono text-[#8a8fa0] max-w-[150px] truncate" title={log.provider_message_id || ""}>
                        <div className="flex flex-col">
                          <span>{log.provider || "resend"}</span>
                          {log.provider_message_id && (
                            <span className="text-[9px] text-muted-foreground truncate">{log.provider_message_id}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-xs font-mono">
                        <MetadataInspector payload={log.payload} />
                      </TableCell>
                      <TableCell className="py-3 text-xs font-mono text-right">
                        {log.status === "failed" ? (
                          <RetryButton eventId={log.id} isReadOnly={isReadOnly} />
                        ) : (
                          <span className="text-[#8a8fa0] text-[10px]">-</span>
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
