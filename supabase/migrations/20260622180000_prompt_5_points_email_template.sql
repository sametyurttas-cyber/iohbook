-- Update points_awarded email template to include pointsReason and currentBalance
update public.email_templates
set subject = 'Hesabınıza IOH Puan Yüklendi! (+{{pointsAmount}} Puan)',
    preview_text = 'Yeni bir etkinlikten IOH Puan kazandınız.',
    body_html = '<p>Merhaba {{userName}},</p><p><strong>{{pointsAmount}} IOH Puan</strong> hesabınıza işlendi.</p><p><strong>Sebep:</strong> {{pointsReason}}</p><p><strong>Güncel Bakiyeniz:</strong> {{currentBalance}} IOH Puan</p><p><a href="{{accountUrl}}" style="display:inline-block;background:#c9a75d;color:#0d0d0f;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:bold;">Hesabımı Görüntüle</a></p>',
    body_text = 'Merhaba {{userName}},\n\n{{pointsAmount}} IOH Puan hesabınıza işlendi.\n\nSebep: {{pointsReason}}\nGüncel Bakiyeniz: {{currentBalance}} IOH Puan\n\nHesabımı görüntüle: {{accountUrl}}',
    variables = '["userName", "pointsAmount", "pointsReason", "currentBalance", "accountUrl"]'::jsonb,
    updated_at = now()
where key = 'points_awarded';
