"use client";

import { useState } from "react";
import Link from "next/link";

const navItems = [
  { label: "Evren", href: "/" },
  { label: "Kitaplar", href: "/books" },
  { label: "Encyclopedia", href: "/encyclopedia" },
  { label: "Iohcoin", href: "/token-sale" },
  { label: "Yazar Hakkında", href: "/author" },
  { label: "NFT Galeri", href: "/nft" },
  { label: "Günlük/Blog", href: "/journal" },
  { label: "Sepet", href: "/cart" },
  { label: "İletişim", href: "/contact" }
];

export type MobileNavUser = {
  displayName: string;
  points: number;
  email?: string;
  orderCount?: number;
} | null;

export function MobileNav({ user = null }: { user?: MobileNavUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [encExpanded, setEncExpanded] = useState(false);

  return (
    <>
      {/* Trigger Button - matches index hamburger exactly */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Menüyü aç"
        className="inline-flex items-center justify-center text-[#f2efe8] hover:text-[#e7c574] transition-colors focus:outline-none lg:hidden cursor-pointer bg-transparent border-0 p-0"
      >
        <svg fill="none" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {/* Overlay backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* Drawer Panel - matches .mobile-drawer styling exactly */}
      <div 
        className={`fixed top-0 right-0 w-[300px] h-screen bg-[#05060a] z-[10001] p-8 flex flex-col gap-8 transition-transform duration-[400ms] ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center flex-shrink-0">
          <span className="font-mono text-[0.7rem] tracking-[0.2em] text-[#8a8fa0] uppercase">// IOH Navigasyon</span>
          <button 
            onClick={() => setIsOpen(false)}
            className="background-none border-none text-[#f2efe8] hover:text-[#e7c574] cursor-pointer transition-colors p-0 bg-transparent"
            aria-label="Menüyü Kapat"
          >
            <svg fill="none" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav aria-label="Mobil navigasyon" className="flex flex-col gap-[1.5rem] text-left">
          {navItems.map((item) => {
            if (item.href === "/encyclopedia") {
              return (
                <div key={item.href} className="flex flex-col gap-3">
                  <button
                    onClick={() => setEncExpanded(!encExpanded)}
                    className="font-display font-semibold flex w-full items-center justify-between text-[0.95rem] text-[#f2efe8] transition-colors hover:text-[#e7c574] focus:outline-none cursor-pointer bg-transparent border-0 p-0"
                  >
                    <span>{item.label}</span>
                    <span 
                      className="text-[0.55rem] transition-transform duration-200 opacity-60"
                      style={{ transform: encExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                    >
                      ▼
                    </span>
                  </button>
                  {encExpanded && (
                    <div className="flex flex-col gap-3 pl-4 border-l border-white/10 ml-1 mt-1">
                      <Link
                        onClick={() => setIsOpen(false)}
                        className="font-display font-medium flex text-[0.85rem] text-[#f2efe8]/70 hover:text-[#e7c574] text-decoration-none"
                        href="/encyclopedia"
                      >
                        Encyclopedia Index
                      </Link>
                      <Link
                        onClick={() => setIsOpen(false)}
                        className="font-display font-medium flex text-[0.85rem] text-[#f2efe8]/70 hover:text-[#e7c574] text-decoration-none"
                        href="/encyclopedia/characters"
                      >
                        Characters
                      </Link>
                      <Link
                        onClick={() => setIsOpen(false)}
                        className="font-display font-medium flex text-[0.85rem] text-[#f2efe8]/70 hover:text-[#e7c574] text-decoration-none"
                        href="/encyclopedia/corporations"
                      >
                        Corporations
                      </Link>
                      <Link
                        onClick={() => setIsOpen(false)}
                        className="font-display font-medium flex text-[0.85rem] text-[#f2efe8]/70 hover:text-[#e7c574] text-decoration-none"
                        href="/encyclopedia/swos"
                      >
                        SWOS
                      </Link>
                      <Link
                        onClick={() => setIsOpen(false)}
                        className="font-display font-medium flex text-[0.85rem] text-[#f2efe8]/70 hover:text-[#e7c574] text-decoration-none"
                        href="/encyclopedia/ai"
                      >
                        AI System
                      </Link>
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={item.href}
                onClick={() => setIsOpen(false)}
                className="font-display font-semibold flex text-[0.95rem] text-[#f2efe8] transition-colors hover:text-[#e7c574] focus:outline-none text-decoration-none"
                href={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User Session list items at the bottom */}
        <div className="mt-auto pt-6 border-t border-dashed border-white/10 flex flex-col gap-5 pl-1 text-left">
          {user ? (
            <>
              <div className="mono-label text-[0.52rem] text-[#e7c574]/60 uppercase tracking-widest mb-1">
                // Oturum: {user.displayName}
              </div>
              <div className="mono-label flex text-[0.82rem] tracking-widest text-[#f2efe8]/60 select-none">
                IOH PUAN: {user.points}
              </div>
              <Link
                onClick={() => setIsOpen(false)}
                className="mono-label flex text-[0.82rem] tracking-widest text-[#f2efe8] transition-colors hover:text-[#e7c574] focus:outline-none text-decoration-none"
                href="/collections"
              >
                Koleksiyona Gir
              </Link>
              <form action="/api/auth/sign-out" method="POST" className="m-0">
                <button
                  type="submit"
                  className="mono-label flex w-full text-[0.82rem] tracking-widest text-red-400 hover:text-red-500 transition-colors cursor-pointer text-left focus:outline-none bg-transparent border-0 p-0"
                >
                  Oturumu Kapat
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                onClick={() => setIsOpen(false)}
                className="mono-label flex text-[0.82rem] tracking-widest text-[#f2efe8] transition-colors hover:text-[#e7c574] focus:outline-none text-decoration-none"
                href="/collections"
              >
                Koleksiyona Gir
              </Link>
              <Link
                onClick={() => setIsOpen(false)}
                className="mono-label flex text-[0.82rem] tracking-widest text-[#f2efe8] transition-colors hover:text-[#e7c574] focus:outline-none text-decoration-none"
                href="/sign-in"
              >
                Giriş
              </Link>
              <Link
                onClick={() => setIsOpen(false)}
                className="mono-label flex text-[0.82rem] tracking-widest text-[#f2efe8] transition-colors hover:text-[#e7c574] focus:outline-none text-decoration-none"
                href="/sign-up"
              >
                Üye Ol
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
