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

export function IohIndexLanding() {
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

  return (
    <div
      dangerouslySetInnerHTML={{ __html: IOH_INDEX_BODY }}
      suppressHydrationWarning
    />
  );
}

export function IohIndexStyles() {
  return <style dangerouslySetInnerHTML={{ __html: IOH_INDEX_CSS }} />;
}
