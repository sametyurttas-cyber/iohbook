# SEO, Performance, Accessibility Report

## Scope

Reviewed and improved the public storefront with a Lighthouse-style pass focused on:

- Metadata and canonical URLs
- Open Graph and social sharing
- Sitemap and robots discovery
- JSON-LD structured data
- Image sizing and rendering stability
- Font loading and layout shift risk
- Keyboard/skip navigation
- Tappable target sizing

## SEO Changes

- Added shared SEO helpers in `src/lib/seo.ts`.
- Added canonical metadata and Open Graph/Twitter metadata for key pages.
- Added automatic Open Graph image route at `/opengraph-image`.
- Added `/sitemap.xml` with static public routes and published book detail URLs.
- Added `/robots.txt` that allows public content and blocks account, admin, checkout, cart, auth, and API paths.
- Added JSON-LD:
  - `WebSite`, `Organization`, and `Person` on the home page
  - `CollectionPage` on `/books` and `/collections`
  - `Book`, `Product`, and `BreadcrumbList` on book detail pages
  - `FAQPage` on `/faq` when FAQ content exists
  - `Blog` on `/journal`
- Added `/collections` and `/journal` pages so public navigation no longer points to missing routes.

## Performance Changes

- Replaced CMS-rendered raw `img` elements with `next/image`.
- Added stable aspect-ratio containers for large CMS images to reduce layout shift.
- Prioritized the hero image and first catalog cover where appropriate.
- Removed assumed external display fonts and switched to a system font stack to avoid font-loading layout shifts.
- Kept product/catalog data cached with existing 300-second revalidation.

## Accessibility Changes

- Added a skip link and `#main-content` targets across public, account, admin, auth, and utility pages.
- Increased button, header link, footer link, breadcrumb, and tab trigger hit areas toward 44px tappable targets.
- Added/kept focus-visible ring styles for key navigation controls.
- Verified product detail images have alt text in the rendered DOM.

## Local Verification

Commands:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Manual/browser checks:

- `/`, `/books`, `/books/code-god`, `/robots.txt`, `/sitemap.xml`, and `/opengraph-image` returned HTTP 200 locally.
- `/books/code-god` rendered:
  - canonical URL
  - Open Graph image
  - `Book` + `Product` JSON-LD
  - `BreadcrumbList` JSON-LD
  - skip target
  - no visible tappable targets below 44px in the checked viewport
  - no rendered images missing alt text

## Remaining Risks

- Real Lighthouse scores should be captured on Vercel Preview and Production because Supabase media latency, CDN behavior, and production env values affect final numbers.
- CMS admins can still upload overly large images; add upload-time compression or dimension validation before launch.
- Broad remote image support is enabled for CMS flexibility. If admins will only use Supabase Storage, narrow `next.config.ts` image remote patterns before production hardening.
