"use client";

import { useState } from "react";
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
  { label: "Encyclopedia", href: "/encyclopedia" },
  { label: "IOHCoin", href: "/token-sale" },
  { label: "Yazar Hakkinda", href: "/author" },
  { label: "NFT Galeri", href: "/nft" },
  { label: "Gunluk/Blog", href: "/journal" },
  { label: "Sepet", href: "/cart" },
  { label: "Iletisim", href: "/contact" }
];

export function MobileNav() {
  const [encExpanded, setEncExpanded] = useState(false);

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
      <SheetContent className="w-[86vw] max-w-sm border-white/10 bg-ink/95 backdrop-blur-2xl" side="right">
        <SheetHeader>
          <SheetTitle className="text-gold font-display text-sm tracking-wider uppercase">// IOH Navigasyon</SheetTitle>
        </SheetHeader>
        <nav aria-label="Mobil navigasyon" className="mt-8 grid gap-2 overflow-y-auto max-h-[75vh] pr-1">
          {navItems.map((item) => {
            if (item.href === "/encyclopedia") {
              return (
                <div key={item.href} className="flex flex-col gap-1.5">
                  <button
                    onClick={() => setEncExpanded(!encExpanded)}
                    className="mono-label flex min-h-12 w-full items-center justify-between rounded-full border border-white/10 bg-white/[0.035] px-4 text-[0.68rem] text-mist transition-colors hover:border-gold/45 hover:bg-gold/10 hover:text-gold focus-visible:outline-none cursor-pointer"
                  >
                    <span>{item.label}</span>
                    <span 
                      className="text-[0.5rem] transition-transform duration-200 opacity-70"
                      style={{ transform: encExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                    >
                      ▼
                    </span>
                  </button>
                  {encExpanded && (
                    <div className="flex flex-col gap-1.5 pl-4 border-l border-white/10 ml-4 mt-0.5">
                      <SheetClose asChild>
                        <Link
                          className="mono-label flex min-h-10 items-center rounded-full border border-white/5 bg-white/[0.015] px-4 text-[0.65rem] text-mist/85 hover:text-gold"
                          href="/encyclopedia"
                        >
                          Encyclopedia Index
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          className="mono-label flex min-h-10 items-center rounded-full border border-white/5 bg-white/[0.015] px-4 text-[0.65rem] text-mist/85 hover:text-gold"
                          href="/encyclopedia/characters"
                        >
                          Characters
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          className="mono-label flex min-h-10 items-center rounded-full border border-white/5 bg-white/[0.015] px-4 text-[0.65rem] text-mist/85 hover:text-gold"
                          href="/encyclopedia/corporations"
                        >
                          Corporations
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          className="mono-label flex min-h-10 items-center rounded-full border border-white/5 bg-white/[0.015] px-4 text-[0.65rem] text-mist/85 hover:text-gold"
                          href="/encyclopedia/swos"
                        >
                          SWOS
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          className="mono-label flex min-h-10 items-center rounded-full border border-white/5 bg-white/[0.015] px-4 text-[0.65rem] text-mist/85 hover:text-gold"
                          href="/encyclopedia/ai"
                        >
                          AI System
                        </Link>
                      </SheetClose>
                    </div>
                  )}
                </div>
              );
            }
            return (
              <SheetClose asChild key={item.href}>
                <Link
                  className="mono-label flex min-h-12 items-center rounded-full border border-white/10 bg-white/[0.035] px-4 text-[0.68rem] text-mist transition-colors hover:border-gold/45 hover:bg-gold/10 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  href={item.href}
                >
                  {item.label}
                </Link>
              </SheetClose>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
