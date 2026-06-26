import Link from "next/link";
import type { Metadata } from "next";
import { consumeUnsubscribeToken } from "@/features/email/preferences-actions";
import { buildNoIndexMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = buildNoIndexMetadata(
  "E-posta tercihleri",
  "IOH e-posta abonelikten cikma sayfasi."
);

type UnsubscribePageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

const categoryLabels: Record<string, string> = {
  marketing: "Kampanya ve Pazarlama",
  product_updates: "Ürün Güncellemeleri",
  community: "Topluluk ve Duyuru",
  amazon_rewards: "Amazon Ödül Bildirimleri"
};

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const params = await searchParams;
  const token = params.token || "";

  const result = await consumeUnsubscribeToken(token);
  const categoryLabel = result.category ? categoryLabels[result.category] || result.category : "Pazarlama ve kampanya";

  return (
    <main className="min-h-screen bg-[#08090d] text-[#f2efe8] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Cinematic Cosmic Background Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(231,197,116,0.03)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(0,149,255,0.02)_0%,rgba(0,0,0,0)_70%)] pointer-events-none" />

      <div className="max-w-md w-full border border-[rgba(242,239,232,0.12)] rounded-lg bg-[linear-gradient(145deg,rgba(255,255,255,0.03),rgba(255,255,255,0.005))] backdrop-blur-md p-8 shadow-2xl relative z-10 text-center space-y-6">
        
        {/* Brand Kicker */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-mono tracking-[0.25em] uppercase text-[#e7c574]">IOH / BİLDİRİM MERKEZİ</p>
          <div className="h-px w-12 bg-[#e7c574]/40 mx-auto" />
        </div>

        {result.ok ? (
          <>
            {/* Success Icon */}
            <div className="w-16 h-16 rounded-full bg-green-950/20 border border-green-500/30 flex items-center justify-center mx-auto text-green-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-mono text-[#f2efe8] uppercase tracking-wider font-semibold">
                Abonelikten Ayrıldınız
              </h2>
              <p className="text-xs text-[#8a8fa0] leading-relaxed">
                <strong className="text-[#f2efe8] font-mono">{categoryLabel}</strong> e-postalarını almayacaksınız. 
                Sipariş onayları ve dijital teslimat gibi işlemsel (transactional) bildirimler gönderilmeye devam edecektir.
              </p>
            </div>

            <p className="text-[10px] text-[#8a8fa0] font-mono leading-relaxed bg-black/35 border border-[rgba(242,239,232,0.05)] rounded p-3">
              Fikrinizi değiştirirseniz, istediğiniz zaman hesap profilinizden e-posta tercihlerinizi tekrar açabilirsiniz.
            </p>
          </>
        ) : (
          <>
            {/* Failure/Warning Icon */}
            <div className="w-16 h-16 rounded-full bg-red-950/20 border border-red-500/30 flex items-center justify-center mx-auto text-red-400 animate-pulse">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-mono text-[#f2efe8] uppercase tracking-wider font-semibold">
                Bağlantı Geçersiz
              </h2>
              <p className="text-xs text-[#8a8fa0] leading-relaxed">
                {result.error || "Abonelikten ayrılma bağlantısı geçersiz, kullanılmış veya süresi dolmuş."}
              </p>
            </div>
          </>
        )}

        <div className="pt-4 border-t border-[rgba(242,239,232,0.08)]">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-5 py-2.5 border border-[rgba(242,239,232,0.12)] text-[#8a8fa0] hover:border-[#e7c574] hover:text-[#e7c574] text-xs font-mono uppercase tracking-wider rounded transition-all font-semibold"
          >
            Ana Sayfaya Git
          </Link>
        </div>
      </div>
    </main>
  );
}
