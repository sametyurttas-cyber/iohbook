import Image from "next/image";
import { cn } from "@/lib/utils";

type BookCoverProps = {
  alt: string;
  className?: string;
  priority?: boolean;
  title: string;
  url: string | null;
};

export function BookCover({ alt, className, priority = false, title, url }: BookCoverProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-border bg-card shadow-panel",
        className
      )}
    >
      {url ? (
        <Image
          alt={alt}
          className="h-full w-full object-cover"
          fill
          loading={priority ? undefined : "eager"}
          priority={priority}
          sizes="(min-width: 1024px) 420px, 100vw"
          src={url}
        />
      ) : (
        <div className="flex h-full min-h-80 flex-col justify-between bg-ink p-6">
          <p className="text-eyebrow uppercase text-muted-foreground">IOH</p>
          <div>
            <p className="font-display text-5xl font-bold leading-none text-gold">
              {title}
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Kapak görseli eklendiğinde burada görünecek.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
