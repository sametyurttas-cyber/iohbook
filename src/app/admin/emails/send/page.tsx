import { Suspense } from "react";
import Link from "next/link";
import { requireEmailStaff, listAdminEmailTemplates } from "@/features/email/admin-queries";
import { getCurrentUser } from "@/features/auth/queries";
import { SendForm } from "./send-form";
import sceneStyles from "@/features/admin/admin-scene.module.css";

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

export default async function AdminEmailSendPage() {
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

  const user = await getCurrentUser();
  const templates = await listAdminEmailTemplates();

  // Check if they can actually send (owner or admin_ops)
  const canSend = staff.roles.includes("owner") || staff.roles.includes("admin_ops");

  return (
    <main className={sceneStyles.main} id="main-content">
      <section className={sceneStyles.hero}>
        <div className={sceneStyles.heroTop}>
          <div className={sceneStyles.heroMain}>
            <div className={sceneStyles.heroGhost} aria-hidden="true">SEND</div>
            <p className={sceneStyles.kicker}>OPERATIONS / MANUEL MAİL GÖNDERİMİ</p>
            <h2 className={sceneStyles.heroTitle}>Manuel Mail Gönderimi</h2>
            <p className={sceneStyles.heroLead}>
              Seçilen tek bir kullanıcıya özel konu ve içerik girerek ya da şablonlardan birini seçerek anında mail gönderin.
            </p>
          </div>
        </div>
      </section>

      <div className="px-8 max-w-[1480px] mx-auto mb-12">
        <EmailSubNav active="send" />
        <Suspense fallback={<div className="text-xs font-mono text-[#8a8fa0] p-8 border border-[rgba(242,239,232,0.08)] bg-[#0d0e12] rounded text-center">Yükleniyor...</div>}>
          <SendForm
            templates={templates}
            adminEmail={user?.email || ""}
            adminProfileId={user?.id || ""}
            canSend={canSend}
          />
        </Suspense>
      </div>
    </main>
  );
}
