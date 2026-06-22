-- Seed prompt 4 order email templates
insert into public.email_templates (key, subject, preview_text, body_html, body_text, variables) values
(
  'order_received',
  'Siparişiniz Alındı: {{orderCode}}',
  'Siparişiniz oluşturuldu, ödeme onayı bekleniyor.',
  '<p>Merhaba {{userName}},</p><p><strong>{{orderCode}}</strong> numaralı sipariş talebiniz başarıyla alındı ve ödeme onayı bekleniyor.</p><p>Sipariş detaylarınızı aşağıdaki bağlantıdan takip edebilirsiniz:</p><p><a href="{{accountUrl}}" style="display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;">Siparişi Takip Et</a></p>',
  'Merhaba {{userName}},\n\n{{orderCode}} numaralı sipariş talebiniz başarıyla alındı ve ödeme onayı bekleniyor.\n\nSipariş detayı: {{accountUrl}}',
  '["userName", "orderCode", "accountUrl"]'::jsonb
),
(
  'payment_failed',
  'Ödeme Denemeniz Başarısız Oldu: {{orderCode}}',
  'Siparişinizin ödemesi gerçekleştirilemedi.',
  '<p>Merhaba {{userName}},</p><p><strong>{{orderCode}}</strong> numaralı siparişiniz için yapılan ödeme işlemi başarısız oldu.</p><p>Kart bilgilerinizin doğruluğunu kontrol edip tekrar deneyebilir veya farklı bir kart kullanabilirsiniz.</p><p><a href="{{checkoutUrl}}" style="display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;">Ödemeyi Tekrar Dene</a></p>',
  'Merhaba {{userName}},\n\n{{orderCode}} numaralı siparişiniz için yapılan ödeme işlemi başarısız oldu. Lütfen tekrar deneyin.\n\nÖdeme sayfası: {{checkoutUrl}}',
  '["userName", "orderCode", "checkoutUrl"]'::jsonb
),
(
  'order_cancelled',
  'Siparişiniz İptal Edildi: {{orderCode}}',
  'Siparişinizin iptal işlemi tamamlandı.',
  '<p>Merhaba {{userName}},</p><p><strong>{{orderCode}}</strong> numaralı siparişiniz iptal edilmiştir.</p><p>Ödeme yapıldıysa iadeniz bankanıza iletilecektir.</p><p><a href="{{accountUrl}}" style="display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;">Sipariş Detayları</a></p>',
  'Merhaba {{userName}},\n\n{{orderCode}} numaralı siparişiniz iptal edilmiştir. Detaylar için hesabınızı ziyaret edebilirsiniz:\n\nHesabınız: {{accountUrl}}',
  '["userName", "orderCode", "accountUrl"]'::jsonb
),
(
  'order_refunded',
  'İade İşleminiz Tamamlandı: {{orderCode}}',
  'İade işleminiz başarıyla tamamlandı.',
  '<p>Merhaba {{userName}},</p><p><strong>{{orderCode}}</strong> numaralı siparişinizin iade işlemi tamamlanmış ve ücret iadesi kartınıza yansıtılmak üzere bankanıza iletilmiştir.</p><p>İade tutarının kartınıza yansıması bankanıza bağlı olarak birkaç iş günü sürebilir.</p><p><a href="{{accountUrl}}" style="display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;">Sipariş Detayları</a></p>',
  'Merhaba {{userName}},\n\n{{orderCode}} numaralı siparişinizin iade işlemi tamamlanmış ve ücret iadesi bankanıza iletilmiştir.\n\nHesabınız: {{accountUrl}}',
  '["userName", "orderCode", "accountUrl"]'::jsonb
),
(
  'order_shipped',
  'Siparişiniz Kargoya Verildi: {{orderCode}}',
  'Siparişiniz kargoya verildi, kargo takibini başlatabilirsiniz.',
  '<p>Merhaba {{userName}},</p><p><strong>{{orderCode}}</strong> numaralı siparişiniz kargoya verilmiştir.</p><p>Kargo Takip Kodu: <strong>{{trackingNumber}}</strong></p><p><a href="{{trackingUrl}}" style="display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;">Kargomu Takip Et</a></p>',
  'Merhaba {{userName}},\n\n{{orderCode}} numaralı siparişiniz kargoya verilmiştir.\n\nKargo Takip Kodu: {{trackingNumber}}\nTakip Linki: {{trackingUrl}}',
  '["userName", "orderCode", "trackingNumber", "trackingUrl"]'::jsonb
)
on conflict (key) do update set
  subject = excluded.subject,
  preview_text = excluded.preview_text,
  body_html = excluded.body_html,
  body_text = excluded.body_text,
  variables = excluded.variables;
