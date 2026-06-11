import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { MiniCart } from "@/features/cart/mini-cart";

const navItems = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Kitaplar", href: "/books" },
  { label: "Yazar Hakkinda", href: "/author" },
  { label: "Koleksiyonlar", href: "/collections" },
  { label: "NFT Galeri", href: "/nft" },
  { label: "Token Sale", href: "/token-sale" },
  { label: "Gunluk/Blog", href: "/journal" },
  { label: "Iletisim", href: "/contact" },
  { label: "Sepet", href: "/cart" }
];

export async function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-ink/88 backdrop-blur-xl">
      <Container className="flex h-20 items-center justify-between gap-6">
        <Link className="group flex items-center gap-3" href="/">
          <span className="flex h-10 w-10 items-center justify-center rounded-md border border-gold/30 bg-gold/10 font-display text-lg font-bold text-gold shadow-glow">
            IOH
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Samet Yurttas
            </span>
            <span className="block font-display text-lg font-semibold text-paper">
              Author Store
            </span>
          </span>
        </Link>

        <nav aria-label="Ana navigasyon" className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              className="inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild className="hidden sm:inline-flex" size="sm">
            <Link href="/books">Kitaplari Incele</Link>
          </Button>
          <MiniCart />
        </div>
      </Container>
    </header>
  );
}
