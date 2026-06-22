-- Create email_templates table
create table public.email_templates (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  subject text not null,
  preview_text text,
  body_html text not null,
  body_text text not null,
  variables jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS and create policies for email_templates
alter table public.email_templates enable row level security;

create policy email_templates_staff_all
  on public.email_templates for all
  using (public.is_staff(array['owner', 'admin_ops']::public.staff_role[]));

-- Alter email_events table
alter table public.email_events add column if not exists template_key text;
alter table public.email_events add column if not exists sent_at timestamptz;

-- Drop and recreate status check constraint
alter table public.email_events drop constraint if exists email_events_status_check;
alter table public.email_events add constraint email_events_status_check check (status in ('pending', 'queued', 'sent', 'failed', 'skipped'));

-- Add indexes
create index if not exists email_events_template_key_idx on public.email_events(template_key);
create index if not exists email_events_status_new_idx on public.email_events(status);

-- Seed initial email templates
insert into public.email_templates (key, subject, preview_text, body_html, body_text, variables) values
(
  'welcome',
  'IOH Evrenine Hoş Geldiniz!',
  'Kozmik teknoloji ve kitap evrenine ilk adımınızı attınız.',
  '<p>Merhaba {{userName}},</p><p>IOH evrenine katıldığınız için teşekkür ederiz. Hesabınız başarıyla oluşturuldu.</p><p>Giriş adresi: {{email}}</p><p><a href="{{accountUrl}}" style="display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;">Hesabımı Görüntüle</a></p>',
  'Merhaba {{userName}},\n\nIOH evrenine katıldığınız için teşekkür ederiz. Hesabınız başarıyla oluşturuldu.\n\nE-posta: {{email}}\n\nHesabınız: {{accountUrl}}',
  '["userName", "email", "accountUrl"]'::jsonb
),
(
  'order_paid',
  'Siparişiniz Onaylandı: {{orderCode}}',
  'Ödemeniz başarıyla doğrulandı, siparişiniz hazırlanıyor.',
  '<p>Merhaba {{userName}},</p><p><strong>{{orderCode}}</strong> numaralı siparişinizin ödemesi başarıyla doğrulandı.</p><p>Sipariş detaylarını ve durumunu görmek için aşağıdaki bağlantıyı kullanabilirsiniz:</p><p><a href="{{accountUrl}}" style="display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;">Siparişi Görüntüle</a></p>',
  'Merhaba {{userName}},\n\n{{orderCode}} numaralı siparişinizin ödemesi başarıyla doğrulandı.\n\nSiparişi görüntüle: {{accountUrl}}',
  '["userName", "orderCode", "accountUrl"]'::jsonb
),
(
  'digital_delivery_ready',
  'Dijital Kitabınız Hazır: {{bookTitle}}',
  'Satın aldığınız dijital kitap formatları hesabınızda erişime açıldı.',
  '<p>Merhaba {{userName}},</p><p>Satın aldığınız <strong>{{bookTitle}}</strong> kitabı indirmeye hazır!</p><p>PDF/EPUB dosyalarınız mail eki olarak gönderilmez ve kalıcı halka açık link oluşturulmaz. Güvenli bir şekilde indirmek için lütfen hesabınıza giriş yapın:</p><p><a href="{{downloadUrl}}" style="display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;">Kitaplarımı İndir</a></p>',
  'Merhaba {{userName}},\n\nSatın aldığınız {{bookTitle}} kitabı indirmeye hazır!\n\nGiriş yapıp indirmek için: {{downloadUrl}}',
  '["userName", "bookTitle", "downloadUrl"]'::jsonb
),
(
  'amazon_verification_received',
  'Amazon Doğrulama Başvurunuz Alındı',
  'Amazon incelemeniz veya satın alma kaydınız kontrol sırasına alındı.',
  '<p>Merhaba {{userName}},</p><p><strong>{{verificationTitle}}</strong> için gönderdiğiniz Amazon doğrulama başvurunuz başarıyla alındı.</p><p>Başvurunuz operasyon ekibimiz tarafından en geç 24 saat içinde incelenecektir.</p>',
  'Merhaba {{userName}},\n\n{{verificationTitle}} için gönderdiğiniz Amazon doğrulama başvurunuz başarıyla alındı. Başvurunuz en geç 24 saat içinde incelenecektir.',
  '["userName", "verificationTitle"]'::jsonb
),
(
  'amazon_verification_approved',
  'Amazon Başvurunuz Onaylandı! (+{{pointsAmount}} IOH Puan)',
  'Tebrikler, Amazon doğrulama talebiniz onaylandı ve puanlarınız yüklendi.',
  '<p>Merhaba {{userName}},</p><p><strong>{{verificationTitle}}</strong> için gönderdiğiniz doğrulama başvurusu onaylandı!</p><p>Hesabınıza <strong>{{pointsAmount}} IOH Puan</strong> yüklendi.</p><p>Mevcut puan bakiyenizi görmek ve ödülleri incelemek için:</p><p><a href="{{accountUrl}}" style="display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;">Ödüllerimi Gör</a></p>',
  'Merhaba {{userName}},\n\n{{verificationTitle}} için gönderdiğiniz doğrulama başvurusu onaylandı! Hesabınıza {{pointsAmount}} IOH Puan yüklendi.\n\nÖdüllerini gör: {{accountUrl}}',
  '["userName", "verificationTitle", "pointsAmount", "accountUrl"]'::jsonb
),
(
  'amazon_verification_rejected',
  'Amazon Başvurunuz Reddedildi',
  'Amazon doğrulama talebiniz maalesef onaylanamadı. Detayları inceleyin.',
  '<p>Merhaba {{userName}},</p><p><strong>{{verificationTitle}}</strong> için gönderdiğiniz doğrulama başvurusu maalesef kriterleri karşılamadığı için onaylanamadı.</p><p>Detayları incelemek ve yeni bir başvuru yapmak için hesabınızı ziyaret edebilirsiniz:</p><p><a href="{{accountUrl}}" style="display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;">Başvuru Detayını Gör</a></p>',
  'Merhaba {{userName}},\n\n{{verificationTitle}} için gönderdiğiniz doğrulama başvurusu maalesef kriterleri karşılamadığı için onaylanamadı.\n\nBaşvuru detayını gör: {{accountUrl}}',
  '["userName", "verificationTitle", "accountUrl"]'::jsonb
),
(
  'amazon_admin_reply',
  'Amazon Başvurunuza Yeni Mesaj: {{verificationTitle}}',
  'Yöneticimiz başvurunuza bir mesaj bıraktı.',
  '<p>Merhaba {{userName}},</p><p><strong>{{verificationTitle}}</strong> başvurunuz hakkında bir yönetici mesaj bıraktı:</p><blockquote style="border-left:4px solid #c9a75d;padding-left:12px;margin:18px 0;color:#d8d0c8;">{{adminReply}}</blockquote><p>Yanıt vermek veya durumu incelemek için tıklayın:</p><p><a href="{{accountUrl}}" style="display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;">Başvuruyu İncele</a></p>',
  'Merhaba {{userName}},\n\n{{verificationTitle}} başvurunuz hakkında bir yönetici mesaj bıraktı:\n\n"{{adminReply}}"\n\nBaşvuruyu incele: {{accountUrl}}',
  '["userName", "verificationTitle", "adminReply", "accountUrl"]'::jsonb
),
(
  'points_awarded',
  'Hesabınıza IOH Puan Yüklendi! (+{{pointsAmount}} Puan)',
  'Yeni bir etkinlikten IOH Puan kazandınız.',
  '<p>Merhaba {{userName}},</p><p>Tebrikler! Hesabınıza <strong>{{pointsAmount}} IOH Puan</strong> yüklendi.</p><p>Puanlarınızı indirimler ve butik hediyeler için kullanabilirsiniz.</p><p><a href="{{accountUrl}}" style="display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;">Puanlarımı Gör</a></p>',
  'Merhaba {{userName}},\n\nTebrikler! Hesabınıza {{pointsAmount}} IOH Puan yüklendi.\n\nPuanlarımı gör: {{accountUrl}}',
  '["userName", "pointsAmount", "accountUrl"]'::jsonb
);
