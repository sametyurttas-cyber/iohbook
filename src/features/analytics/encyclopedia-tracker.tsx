"use client";

import { useEffect } from "react";
import { trackEvent } from "@/features/analytics/client";

const SELECTOR = "[data-analytics-encyclopedia]";

export function EncyclopediaTracker() {
  useEffect(() => {
    const seen = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          const entityType = element.dataset.analyticsEntityType;
          const entitySlug = element.dataset.analyticsEntitySlug;
          const entityTitle = element.dataset.analyticsEntityTitle;
          if (!entityType || !entitySlug || !entityTitle) continue;

          const key = `${entityType}:${entitySlug}`;
          if (seen.has(key)) continue;
          seen.add(key);
          observer.unobserve(element);
          void trackEvent("encyclopedia_view", {
            entity_slug: entitySlug,
            entity_title: entityTitle,
            entity_type: entityType
          });
        }
      },
      { threshold: 0.45 }
    );

    const elements = document.querySelectorAll<HTMLElement>(SELECTOR);
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return null;
}

