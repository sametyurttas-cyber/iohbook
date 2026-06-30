import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { getEmailProvider } from "@/features/email/providers";
import type { EmailSendResult } from "@/features/email/providers/types";
import { renderIohEmailShell } from "@/features/email/email-shell";

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

const ENGLISH_FALLBACK_TEMPLATES: Record<
  string,
  { subject: string; bodyHtml: string; bodyText: string; previewText?: string }
> = {
  welcome: {
    subject: "Welcome to the IOH Universe",
    bodyHtml: "<p>Hello {{userName}},</p><p>Thank you for joining the IOH universe. Your account has been created successfully.</p><p>Sign-in email: {{email}}</p><p><a href=\"{{accountUrl}}\" style=\"display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;\">View My Account</a></p>",
    bodyText: "Hello {{userName}},\n\nThank you for joining the IOH universe. Your account has been created successfully.\n\nEmail: {{email}}\n\nYour account: {{accountUrl}}",
    previewText: "Your first step into the IOH book universe is complete."
  },
  order_received: {
    subject: "Order Received: {{orderCode}}",
    bodyHtml: "<p>Hello {{userName}},</p><p>Your order request <strong>{{orderCode}}</strong> has been received and is waiting for payment confirmation.</p><p>You can follow your order details from the link below:</p><p><a href=\"{{accountUrl}}\" style=\"display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;\">Track Order</a></p>",
    bodyText: "Hello {{userName}},\n\nYour order request {{orderCode}} has been received and is waiting for payment confirmation.\n\nOrder details: {{accountUrl}}",
    previewText: "Your order has been created and is waiting for payment confirmation."
  },
  order_paid: {
    subject: "Your Order Is Confirmed: {{orderCode}}",
    bodyHtml: "<p>Hello {{userName}},</p><p>The payment for your order <strong>{{orderCode}}</strong> has been successfully verified.</p><p>You can view your order details and status from the link below:</p><p><a href=\"{{accountUrl}}\" style=\"display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;\">View Order</a></p>",
    bodyText: "Hello {{userName}},\n\nThe payment for your order {{orderCode}} has been successfully verified.\n\nView order: {{accountUrl}}",
    previewText: "Your payment has been verified successfully."
  },
  payment_failed: {
    subject: "Payment Attempt Failed: {{orderCode}}",
    bodyHtml: "<p>Hello {{userName}},</p><p>The payment attempt for your order <strong>{{orderCode}}</strong> was not completed.</p><p>Please check your payment details and try again.</p><p><a href=\"{{checkoutUrl}}\" style=\"display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;\">Try Payment Again</a></p>",
    bodyText: "Hello {{userName}},\n\nThe payment attempt for your order {{orderCode}} was not completed. Please try again.\n\nCheckout: {{checkoutUrl}}",
    previewText: "Your payment could not be completed."
  },
  order_cancelled: {
    subject: "Your Order Has Been Cancelled: {{orderCode}}",
    bodyHtml: "<p>Hello {{userName}},</p><p>Your order <strong>{{orderCode}}</strong> has been cancelled.</p><p>If payment was collected, the refund process will be handled through the payment provider.</p><p><a href=\"{{accountUrl}}\" style=\"display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;\">Order Details</a></p>",
    bodyText: "Hello {{userName}},\n\nYour order {{orderCode}} has been cancelled. You can review the details in your account:\n\nYour account: {{accountUrl}}",
    previewText: "Your order cancellation has been completed."
  },
  order_refunded: {
    subject: "Your Refund Is Complete: {{orderCode}}",
    bodyHtml: "<p>Hello {{userName}},</p><p>The refund for your order <strong>{{orderCode}}</strong> has been completed and sent to the payment provider.</p><p>The refunded amount may take a few business days to appear, depending on your bank or card provider.</p><p><a href=\"{{accountUrl}}\" style=\"display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;\">Order Details</a></p>",
    bodyText: "Hello {{userName}},\n\nThe refund for your order {{orderCode}} has been completed and sent to the payment provider.\n\nYour account: {{accountUrl}}",
    previewText: "Your refund has been completed."
  },
  order_shipped: {
    subject: "Your Order Has Shipped: {{orderCode}}",
    bodyHtml: "<p>Hello {{userName}},</p><p>Your order <strong>{{orderCode}}</strong> has been shipped.</p><p>Tracking number: <strong>{{trackingNumber}}</strong></p><p><a href=\"{{trackingUrl}}\" style=\"display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;\">Track Shipment</a></p>",
    bodyText: "Hello {{userName}},\n\nYour order {{orderCode}} has been shipped.\n\nTracking number: {{trackingNumber}}\nTracking link: {{trackingUrl}}",
    previewText: "Your order has been shipped."
  },
  digital_delivery_ready: {
    subject: "Your Digital Book Is Ready: {{bookTitle}}",
    bodyHtml: "<p>Hello {{userName}},</p><p>Your purchased book <strong>{{bookTitle}}</strong> is ready to download.</p><p>Your PDF/EPUB files are not sent as email attachments and are never exposed through permanent public links. Please sign in to your account to download securely:</p><p><a href=\"{{downloadUrl}}\" style=\"display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;\">Open Downloads</a></p>",
    bodyText: "Hello {{userName}},\n\nYour purchased book {{bookTitle}} is ready to download.\n\nSign in and download securely: {{downloadUrl}}",
    previewText: "Your digital book formats are available in your account."
  },
  amazon_verification_received: {
    subject: "Your Amazon Verification Was Received",
    bodyHtml: "<p>Hello {{userName}},</p><p>Your Amazon verification submission for <strong>{{verificationTitle}}</strong> has been received successfully.</p><p>Our operations team will review it as soon as possible.</p>",
    bodyText: "Hello {{userName}},\n\nYour Amazon verification submission for {{verificationTitle}} has been received successfully. Our operations team will review it as soon as possible.",
    previewText: "Your Amazon purchase or review verification is now in review."
  },
  amazon_verification_approved: {
    subject: "Your Amazon Submission Was Approved (+{{pointsAmount}} IOH Points)",
    bodyHtml: "<p>Hello {{userName}},</p><p>Your verification submission for <strong>{{verificationTitle}}</strong> has been approved.</p><p><strong>{{pointsAmount}} IOH Points</strong> have been added to your account.</p><p>You can view your current balance and rewards here:</p><p><a href=\"{{accountUrl}}\" style=\"display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;\">View Rewards</a></p>",
    bodyText: "Hello {{userName}},\n\nYour verification submission for {{verificationTitle}} has been approved. {{pointsAmount}} IOH Points have been added to your account.\n\nView rewards: {{accountUrl}}",
    previewText: "Your Amazon verification was approved and your IOH Points were added."
  },
  amazon_verification_rejected: {
    subject: "Your Amazon Submission Was Rejected",
    bodyHtml: "<p>Hello {{userName}},</p><p>Your verification submission for <strong>{{verificationTitle}}</strong> could not be approved.</p><p>Reason: <strong>{{adminReply}}</strong></p><p>You can review the details and submit again from your account:</p><p><a href=\"{{accountUrl}}\" style=\"display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;\">View Submission</a></p>",
    bodyText: "Hello {{userName}},\n\nYour verification submission for {{verificationTitle}} could not be approved.\n\nReason: {{adminReply}}\n\nView submission: {{accountUrl}}",
    previewText: "Your Amazon verification could not be approved."
  },
  amazon_admin_reply: {
    subject: "New Message About Your Amazon Submission: {{verificationTitle}}",
    bodyHtml: "<p>Hello {{userName}},</p><p>An administrator left a message about your <strong>{{verificationTitle}}</strong> submission:</p><blockquote style=\"border-left:4px solid #c9a75d;padding-left:12px;margin:18px 0;color:#d8d0c8;\">{{adminReply}}</blockquote><p>You can reply or review the status here:</p><p><a href=\"{{accountUrl}}\" style=\"display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;\">Review Submission</a></p>",
    bodyText: "Hello {{userName}},\n\nAn administrator left a message about your {{verificationTitle}} submission:\n\n\"{{adminReply}}\"\n\nReview submission: {{accountUrl}}",
    previewText: "An administrator left a message on your submission."
  },
  points_awarded: {
    subject: "IOH Points Added to Your Account (+{{pointsAmount}} Points)",
    bodyHtml: "<p>Hello {{userName}},</p><p><strong>{{pointsAmount}} IOH Points</strong> have been added to your account.</p><p><strong>Reason:</strong> {{pointsReason}}</p><p><strong>Current Balance:</strong> {{currentBalance}} IOH Points</p><p><a href=\"{{accountUrl}}\" style=\"display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;\">View My Account</a></p>",
    bodyText: "Hello {{userName}},\n\n{{pointsAmount}} IOH Points have been added to your account.\n\nReason: {{pointsReason}}\nCurrent Balance: {{currentBalance}} IOH Points\n\nView my account: {{accountUrl}}",
    previewText: "New IOH Points have been added to your account."
  },
  campaign_email: {
    subject: "{{subject}}",
    bodyHtml: "<div style=\"font-family:sans-serif;font-size:16px;line-height:1.6;color:#d8d0c8;\">{{body}}<hr style=\"border:none;border-top:1px solid #333;margin:20px 0;\" /><p style=\"font-size:12px;color:#888;text-align:center;\">You are receiving this email because you opted in to IOHBOOK communications.<br />To change your preferences or unsubscribe, please <a href=\"{{unsubscribeUrl}}\" style=\"color:#e7c574;text-decoration:underline;\">visit your profile</a>.</p></div>",
    bodyText: "{{body}}\n\n---\nYou are receiving this email because you opted in to IOHBOOK communications.\nUnsubscribe or update preferences: {{unsubscribeUrl}}",
    previewText: "{{subject}}"
  }
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

Object.assign(FALLBACK_TEMPLATES, ENGLISH_FALLBACK_TEMPLATES);

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

  void fallback;
  const activeFallback = FALLBACK_TEMPLATES[templateKey] ?? {
    subject: "IOH Notification",
    bodyHtml: "<p>You have received a new IOH notification.</p>",
    bodyText: "You have received a new IOH notification.",
    previewText: ""
  };

  const subjectTemplate = dbTemplate?.subject ?? activeFallback.subject;
  const htmlTemplate = dbTemplate?.body_html ?? activeFallback.bodyHtml;
  const textTemplate = dbTemplate?.body_text ?? activeFallback.bodyText;
  const previewTemplate = dbTemplate?.preview_text ?? activeFallback.previewText ?? "";

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

  const html = renderIohEmailShell({
    body: htmlBody,
    preview: previewText || subject,
    title: subject
  });

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
  let subject = "IOH Notification";
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
            subject: `[SKIPPED] ${FALLBACK_TEMPLATES[input.templateKey]?.subject ?? "IOH Notification"}`,
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
      adminReply: "Great review, thank you!",
      accountUrl: "https://iohbook.local/account",
      pointsReason: "Amazon review verification",
      currentBalance: 45
    }
  });
}
