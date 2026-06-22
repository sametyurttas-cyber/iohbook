"use client";

import { useState } from "react";
import { sendTestEmailAction } from "@/features/email/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TestSendButtonProps = {
  templateKey: string;
  isReadOnly: boolean;
};

export function TestSendButton({ templateKey, isReadOnly }: TestSendButtonProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  if (isReadOnly) {
    return null;
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      alert("Lütfen geçerli bir e-posta adresi girin.");
      return;
    }

    setLoading(true);
    try {
      const res = await sendTestEmailAction(email, templateKey);
      if (res.ok) {
        alert(`Test e-postası başarıyla gönderildi (${email}).`);
        setOpen(false);
        setEmail("");
      } else {
        alert(`Hata: ${res.error}`);
      }
    } catch {
      alert("Gönderim sırasında bir bağlantı hatası oluştu.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-7 text-[10px] font-mono border-[#e7c574] text-[#e7c574] hover:bg-[rgba(231,197,116,0.1)] hover:text-[#e7c574]"
        onClick={() => setOpen(true)}
      >
        Test Gönder
      </Button>
    );
  }

  return (
    <form onSubmit={handleSend} className="flex items-center gap-1.5 justify-end">
      <Input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Alıcı e-posta..."
        className="h-7 text-[10px] font-mono bg-black/40 border-[rgba(242,239,232,0.12)] text-[#f2efe8] w-[150px] px-2 focus-visible:ring-0 focus-visible:ring-offset-0"
        disabled={loading}
      />
      <Button
        type="submit"
        size="sm"
        className="h-7 px-2 text-[10px] font-mono bg-[#e7c574] text-[#08090d] hover:bg-[#d4b05d]"
        disabled={loading}
      >
        {loading ? "..." : "Gönder"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 px-1 text-[10px] font-mono text-[#8a8fa0] hover:text-[#f2efe8]"
        onClick={() => setOpen(false)}
        disabled={loading}
      >
        Kapat
      </Button>
    </form>
  );
}
