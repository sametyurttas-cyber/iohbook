import { BookCover } from "@/features/catalog/book-cover";
import { getMediaUrl } from "@/features/catalog/catalog-utils";
import type { StorefrontBook } from "@/features/catalog/queries";

type BookGalleryProps = {
  book: StorefrontBook;
};

export function BookGallery({ book }: BookGalleryProps) {
  const media = [...(book.product_media ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const cover = media.find((item) => item.kind === "cover") ?? media[0] ?? null;
  const gallery = media.filter((item) => item.id !== cover?.id).slice(0, 4);

  return (
    <div className="grid gap-4">
      <BookCover
        alt={cover?.alt_text ?? `${book.title} kapak görseli`}
        className="aspect-[3/4]"
        priority
        title={book.title}
        url={getMediaUrl(cover)}
      />
      <div className="grid grid-cols-4 gap-3">
        {[cover, ...gallery].filter(Boolean).map((item) => (
          <BookCover
            alt={item?.alt_text ?? `${book.title} galeri görseli`}
            className="aspect-square"
            key={item?.id}
            title={book.title}
            url={getMediaUrl(item ?? null)}
          />
        ))}
      </div>
    </div>
  );
}
