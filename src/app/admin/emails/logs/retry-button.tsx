"use client";

import { useState } from "react";
import { retryFailedEmailAction } from "@/features/email/admin-actions";
import { Button } from "@/components/ui/button";

type RetryButtonProps = {
  eventId: string;
  isReadOnly: boolean;
};

export function RetryButton({ eventId, isReadOnly }: RetryButtonProps) {
  const [loading, setLoading] = useState(false);

  if (isReadOnly) {
    return null;
  }

  const handleRetry = async () => {
    if (!confirm("Bu e-postayı yeniden göndermek istediğinize emin misiniz?")) {
      return;
    }

    setLoading(true);
    try {
      const res = await retryFailedEmailAction(eventId);
      if (res.ok) {
        alert("E-posta başarıyla yeniden gönderildi.");
      } else {
        alert(`Hata: ${res.error}`);
      }
    } catch {
      alert("Yeniden gönderim sırasında bir ağ hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-7 text-[10px] font-mono border-[#e7c574] text-[#e7c574] hover:bg-[rgba(231,197,116,0.1)] hover:text-[#e7c574]"
      disabled={loading}
      onClick={handleRetry}
    >
      {loading ? "Gönderiliyor..." : "Tekrar Gönder"}
    </Button>
  );
}
