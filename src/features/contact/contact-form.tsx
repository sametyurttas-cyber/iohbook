"use client";

import { useState, useTransition } from "react";
import { submitContactMessageAction } from "./contact-actions";
import styles from "./contact-scene.module.css";

const PURPOSE_OPTIONS = [
  { value: "support", label: "01 // READER SUPPORT (Points & Books)", kicker: "Reader Support Request" },
  { value: "partnership", label: "02 // ALLIANCE & PARTNERS (Partnerships)", kicker: "Partnership Request" },
  { value: "press", label: "03 // BRAND & PRESS (Press & Media)", kicker: "Press Request" },
  { value: "tech", label: "04 // SYSTEM / TECH (Technical Issues)", kicker: "Tech Support Request" },
  { value: "other", label: "05 // OTHER CHANNELS (Other Inquiries)", kicker: "Other Request" }
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
      setErrorMsg("Please enter a valid name (at least 2 characters).");
      return;
    }
    const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setStatus("error");
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!message.trim() || message.trim().length < 10) {
      setStatus("error");
      setErrorMsg("Please enter a valid message (at least 10 characters).");
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
          setErrorMsg(res.error || "Failed to transmit signal.");
        }
      } catch (err) {
        setStatus("error");
        setErrorMsg("A server error occurred.");
      }
    });
  };

  if (status === "success") {
    return (
      <div className="p-8 border border-[#e7c574]/30 bg-[#0d0e12] rounded-lg text-center space-y-4 font-mono max-w-xl mx-auto shadow-2xl">
        <div className="text-4xl animate-bounce">⚡</div>
        <h3 className="text-lg text-[#e7c574] font-bold uppercase tracking-widest">SIGNAL TRANSFERRED</h3>
        <p className="text-xs text-[#9297a6] leading-relaxed">
          Signal successfully locked and saved to our database. <br />
          Our operations unit will reply to your return email address within 24 hours.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="px-6 py-2.5 rounded text-xs font-mono uppercase tracking-wider bg-[#e7c574] text-[#08090d] font-bold hover:bg-[#d4b363] transition-all cursor-pointer"
        >
          Transmit New Signal
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-[rgba(242,239,232,0.08)] bg-[#0d0e12] p-6 rounded-lg space-y-5 font-mono text-xs max-w-xl mx-auto shadow-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[#8a8fa0] uppercase tracking-wider mb-2">Your Identity (Name / Alias)</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
            placeholder="Your name..."
            className="w-full bg-[#08090d] border border-[rgba(242,239,232,0.12)] text-[#f2efe8] px-4 py-2.5 rounded focus:outline-none focus:border-[#e7c574]/50 transition-all"
          />
        </div>
        <div>
          <label className="block text-[#8a8fa0] uppercase tracking-wider mb-2">Return Address (Email)</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isPending}
            placeholder="Your email address..."
            className="w-full bg-[#08090d] border border-[rgba(242,239,232,0.12)] text-[#f2efe8] px-4 py-2.5 rounded focus:outline-none focus:border-[#e7c574]/50 transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-[#8a8fa0] uppercase tracking-wider mb-2">Transmission Node (Purpose)</label>
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
        <label className="block text-[#8a8fa0] uppercase tracking-wider mb-2">Subject (Optional)</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={isPending}
          placeholder="Topic of communication..."
          className="w-full bg-[#08090d] border border-[rgba(242,239,232,0.12)] text-[#f2efe8] px-4 py-2.5 rounded focus:outline-none focus:border-[#e7c574]/50 transition-all"
        />
      </div>

      <div>
        <label className="block text-[#8a8fa0] uppercase tracking-wider mb-2">Transmission Body (Message)</label>
        <textarea
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isPending}
          placeholder="Type your message here..."
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
