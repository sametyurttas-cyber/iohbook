"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  updateContactMessageStatusAction,
  updateContactMessageNotesAction,
  getContactMessagesAction
} from "@/features/contact/contact-actions";

type ContactMessage = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  purpose: "press" | "partnership" | "support" | "tech" | "other";
  subject: string | null;
  message: string;
  status: "unread" | "read" | "archived";
  admin_notes: string | null;
  user_id: string | null;
};

const PURPOSE_LABELS: Record<string, string> = {
  press: "Brand & Press",
  partnership: "Alliance & Partners",
  support: "Reader Support",
  tech: "System & Tech",
  other: "Other Channels"
};

const PURPOSE_COLORS: Record<string, string> = {
  press: "text-purple-400 border-purple-500/30 bg-purple-950/20",
  partnership: "text-amber-400 border-[#e7c574]/30 bg-amber-950/20",
  support: "text-green-400 border-green-500/30 bg-green-950/20",
  tech: "text-blue-400 border-blue-500/30 bg-blue-950/20",
  other: "text-gray-400 border-gray-500/30 bg-gray-950/20"
};

export function ContactDashboardClient({
  initialMessages
}: {
  initialMessages: any[];
}) {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages as ContactMessage[]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  
  // Note editing state
  const [adminNotes, setAdminNotes] = useState("");
  
  // Cooldown status and transition
  const [isPending, startTransition] = useTransition();
  const [statusFilter, setStatusFilter] = useState<"all" | "unread" | "read" | "archived">("unread");
  const [purposeFilter, setPurposeFilter] = useState<string>("all");

  const router = useRouter();

  const handleRefresh = async () => {
    try {
      const res = await getContactMessagesAction({});
      if (res.ok && res.data) {
        setMessages(res.data as ContactMessage[]);
      }
    } catch (err) {
      console.error("Refresh failed", err);
    }
  };

  const handleUpdateStatus = (id: string, newStatus: "unread" | "read" | "archived") => {
    startTransition(async () => {
      const res = await updateContactMessageStatusAction(id, newStatus);
      if (res.ok) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === id ? { ...msg, status: newStatus } : msg))
        );
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      }
    });
  };

  const handleSaveNotes = () => {
    if (!selectedMessage) return;
    startTransition(async () => {
      const res = await updateContactMessageNotesAction(selectedMessage.id, adminNotes);
      if (res.ok) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === selectedMessage.id ? { ...msg, admin_notes: adminNotes || null } : msg
          )
        );
        setSelectedMessage((prev) =>
          prev ? { ...prev, admin_notes: adminNotes || null } : null
        );
      }
    });
  };

  const filteredMessages = messages.filter((msg) => {
    const matchesStatus = statusFilter === "all" ? true : msg.status === statusFilter;
    const matchesPurpose = purposeFilter === "all" ? true : msg.purpose === purposeFilter;
    return matchesStatus && matchesPurpose;
  });

  const openMessageDetails = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setAdminNotes(msg.admin_notes || "");
    
    // Automatically mark as read if it is unread
    if (msg.status === "unread") {
      handleUpdateStatus(msg.id, "read");
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 border border-[rgba(242,239,232,0.08)] bg-[#0d0e12] rounded-lg">
        <div className="flex flex-wrap gap-2">
          {/* Status Tabs */}
          {(["unread", "read", "archived", "all"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded border transition-all cursor-pointer ${
                statusFilter === tab
                  ? "bg-[#e7c574] text-[#08090d] border-[#e7c574] font-bold"
                  : "border-[rgba(242,239,232,0.12)] text-[#8a8fa0] hover:text-[#f2efe8] hover:border-[rgba(242,239,232,0.3)]"
              }`}
            >
              {tab === "unread" && `Okunmamış (${messages.filter((m) => m.status === "unread").length})`}
              {tab === "read" && "Okunmuş"}
              {tab === "archived" && "Arşiv"}
              {tab === "all" && `Tümü (${messages.length})`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Classification Select */}
          <select
            value={purposeFilter}
            onChange={(e) => setPurposeFilter(e.target.value)}
            className="bg-[#08090d] border border-[rgba(242,239,232,0.12)] text-[#f2efe8] px-3 py-2 text-xs rounded focus:outline-none focus:border-[#e7c574]/50 transition-all font-mono"
          >
            <option value="all">Tüm Kategoriler</option>
            {Object.entries(PURPOSE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2 rounded border border-[rgba(242,239,232,0.12)] text-[#8a8fa0] hover:text-[#f2efe8] transition-all cursor-pointer hover:bg-[rgba(242,239,232,0.04)]"
            title="Yenile"
          >
            🔄
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="border border-[rgba(242,239,232,0.08)] bg-[#0c0d12] rounded-lg overflow-hidden font-mono text-xs">
        {filteredMessages.length === 0 ? (
          <div className="p-12 text-center text-[#8a8fa0]">
            Kriterlere uygun hiçbir sinyal kaydı bulunmamaktadır.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[rgba(242,239,232,0.08)] bg-[#08090d] text-[#8a8fa0] uppercase tracking-wider text-[10px]">
                  <th className="p-4">Tarih</th>
                  <th className="p-4">Gönderen</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Konu Başlığı</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((msg) => (
                  <tr
                    key={msg.id}
                    className={`border-b border-[rgba(242,239,232,0.04)] hover:bg-[#e7c574]/5 transition-all cursor-pointer ${
                      msg.status === "unread" ? "bg-[#e7c574]/3 font-bold text-[#f2efe8]" : "text-[#9297a6]"
                    }`}
                    onClick={() => openMessageDetails(msg)}
                  >
                    <td className="p-4 whitespace-nowrap">
                      {new Date(msg.created_at).toLocaleString("tr-TR", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className="p-4">
                      <div>{msg.name}</div>
                      <div className="text-[10px] text-gray-500 font-normal">{msg.email}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full border text-[9px] font-bold ${
                          PURPOSE_COLORS[msg.purpose] || PURPOSE_COLORS.other
                        }`}
                      >
                        {PURPOSE_LABELS[msg.purpose] || msg.purpose}
                      </span>
                    </td>
                    <td className="p-4 max-w-xs truncate">
                      {msg.subject || "Konu Yok"}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        {msg.status !== "archived" ? (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(msg.id, "archived")}
                            className="px-2 py-1 rounded border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-[#f2efe8] transition-all cursor-pointer"
                          >
                            Arşivle
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(msg.id, "unread")}
                            className="px-2 py-1 rounded border border-yellow-700/50 hover:border-[#e7c574] text-yellow-500 hover:text-[#e7c574] transition-all cursor-pointer"
                          >
                            Okunmadı Yap
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal Overlay */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl border border-[#e7c574]/20 bg-[#0d0e12] rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-[rgba(242,239,232,0.08)] bg-[#08090d] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-[#8a8fa0] uppercase tracking-widest block mb-1">
                  Sinyal Detayları // {selectedMessage.id.slice(0, 8)}
                </span>
                <h3 className="text-[#e7c574] font-mono font-bold uppercase tracking-wider">
                  {selectedMessage.subject || "KONU BAŞLIĞI BELİRTİLMEDİ"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="text-gray-500 hover:text-white transition-all text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 font-mono text-xs flex-1">
              {/* Metadata Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-[rgba(242,239,232,0.06)] bg-[#08090d] p-4 rounded-lg">
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-500">Gönderen:</span>{" "}
                    <span className="text-[#f2efe8] font-bold">{selectedMessage.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">E-posta:</span>{" "}
                    <span className="text-[#f2efe8]">{selectedMessage.email}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-500">Kategori:</span>{" "}
                    <span
                      className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${
                        PURPOSE_COLORS[selectedMessage.purpose] || PURPOSE_COLORS.other
                      }`}
                    >
                      {PURPOSE_LABELS[selectedMessage.purpose] || selectedMessage.purpose}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tarih:</span>{" "}
                    <span className="text-[#f2efe8]">
                      {new Date(selectedMessage.created_at).toLocaleString("tr-TR")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message Payload */}
              <div>
                <span className="text-gray-500 uppercase tracking-widest block mb-2 text-[10px]">
                  İleti Gövdesi (Payload)
                </span>
                <div className="p-5 border border-[rgba(242,239,232,0.08)] bg-[#050609] rounded-lg text-gray-300 whitespace-pre-wrap leading-relaxed min-h-[140px] font-sans text-sm">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Administrator Notes */}
              <div className="space-y-2">
                <label className="text-gray-500 uppercase tracking-widest block text-[10px]">
                  Yönetici Notları (Staff Only)
                </label>
                <div className="flex gap-2">
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    disabled={isPending}
                    rows={2}
                    placeholder="Talebe dair bir yönetici notu ekleyin..."
                    className="w-full bg-[#08090d] border border-[rgba(242,239,232,0.12)] text-[#f2efe8] px-3 py-2 rounded focus:outline-none focus:border-[#e7c574]/50 transition-all leading-normal"
                  />
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={isPending}
                    className="px-4 py-2 bg-[#e7c574]/15 border border-[#e7c574] text-[#e7c574] font-bold hover:bg-[#e7c574] hover:text-[#08090d] rounded transition-all cursor-pointer flex items-center justify-center whitespace-nowrap self-end"
                  >
                    Notu Kaydet
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-[rgba(242,239,232,0.08)] bg-[#08090d] flex items-center justify-between font-mono text-xs">
              <div className="flex gap-2">
                {selectedMessage.status !== "archived" ? (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedMessage.id, "archived")}
                    className="px-4 py-2 border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-[#f2efe8] rounded transition-all cursor-pointer"
                  >
                    Arşivle
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedMessage.id, "unread")}
                    className="px-4 py-2 border border-yellow-700/50 hover:border-[#e7c574] text-yellow-500 hover:text-[#e7c574] rounded transition-all cursor-pointer"
                  >
                    Okunmadı Yap
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 border border-[rgba(242,239,232,0.12)] text-[#8a8fa0] hover:text-[#f2efe8] rounded transition-all cursor-pointer"
                >
                  Kapat
                </button>
                <Link
                  href={`/admin/emails/send?to=${encodeURIComponent(selectedMessage.email)}&subject=Re: ${encodeURIComponent(selectedMessage.subject || "IOH Signal")}`}
                  className="px-4 py-2 bg-[#e7c574] text-[#08090d] font-bold hover:bg-[#d4b363] rounded transition-all flex items-center gap-1.5"
                >
                  ✉️ Manuel Mail İle Yanıtla
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
