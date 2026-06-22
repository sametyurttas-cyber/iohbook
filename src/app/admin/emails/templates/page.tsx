import Link from "next/link";
import { listAdminEmailTemplates, requireEmailStaff } from "@/features/email/admin-queries";
import { TestSendButton } from "./test-send-button";
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

export default async function AdminEmailTemplatesPage() {
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

  const templates = await listAdminEmailTemplates();

  return (
    <main className={sceneStyles.main} id="main-content">
      <section className={sceneStyles.hero}>
        <div className={sceneStyles.heroTop}>
          <div className={sceneStyles.heroMain}>
            <div className={sceneStyles.heroGhost} aria-hidden="true">TEMPLATES</div>
            <p className={sceneStyles.kicker}>OPERATIONS / E-POSTA ŞABLONLARI</p>
            <h2 className={sceneStyles.heroTitle}>E-posta Şablonları</h2>
            <p className={sceneStyles.heroLead}>
              Sistemdeki tüm e-posta şablonlarını listeleyin, durumlarını görün ve şablonların doğru render edildiğini doğrulamak için test gönderimi yapın.
            </p>
          </div>
        </div>
      </section>

      <div className="px-8 max-w-[1480px] mx-auto">
        <EmailSubNav active="templates" />

        {/* Templates Table */}
        <section className="border border-[rgba(242,239,232,0.12)] rounded-lg bg-[linear-gradient(145deg,rgba(255,255,255,0.025),rgba(255,255,255,0.006))] p-6 mb-12">
          {templates.length === 0 ? (
            <div className="text-center py-12 text-sm text-[#8a8fa0] font-mono">
              Sistemde kayıtlı e-posta şablonu bulunamadı.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-[rgba(242,239,232,0.08)]">
                    <TableHead className="text-xs text-[#8a8fa0] py-3 font-mono">Şablon Anahtarı (Key)</TableHead>
                    <TableHead className="text-xs text-[#8a8fa0] py-3 font-mono">Konu (Subject)</TableHead>
                    <TableHead className="text-xs text-[#8a8fa0] py-3 font-mono">Durum</TableHead>
                    <TableHead className="text-xs text-[#8a8fa0] py-3 font-mono">Son Güncelleme</TableHead>
                    <TableHead className="text-xs text-[#8a8fa0] py-3 font-mono text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((tpl) => (
                    <TableRow key={tpl.id} className="border-b border-[rgba(242,239,232,0.04)] hover:bg-[rgba(255,255,255,0.015)]">
                      <TableCell className="py-3 text-xs font-mono text-[#f2efe8] font-semibold">
                        {tpl.key}
                      </TableCell>
                      <TableCell className="py-3 text-xs text-[#8a8fa0] font-sans">
                        {tpl.subject}
                      </TableCell>
                      <TableCell className="py-3 text-xs font-mono">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                            tpl.active
                              ? "bg-green-950 text-green-400 border border-green-800"
                              : "bg-gray-800 text-gray-400 border border-gray-700"
                          }`}
                        >
                          {tpl.active ? "Aktif" : "Pasif"}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-xs font-mono text-[#8a8fa0]">
                        {new Intl.DateTimeFormat("tr-TR", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit"
                        }).format(new Date(tpl.updated_at))}
                      </TableCell>
                      <TableCell className="py-3 text-xs font-mono text-right">
                        <div className="flex gap-2 justify-end items-center">
                          <Link
                            href={`/admin/emails/templates/${tpl.key}`}
                            className="inline-flex items-center justify-center px-3 py-1 border border-[rgba(242,239,232,0.12)] hover:border-[rgba(242,239,232,0.3)] text-[#8a8fa0] hover:text-[#f2efe8] rounded text-[10px] uppercase tracking-wider font-mono transition-all h-7"
                          >
                            Detayları Gör
                          </Link>
                          <TestSendButton templateKey={tpl.key} isReadOnly={isReadOnly} />
                        </div>
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
