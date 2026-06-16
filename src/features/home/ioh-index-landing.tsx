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
      script.textContent = IOH_INDEX_MODULE;
      document.body.appendChild(script);
    })();
  }, []);

  const body = accountActionsHtml
    ? IOH_INDEX_BODY.replace(DEFAULT_ACCOUNT_ACTIONS_HTML, accountActionsHtml)
    : IOH_INDEX_BODY;

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
