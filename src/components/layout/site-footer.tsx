import Link from "next/link";
import { Container } from "@/components/layout/container";

const footerLinks = [
  { label: "Kitaplar", href: "/books" },
  { label: "Koleksiyonlar", href: "/collections" },
  { label: "NFT Galeri", href: "/nft" },
  { label: "Token Sale", href: "/token-sale" },
  { label: "Gunluk/Blog", href: "/journal" },
  { label: "Yazar Hakkinda", href: "/author" },
  { label: "Iletisim", href: "/contact" },
  { label: "On Bilgilendirme", href: "/legal/pre-info" },
  { label: "Mesafeli Satis", href: "/legal/distance-sales" },
  { label: "Gizlilik / KVKK", href: "/legal/privacy" },
  { label: "Cerez Tercihleri", href: "/legal/cookie-preferences" }
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-ink/88 py-14">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/45 to-transparent" />
      <Container className="relative grid gap-10 md:grid-cols-[1fr_2fr]">
        <div>
          <p className="mono-label text-gold">IOH Archive</p>
          <p className="mt-3 font-display text-3xl font-bold text-paper">IOH</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            Samet Yurttas kitap evreni icin premium, karanlik ve kozmik bir
            butik satis deneyimi.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {footerLinks.map((link) => (
            <Link
              className="mono-label inline-flex min-h-11 items-center rounded-full border border-white/10 bg-white/[0.025] px-4 text-[0.62rem] text-mist/75 transition-colors hover:border-gold/40 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
