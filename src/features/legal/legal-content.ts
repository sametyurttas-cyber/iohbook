export const LEGAL_DOCUMENT_VERSION = "2026-06-10";

export type LegalDocument = {
  description: string;
  href: string;
  sections: { body: string[]; title: string }[];
  slug: string;
  title: string;
};

export const legalDocuments: Record<string, LegalDocument> = {
  "cookie-preferences": {
    description: "Cerez kategorileri ve tercihlerinizi nasil yoneteceginiz.",
    href: "/legal/cookie-preferences",
    sections: [
      {
        body: [
          "Zorunlu cerezler sepet, oturum, guvenlik ve tercihlerin hatirlanmasi icin kullanilir. Bu cerezler olmadan site temel olarak calismaz.",
          "Analitik ve pazarlama cerezleri yalnizca kullanicinin tercihine bagli olarak etkinlestirilmelidir. MVP fazinda bu tercih yerel cerez kaydi ile tutulur."
        ],
        title: "Cerez kategorileri"
      },
      {
        body: [
          "Kullanici cerez tercihlerini her zaman bu sayfadan degistirebilir. Tercih degisikligi gelecekteki ziyaretlere uygulanir.",
          "Ucuncu taraf pazarlama, yeniden hedefleme veya davranissal reklam cerezleri canliya alinmadan once hukuki metinler ve teknik envanter guncellenmelidir."
        ],
        title: "Tercih yonetimi"
      }
    ],
    slug: "cookie-preferences",
    title: "Cerez Tercihleri"
  },
  "distance-sales": {
    description: "Mesafeli satis sozlesmesinin temel hukumleri.",
    href: "/legal/distance-sales",
    sections: [
      {
        body: [
          "Bu sozlesme, alicinin elektronik ortamda siparis verdigi dijital kitap satislarinda taraflarin hak ve yukumluluklerini duzenler.",
          "Satici unvani, adresi, MERSIS/vergi bilgileri ve destek kanallari canliya cikmadan once resmi sirket bilgileriyle doldurulmalidir."
        ],
        title: "Taraflar ve konu"
      },
      {
        body: [
          "Urunun temel nitelikleri, dijital format bilgisi, adet, satis bedeli ve toplam bedel siparis oncesinde checkout ozetinde gosterilir.",
          "Odeme iyzico CheckoutForm uzerinden baslatilir; kart bilgileri bu site tarafindan saklanmaz."
        ],
        title: "Urun, bedel ve odeme"
      },
      {
        body: [
          "Dijital kitaplar odeme onayindan sonra kullanici hesabindaki Indirmelerim alaninda guvenli indirme linkiyle sunulur.",
          "Dijital icerikte cayma hakki, istisnalar, iade kosullari ve erisim sureleri avukat tarafindan son metne islenmelidir."
        ],
        title: "Teslimat ve cayma"
      }
    ],
    slug: "distance-sales",
    title: "Mesafeli Satis Sozlesmesi"
  },
  "pre-info": {
    description: "Siparis oncesi ticari, urun, teslimat ve odeme ozeti.",
    href: "/legal/pre-info",
    sections: [
      {
        body: [
          "Alici, siparis oncesinde urunun temel niteliklerini, dijital formatini, erisim bilgisini, toplam fiyatini ve odeme adimini gorur.",
          "Bu metin dijital kitap MVP'si icin teknik placeholder'dir. NFT, token/coin satisi veya claimable urun canliya alinmadan once ayri hukuki inceleme gerekir."
        ],
        title: "Kapsam"
      },
      {
        body: [
          "Fiyatlar checkout ozetinde gosterilir. Dijital-only sipariste kargo/adres adimi ve teslimat ucreti uygulanmaz.",
          "Odeme sayfasina yonlendirme basarili olsa bile siparisin kesinlesmesi backend odeme dogrulamasina baglidir."
        ],
        title: "Fiyat, teslimat ve odeme"
      },
      {
        body: [
          "Kisisel veriler siparisin alinmasi, odemenin dogrulanmasi, dijital erisim ve destek surecleri icin islenir.",
          "Ticari elektronik ileti izni zorunlu degildir ve ayri acik riza alanlariyla alinmalidir."
        ],
        title: "Kisisel veri ve iletisim izni"
      }
    ],
    slug: "pre-info",
    title: "On Bilgilendirme Metni"
  },
  privacy: {
    description: "Kisisel verilerin islenmesine iliskin aydinlatma metni.",
    href: "/legal/privacy",
    sections: [
      {
        body: [
          "Siparis, uyelik, odeme, dijital erisim ve destek surecleri icin ad soyad, e-posta, telefon, siparis ve odeme islem bilgileri islenebilir.",
          "Odeme kart verileri iyzico tarafindan islenir; bu site kart numarasi veya CVV saklamaz."
        ],
        title: "Islenen veri kategorileri"
      },
      {
        body: [
          "Veriler sozlesmenin kurulmasi/ifasi, hukuki yukumlulukler, mesru menfaat ve kullanicinin acik rizasi gibi hukuki sebeplere dayanarak islenir.",
          "Aydinlatma metninin okunmasi ile ticari elektronik ileti acik rizasi birbirinden ayridir."
        ],
        title: "Hukuki sebepler"
      },
      {
        body: [
          "Kullanici, KVKK kapsamindaki bilgi alma, duzeltme, silme, itiraz ve ilgili diger haklarini saticinin resmi iletisim kanallari uzerinden kullanabilir.",
          "Canliya cikmadan once veri sorumlusu kimligi, basvuru adresi, saklama sureleri ve aktarim alicilari resmi bilgilerle tamamlanmalidir."
        ],
        title: "Haklar ve basvuru"
      }
    ],
    slug: "privacy",
    title: "Gizlilik ve KVKK Aydinlatma Metni"
  }
};

export const checkoutLegalSummaries = [
  {
    documentSlug: "pre-info",
    eventKind: "notice_acknowledgement",
    inputName: "pre_info_acknowledged",
    label: "On bilgilendirme metnini okudum ve siparis oncesi ticari ozeti anladim.",
    purpose: "checkout_pre_information",
    required: true,
    summary:
      "Urun nitelikleri, dijital format, toplam bedel, erisim ve odeme dogrulama akisi siparis oncesinde gosterilir."
  },
  {
    documentSlug: "distance-sales",
    eventKind: "explicit_consent",
    inputName: "distance_sales_accepted",
    label: "Mesafeli satis sozlesmesini kabul ediyorum.",
    purpose: "distance_sales_contract",
    required: true,
    summary:
      "Dijital kitap satisi, erisim, cayma/iade basliklari ve taraf yukumlulukleri bu sozlesme kapsamindadir."
  },
  {
    documentSlug: "privacy",
    eventKind: "notice_acknowledgement",
    inputName: "privacy_notice_acknowledged",
    label: "KVKK aydinlatma metnini okudum.",
    purpose: "privacy_notice",
    required: true,
    summary:
      "Siparis, odeme, dijital erisim ve destek icin gerekli kisisel veriler islenir; pazarlama izni ayrica alinir."
  }
] as const;

export const optionalCommunicationConsents = [
  {
    documentSlug: "privacy",
    inputName: "email_marketing_consent",
    label: "E-posta ile kampanya, yeni kitap ve koleksiyon duyurulari almak istiyorum.",
    purpose: "email_marketing"
  },
  {
    documentSlug: "privacy",
    inputName: "sms_marketing_consent",
    label: "SMS/telefon kanaliyla kampanya ve siparis disi duyuru almak istiyorum.",
    purpose: "sms_marketing"
  }
] as const;
