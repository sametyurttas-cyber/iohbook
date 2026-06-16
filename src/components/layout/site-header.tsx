import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { MobileNav } from "@/components/layout/mobile-nav";
import { PublicAtmosphere } from "@/components/layout/public-atmosphere";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { getOrderCountForProfile } from "@/features/account/queries";
import { signOut } from "@/features/auth/actions";
import { getCurrentProfile, getCurrentUser } from "@/features/auth/queries";
import { MiniCart } from "@/features/cart/mini-cart";
import {
  getIohPointBalanceForProfile,
  type IohPointBalanceSummary
} from "@/features/points/queries";

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
  let profile: Awaited<ReturnType<typeof getCurrentProfile>> = null;
  let points: IohPointBalanceSummary | null = null;
  let orderCount = 0;

  if (user) {
    [profile, points, orderCount] = await Promise.all([
      getCurrentProfile(),
      getIohPointBalanceForProfile(user.id),
      getOrderCountForProfile(user.id)
    ]);
  }

  const displayName = profile?.full_name || profile?.email || user?.email || "Hesabim";

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
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="inline-flex min-h-11 items-center gap-3 rounded-full border border-gold/25 bg-gold/10 px-3 py-2 text-left transition-colors hover:border-gold/45 hover:bg-gold/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    type="button"
                  >
                    <span className="hidden max-w-28 truncate text-sm font-semibold text-paper sm:inline">
                      {displayName}
                    </span>
                    <span className="mono-label rounded-full border border-gold/35 bg-ink/70 px-2 py-1 text-[0.56rem] text-gold">
                      IOH {points?.balance ?? 0}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 border-white/12 bg-ink/95 p-3">
                  <DropdownMenuLabel className="text-gold">Mini profil</DropdownMenuLabel>
                  <div className="px-2 py-2">
                    <p className="truncate text-sm font-semibold text-paper">{displayName}</p>
                    <p className="mt-1 truncate text-xs text-mist/70">
                      {profile?.email ?? user.email}
                    </p>
                  </div>
                  <div className="mx-2 my-2 rounded-md border border-gold/25 bg-gold/10 p-3">
                    <p className="mono-label text-[0.58rem] text-mist/70">IOH PUAN</p>
                    <p className="mt-1 font-display text-2xl text-gold">
                      {points?.balance ?? 0}
                    </p>
                  </div>
                  <div className="px-2 py-2 text-xs text-mist/75">
                    Son siparis sayisi: <span className="text-paper">{orderCount}</span>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/account">Hesabima git</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account/orders">Siparislerim</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <form action={signOut}>
                    <button
                      className="flex w-full rounded-sm px-2 py-1.5 text-left text-sm text-mist outline-none transition-colors hover:bg-secondary hover:text-paper focus:bg-secondary"
                      type="submit"
                    >
                      Cikis yap
                    </button>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild size="sm" variant="outline">
                  <Link href="/sign-in">Giris</Link>
                </Button>
                <Button asChild className="hidden sm:inline-flex" size="sm">
                  <Link href="/sign-up">Uye ol</Link>
                </Button>
              </>
            )}
            <Button asChild className="hidden xl:inline-flex" size="sm">
              <Link href="/books">Kitaplari Incele</Link>
            </Button>
            <MiniCart />
          </div>
        </Container>
      </header>
    </>
  );
}
