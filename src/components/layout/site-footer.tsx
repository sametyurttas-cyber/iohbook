import Link from "next/link";
import { Container } from "@/components/layout/container";

const footerLinks = [
  { label: "Kitaplar", href: "/books" },
  { label: "Koleksiyonlar", href: "/collections" },
  { label: "Yazar Hakkinda", href: "/author" },
  { label: "Iletisim", href: "/contact" },
  { label: "On Bilgilendirme", href: "/legal/pre-info" },
  { label: "Mesafeli Satis", href: "/legal/distance-sales" },
  { label: "Gizlilik / KVKK", href: "/legal/privacy" },
  { label: "Cerez Tercihleri", href: "/legal/cookie-preferences" }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-ink py-12">
      <Container className="grid gap-8 md:grid-cols-[1fr_2fr]">
        <div>
          <p className="font-display text-2xl font-bold text-paper">IOH</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            Samet Yurttas kitap evreni icin premium, karanlik ve kozmik bir
            butik satis deneyimi.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {footerLinks.map((link) => (
            <Link
              className="inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </Container>
    </footer>
  );
}
