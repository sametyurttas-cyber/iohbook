"use client";

import { useEffect } from "react";
import { IOH_INDEX_BODY, IOH_INDEX_CSS, IOH_INDEX_MODULE } from "@/features/home/ioh-index-html";

declare global {
  interface Window {
    __iohIndexLandingLoaded?: boolean;
  }
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);

    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

type IohIndexLandingProps = {
  accountActionsHtml?: string;
  user?: {
    displayName: string;
    points: number;
    email?: string;
    orderCount?: number;
  } | null;
};

const DEFAULT_ACCOUNT_ACTIONS_HTML =
  '<div class="head-actions"><a class="head-cta" href="/sign-in" data-hover data-magnet>Giriş</a><a class="head-cta" href="/collections" data-hover data-magnet>Koleksiyona Gir</a></div>';

const INDEX_CHAPTER_ORDER = [
  { id: "godcode", number: "01", roman: "I" },
  { id: "codewar", number: "02", roman: "II" },
  { id: "sysgod", number: "03", roman: "III" }
] as const;

function reorderIndexBody(source: string) {
  const chapterPattern =
    /<section class="chapter" id="(godcode|sysgod|codewar)"[\s\S]*?<\/section>/g;
  const matches = [...source.matchAll(chapterPattern)];

  if (matches.length !== INDEX_CHAPTER_ORDER.length || matches.some((match) => match.index === undefined)) {
    return source;
  }

  const sections = new Map(matches.map((match) => [match[1], match[0]]));
  const orderedSections = INDEX_CHAPTER_ORDER.map((chapter, index) => {
    const section = sections.get(chapter.id);

    if (!section) {
      return "";
    }

    const numberedSection = section
      .replace(
        /(<span class="ch-index">[^<]*?)([IVX]+)(\s*\/\s*III<\/span>)/,
        `$1${chapter.roman}$3`
      )
      .replace(/<div class="ghost">\d+<\/div>/, `<div class="ghost">${chapter.number}</div>`)
      .replace(
        /(<p class="kicker mono ch-kicker">[^<]*?)(\d+)([^<]*<\/p>)/,
        `$1${chapter.number}$3`
      );

    return index === 0
      ? numberedSection
      : `<!-- ${chapter.number} / ${chapter.id.toUpperCase()} -->\n  ${numberedSection}`;
  }).join("\n\n  ");
  const firstMatch = matches[0];
  const lastMatch = matches.at(-1);

  if (firstMatch.index === undefined || !lastMatch || lastMatch.index === undefined) {
    return source;
  }

  let body =
    source.slice(0, firstMatch.index) +
    orderedSections +
    source.slice(lastMatch.index + lastMatch[0].length);

  const railPattern =
    /<a href="#(godcode|sysgod|codewar)" data-rail="(?:godcode|sysgod|codewar)"[\s\S]*?<\/a>/g;
  const railMatches = [...body.matchAll(railPattern)];

  if (railMatches.length === INDEX_CHAPTER_ORDER.length) {
    const railLinks = new Map(railMatches.map((match) => [match[1], match[0]]));
    const orderedRailLinks = INDEX_CHAPTER_ORDER.map((chapter) =>
      railLinks
        .get(chapter.id)
        ?.replace(/(<span class="r-tag">)\d+ \//, `$1${chapter.number} /`)
    ).join("\n  ");
    const firstRail = railMatches[0];
    const lastRail = railMatches.at(-1);

    if (firstRail.index !== undefined && lastRail?.index !== undefined) {
      body =
        body.slice(0, firstRail.index) +
        orderedRailLinks +
        body.slice(lastRail.index + lastRail[0].length);
    }
  }

  return body.replaceAll(
    "GODCODE <i>/</i> SYSGOD <i>/</i> CODEWAR",
    "GODCODE <i>/</i> CODEWAR <i>/</i> SYSGOD"
  );
}

function reorderIndexModule(source: string) {
  return source
    .replace(
      "const FORMS  = [formGalaxy(), formHelix(), formLattice(), formShards(), formCoin()]",
      "const FORMS  = [formGalaxy(), formHelix(), formShards(), formLattice(), formCoin()]"
    )
    .replace(
      /  (new THREE\.Color\('#6f9bff'\),[^\n]*)\n  (new THREE\.Color\('#ff5b5b'\),[^\n]*)/,
      "  $2\n  $1"
    )
    .replace(
      "const SPINS = [0.05, 0.09, 0.04, 0.07, 0.5]",
      "const SPINS = [0.05, 0.09, 0.07, 0.04, 0.5]"
    )
    .replace(
      "const phaseEls = ['#evren', '#godcode', '#sysgod', '#codewar', '#iohcoin']",
      "const phaseEls = ['#evren', '#godcode', '#codewar', '#sysgod', '#iohcoin']"
    );
}

export function IohIndexLanding({ accountActionsHtml, user }: IohIndexLandingProps) {
  useEffect(() => {
    if (window.__iohIndexLandingLoaded) {
      return;
    }

    window.__iohIndexLandingLoaded = true;

    void (async () => {
      await loadScript("https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js");
      await loadScript("https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js");
      await loadScript("https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js");

      const script = document.createElement("script");
      script.type = "module";
      script.textContent = reorderIndexModule(IOH_INDEX_MODULE);
      document.body.appendChild(script);
    })();
  }, []);

  useEffect(() => {
    if (!user) return;

    const timer = setTimeout(() => {
      const userBtn = document.querySelector('.head-actions a[href="/account"]');
      if (!userBtn) return;

      const style = document.createElement('style');
      style.textContent = `
        .index-profile-dropdown {
          position: fixed;
          top: 80px;
          right: clamp(1.2rem, 4vw, 3.4rem);
          width: 320px;
          background: rgba(5, 6, 10, 0.95);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(231, 197, 116, 0.25);
          border-radius: 12px;
          padding: 1.5rem;
          z-index: 1000;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05);
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease;
          font-family: "Space Grotesk", sans-serif;
        }
        .index-profile-dropdown.is-open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        .index-dropdown-header {
          font-family: "JetBrains Mono", monospace;
          font-size: 0.65rem;
          color: #e7c574;
          letter-spacing: 0.2em;
          margin-bottom: 0.75rem;
        }
        .index-dropdown-user {
          margin-bottom: 1.25rem;
        }
        .index-dropdown-name {
          font-size: 1.1rem;
          font-weight: 500;
          color: #f2efe8;
          line-height: 1.2;
        }
        .index-dropdown-email {
          font-size: 0.8rem;
          color: #8a8fa0;
          margin-top: 0.25rem;
        }
        .index-points-box {
          background: rgba(231, 197, 116, 0.07);
          border: 1px solid rgba(231, 197, 116, 0.15);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          margin-bottom: 1.25rem;
        }
        .index-points-label {
          font-family: "JetBrains Mono", monospace;
          font-size: 0.6rem;
          color: #8a8fa0;
          letter-spacing: 0.15em;
        }
        .index-points-val {
          font-size: 1.4rem;
          font-weight: 700;
          color: #e7c574;
          margin-top: 0.25rem;
        }
        .index-order-count {
          font-size: 0.8rem;
          color: #8a8fa0;
          margin-bottom: 1.25rem;
        }
        .index-order-count span {
          color: #f2efe8;
          font-weight: 500;
        }
        .index-dropdown-divider {
          height: 1px;
          background: rgba(242, 239, 232, 0.12);
          margin: 0.75rem 0;
        }
        .index-dropdown-link {
          display: block;
          font-size: 0.9rem;
          color: #f2efe8;
          text-decoration: none;
          padding: 0.5rem 0;
          transition: color 0.2s ease;
        }
        .index-dropdown-link:hover {
          color: #e7c574;
        }
        .index-logout-form {
          margin-top: 0.75rem;
        }
        .index-logout-btn {
          width: 100%;
          background: linear-gradient(135deg, rgba(255, 91, 91, 0.1), rgba(255, 91, 91, 0.03));
          border: 1px solid rgba(255, 91, 91, 0.25);
          border-radius: 8px;
          color: #ff5b5b;
          font-family: "JetBrains Mono", monospace;
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 0.75rem;
          cursor: pointer !important;
          transition: all 0.3s ease;
        }
        .index-logout-btn:hover {
          background: rgba(255, 91, 91, 0.18);
          border-color: #ff5b5b;
        }
      `;
      document.head.appendChild(style);

      const dropdown = document.createElement('div');
      dropdown.className = 'index-profile-dropdown';
      dropdown.innerHTML = `
        <div class="index-dropdown-header">MINI PROFILE</div>
        <div class="index-dropdown-user">
          <div class="index-dropdown-name">${user.displayName}</div>
          <div class="index-dropdown-email">${user.email || ''}</div>
        </div>
        <div class="index-points-box">
          <div class="index-points-label">IOH PUAN</div>
          <div class="index-points-val">${user.points}</div>
        </div>
        ${user.orderCount !== undefined ? `
        <div class="index-order-count">
          Son sipariş sayısı: <span>${user.orderCount}</span>
        </div>
        ` : ''}
        <div class="index-dropdown-divider"></div>
        <a class="index-dropdown-link" href="/account">Hesabıma git</a>
        <a class="index-dropdown-link" href="/account">Siparişlerim</a>
        <div class="index-dropdown-divider"></div>
        <form class="index-logout-form" action="/api/auth/sign-out" method="POST">
          <button class="index-logout-btn" type="submit">Çıkış yap</button>
        </form>
      `;
      document.body.appendChild(dropdown);

      const toggleDropdown = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        dropdown.classList.toggle('is-open');
      };

      userBtn.addEventListener('click', toggleDropdown);

      const closeDropdown = (e: Event) => {
        if (!dropdown.contains(e.target as Node) && e.target !== userBtn) {
          dropdown.classList.remove('is-open');
        }
      };

      document.addEventListener('click', closeDropdown);

      return () => {
        userBtn.removeEventListener('click', toggleDropdown);
        document.removeEventListener('click', closeDropdown);
        dropdown.remove();
        style.remove();
      };
    }, 100);

    return () => clearTimeout(timer);
  }, [user]);

  const bodyWithAccount = accountActionsHtml
    ? IOH_INDEX_BODY.replace(DEFAULT_ACCOUNT_ACTIONS_HTML, accountActionsHtml)
    : IOH_INDEX_BODY;
  const body = reorderIndexBody(bodyWithAccount);

  return (
    <div
      dangerouslySetInnerHTML={{ __html: body }}
      suppressHydrationWarning
    />
  );
}

export function IohIndexStyles() {
  return <style dangerouslySetInnerHTML={{ __html: IOH_INDEX_CSS }} />;
}
