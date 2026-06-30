import { requireStaff } from "@/features/auth/queries";
import { getContactMessagesAction } from "@/features/contact/contact-actions";
import { ContactDashboardClient } from "./contact-dashboard-client";
import sceneStyles from "@/features/admin/admin-scene.module.css";

export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
  const staff = await requireStaff(["owner", "admin_ops"]);
  if (!staff) {
    return (
      <main className={sceneStyles.main} id="main-content">
        <div className="p-8 text-center text-red-500 font-mono">
          Bu sayfaya erişim yetkiniz bulunmamaktadır.
        </div>
      </main>
    );
  }

  // Fetch initial contact signals
  const res = await getContactMessagesAction({});
  const initialMessages = res.ok ? res.data || [] : [];

  return (
    <main className={sceneStyles.main} id="main-content">
      <section className={sceneStyles.hero}>
        <div className={sceneStyles.heroTop}>
          <div className={sceneStyles.heroMain}>
            <div className={sceneStyles.heroGhost} aria-hidden="true">SIGNALS</div>
            <p className={sceneStyles.kicker}>OPERATIONS / İLETİŞİM VE DESTEK TALEPLERİ</p>
            <h2 className={sceneStyles.heroTitle}>İletişim Sinyalleri</h2>
            <p className={sceneStyles.heroLead}>
              Ziyaretçiler ve okurlar tarafından IOH veri kuyruğuna gönderilen tüm iletişim mesajlarını okuyun ve yönetin.
            </p>
          </div>
        </div>
      </section>

      <div className="px-8 max-w-[1480px] mx-auto mb-12">
        <ContactDashboardClient initialMessages={initialMessages} />
      </div>
    </main>
  );
}
