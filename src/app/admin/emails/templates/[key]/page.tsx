import Link from "next/link";
import { getAdminEmailTemplateByKey, requireEmailStaff } from "@/features/email/admin-queries";
import { FALLBACK_TEMPLATES } from "@/features/email/service";
import { TestSendButton } from "../test-send-button";
import sceneStyles from "@/features/admin/admin-scene.module.css";


export const dynamic = "force-dynamic";

type TemplateDetailPageProps = {
  params: Promise<{ key: string }>;
};

export default async function AdminEmailTemplateDetailPage({ params }: TemplateDetailPageProps) {
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

  const { key } = await params;
  let template = await getAdminEmailTemplateByKey(key);
  let isFallback = false;

  if (!template) {
    const fallback = FALLBACK_TEMPLATES[key];
    if (fallback) {
      template = {
        id: "mock-fallback-id",
        key,
        subject: fallback.subject,
        preview_text: fallback.previewText || null,
        body_html: fallback.bodyHtml,
        body_text: fallback.bodyText,
        variables: ["userName", "email", "accountUrl", "orderCode", "bookTitle", "downloadUrl", "pointsAmount", "verificationTitle", "adminReply", "pointsReason", "currentBalance"] as unknown as Record<string, unknown>,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      isFallback = true;
    }
  }

  if (!template) {
    return (
      <main className={sceneStyles.main}>
        <div className="p-8 max-w-[1480px] mx-auto">
          <Link href="/admin/emails/templates" className="text-[#e7c574] hover:underline font-mono text-xs">
            &larr; Şablonlara Geri Dön
          </Link>
          <div className="mt-8 p-8 border border-red-900 bg-red-950/20 text-red-400 rounded text-center font-mono text-sm">
            Şablon &quot;{key}&quot; bulunamadı.
          </div>
        </div>
      </main>
    );
  }

  // Parse variables
  let variablesList: string[] = [];
  if (Array.isArray(template.variables)) {
    variablesList = template.variables;
  } else if (typeof template.variables === "string") {
    try {
      variablesList = JSON.parse(template.variables);
    } catch {
      variablesList = [];
    }
  }

  return (
    <main className={sceneStyles.main} id="main-content">
      <section className={sceneStyles.hero}>
        <div className={sceneStyles.heroTop}>
          <div className={sceneStyles.heroMain}>
            <div className={sceneStyles.heroGhost} aria-hidden="true">DETAIL</div>
            <p className={sceneStyles.kicker}>OPERATIONS / ŞABLON DETAYI</p>
            <h2 className={sceneStyles.heroTitle}>{template.key}</h2>
            <p className={sceneStyles.heroLead}>
              E-posta şablon parametrelerini, konu satırını, önizleme metinlerini ve ham şablon içeriğini inceleyin.
            </p>
          </div>
        </div>
      </section>

      <div className="px-8 max-w-[1480px] mx-auto mb-12">
        <div className="mb-6 flex justify-between items-center">
          <Link
            href="/admin/emails/templates"
            className="inline-flex items-center justify-center px-4 py-2 border border-[rgba(242,239,232,0.12)] hover:border-[rgba(242,239,232,0.3)] text-[#8a8fa0] hover:text-[#f2efe8] rounded text-xs font-mono uppercase tracking-wider transition-all"
          >
            &larr; Şablon Listesine Dön
          </Link>
          
          <div className="flex gap-2">
            {isFallback && (
              <span className="inline-flex items-center px-3 py-1 bg-yellow-950 text-yellow-400 border border-yellow-800 rounded text-xs font-mono">
                Kod Tabanlı Fallback
              </span>
            )}
            <TestSendButton templateKey={template.key} isReadOnly={isReadOnly} />
          </div>
        </div>

        {/* Template info card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Details Column */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            <section className="border border-[rgba(242,239,232,0.12)] rounded-lg bg-[linear-gradient(145deg,rgba(255,255,255,0.025),rgba(255,255,255,0.006))] p-6">
              <h3 className="text-sm font-mono text-[#e7c574] mb-4 uppercase tracking-wider border-b border-[rgba(242,239,232,0.08)] pb-2">Şablon Künyesi</h3>
              
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-[10px] font-mono uppercase text-[#8a8fa0] tracking-wider mb-1">Şablon Key</h4>
                  <span className="text-sm font-mono text-[#f2efe8]">{template.key}</span>
                </div>
                
                <div>
                  <h4 className="text-[10px] font-mono uppercase text-[#8a8fa0] tracking-wider mb-1">Konu Satırı (Subject)</h4>
                  <span className="text-sm font-sans text-[#f2efe8]">{template.subject}</span>
                </div>
                
                {template.preview_text && (
                  <div>
                    <h4 className="text-[10px] font-mono uppercase text-[#8a8fa0] tracking-wider mb-1">Önizleme Metni (Preview)</h4>
                    <span className="text-xs font-sans text-[#8a8fa0]">{template.preview_text}</span>
                  </div>
                )}

                <div>
                  <h4 className="text-[10px] font-mono uppercase text-[#8a8fa0] tracking-wider mb-1">Durum</h4>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                      template.active
                        ? "bg-green-950 text-green-400 border border-green-800"
                        : "bg-gray-800 text-gray-400 border border-gray-700"
                    }`}
                  >
                    {template.active ? "Aktif" : "Pasif"}
                  </span>
                </div>
              </div>
            </section>

            <section className="border border-[rgba(242,239,232,0.12)] rounded-lg bg-[linear-gradient(145deg,rgba(255,255,255,0.025),rgba(255,255,255,0.006))] p-6">
              <h3 className="text-sm font-mono text-[#e7c574] mb-4 uppercase tracking-wider border-b border-[rgba(242,239,232,0.08)] pb-2">Beklenen Değişkenler</h3>
              {variablesList.length === 0 ? (
                <span className="text-xs font-mono text-[#8a8fa0]">Değişken tanımlanmamış.</span>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {variablesList.map((v: string) => (
                    <span key={v} className="px-2 py-1 bg-black/40 border border-[rgba(242,239,232,0.08)] rounded text-[10px] font-mono text-[#e7c574]">
                      {"{{" + v + "}}"}
                    </span>
                  ))}
                </div>
              )}
            </section>

          </div>

          {/* Code/Content Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* HTML view */}
            <section className="border border-[rgba(242,239,232,0.12)] rounded-lg bg-[linear-gradient(145deg,rgba(255,255,255,0.025),rgba(255,255,255,0.006))] p-6">
              <h3 className="text-sm font-mono text-[#e7c574] mb-4 uppercase tracking-wider border-b border-[rgba(242,239,232,0.08)] pb-2">HTML İçeriği</h3>
              <pre className="text-xs font-mono bg-black/40 border border-[rgba(242,239,232,0.08)] p-4 rounded text-left overflow-auto max-h-[300px] whitespace-pre-wrap text-[#8a8fa0] break-all">
                {template.body_html}
              </pre>
            </section>

            {/* Plain text view */}
            <section className="border border-[rgba(242,239,232,0.12)] rounded-lg bg-[linear-gradient(145deg,rgba(255,255,255,0.025),rgba(255,255,255,0.006))] p-6">
              <h3 className="text-sm font-mono text-[#e7c574] mb-4 uppercase tracking-wider border-b border-[rgba(242,239,232,0.08)] pb-2">Düz Metin (Plain Text) İçeriği</h3>
              <pre className="text-xs font-mono bg-black/40 border border-[rgba(242,239,232,0.08)] p-4 rounded text-left overflow-auto max-h-[250px] whitespace-pre-wrap text-[#8a8fa0] break-all">
                {template.body_text}
              </pre>
            </section>

          </div>

        </div>
      </div>
    </main>
  );
}
