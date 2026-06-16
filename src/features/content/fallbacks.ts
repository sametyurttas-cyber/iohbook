import type { ContentBlock, ContentBody } from "@/features/content/content-types";

export const REQUIRED_CONTENT_SLUGS = [
  "home",
  "author",
  "contact",
  "faq",
  "campaigns"
] as const;

export type RequiredContentSlug = (typeof REQUIRED_CONTENT_SLUGS)[number];

const homeBlocks: ContentBlock[] = [
  {
    eyebrow: "IOH Universe",
    primaryHref: "/books",
    primaryLabel: "Kitaplari Incele",
    secondaryHref: "/author",
    secondaryLabel: "Yazari Tani",
    text: "Samet Yurttas kitaplari icin sade, editoryal ve koleksiyon hissi tasiyan butik satis deneyimi.",
    title: "Kod, sistem ve savas ekseninde premium bir yazar evreni.",
    type: "hero"
  },
  {
    ctaHref: "/books",
    ctaLabel: "Tum Kitaplar",
    eyebrow: "Kampanya bloklari",
    items: [
      {
        description: "Hafizasini kaybeden Algus'un System icindeki uyanisi.",
        imageUrl: "/media/books/ioh-godcode-cover.jpeg",
        title: "GODCODE"
      },
      {
        description: "Guvenlik, kontrol ve insan bilincinin mavi mimarisi.",
        imageUrl: "/media/books/ioh-sysgod-cover.jpeg",
        title: "SYSGOD"
      },
      {
        description: "Centrium, Iohcoin core ve kirmizi operasyon hatti.",
        imageUrl: "/media/books/ioh-codewar-cover.jpeg",
        title: "CODEWAR"
      }
    ],
    title: "Uc ana hat",
    type: "campaign"
  }
];

export const fallbackContent: Record<RequiredContentSlug, ContentBody & { title: string; excerpt: string }> = {
  author: {
    blocks: [
      {
        eyebrow: "Yazar hakkinda",
        text: "Samet Yurttas, teknoloji, sistemler ve insan iradesi etrafinda kurulan karanlik bir bilim kurgu evreni insa eder.",
        title: "Kodun mitolojiye donustugu bir yazar markasi.",
        type: "hero"
      },
      {
        text: "IOH evreni; GODCODE, SYSGOD ve CODEWAR kitaplariyla yapay zeka, sistem mimarisi ve catismayi tek bir editoryal hatta toplar.",
        title: "Yazar notu",
        type: "text"
      }
    ],
    excerpt: "Samet Yurttas ve IOH evreni hakkinda.",
    title: "Yazar Hakkinda"
  },
  campaigns: {
    blocks: [
      {
        ctaHref: "/books",
        ctaLabel: "Kitaplari Incele",
        eyebrow: "Kampanyalar",
        items: [
          {
            description: "Imzali baski ve koleksiyon varyantlari icin yayin takibi.",
            title: "Koleksiyon drop"
          }
        ],
        title: "Aktif kampanya bloklari",
        type: "campaign"
      }
    ],
    excerpt: "Kampanya ve koleksiyon duyurulari.",
    title: "Kampanyalar"
  },
  contact: {
    blocks: [
      {
        eyebrow: "Iletisim",
        text: "Siparis, imzali baski, basin ve is birligi talepleri icin bu sayfa uzerinden yonlendirme yapilir.",
        title: "Dogru konu icin dogru kanal.",
        type: "hero"
      },
      {
        text: "Destek: destek@iohbook.local\nIs birlikleri: hello@iohbook.local\nYanıt suresi: 1-2 is gunu.",
        title: "Iletisim bilgileri",
        type: "text"
      }
    ],
    excerpt: "Siparis ve is birligi iletisim kanallari.",
    title: "Iletisim"
  },
  faq: {
    blocks: [
      {
        eyebrow: "SSS",
        text: "Siparis, dijital teslimat ve koleksiyon fazlari hakkinda sik sorulan sorular.",
        title: "Merak edilenler",
        type: "hero"
      },
      {
        items: [
          {
            answer: "MVP fazinda kitaplar PDF ve/veya EPUB dijital format olarak satilir. Fiziksel baskilar sonraki faz icin saklanir.",
            question: "Dijital urunler var mi?"
          },
          {
            answer: "Odeme kesinlesmesi backend dogrulamasi ile tamamlanir.",
            question: "Odeme basarili sayfasi siparisi kesinlestirir mi?"
          }
        ],
        title: "Sik sorulan sorular",
        type: "faq"
      }
    ],
    excerpt: "Sik sorulan sorular.",
    title: "SSS"
  },
  home: {
    blocks: homeBlocks,
    excerpt: "IOH yazar markasi ana sayfasi.",
    title: "Ana Sayfa"
  }
};
