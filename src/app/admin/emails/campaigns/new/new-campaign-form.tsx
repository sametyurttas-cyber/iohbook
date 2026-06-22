"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createCampaignAction, estimateSegmentRecipientsAction } from "@/features/email/campaign-actions";

const segments = [
  { value: "all", label: "Tüm Kullanıcılar (Pazarlama Onaylı)" },
  { value: "recent_30d", label: "Son 30 Gün Kayıt Olanlar" },
  { value: "purchased_book", label: "Kitap Satın Alanlar" },
  { value: "downloaded_book_1", label: "Book I İndirenler" },
  { value: "approved_amazon_review", label: "Amazon Yorumu Onaylananlar" },
  { value: "high_points", label: "IOH Puanı > 1000 Olanlar" },
  { value: "no_orders", label: "Hiç Sipariş Vermeyenler" }
];

export function NewCampaignForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [segmentKey, setSegmentKey] = useState("all");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [isCounting, setIsCounting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!segmentKey) return;
    let active = true;

    setTimeout(() => {
      if (active) setIsCounting(true);
    }, 0);

    estimateSegmentRecipientsAction(segmentKey)
      .then((res) => {
        if (!active) return;
        if (res.ok && typeof res.count === "number") {
          setRecipientCount(res.count);
        } else {
          setRecipientCount(0);
        }
      })
      .catch(() => {
        if (active) setRecipientCount(0);
      })
      .finally(() => {
        if (active) setIsCounting(false);
      });

    return () => {
      active = false;
    };
  }, [segmentKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Lütfen kampanya başlığı girin.");
      return;
    }
    if (!subject.trim()) {
      setError("Lütfen e-posta konusu girin.");
      return;
    }
    if (!body.trim()) {
      setError("Lütfen e-posta içeriği girin.");
      return;
    }

    startTransition(async () => {
      const res = await createCampaignAction({
        title,
        segmentKey,
        subject,
        body
      });

      if (res.ok && res.campaignId) {
        router.push(`/admin/emails/campaigns/${res.campaignId}`);
      } else {
        setError(res.error || "Kampanya oluşturulurken bir hata oluştu.");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Section */}
      <form onSubmit={handleSubmit} className="space-y-6 border border-[rgba(242,239,232,0.12)] rounded-lg bg-[linear-gradient(145deg,rgba(255,255,255,0.025),rgba(255,255,255,0.006))] p-6 shadow-xl">
        <h3 className="text-lg font-mono text-[#e7c574] mb-4 border-b border-[rgba(242,239,232,0.08)] pb-2 uppercase tracking-wider">
          Kampanya Bilgileri
        </h3>

        {error && (
          <div className="p-4 border border-red-900/50 bg-red-950/20 text-red-400 rounded text-xs font-mono">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono text-[#8a8fa0] uppercase tracking-wider">Kampanya Başlığı (Dahili)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Örn: Haziran 2026 Bülteni"
            className="w-full bg-[#0d0d0f] border border-[rgba(242,239,232,0.12)] rounded px-3 py-2 text-xs font-mono text-[#f2efe8] focus:border-[#e7c574] focus:outline-none transition-all placeholder:text-[#8a8fa0]/50"
            required
            disabled={isPending}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono text-[#8a8fa0] uppercase tracking-wider">Hedef Kullanıcı Segmenti</label>
          <select
            value={segmentKey}
            onChange={(e) => setSegmentKey(e.target.value)}
            className="w-full bg-[#0d0d0f] border border-[rgba(242,239,232,0.12)] rounded px-3 py-2 text-xs font-mono text-[#f2efe8] focus:border-[#e7c574] focus:outline-none transition-all"
            disabled={isPending}
          >
            {segments.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <p className="text-[11px] font-mono text-[#8a8fa0] mt-1">
            {isCounting ? (
              <span className="text-[#e7c574] animate-pulse">Alıcı sayısı hesaplanıyor...</span>
            ) : (
              <span>Tahmini Alıcı Sayısı: <strong className="text-[#f2efe8]">{recipientCount ?? 0}</strong></span>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono text-[#8a8fa0] uppercase tracking-wider">E-posta Konusu (Subject)</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Kullanıcıların e-posta kutusunda göreceği başlık"
            className="w-full bg-[#0d0d0f] border border-[rgba(242,239,232,0.12)] rounded px-3 py-2 text-xs font-mono text-[#f2efe8] focus:border-[#e7c574] focus:outline-none transition-all placeholder:text-[#8a8fa0]/50"
            required
            disabled={isPending}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-mono text-[#8a8fa0] uppercase tracking-wider">E-posta Gövdesi (Text / HTML)</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={12}
            placeholder="E-posta içeriğini buraya yazın. Satır atlamaları otomatik olarak <br /> etiketine dönüştürülecektir."
            className="w-full bg-[#0d0d0f] border border-[rgba(242,239,232,0.12)] rounded px-3 py-2 text-xs font-mono text-[#f2efe8] focus:border-[#e7c574] focus:outline-none transition-all placeholder:text-[#8a8fa0]/50 resize-y"
            required
            disabled={isPending}
          />
        </div>

        <div className="flex gap-4 pt-4 border-t border-[rgba(242,239,232,0.08)]">
          <button
            type="submit"
            disabled={isPending || isCounting}
            className="flex-1 px-6 py-2.5 border border-[#e7c574] text-[#08090d] bg-[#e7c574] hover:bg-transparent hover:text-[#e7c574] text-xs font-mono uppercase tracking-wider rounded transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Oluşturuluyor..." : "Kampanya Taslağı Oluştur"}
          </button>
          <Link
            href="/admin/emails/campaigns"
            className="px-6 py-2.5 border border-[rgba(242,239,232,0.12)] text-[#8a8fa0] hover:border-[rgba(242,239,232,0.3)] hover:text-[#f2efe8] text-xs font-mono uppercase tracking-wider rounded transition-all flex items-center justify-center"
          >
            Vazgeç
          </Link>
        </div>
      </form>

      {/* Preview Section */}
      <div className="border border-[rgba(242,239,232,0.12)] rounded-lg bg-[#08090d] p-6 flex flex-col h-full min-h-[500px]">
        <h3 className="text-lg font-mono text-[#e7c574] mb-4 border-b border-[rgba(242,239,232,0.08)] pb-2 uppercase tracking-wider">
          Kampanya Önizleme (Preview)
        </h3>

        <div className="flex-1 bg-[#0d0d0f] border border-[rgba(242,239,232,0.08)] rounded p-6 overflow-y-auto">
          {subject && (
            <div className="mb-4 pb-3 border-b border-[rgba(242,239,232,0.08)]">
              <span className="text-xs font-mono text-[#8a8fa0] block">KONU:</span>
              <span className="text-xs font-mono text-[#f2efe8] font-bold">{subject}</span>
            </div>
          )}

          {body ? (
            <div className="text-xs font-sans text-[#d8d0c8] space-y-4 whitespace-pre-line leading-relaxed">
              {body}
              
              <hr className="border-none border-t border-[rgba(242,239,232,0.08)] my-6" />
              <div className="text-[10px] text-[#8a8fa0] text-center space-y-1">
                <p>Bu e-postayı pazarlama iletişim onayınız olduğu için alıyorsunuz.</p>
                <p>
                  İletişim tercihlerinizi değiştirmek veya üyelikten ayrılmak için lütfen{" "}
                  <span className="text-[#e7c574] underline cursor-pointer">profilinizi ziyaret edin</span>.
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs font-mono text-[#8a8fa0]/40 text-center">
              Önizleme oluşturmak için sol taraftaki alanları doldurun.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
