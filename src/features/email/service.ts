import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { getEmailProvider } from "@/features/email/providers";
import type { EmailSendResult } from "@/features/email/providers/types";

// HTML escaping helper to prevent HTML injection/XSS
export function escapeHtml(str: string): string {
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
}

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
};

// Hardcoded fallback templates for absolute resilience
export const FALLBACK_TEMPLATES: Record<
  string,
  { subject: string; bodyHtml: string; bodyText: string; previewText?: string }
> = {
  welcome: {
    subject: "IOH Evrenine Hoş Geldiniz!",
    bodyHtml: "<p>Merhaba {{userName}},</p><p>IOH evrenine katıldığınız için teşekkür ederiz. Hesabınız başarıyla oluşturuldu.</p><p>Giriş adresi: {{email}}</p><p><a href=\"{{accountUrl}}\" style=\"display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;\">Hesabımı Görüntüle</a></p>",
    bodyText: "Merhaba {{userName}},\n\nIOH evrenine katıldığınız için teşekkür ederiz. Hesabınız başarıyla oluşturuldu.\n\nE-posta: {{email}}\n\nHesabınız: {{accountUrl}}",
    previewText: "Kozmik teknoloji ve kitap evrenine ilk adımınızı attınız."
  },
  order_received: {
    subject: "Siparişiniz Alındı: {{orderCode}}",
    bodyHtml: "<p>Merhaba {{userName}},</p><p><strong>{{orderCode}}</strong> numaralı sipariş talebiniz başarıyla alındı ve ödeme onayı bekleniyor.</p><p>Sipariş detaylarınızı aşağıdaki bağlantıdan takip edebilirsiniz:</p><p><a href=\"{{accountUrl}}\" style=\"display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;\">Siparişi Takip Et</a></p>",
    bodyText: "Merhaba {{userName}},\n\n{{orderCode}} numaralı sipariş talebiniz başarıyla alındı ve ödeme onayı bekleniyor.\n\nSipariş detayı: {{accountUrl}}",
    previewText: "Siparişiniz oluşturuldu, ödeme onayı bekleniyor."
  },
  order_paid: {
    subject: "Siparişiniz Onaylandı: {{orderCode}}",
    bodyHtml: "<p>Merhaba {{userName}},</p><p><strong>{{orderCode}}</strong> numaralı siparişinizin ödemesi başarıyla doğrulandı.</p><p>Sipariş detaylarını ve durumunu görmek için aşağıdaki bağlantıyı kullanabilirsiniz:</p><p><a href=\"{{accountUrl}}\" style=\"display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;\">Siparişi Görüntüle</a></p>",
    bodyText: "Merhaba {{userName}},\n\n{{orderCode}} numaralı siparişinizin ödemesi başarıyla doğrulandı.\n\nSiparişi görüntüle: {{accountUrl}}",
    previewText: "Ödemeniz başarıyla doğrulandı, siparişiniz hazırlanıyor."
  },
  payment_failed: {
    subject: "Ödeme Denemeniz Başarısız Oldu: {{orderCode}}",
    bodyHtml: "<p>Merhaba {{userName}},</p><p><strong>{{orderCode}}</strong> numaralı siparişiniz için yapılan ödeme işlemi başarısız oldu.</p><p>Kart bilgilerinizin doğruluğunu kontrol edip tekrar deneyebilir veya farklı bir kart kullanabilirsiniz.</p><p><a href=\"{{checkoutUrl}}\" style=\"display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;\">Ödemeyi Tekrar Dene</a></p>",
    bodyText: "Merhaba {{userName}},\n\n{{orderCode}} numaralı siparişiniz için yapılan ödeme işlemi başarısız oldu. Lütfen tekrar deneyin.\n\nÖdeme sayfası: {{checkoutUrl}}",
    previewText: "Siparişinizin ödemesi gerçekleştirilemedi."
  },
  order_cancelled: {
    subject: "Siparişiniz İptal Edildi: {{orderCode}}",
    bodyHtml: "<p>Merhaba {{userName}},</p><p><strong>{{orderCode}}</strong> numaralı siparişiniz iptal edilmiştir.</p><p>Ödeme yapıldıysa iadeniz bankanıza iletilecektir.</p><p><a href=\"{{accountUrl}}\" style=\"display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;\">Sipariş Detayları</a></p>",
    bodyText: "Merhaba {{userName}},\n\n{{orderCode}} numaralı siparişiniz iptal edilmiştir. Detaylar için hesabınızı ziyaret edebilirsiniz:\n\nHesabınız: {{accountUrl}}",
    previewText: "Siparişinizin iptal işlemi tamamlandı."
  },
  order_refunded: {
    subject: "İade İşleminiz Tamamlandı: {{orderCode}}",
    bodyHtml: "<p>Merhaba {{userName}},</p><p><strong>{{orderCode}}</strong> numaralı siparişinizin iade işlemi tamamlanmış ve ücret iadesi kartınıza yansıtılmak üzere bankanıza iletilmiştir.</p><p>İade tutarının kartınıza yansıması bankanıza bağlı olarak birkaç iş günü sürebilir.</p><p><a href=\"{{accountUrl}}\" style=\"display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;\">Sipariş Detayları</a></p>",
    bodyText: "Merhaba {{userName}},\n\n{{orderCode}} numaralı siparişinizin iade işlemi tamamlanmış ve ücret iadesi bankanıza iletilmiştir.\n\nHesabınız: {{accountUrl}}",
    previewText: "İade işleminiz başarıyla tamamlandı."
  },
  order_shipped: {
    subject: "Siparişiniz Kargoya Verildi: {{orderCode}}",
    bodyHtml: "<p>Merhaba {{userName}},</p><p><strong>{{orderCode}}</strong> numaralı siparişiniz kargoya verilmiştir.</p><p>Kargo Takip Kodu: <strong>{{trackingNumber}}</strong></p><p><a href=\"{{trackingUrl}}\" style=\"display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;\">Kargomu Takip Et</a></p>",
    bodyText: "Merhaba {{userName}},\n\n{{orderCode}} numaralı siparişiniz kargoya verilmiştir.\n\nKargo Takip Kodu: {{trackingNumber}}\nTakip Linki: {{trackingUrl}}",
    previewText: "Siparişiniz kargoya verildi, kargo takibini başlatabilirsiniz."
  },
  digital_delivery_ready: {
    subject: "Dijital Kitabınız Hazır: {{bookTitle}}",
    bodyHtml: "<p>Merhaba {{userName}},</p><p>Satın aldığınız <strong>{{bookTitle}}</strong> kitabı indirmeye hazır!</p><p>PDF/EPUB dosyalarınız mail eki olarak gönderilmez ve kalıcı halka açık link oluşturulmaz. Güvenli bir şekilde indirmek için lütfen hesabınıza giriş yapın:</p><p><a href=\"{{downloadUrl}}\" style=\"display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;\">Kitaplarımı İndir</a></p>",
    bodyText: "Merhaba {{userName}},\n\nSatın aldığınız {{bookTitle}} kitabı indirmeye hazır!\n\nGiriş yapıp indirmek için: {{downloadUrl}}",
    previewText: "Satın aldığınız dijital kitap formatları hesabınızda erişime açıldı."
  },
  amazon_verification_received: {
    subject: "Amazon Doğrulama Başvurunuz Alındı",
    bodyHtml: "<p>Merhaba {{userName}},</p><p><strong>{{verificationTitle}}</strong> için gönderdiğiniz Amazon doğrulama başvurunuz başarıyla alındı.</p><p>Başvurunuz operasyon ekibimiz tarafından en geç 24 saat içinde incelenecektir.</p>",
    bodyText: "Merhaba {{userName}},\n\n{{verificationTitle}} için gönderdiğiniz Amazon doğrulama başvurunuz başarıyla alındı. Başvurunuz en geç 24 saat içinde incelenecektir.",
    previewText: "Amazon incelemeniz veya satın alma kaydınız kontrol sırasına alındı."
  },
  amazon_verification_approved: {
    subject: "Amazon Başvurunuz Onaylandı! (+{{pointsAmount}} IOH Puan)",
    bodyHtml: "<p>Merhaba {{userName}},</p><p><strong>{{verificationTitle}}</strong> için gönderdiğiniz doğrulama başvurusu onaylandı!</p><p>Hesabınıza <strong>{{pointsAmount}} IOH Puan</strong> yüklendi.</p><p>Mevcut puan bakiyenizi görmek ve ödülleri incelemek için:</p><p><a href=\"{{accountUrl}}\" style=\"display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;\">Ödüllerimi Gör</a></p>",
    bodyText: "Merhaba {{userName}},\n\n{{verificationTitle}} için gönderdiğiniz doğrulama başvurusu onaylandı! Hesabınıza {{pointsAmount}} IOH Puan yüklendi.\n\nÖdüllerini gör: {{accountUrl}}",
    previewText: "Tebrikler, Amazon doğrulama talebiniz onaylandı ve puanlarınız yüklendi."
  },
  amazon_verification_rejected: {
    subject: "Amazon Başvurunuz Reddedildi",
    bodyHtml: "<p>Merhaba {{userName}},</p><p><strong>{{verificationTitle}}</strong> için gönderdiğiniz doğrulama başvurusu maalesef kriterleri karşılamadığı için onaylanamadı.</p><p>Ret Sebebi: <strong>{{adminReply}}</strong></p><p>Detayları incelemek ve yeni bir başvuru yapmak için hesabınızı ziyaret edebilirsiniz:</p><p><a href=\"{{accountUrl}}\" style=\"display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;\">Başvuru Detayını Gör</a></p>",
    bodyText: "Merhaba {{userName}},\n\n{{verificationTitle}} için gönderdiğiniz doğrulama başvurusu maalesef kriterleri karşılamadığı için onaylanamadı.\n\nRet Sebebi: {{adminReply}}\n\nBaşvuru detayını gör: {{accountUrl}}",
    previewText: "Amazon doğrulama talebiniz maalesef onaylanamadı. Detayları inceleyin."
  },
  amazon_admin_reply: {
    subject: "Amazon Başvurunuza Yeni Mesaj: {{verificationTitle}}",
    bodyHtml: "<p>Merhaba {{userName}},</p><p><strong>{{verificationTitle}}</strong> başvurunuz hakkında bir yönetici mesaj bıraktı:</p><blockquote style=\"border-left:4px solid #c9a75d;padding-left:12px;margin:18px 0;color:#d8d0c8;\">{{adminReply}}</blockquote><p>Yanıt vermek veya durumu incelemek için tıklayın:</p><p><a href=\"{{accountUrl}}\" style=\"display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;\">Başvuruyu İncele</a></p>",
    bodyText: "Merhaba {{userName}},\n\n{{verificationTitle}} başvurunuz hakkında bir yönetici mesaj bıraktı:\n\n\"{{adminReply}}\"\n\nBaşvuruyu incele: {{accountUrl}}",
    previewText: "Yöneticimiz başvurunuza bir mesaj bıraktı."
  },
  points_awarded: {
    subject: "Hesabınıza IOH Puan Yüklendi! (+{{pointsAmount}} Puan)",
    bodyHtml: "<p>Merhaba {{userName}},</p><p><strong>{{pointsAmount}} IOH Puan</strong> hesabınıza işlendi.</p><p><strong>Sebep:</strong> {{pointsReason}}</p><p><strong>Güncel Bakiyeniz:</strong> {{currentBalance}} IOH Puan</p><p><a href=\"{{accountUrl}}\" style=\"display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;\">Hesabımı Görüntüle</a></p>",
    bodyText: "Merhaba {{userName}},\n\n{{pointsAmount}} IOH Puan hesabınıza işlendi.\n\nSebep: {{pointsReason}}\nGüncel Bakiyeniz: {{currentBalance}} IOH Puan\n\nHesabımı görüntüle: {{accountUrl}}",
    previewText: "Hesabınıza yeni IOH Puan eklendi."
  },
  manual_email: {
    subject: "{{subject}}",
    bodyHtml: "<div style=\"font-family:sans-serif;font-size:16px;line-height:1.6;color:#d8d0c8;\">{{body}}</div>",
    bodyText: "{{body}}",
    previewText: "{{subject}}"
  },
  campaign_email: {
    subject: "{{subject}}",
    bodyHtml: "<div style=\"font-family:sans-serif;font-size:16px;line-height:1.6;color:#d8d0c8;\">{{body}}<hr style=\"border:none;border-top:1px solid #333;margin:20px 0;\" /><p style=\"font-size:12px;color:#888;text-align:center;\">Bu e-postayı pazarlama iletişim onayınız olduğu için alıyorsunuz.<br />İletişim tercihlerinizi değiştirmek veya üyelikten ayrılmak için lütfen <a href=\"{{unsubscribeUrl}}\" style=\"color:#e7c574;text-decoration:underline;\">profilinizi ziyaret edin</a>.</p></div>",
    bodyText: "{{body}}\n\n---\nBu e-postayı pazarlama iletişim onayınız olduğu için alıyorsunuz.\nÜyelikten ayrılmak için: {{unsubscribeUrl}}",
    previewText: "{{subject}}"
  }
};

export function renderEmailTemplate(
  templateKey: string,
  variables: Record<string, unknown>,
  dbTemplate?: { subject: string; body_html: string; body_text: string; preview_text?: string | null } | null
): RenderedEmail {
  const fallback = FALLBACK_TEMPLATES[templateKey] || {
    subject: "IOH Bildirimi",
    bodyHtml: "<p>Yeni bir bildirim aldınız.</p>",
    bodyText: "Yeni bir bildirim aldınız.",
    previewText: ""
  };

  const subjectTemplate = dbTemplate?.subject ?? fallback.subject;
  const htmlTemplate = dbTemplate?.body_html ?? fallback.bodyHtml;
  const textTemplate = dbTemplate?.body_text ?? fallback.bodyText;
  const previewTemplate = dbTemplate?.preview_text ?? fallback.previewText ?? "";

  // Dynamic variable replacement helper
  const replacePlaceholder = (tmpl: string, key: string, val: string) => {
    return tmpl.replace(new RegExp(`{{\\s*${key}\\s*}}`, "g"), val);
  };

  const safeVariables: Record<string, string> = {};
  const rawVariables: Record<string, string> = {};

  const expectedKeys = [
    "userName", "email", "orderCode", "bookTitle", "downloadUrl",
    "pointsAmount", "verificationTitle", "adminReply", "accountUrl",
    "checkoutUrl", "trackingNumber", "trackingUrl", "pointsReason",
    "currentBalance", "body", "subject", "unsubscribeUrl"
  ];

  // Populate expected keys with fallbacks if missing
  for (const key of expectedKeys) {
    const val = variables[key] !== undefined && variables[key] !== null ? String(variables[key]) : "";
    if (key === "body") {
      safeVariables[key] = escapeHtml(val).replace(/\n/g, "<br />");
    } else {
      safeVariables[key] = escapeHtml(val);
    }
    rawVariables[key] = val;
  }

  // Populate extra variables if provided
  for (const [key, val] of Object.entries(variables)) {
    const strVal = val !== undefined && val !== null ? String(val) : "";
    if (safeVariables[key] === undefined) {
      if (key === "body") {
        safeVariables[key] = escapeHtml(strVal).replace(/\n/g, "<br />");
      } else {
        safeVariables[key] = escapeHtml(strVal);
      }
      rawVariables[key] = strVal;
    }
  }

  // 1. Process Subject
  let subject = subjectTemplate;
  for (const [key, val] of Object.entries(rawVariables)) {
    subject = replacePlaceholder(subject, key, val);
  }

  // 2. Process HTML Body
  let htmlBody = htmlTemplate;
  for (const [key, val] of Object.entries(safeVariables)) {
    htmlBody = replacePlaceholder(htmlBody, key, val);
  }

  // 3. Process Text Body
  let textBody = textTemplate;
  for (const [key, val] of Object.entries(rawVariables)) {
    textBody = replacePlaceholder(textBody, key, val);
  }

  // 4. Process Preview Text
  let previewText = previewTemplate;
  for (const [key, val] of Object.entries(rawVariables)) {
    previewText = replacePlaceholder(previewText, key, val);
  }

  // Wrap HTML body with the premium cosmic shell
  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#0d0d0f;color:#f6f0e8;font-family:Arial,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;">${previewText || subject}</div>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0f;padding:32px 16px;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;border:1px solid #2a2826;background:#151417;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 18px;border-bottom:1px solid #2a2826;">
                <div style="font-size:12px;letter-spacing:0.22em;text-transform:uppercase;color:#c9a75d;">IOH Book</div>
                <h1 style="margin:12px 0 0;font-size:28px;line-height:1.2;color:#f6f0e8;">${subject}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;color:#d8d0c8;font-size:15px;line-height:1.65;">
                ${htmlBody}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px;border-top:1px solid #2a2826;color:#8f8780;font-size:12px;line-height:1.6;">
                Bu e-posta IOH Book islemiyle ilgili otomatik bir bildirimdir. Kart bilgileriniz sitede saklanmaz.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return {
    subject,
    html,
    text: textBody
  };
}

export async function logEmailEvent(input: {
  templateKey: string;
  to: string;
  subject: string;
  profileId?: string | null;
  orderId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from("email_events")
      .insert({
        event_type: input.templateKey,
        template_key: input.templateKey,
        recipient: input.to,
        subject: input.subject,
        status: "pending",
        profile_id: input.profileId ?? null,
        order_id: input.orderId ?? null,
        payload: input.metadata ?? {},
        provider: "resend"
      })
      .select("id")
      .single();

    if (error) {
      console.error("Failed to log email event", error);
      return null;
    }
    return data.id;
  } catch (err) {
    console.error("Failed to log email event", err);
    return null;
  }
}

export async function markEmailSent(id: string, providerMessageId: string | null) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    await supabase
      .from("email_events")
      .update({
        status: "sent",
        provider_message_id: providerMessageId,
        sent_at: new Date().toISOString()
      })
      .eq("id", id);
  } catch (err) {
    console.error("Failed to mark email as sent in db", err);
  }
}

export async function markEmailFailed(id: string, errorMessage: string) {
  try {
    const supabase = createSupabaseServiceRoleClient();
    await supabase
      .from("email_events")
      .update({
        status: "failed",
        error_message: errorMessage
      })
      .eq("id", id);
  } catch (err) {
    console.error("Failed to mark email as failed in db", err);
  }
}

export async function sendTransactionalEmail(input: {
  templateKey: string;
  to: string;
  profileId?: string | null;
  orderId?: string | null;
  variables: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}): Promise<EmailSendResult> {
  let eventId: string | null = null;
  let subject = "IOH Bildirimi";
  let html = "";
  let text = "";

  try {
    // Idempotency check: prevent duplicate emails for the same order and template
    if (input.orderId) {
      try {
        const supabase = createSupabaseServiceRoleClient();
        const { data: existingEvent, error: checkError } = await supabase
          .from("email_events")
          .select("id")
          .eq("template_key", input.templateKey)
          .eq("order_id", input.orderId)
          .in("status", ["sent", "pending", "queued"])
          .maybeSingle();

        if (!checkError && existingEvent) {
          console.log(`Idempotency duplicate blocked: template=${input.templateKey}, order=${input.orderId}`);
          
          // Log skipped event
          const skipId = await logEmailEvent({
            templateKey: input.templateKey,
            to: input.to,
            subject: `[SKIPPED] ${FALLBACK_TEMPLATES[input.templateKey]?.subject ?? "IOH Bildirimi"}`,
            profileId: input.profileId,
            orderId: input.orderId,
            metadata: { ...input.metadata, skipped_reason: "idempotency_duplicate" }
          });
          if (skipId) {
            await supabase
              .from("email_events")
              .update({ status: "skipped" })
              .eq("id", skipId);
          }

          return {
            ok: false,
            error: "Duplicate email blocked by idempotency",
            provider: "resend",
            skipped: true
          };
        }
      } catch (checkErr) {
        console.warn("Idempotency duplicate check failed", checkErr);
      }
    }
    // 1. Fetch active template from DB
    let dbTemplate = null;
    try {
      const supabase = createSupabaseServiceRoleClient();
      const { data, error } = await supabase
        .from("email_templates")
        .select("subject, body_html, body_text, preview_text")
        .eq("key", input.templateKey)
        .eq("active", true)
        .maybeSingle();

      if (!error && data) {
        dbTemplate = data;
      } else if (error) {
        console.warn("Could not load email template from database, using fallback", error);
      }
    } catch (dbErr) {
      console.warn("Database lookup failed for email template, using fallback", dbErr);
    }

    // 2. Render Template
    const rendered = renderEmailTemplate(input.templateKey, input.variables, dbTemplate);
    subject = rendered.subject;
    html = rendered.html;
    text = rendered.text;

    // 3. Log event as pending
    eventId = await logEmailEvent({
      templateKey: input.templateKey,
      to: input.to,
      subject,
      profileId: input.profileId,
      orderId: input.orderId,
      metadata: {
        ...input.metadata,
        _variables: input.variables
      }
    });

    // 4. Send email via Resend
    const provider = getEmailProvider();
    const result = await provider.send({
      to: input.to,
      subject,
      html,
      text
    });

    // 5. Update DB event status
    if (eventId) {
      if (result.ok) {
        await markEmailSent(eventId, result.messageId);
      } else {
        await markEmailFailed(eventId, result.error);
      }
    }

    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("sendTransactionalEmail failed", error);

    if (eventId) {
      try {
        await markEmailFailed(eventId, errorMsg);
      } catch (logErr) {
        console.error("Failed to mark email event as failed", logErr);
      }
    }

    // Capture observability error without throwing (Side-effect isolation)
    try {
      const { captureError } = await import("@/lib/observability");
      captureError(error, {
        operation: "email.send_transactional",
        template_key: input.templateKey,
        recipient: input.to
      });
    } catch (obsErr) {
      console.error("Observability logger failed", obsErr);
    }

    return {
      ok: false,
      provider: "resend",
      error: errorMsg
    };
  }
}

export async function sendTestEmail(to: string, templateKey: string) {
  return sendTransactionalEmail({
    templateKey,
    to,
    variables: {
      userName: "Test User",
      email: to,
      orderCode: "IOH-TEST-123",
      bookTitle: "GODCODE",
      downloadUrl: "https://iohbook.local/account/downloads",
      pointsAmount: 30,
      verificationTitle: "Amazon Review Verification",
      adminReply: "Harika bir inceleme olmuş, teşekkür ederiz!",
      accountUrl: "https://iohbook.local/account",
      pointsReason: "Amazon yorum doğrulaması",
      currentBalance: 45
    }
  });
}
