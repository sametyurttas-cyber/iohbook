"use client";

import Link from "next/link";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";

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

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger
        aria-label="Menüyü aç"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/14 bg-white/[0.045] text-paper transition-colors hover:border-gold/45 hover:bg-gold/10 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
        type="button"
      >
        <svg
          aria-hidden="true"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            d="M4 7h16M4 12h16M4 17h16"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      </SheetTrigger>
      <SheetContent className="w-[86vw] max-w-sm" side="right">
        <SheetHeader>
          <SheetTitle>IOH Navigasyon</SheetTitle>
        </SheetHeader>
        <nav aria-label="Mobil navigasyon" className="mt-8 grid gap-2">
          {navItems.map((item) => (
            <SheetClose asChild key={item.href}>
              <Link
                className="mono-label flex min-h-12 items-center rounded-full border border-white/10 bg-white/[0.035] px-4 text-[0.68rem] text-mist transition-colors hover:border-gold/45 hover:bg-gold/10 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                href={item.href}
              >
                {item.label}
              </Link>
            </SheetClose>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
