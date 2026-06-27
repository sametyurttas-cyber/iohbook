# Session Handoff

Last updated: 2026-06-26

## Current Status

- **Düzeltmeler ve Yeni Özellikler Pushlandı:**
  - Ödeme Bekleniyor (`/payment/pending`) sayfası sitenin kozmik tasarım diline uygun şekilde eklendi ve Shopier ödemelerinin yeni sekmede (`_blank`) açılması sağlandı.
  - Checkout sayfası (`/checkout`), modern ve modüler `CheckoutScene` bileşeniyle refaktör edilip kozmik temaya uygun şekilde güncellendi.
  - Puan hareketleri (points ledger) listesi detaylandırıldı. Token satın alımları için `source: token_purchase` metadatası kontrol edilerek otomatik olarak **"Token Satın Alma Ödülü"** başlığı ve özel detay açıklaması eklendi.
  - Değişiklikler başarıyla commitleyip GitHub'a pushlandı (`1b13dec`).
- **Otomatik Canlı Dağıtım:** Vercel otomatik deployment süreci GitHub tetiklenmesiyle başladı.
- **Testler:** Proje yapısı yerel ve uzak testlerle uyumlu şekilde korunmaktadır.

## Verification & Active Tests

- Canlıya geçiş tamamlandıktan sonra `/token-sale` sayfasında satın alım akışı başlatılarak Shopier'in yeni sekmede açıldığı ve mevcut sekmenin `/payment/pending` sayfasına yönlendiği doğrulanmalıdır.
- `/checkout` sayfasının yeni kozmik tasarımı ve form akışı test edilmelidir.
- Hesap profili ve Token Haklarım sayfasındaki "Puan Hareketleri" listesinin yeni formatta doğru şekilde listelendiği doğrulanmalıdır.

## Open Risks

- Yok. Shopier callback/webhook ve yönlendirme akışı stabil durumdadır.
