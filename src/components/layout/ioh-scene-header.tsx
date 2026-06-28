"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import styles from "./ioh-scene-header.module.css";
import { signOut } from "@/features/auth/actions";

export type IohSceneHeaderUser = {
  displayName: string;
  points: number;
  email?: string;
  orderCount?: number;
} | null;

const navItems = [
  { href: "/", label: "Evren" },
  { href: "/books", label: "Kitaplar" },
  { href: "/encyclopedia", label: "Encyclopedia" },
  { href: "/token-sale", label: "Iohcoin" },
  { href: "/author", label: "Yazar Hakkinda" },
  { href: "/nft", label: "NFT Galeri" },
  { href: "/journal", label: "Gunluk/Blog" },
  { href: "/cart", label: "Sepet" },
  { href: "/contact", label: "Iletisim" }
] as const;

export function IohSceneHeader({ user }: { user: IohSceneHeaderUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEncOpen, setIsEncOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const encDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (encDropdownRef.current && !encDropdownRef.current.contains(event.target as Node)) {
        setIsEncOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className={`site-head is-solid ${styles.header}`}>
      <Link className="logo" href="/" data-hover="">
        <b>IOH</b>
        <span className={styles.logoText}>UNIVERSE</span>
      </Link>
      <nav className="site-nav" aria-label="Ana menu">
        {navItems.map((item) => {
          if (item.href === "/encyclopedia") {
            return (
              <div key={item.href} className={styles.navDropdownWrapper} ref={encDropdownRef}>
                <button
                  type="button"
                  className={styles.navButton}
                  onClick={() => setIsEncOpen(!isEncOpen)}
                >
                  {item.label} ▾
                </button>
                {isEncOpen && (
                  <div className={styles.navDropdownMenu}>
                    <Link href="/encyclopedia" onClick={() => setIsEncOpen(false)}>
                      Encyclopedia Index
                    </Link>
                    <div className={styles.navDropdownDivider} />
                    <Link href="/encyclopedia/characters" onClick={() => setIsEncOpen(false)}>
                      Characters
                    </Link>
                    <Link href="/encyclopedia/corporations" onClick={() => setIsEncOpen(false)}>
                      Corporations
                    </Link>
                    <Link href="/encyclopedia/swos" onClick={() => setIsEncOpen(false)}>
                      SWOS
                    </Link>
                    <Link href="/encyclopedia/ai" onClick={() => setIsEncOpen(false)}>
                      AI System
                    </Link>
                  </div>
                )}
              </div>
            );
          }
          return (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className={`head-actions ${styles.actions}`}>
        {user ? (
          <div className={styles.profileWrapper} ref={dropdownRef}>
            <button
              className={`head-cta ${styles.cta} ${styles.userName}`}
              type="button"
              onClick={() => setIsOpen(!isOpen)}
            >
              {user.displayName}
            </button>
            <Link className={`head-cta ${styles.cta}`} href="/account" data-hover="" data-magnet="">
              IOH Puan: {user.points}
            </Link>

            {isOpen && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>MINI PROFILE</div>
                <div className={styles.dropdownUser}>
                  <div className={styles.dropdownName}>{user.displayName}</div>
                  <div className={styles.dropdownEmail}>{user.email || ""}</div>
                </div>

                <div className={styles.pointsBox}>
                  <div className={styles.pointsLabel}>IOH PUAN</div>
                  <div className={styles.pointsVal}>{user.points}</div>
                </div>

                <div className={styles.orderCount}>
                  Son siparis sayisi: <span>{user.orderCount ?? 0}</span>
                </div>

                <div className={styles.dropdownDivider} />

                <Link className={styles.dropdownLink} href="/account" onClick={() => setIsOpen(false)}>
                  Hesabima git
                </Link>
                <Link className={styles.dropdownLink} href="/account" onClick={() => setIsOpen(false)}>
                  Siparislerim
                </Link>

                <div className={styles.dropdownDivider} />

                <form action={signOut} onSubmit={() => setIsOpen(false)}>
                  <button className={styles.logoutButton} type="submit">
                    Cikis yap
                  </button>
                </form>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link className={`head-cta ${styles.cta}`} href="/sign-in" data-hover="" data-magnet="">
              Giris
            </Link>
            <Link className={`head-cta ${styles.cta}`} href="/sign-up" data-hover="" data-magnet="">
              Uye Ol
            </Link>
          </>
        )}
        <Link
          className={`head-cta ${styles.cta} ${styles.collectionAction}`}
          href="/collections"
          data-hover=""
          data-magnet=""
        >
          Koleksiyona Gir
        </Link>
      </div>
    </header>
  );
}
