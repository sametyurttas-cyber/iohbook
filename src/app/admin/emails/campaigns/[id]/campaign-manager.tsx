"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  sendTestCampaignAction,
  processCampaignBatchAction,
  pauseCampaignAction,
  retryFailedCampaignRecipientsAction
} from "@/features/email/campaign-actions";

type CampaignInfo = {
  id: string;
  title: string;
  segment_key: string;
  subject: string;
  body_text: string;
  status: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  skipped_count: number;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
};

type CampaignManagerProps = {
  campaign: CampaignInfo;
  adminEmail: string;
  canManage: boolean;
};

const segmentLabels: Record<string, string> = {
  all: "Tüm Kullanıcılar (Pazarlama Onaylı)",
  recent_30d: "Son 30 Gün Kayıt Olanlar",
  purchased_book: "Kitap Satın Alanlar",
  downloaded_book_1: "Book I İndirenler",
  approved_amazon_review: "Amazon Yorumu Onaylananlar",
  high_points: "IOH Puanı > 1000 Olanlar",
  no_orders: "Hiç Sipariş Vermeyenler"
};

export function CampaignManager({ campaign, adminEmail, canManage }: CampaignManagerProps) {
  const router = useRouter();
  const [status, setStatus] = useState(campaign.status);
  const [sentCount, setSentCount] = useState(campaign.sent_count);
  const [failedCount, setFailedCount] = useState(campaign.failed_count);
  const [skippedCount, setSkippedCount] = useState(campaign.skipped_count);
  const [testSent, setTestSent] = useState(!!campaign.scheduled_at);

  const [activeBatchProcess, setActiveBatchProcess] = useState(campaign.status === "sending");
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Periodically process batch if in sending state and active batch process is enabled
  useEffect(() => {
    if (status !== "sending" || !activeBatchProcess) return;

    let isSubscribed = true;
    const processBatch = async () => {
      try {
        const res = await processCampaignBatchAction(campaign.id);
        if (!isSubscribed) return;

        if (res.ok) {
          if (typeof res.sent === "number") setSentCount((prev) => prev + (res.sent ?? 0));
          if (typeof res.failed === "number") setFailedCount((prev) => prev + (res.failed ?? 0));
          if (typeof res.skipped === "number") setSkippedCount((prev) => prev + (res.skipped ?? 0));

          if (res.completed) {
            setStatus("completed");
            setActiveBatchProcess(false);
            setInfoMessage("Kampanya gönderimi başarıyla tamamlandı!");
            router.refresh();
          } else {
            // Wait 1s and recurse
            setTimeout(() => {
              if (isSubscribed && activeBatchProcess && status === "sending") {
                processBatch();
              }
            }, 1000);
          }
        } else {
          setErrorMessage(res.error || "Toplu gönderim esnasında bir hata oluştu.");
          setStatus("failed");
          setActiveBatchProcess(false);
          router.refresh();
        }
      } catch (err) {
        if (!isSubscribed) return;
        const msg = err instanceof Error ? err.message : String(err);
        setErrorMessage(`Hata: ${msg}`);
        setStatus("failed");
        setActiveBatchProcess(false);
        router.refresh();
      }
    };

    processBatch();

    return () => {
      isSubscribed = false;
    };
  }, [status, activeBatchProcess, campaign.id, router]);

  const handleSendTest = () => {
    setInfoMessage("");
    setErrorMessage("");
    startTransition(async () => {
      const res = await sendTestCampaignAction(campaign.id);
      if (res.ok) {
        setTestSent(true);
        setInfoMessage(`Kendinize test e-postası gönderildi: ${adminEmail}`);
      } else {
        setErrorMessage(res.error || "Test e-postası gönderilemedi.");
      }
    });
  };

  const handleStartCampaign = () => {
    setShowConfirm(true);
  };

  const confirmStartCampaign = () => {
    setShowConfirm(false);
    setInfoMessage("");
    setErrorMessage("");
    setStatus("sending");
    setActiveBatchProcess(true);
  };

  const handlePauseCampaign = () => {
    setInfoMessage("");
    setErrorMessage("");
    startTransition(async () => {
      const res = await pauseCampaignAction(campaign.id);
      if (res.ok) {
        setStatus("draft");
        setActiveBatchProcess(false);
        setInfoMessage("Gönderim duraklatıldı. İstediğiniz zaman devam edebilirsiniz.");
      } else {
        setErrorMessage(res.error || "Kampanya duraklatılamadı.");
      }
    });
  };

  const handleRetryFailed = () => {
    setInfoMessage("");
    setErrorMessage("");
    startTransition(async () => {
      const res = await retryFailedCampaignRecipientsAction(campaign.id);
      if (res.ok) {
        setStatus("draft");
        setSentCount(campaign.sent_count);
        setFailedCount(0);
        setSkippedCount(campaign.skipped_count);
        setInfoMessage("Başarısız kayıtlar sıfırlandı. Yeni bir test gönderip kampanyayı tekrar başlatabilirsiniz.");
        router.refresh();
      } else {
        setErrorMessage(res.error || "Başarısız alıcılar sıfırlanamadı.");
      }
    });
  };

  const processedTotal = sentCount + failedCount + skippedCount;
  const progressPercentage = campaign.total_recipients > 0
    ? Math.round((processedTotal / campaign.total_recipients) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Messages */}
      {infoMessage && (
        <div className="p-4 border border-green-950 bg-green-950/20 text-green-400 rounded text-xs font-mono">
          {infoMessage}
        </div>
      )}
      {errorMessage && (
        <div className="p-4 border border-red-950 bg-red-950/20 text-red-400 rounded text-xs font-mono">
          {errorMessage}
        </div>
      )}

      {/* Campaign Details Panel */}
      <section className="border border-[rgba(242,239,232,0.12)] rounded-lg bg-[linear-gradient(145deg,rgba(255,255,255,0.025),rgba(255,255,255,0.006))] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-[rgba(242,239,232,0.08)] pb-4">
          <div>
            <h3 className="text-lg font-mono text-[#e7c574] uppercase tracking-wider">
              {campaign.title}
            </h3>
            <p className="text-xs text-[#8a8fa0] font-mono mt-1">
              Segment: <strong className="text-[#f2efe8]">{segmentLabels[campaign.segment_key] || campaign.segment_key}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#8a8fa0]">DURUM:</span>
            <span
              className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-wider border ${
                status === "completed"
                  ? "bg-green-950 text-green-400 border-green-800"
                  : status === "sending"
                  ? "bg-yellow-950 text-yellow-500 border-yellow-800 animate-pulse"
                  : status === "failed"
                  ? "bg-red-950 text-red-400 border-red-800"
                  : "bg-gray-800 text-gray-400 border-gray-700"
              }`}
            >
              {status === "completed"
                ? "Tamamlandı"
                : status === "sending"
                ? "Gönderiliyor"
                : status === "failed"
                ? "Hata Aldı"
                : "Taslak"}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-black/25 border border-[rgba(242,239,232,0.08)] rounded p-4 text-center">
            <p className="text-xs font-mono text-[#8a8fa0] uppercase tracking-wider mb-1">Toplam Alıcı</p>
            <p className="text-2xl font-mono text-[#f2efe8] font-bold">{campaign.total_recipients}</p>
          </div>
          <div className="bg-black/25 border border-[rgba(242,239,232,0.08)] rounded p-4 text-center border-l-green-950/50">
            <p className="text-xs font-mono text-[#8a8fa0] uppercase tracking-wider mb-1">Başarılı Gönderilen</p>
            <p className="text-2xl font-mono text-green-400 font-bold">{sentCount}</p>
          </div>
          <div className="bg-black/25 border border-[rgba(242,239,232,0.08)] rounded p-4 text-center border-l-red-950/50">
            <p className="text-xs font-mono text-[#8a8fa0] uppercase tracking-wider mb-1">Hatalı / Başarısız</p>
            <p className="text-2xl font-mono text-red-400 font-bold">{failedCount}</p>
          </div>
          <div className="bg-black/25 border border-[rgba(242,239,232,0.08)] rounded p-4 text-center">
            <p className="text-xs font-mono text-[#8a8fa0] uppercase tracking-wider mb-1">Atlanan (Skipped)</p>
            <p className="text-2xl font-mono text-amber-500 font-bold">{skippedCount}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-xs font-mono text-[#8a8fa0]">
            <span>Gönderim İlerlemesi</span>
            <span>{progressPercentage}% ({processedTotal} / {campaign.total_recipients})</span>
          </div>
          <div className="w-full bg-black/50 border border-[rgba(242,239,232,0.08)] rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                status === "completed" ? "bg-green-500" : "bg-[#e7c574]"
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        {canManage && (
          <div className="flex flex-wrap gap-4 pt-4 border-t border-[rgba(242,239,232,0.08)]">
            {status === "draft" && (
              <>
                <button
                  onClick={handleSendTest}
                  disabled={isPending}
                  className="px-5 py-2 border border-[#e7c574]/30 hover:border-[#e7c574] text-[#8a8fa0] hover:text-[#e7c574] text-xs font-mono uppercase tracking-wider rounded transition-all font-semibold disabled:opacity-50"
                >
                  {isPending ? "Gönderiliyor..." : "Kendime Test Maili Gönder"}
                </button>
                <button
                  onClick={handleStartCampaign}
                  disabled={!testSent || isPending}
                  className="px-5 py-2 border border-[#e7c574] text-[#08090d] bg-[#e7c574] hover:bg-transparent hover:text-[#e7c574] text-xs font-mono uppercase tracking-wider rounded transition-all font-bold disabled:opacity-30 disabled:hover:bg-[#e7c574] disabled:hover:text-[#08090d] disabled:cursor-not-allowed"
                  title={!testSent ? "Kampanyayı başlatmak için önce test maili göndermelisiniz." : ""}
                >
                  {campaign.started_at ? "Gönderimi Sürdür" : "Kampanyayı Başlat"}
                </button>
              </>
            )}

            {status === "sending" && (
              <button
                onClick={handlePauseCampaign}
                disabled={isPending}
                className="px-5 py-2 border border-red-500 text-red-500 hover:bg-red-950/20 text-xs font-mono uppercase tracking-wider rounded transition-all font-bold disabled:opacity-50"
              >
                Gönderimi Duraklat (Pause)
              </button>
            )}

            {(status === "completed" || status === "failed") && failedCount > 0 && (
              <button
                onClick={handleRetryFailed}
                disabled={isPending}
                className="px-5 py-2 border border-[#e7c574] text-[#08090d] bg-[#e7c574] hover:bg-transparent hover:text-[#e7c574] text-xs font-mono uppercase tracking-wider rounded transition-all font-bold disabled:opacity-50"
              >
                Başarısız Alıcıları Yeniden Dene ({failedCount})
              </button>
            )}
          </div>
        )}

        {!canManage && (
          <div className="p-4 border border-blue-900/50 bg-blue-950/20 text-blue-400 rounded text-xs font-mono">
            Destek personeli (support) rolündesiniz. Kampanya detaylarını ve ilerlemesini izleyebilirsiniz ancak gönderim/test yönetimi yapamazsınız.
          </div>
        )}
      </section>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="border border-[rgba(242,239,232,0.12)] rounded-lg bg-[#0d0d0f] p-6 max-w-md w-full shadow-2xl space-y-4">
            <h4 className="text-lg font-mono text-[#e7c574] uppercase tracking-wider border-b border-[rgba(242,239,232,0.08)] pb-2">
              Kampanya Gönderim Onayı
            </h4>
            <p className="text-xs font-mono text-[#8a8fa0] leading-relaxed">
              Bu kampanya <strong className="text-[#f2efe8]">{campaign.total_recipients}</strong> alıcıya gönderilecektir.
            </p>
            <p className="text-xs font-mono text-[#8a8fa0] leading-relaxed">
              Gönderim işlemi tarayıcınızda canlı olarak 50 alıcılık dilimler halinde gerçekleştirilecektir. Gönderim esnasında bu sayfayı açık tutmalısınız. Kapatırsanız gönderim duraklatılacaktır.
            </p>
            <div className="flex gap-4 pt-2">
              <button
                onClick={confirmStartCampaign}
                className="flex-1 px-4 py-2 border border-green-500 bg-green-500 hover:bg-transparent text-[#08090d] hover:text-green-400 text-xs font-mono uppercase tracking-wider rounded transition-all font-bold"
              >
                Evet, Gönderimi Başlat
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 border border-[rgba(242,239,232,0.12)] text-[#8a8fa0] hover:border-[rgba(242,239,232,0.3)] hover:text-[#f2efe8] text-xs font-mono uppercase tracking-wider rounded transition-all flex items-center justify-center font-bold"
              >
                İptal Et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
