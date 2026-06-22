"use client";

import { useState, useTransition } from "react";
import { searchProfilesAction, sendManualEmailAction } from "@/features/email/admin-actions";

type ProfileResult = {
  id: string;
  email: string;
  full_name: string | null;
};

type TemplateItem = {
  id: string;
  key: string;
  subject: string;
  body_text: string;
  body_html: string;
  preview_text: string | null;
  active: boolean;
};

type SendFormProps = {
  templates: TemplateItem[];
  adminEmail: string;
  adminProfileId: string;
  canSend: boolean;
};

export function SendForm({ templates, adminEmail, adminProfileId, canSend }: SendFormProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProfileResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ProfileResult | null>(null);

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [templateKey, setTemplateKey] = useState("");

  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "success" | "error" | "sending" | "testing">("idle");
  const [message, setMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await searchProfilesAction(val);
      if (res.ok && res.data) {
        setSearchResults(res.data as ProfileResult[]);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const selectUser = (user: ProfileResult) => {
    setSelectedUser(user);
    setTo(user.email);
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleTemplateChange = (key: string) => {
    setTemplateKey(key);
    if (!key) {
      return;
    }
    const found = templates.find((t) => t.key === key);
    if (found) {
      setSubject(found.subject);
      setBody(found.body_text || "");
    }
  };

  const escapeHtmlClient = (str: string): string => {
    return str.replace(/[&<>"']/g, (m) => {
      switch (m) {
        case "&": return "&amp;";
        case "<": return "&lt;";
        case ">": return "&gt;";
        case "\"": return "&quot;";
        case "'": return "&#39;";
        default: return m;
      }
    });
  };

  const renderPreview = () => {
    if (!body) return "";

    let previewHtml = body;
    const replacements: Record<string, string> = {
      userName: selectedUser?.full_name || "Değerli Okurumuz",
      email: to || "alici@example.com",
      orderCode: "IOH-TEST-123",
      bookTitle: "GODCODE",
      downloadUrl: "https://iohbook.local/account/downloads",
      pointsAmount: "30",
      verificationTitle: "Amazon İnceleme Doğrulaması",
      adminReply: "Harika bir inceleme olmuş, teşekkür ederiz!",
      accountUrl: "https://iohbook.local/account",
      pointsReason: "Amazon yorum doğrulaması",
      currentBalance: "45"
    };

    // Replace placeholders
    for (const [k, v] of Object.entries(replacements)) {
      previewHtml = previewHtml.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), v);
    }

    // Escape and turn newlines into <br />
    return escapeHtmlClient(previewHtml).replace(/\n/g, "<br />");
  };

  const handleSendClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setStatus("error");
      setMessage("Lütfen göndermeden önce geçerli bir kullanıcı seçin.");
      return;
    }
    if (!to || !to.includes("@")) {
      setStatus("error");
      setMessage("Geçersiz e-posta adresi.");
      return;
    }
    if (!subject.trim()) {
      setStatus("error");
      setMessage("E-posta konusu boş bırakılamaz.");
      return;
    }
    if (!body.trim()) {
      setStatus("error");
      setMessage("E-posta içeriği boş bırakılamaz.");
      return;
    }
    setStatus("idle");
    setMessage("");
    setShowConfirm(true);
  };

  const handleSendConfirm = () => {
    setShowConfirm(false);
    setStatus("sending");
    setMessage("E-posta gönderiliyor...");

    startTransition(async () => {
      try {
        const res = await sendManualEmailAction({
          profileId: selectedUser!.id,
          to,
          subject,
          body,
          templateKey: templateKey || undefined
        });

        if (res.ok) {
          setStatus("success");
          setMessage("E-posta başarıyla gönderildi ve log tablosuna kaydedildi.");
          // Clear inputs
          setSelectedUser(null);
          setTo("");
          setSubject("");
          setBody("");
          setTemplateKey("");
        } else {
          setStatus("error");
          setMessage(res.error || "E-posta gönderimi sırasında bir hata oluştu.");
        }
      } catch {
        setStatus("error");
        setMessage("E-posta gönderimi başarısız oldu. Sunucu hatası.");
      }
    });
  };

  const handleSendTest = () => {
    if (!subject.trim() || !body.trim()) {
      setStatus("error");
      setMessage("Test gönderebilmek için Konu ve Gövde alanları boş bırakılamaz.");
      return;
    }

    setStatus("testing");
    setMessage("Kendinize test e-postası gönderiliyor...");

    startTransition(async () => {
      try {
        const res = await sendManualEmailAction({
          profileId: adminProfileId,
          to: adminEmail,
          subject: `[TEST] ${subject}`,
          body,
          templateKey: templateKey || undefined
        });

        if (res.ok) {
          setStatus("success");
          setMessage(`Test e-postası başarıyla kendi adresinize (${adminEmail}) gönderildi.`);
        } else {
          setStatus("error");
          setMessage(res.error || "Test e-postası gönderilemedi.");
        }
      } catch {
        setStatus("error");
        setMessage("Test e-postası gönderilemedi. Sunucu hatası.");
      }
    });
  };

  return (
    <div>

      {!canSend && (
        <div className="mb-6 p-4 border border-red-900/50 bg-red-950/20 text-red-400 rounded text-sm font-mono">
          Destek ekibi (support) rolündesiniz. Manuel e-posta hazırlama ekranını inceleyebilirsiniz ancak gönderim ve test işlemleri yapma yetkiniz bulunmamaktadır.
        </div>
      )}

      {status === "success" && (
        <div className="mb-6 p-4 border border-green-950 bg-green-950/20 text-green-400 rounded text-sm font-mono">
          {message}
        </div>
      )}

      {status === "error" && (
        <div className="mb-6 p-4 border border-red-950 bg-red-950/20 text-red-400 rounded text-sm font-mono">
          {message}
        </div>
      )}

      {(status === "sending" || status === "testing") && (
        <div className="mb-6 p-4 border border-amber-950 bg-amber-950/20 text-amber-400 rounded text-sm font-mono animate-pulse">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Form Container */}
        <div className="border border-[rgba(242,239,232,0.08)] bg-[#0d0e12] p-6 rounded-lg space-y-6">
          {/* User Search */}
          <div>
            <label className="block text-xs font-mono text-[#8a8fa0] uppercase tracking-wider mb-2">Alıcı Kullanıcı Ara</label>
            <div className="flex gap-2 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="E-posta veya isim yazın (en az 2 karakter)..."
                disabled={!canSend}
                className="w-full bg-[#08090d] border border-[rgba(242,239,232,0.12)] text-[#f2efe8] px-4 py-2 text-sm rounded focus:outline-none focus:border-[#e7c574]/50 transition-all font-mono"
              />
              {isSearching && (
                <span className="absolute right-3 top-2.5 text-xs text-[#8a8fa0] font-mono">Aranıyor...</span>
              )}
            </div>
            
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-[90%] lg:w-[45%] max-h-60 overflow-y-auto border border-[rgba(242,239,232,0.12)] bg-[#0b0c10] rounded mt-1 shadow-2xl font-mono text-xs">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => selectUser(user)}
                    className="w-full text-left px-4 py-3 hover:bg-[#e7c574]/10 text-[#f2efe8] border-b border-[rgba(242,239,232,0.04)] transition-all"
                  >
                    <div className="font-bold">{user.full_name || "İsimsiz Kullanıcı"}</div>
                    <div className="text-gray-500 text-[10px]">{user.email}</div>
                  </button>
                ))}
              </div>
            )}

            {selectedUser ? (
              <div className="mt-2 flex items-center justify-between p-3 border border-green-900/30 bg-green-950/10 rounded text-xs font-mono">
                <div>
                  <span className="text-[#8a8fa0]">Seçilen Alıcı:</span>{" "}
                  <strong className="text-[#f2efe8]">{selectedUser.full_name || "İsimsiz"}</strong> ({selectedUser.email})
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(null);
                    setTo("");
                  }}
                  className="text-red-400 hover:text-red-300 hover:underline transition-all"
                >
                  Seçimi Kaldır
                </button>
              </div>
            ) : (
              <div className="mt-2 text-xs font-mono text-amber-500/80">
                * Mail göndermek için veritabanından bir kullanıcı bulup seçmelisiniz.
              </div>
            )}
          </div>

          {/* Template Select */}
          <div>
            <label className="block text-xs font-mono text-[#8a8fa0] uppercase tracking-wider mb-2">Şablon Seç (Hazır İçerik Yükle)</label>
            <select
              value={templateKey}
              onChange={(e) => handleTemplateChange(e.target.value)}
              disabled={!canSend}
              className="w-full bg-[#08090d] border border-[rgba(242,239,232,0.12)] text-[#f2efe8] px-4 py-2.5 text-sm rounded focus:outline-none focus:border-[#e7c574]/50 transition-all font-mono"
            >
              <option value="">-- Özel Mail (Şablon Yok) --</option>
              {templates.map((tmpl) => (
                <option key={tmpl.key} value={tmpl.key}>
                  {tmpl.key} - {tmpl.subject}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-mono text-[#8a8fa0] uppercase tracking-wider mb-2">E-posta Konusu (Subject)</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Konu başlığını girin..."
              disabled={!canSend}
              className="w-full bg-[#08090d] border border-[rgba(242,239,232,0.12)] text-[#f2efe8] px-4 py-2.5 text-sm rounded focus:outline-none focus:border-[#e7c574]/50 transition-all font-mono"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-mono text-[#8a8fa0] uppercase tracking-wider mb-2">E-posta Gövdesi (Body)</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="İçeriğinizi yazın. Dinamik alanları değiştirmek için {{userName}}, {{pointsAmount}} vb. kullanabilirsiniz..."
              disabled={!canSend}
              rows={12}
              className="w-full bg-[#08090d] border border-[rgba(242,239,232,0.12)] text-[#f2efe8] px-4 py-3 text-sm rounded focus:outline-none focus:border-[#e7c574]/50 transition-all font-mono"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-[rgba(242,239,232,0.08)]">
            <button
              type="button"
              onClick={handleSendTest}
              disabled={!canSend || isPending}
              className="w-1/2 px-4 py-3 rounded text-xs font-mono border border-[#e7c574]/30 text-[#e7c574] hover:bg-[#e7c574]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Kendime Test Gönder
            </button>
            <button
              type="button"
              onClick={handleSendClick}
              disabled={!canSend || isPending}
              className="w-1/2 px-4 py-3 rounded text-xs font-mono bg-[#e7c574] text-[#08090d] font-bold hover:bg-[#d4b363] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              E-posta Gönder
            </button>
          </div>
        </div>

        {/* Preview Container */}
        <div className="border border-[rgba(242,239,232,0.08)] bg-[#08090d] p-6 rounded-lg space-y-4">
          <div className="flex items-center justify-between border-b border-[rgba(242,239,232,0.08)] pb-3">
            <span className="text-xs font-mono text-[#e7c574] uppercase tracking-wider">Canlı Önizleme (Live Preview)</span>
            <span className="text-[10px] font-mono text-[#8a8fa0]">Alıcı gözünden e-posta görünümü</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex border-b border-[rgba(242,239,232,0.04)] pb-2">
              <span className="text-[#8a8fa0] w-16">Gönderen:</span>
              <span className="text-[#f2efe8]">info@iohbook.com (IOH Evreni)</span>
            </div>
            <div className="flex border-b border-[rgba(242,239,232,0.04)] pb-2">
              <span className="text-[#8a8fa0] w-16">Alıcı:</span>
              <span className="text-[#f2efe8]">{to || "alici@example.com"}</span>
            </div>
            <div className="flex border-b border-[rgba(242,239,232,0.04)] pb-2">
              <span className="text-[#8a8fa0] w-16">Konu:</span>
              <span className="text-[#f2efe8]">{subject || "E-posta Konusu"}</span>
            </div>
          </div>

          {/* Rendered Email Content Frame */}
          <div className="mt-6 border border-[rgba(242,239,232,0.04)] bg-[#0c0d12] rounded-lg p-6 min-h-[350px]">
            {body ? (
              <div
                className="text-sm text-[#d8d0c8] font-sans leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderPreview() }}
              />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[300px] text-xs font-mono text-[#8a8fa0]">
                Gösterilecek içerik bulunmamaktadır. Gövde alanını doldurun.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg border border-[#e7c574]/30 bg-[#0d0e12] p-6 rounded-lg shadow-2xl relative">
            <h3 className="text-lg font-mono text-[#e7c574] mb-4">Manuel Gönderim Onayı</h3>
            <p className="text-xs text-[#8a8fa0] mb-4">
              Aşağıdaki kayıtlı kullanıcıya manuel olarak e-posta gönderilecektir. Lütfen bilgileri kontrol edin:
            </p>
            <div className="border border-[rgba(242,239,232,0.08)] bg-[#08090d] p-4 rounded mb-6 text-xs font-mono space-y-3">
              <div>
                <span className="text-[#8a8fa0]">Alıcı Adı:</span>{" "}
                <span className="text-[#f2efe8]">{selectedUser?.full_name || "Belirtilmemiş"}</span>
              </div>
              <div>
                <span className="text-[#8a8fa0]">E-posta Adresi:</span>{" "}
                <span className="text-[#f2efe8]">{to}</span>
              </div>
              <div>
                <span className="text-[#8a8fa0]">Konu Başlığı:</span>{" "}
                <span className="text-[#f2efe8]">{subject}</span>
              </div>
              <div>
                <span className="text-[#8a8fa0]">İçerik Uzunluğu:</span>{" "}
                <span className="text-[#f2efe8]">{body.length} karakter</span>
              </div>
            </div>
            <div className="flex justify-end gap-3 font-mono text-xs">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded border border-[rgba(242,239,232,0.12)] text-[#8a8fa0] hover:text-[#f2efe8] hover:border-[rgba(242,239,232,0.3)] transition-all"
              >
                İptal Et
              </button>
              <button
                type="button"
                onClick={handleSendConfirm}
                className="px-4 py-2 rounded bg-[#e7c574] text-[#08090d] font-bold hover:bg-[#d4b363] transition-all"
              >
                Onayla ve Gönder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
