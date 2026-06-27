# Session Handoff

Last updated: 2026-06-27

## Current Status

- **Düzeltmeler ve Yeni Özellikler Pushlandı:**
  - Ödeme Bekleniyor (`/payment/pending`) sayfası sitenin kozmik tasarım diline uygun şekilde eklendi ve Shopier ödemelerinin yeni sekmede (`_blank`) açılması sağlandı.
  - Checkout sayfası (`/checkout`), modern ve modüler `CheckoutScene` bileşeniyle refaktör edilip kozmik temaya uygun şekilde güncellendi.
  - Puan hareketleri (points ledger) listesi detaylandırıldı. Token satın alımları için `source: token_purchase` metadatası kontrol edilerek otomatik olarak **"Token Satın Alma Ödülü"** başlığı ve özel detay açıklaması eklendi.
  - Puan hareketleri geçmişinde UUID olarak görünen sipariş kimlikleri yerine ilişkisel sorgulama ile kullanıcı dostu sipariş numaraları (`order_number`) listelenmesi sağlandı.
  - `/token-sale` sayfasında 365 günlük (`27 Haziran 2027` bitişli) sabit bir **Genesis Countdown** geri sayım saati eklendi ve Hero ile Manifesto arasına yerleştirildi.
  - `/token-sale` pazarlama yazıları finansal vaat barındırmayacak ekosistem odaklı bir dille (`genesis phase`, `early access`, `ecosystem participation`, `future utility`, `community allocation`) güncellendi.
  - `/token-sale` sayfasındaki Hero başlığı altındaki açıklama metni, IOH medeniyeti ve Genesis felsefesini anlatan şiirsel metinle değiştirildi.
  - Hero alt metninin dar sütuna sıkışmaması için `max-width` CSS'te `850px` seviyesine çıkarıldı ve inline stil kısıtlamaları kaldırılarak mobil/tablet cihazlarda tam uyumlu responsive akış sağlandı.
  - Hero alt metni ile sayaç altındaki açıklama metinleri, dikeyde fazla yer kaplamaması ve coin görsellerinin doğru konumlanması için satır satır birleştirilerek kompakt hale getirildi.
  - Değişiklikler başarıyla commitleyip GitHub'a pushlandı (`e3cc9ea`).
- **Otomatik Canlı Dağıtım:** Vercel otomatik deployment süreci GitHub tetiklenmesiyle başladı.
- **Testler:** Proje yapısı yerel ve uzak testlerle uyumlu şekilde korunmaktadır.

## Verification & Active Tests

- Canlıya geçiş tamamlandıktan sonra `/token-sale` sayfasında satın alım akışı başlatılarak Shopier'in yeni sekmede açıldığı ve mevcut sekmenin `/payment/pending` sayfasına yönlendiği doğrulanmalıdır.
- `/checkout` sayfasının yeni kozmik tasarımı ve form akışı test edilmelidir.
- Hesap profili ve Token Haklarım sayfasındaki "Puan Hareketleri" listesinin yeni formatta doğru sipariş numaralarıyla listelendiği doğrulanmalıdır.
- `/token-sale` sayfasındaki yeni **Genesis Countdown** geri sayım saatinin, yenilenen metinlerin, kompakt açıklamaların ve responsive genişliğin doğruluğu kontrol edilmelidir.

## Open Risks

- Yok. Shopier callback/webhook ve yönlendirme akışı stabil durumdadır.



