import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { MobileNav } from "@/components/layout/mobile-nav";
import { PublicAtmosphere } from "@/components/layout/public-atmosphere";
import { getCurrentUser } from "@/features/auth/queries";
import { MiniCart } from "@/features/cart/mini-cart";

const navItems = [
  { label: "Evren", href: "/" },
  { label: "Kitaplar", href: "/books" },
  { label: "IOHCoin", href: "/token-sale" },
  { label: "Koleksiyonlar", href: "/collections" },
  { label: "Yazar Hakkinda", href: "/author" },
  { label: "NFT Galeri", href: "/nft" },
  { label: "Gunluk/Blog", href: "/journal" },
  { label: "Iletisim", href: "/contact" }
];

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <>
      <PublicAtmosphere />
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/72 shadow-[0_18px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
        <Container className="flex min-h-20 items-center justify-between gap-5 py-3">
          <Link className="group flex items-center gap-3" href="/">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/35 bg-gold/10 font-display text-sm font-bold text-gold shadow-glow transition-transform group-hover:scale-105">
              IOH
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="mono-label block text-[0.58rem] text-mist/75">
                Samet Yurttas
              </span>
              <span className="block font-display text-lg font-semibold text-paper">
                IOH Universe
              </span>
            </span>
          </Link>

          <nav aria-label="Ana navigasyon" className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                className="mono-label inline-flex min-h-11 items-center rounded-full px-3 py-2 text-[0.6rem] text-mist/78 transition-colors hover:bg-white/[0.055] hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <MobileNav />
            <Button asChild size="sm" variant="outline">
              <Link href={user ? "/account" : "/sign-in"}>{user ? "Hesap" : "Giris"}</Link>
            </Button>
            <Button asChild className="hidden sm:inline-flex" size="sm">
              <Link href="/books">Kitaplari Incele</Link>
            </Button>
            <MiniCart />
          </div>
        </Container>
      </header>
    </>
  );
}
