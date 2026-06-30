"use client";

import { useState, useTransition } from "react";
import { submitContactMessageAction } from "./contact-actions";
import styles from "./contact-scene.module.css";

const PURPOSE_OPTIONS = [
  { value: "support", label: "01 // READER SUPPORT (Puan & Kitap)", kicker: "Okuyucu Destek Talebi" },
  { value: "partnership", label: "02 // ALLIANCE & PARTNERS (Ortaklık)", kicker: "İş Birliği Talebi" },
  { value: "press", label: "03 // BRAND & PRESS (Tanıtım & Basın)", kicker: "Yayın ve Basın Talebi" },
  { value: "tech", label: "04 // SYSTEM / TECH (Teknik Hatalar)", kicker: "Teknik Destek Talebi" },
  { value: "other", label: "05 // OTHER CHANNELS (Diğer Konular)", kicker: "Diğer Talepler" }
] as const;

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [purpose, setPurpose] = useState<"press" | "partnership" | "support" | "tech" | "other">("support");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setStatus("error");
      setErrorMsg("Lütfen geçerli bir isim girin (en az 2 karakter).");
      return;
    }
    const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setStatus("error");
      setErrorMsg("Lütfen geçerli bir e-posta adresi girin.");
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setStatus("error");
      setErrorMsg("Lütfen geçerli bir mesaj girin (en az 10 karakter).");
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    startTransition(async () => {
      try {
        const res = await submitContactMessageAction({
          name,
          email,
          purpose,
          subject: subject || undefined,
          message
        });

        if (res.ok) {
          setStatus("success");
          setName("");
          setEmail("");
          setSubject("");
          setMessage("");
        } else {
          setStatus("error");
          setErrorMsg(res.error || "Sinyal gönderilemedi.");
        }
      } catch (err) {
        setStatus("error");
        setErrorMsg("Sunucu hatası oluştu.");
      }
    });
  };

  if (status === "success") {
    return (
      <div className="p-8 border border-[#e7c574]/30 bg-[#0d0e12] rounded-lg text-center space-y-4 font-mono max-w-xl mx-auto shadow-2xl">
        <div className="text-4xl animate-bounce">⚡</div>
        <h3 className="text-lg text-[#e7c574] font-bold uppercase tracking-widest">SIGNAL TRANSFERRED</h3>
        <p className="text-xs text-[#9297a6] leading-relaxed">
          Sinyal başarıyla kilitlendi ve veritabanımıza güvenli bir şekilde kaydedildi. <br />
          Operasyon birimimiz 24 saat içinde belirttiğiniz mail adresine dönüş sağlayacaktır.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="px-6 py-2.5 rounded text-xs font-mono uppercase tracking-wider bg-[#e7c574] text-[#08090d] font-bold hover:bg-[#d4b363] transition-all cursor-pointer"
        >
          Yeni Sinyal Gönder
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-[rgba(242,239,232,0.08)] bg-[#0d0e12] p-6 rounded-lg space-y-5 font-mono text-xs max-w-xl mx-auto shadow-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[#8a8fa0] uppercase tracking-wider mb-2">Kimliğiniz (Name / Alias)</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            placeholder="İsminiz..."
            className="w-full bg-[#08090d] border border-[rgba(242,239,232,0.12)] text-[#f2efe8] px-4 py-2.5 rounded focus:outline-none focus:border-[#e7c574]/50 transition-all"
          />
        </div>
        <div>
          <label className="block text-[#8a8fa0] uppercase tracking-wider mb-2">Sinyal Adresi (Email)</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            placeholder="E-posta adresiniz..."
            className="w-full bg-[#08090d] border border-[rgba(242,239,232,0.12)] text-[#f2efe8] px-4 py-2.5 rounded focus:outline-none focus:border-[#e7c574]/50 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-[#8a8fa0] uppercase tracking-wider mb-2">İletişim Amacı (Purpose Nodes)</label>
        <select
          value={purpose}
          onChange={(e) => setPurpose(e.target.value as any)}
          disabled={isPending}
          className="w-full bg-[#08090d] border border-[rgba(242,239,232,0.12)] text-[#f2efe8] px-4 py-2.5 rounded focus:outline-none focus:border-[#e7c574]/50 transition-all"
        >
          {PURPOSE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-[#8a8fa0] uppercase tracking-wider mb-2">Konu Başlığı (Subject - İsteğe Bağlı)</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={isPending}
          placeholder="İletişim konusu..."
          className="w-full bg-[#08090d] border border-[rgba(242,239,232,0.12)] text-[#f2efe8] px-4 py-2.5 rounded focus:outline-none focus:border-[#e7c574]/50 transition-all"
        />
      </div>

      <div>
        <label className="block text-[#8a8fa0] uppercase tracking-wider mb-2">Mesaj İçeriği (Transmission Body)</label>
        <textarea
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isPending}
          placeholder="Mesajınızı buraya yazın..."
          className="w-full bg-[#08090d] border border-[rgba(242,239,232,0.12)] text-[#f2efe8] px-4 py-3 rounded focus:outline-none focus:border-[#e7c574]/50 transition-all leading-relaxed"
        />
      </div>

      {status === "error" && (
        <div className="p-3 border border-red-950 bg-red-950/20 text-red-400 rounded flex items-center gap-2">
          <span>⚠️</span> {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 rounded bg-[#e7c574] text-[#08090d] font-bold hover:bg-[#d4b363] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer uppercase tracking-widest"
      >
        {isPending ? "TRANSMITTING SIGNAL..." : "TRANSMIT SIGNAL →"}
      </button>
    </form>
  );
}
