import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { getHeaderUserView } from "@/features/auth/queries";
import {
  getCoverMedia,
  getLowestPriceLabel,
  getMediaUrl,
  getPublicDigitalVariants
} from "@/features/catalog/catalog-utils";
import {
  BooksIndexScene,
  type BooksIndexItem
} from "@/features/catalog/books-index-scene";
import { listPublishedBooks } from "@/features/catalog/queries";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";

export const revalidate = 300;

export const metadata: Metadata = buildPageMetadata({
  description:
    "Samet Yurttas IOH evrenindeki PDF ve EPUB dijital kitaplari kesfedin.",
  path: "/books",
  title: "Kitaplar"
});

const accents = {
  blue: "#6f9bff",
  gold: "#e7c574",
  red: "#ff5b5b"
} as const;

const fallbackBooks: BooksIndexItem[] = [
  {
    accent: accents.gold,
    coverUrl: null,
    description:
      "Kodun kutsal mimariye donustugu ilk hat. Hafiza, bilinc ve sistemin altin cekirdegi.",
    href: "/books/godcode",
    label: "01 / GODCODE",
    price: "Yakinda",
    title: "GODCODE",
    variants: 3
  },
  {
    accent: accents.blue,
    coverUrl: null,
    description:
      "Sistemin kendini kurdugu mavi esik. Aglar, protokoller ve sessiz iktidar dili.",
    href: "/books/sysgod",
    label: "02 / SYSGOD",
    price: "Yakinda",
    title: "SYSGOD",
    variants: 3
  },
  {
    accent: accents.red,
    coverUrl: null,
    description:
      "Catismanin kirmizi cephesi. Kodun savasa, savasin bilince donustugu karanlik bolge.",
    href: "/books/codewar",
    label: "03 / CODEWAR",
    price: "Yakinda",
    title: "CODEWAR",
    variants: 3
  }
];

function getBookAccent(title: string, index: number) {
  const normalized = title.toLowerCase();

  if (normalized.includes("sys")) {
    return accents.blue;
  }

  if (normalized.includes("war")) {
    return accents.red;
  }

  if (normalized.includes("godcode") || normalized.includes("god code")) {
    return accents.gold;
  }

  return index % 3 === 1 ? accents.blue : index % 3 === 2 ? accents.red : accents.gold;
}

function getBookSortOrder(title: string) {
  const normalized = title.replace(/\s+/g, "").toLowerCase();

  if (normalized === "godcode") return 0;
  if (normalized === "codewar") return 1;
  if (normalized === "sysgod") return 2;
  return 100;
}

export default async function BooksPage() {
  const [books, userView] = await Promise.all([
    listPublishedBooks(),
    getHeaderUserView()
  ]);
  const visibleBooks: BooksIndexItem[] =
    books.length > 0
      ? [...books]
          .sort((a, b) => getBookSortOrder(a.title) - getBookSortOrder(b.title))
          .map((book, index) => {
            const cover = getCoverMedia(book);
            const variants = getPublicDigitalVariants(book);

            return {
              accent: getBookAccent(book.title, index),
              coverUrl: getMediaUrl(cover),
              description:
                book.short_description ??
                book.subtitle ??
                "IOH evreninden PDF ve EPUB dijital kitap deneyimi.",
              href: `/books/${book.slug}`,
              label: `${String(index + 1).padStart(2, "0")} / ${book.title}`,
              price: getLowestPriceLabel(book),
              title: book.title,
              variants: variants.length
            };
          })
      : fallbackBooks;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          hasPart: books.map((book) => ({
            "@type": book.type === "nft" || book.type === "claimable" ? "Product" : "Book",
            name: book.title,
            url: absoluteUrl(`/books/${book.slug}`)
          })),
          name: "IOH Kitaplar",
          url: absoluteUrl("/books")
        }}
      />
      <BooksIndexScene
        books={visibleBooks}
        user={userView}
      />
    </>
  );
}
