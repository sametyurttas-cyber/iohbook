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

export function IohIndexLanding({ accountActionsHtml }: IohIndexLandingProps) {
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
