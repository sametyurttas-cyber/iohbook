"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/features/analytics/client";

export function CatalogViewTracker({ productId, productSlug }: { productId: string; productSlug: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    const metadata = { product_id: productId, product_slug: productSlug };
    void trackEvent("product_view", metadata);
    void trackEvent("book_view", metadata);
  }, [productId, productSlug]);

  return null;
}

