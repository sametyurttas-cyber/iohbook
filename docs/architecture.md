# Architecture Decisions

> Historical baseline. Current production truth and document precedence live in
> `docs/brain/current-state.md` and `docs/brain/README.md`.

## Purpose

This project is a boutique author-brand commerce site for IOH / Samet Yurttas. It must feel like a premium literary and cosmic technology brand on the public side, while keeping a professional commerce core behind the scenes.

The first production target is a web-first MVP for physical book sales and book variants. Digital products, NFT-ready features, and native mobile are later phases. Token or coin sales are not part of the MVP.

## Target Stack

- Next.js App Router for storefront, account, checkout, admin, and API routes.
- TypeScript for application and domain code.
- Tailwind CSS for design tokens and layout.
- shadcn/ui and Radix UI for accessible primitives.
- Supabase Postgres for relational commerce data.
- Supabase Auth for customer and staff identity.
- Supabase Storage for book covers, public media, admin uploads, and later digital files.
- iyzico CheckoutForm for Turkey-focused hosted payment.
- Vercel for preview and production deployment.

## Core Modules

### Storefront

Public brand and commerce pages:

- Home page
- Books listing
- Book detail pages
- Collection or universe pages
- Author/about page
- Cart
- Checkout
- Order confirmation

Storefront pages should use the IOH visual language: black base, cosmic light, premium typography, and book-specific accents.

### Commerce Core

Commerce is variant-driven, not only product-driven.

Core entities:

- Product
- Product variant
- Inventory item
- Cart
- Cart item
- Order
- Order item
- Payment attempt
- Shipment
- Discount rule
- Audit log

Physical books and their variants are MVP scope. Example variants:

- Standard edition
- Signed edition
- Limited edition
- Box set
- Preorder

### Admin

The admin area lives under protected `/admin` routes.

Admin modules:

- Dashboard
- Products and variants
- Inventory
- Orders
- Fulfillment
- Content pages
- Media management
- Discounts
- Audit log

Admin UI should prioritize dense, scannable operations over marketing-style presentation.

### Auth And Access

Supabase Auth is the identity layer.

Roles:

- Owner
- Admin Ops
- Editor
- Fulfillment
- Customer
- Guest

Authorization must be enforced server-side and, where data is exposed through Supabase, through RLS policies. UI visibility alone is not sufficient.

### Payments

MVP payment provider is iyzico CheckoutForm.

Rules:

- Do not build a custom credit card form in MVP.
- Do not use production payment credentials in the repo.
- Checkout success redirect is only a UX signal.
- Final order payment state must be verified by backend retrieve and/or webhook logic.
- Payment handlers must be idempotent.

### Storage

Initial storage buckets:

- `public-media` for public covers and brand images.
- `admin-uploads` for admin-managed assets.
- `private-exports` for private reports and exports.
- `digital-deliveries` for later digital products.

Private files must use signed URLs or server-mediated access.

### Content

The site needs a light CMS layer for:

- Home page blocks
- Author/about content
- Book universe copy
- Campaign copy
- Legal pages
- FAQ

Rich content should be structured enough to render safely in the storefront.

## Phase Plan

### Phase 0: Foundation

Decisions, documentation, project scaffold, design tokens, base layout, and local development flow.

### Phase 1: MVP Physical Commerce

Public storefront, physical book variants, cart, checkout, iyzico sandbox flow, order records, basic account area, and admin product/order operations.

### Phase 2: Digital Products

Digital variants, entitlements, secure download area, signed URLs, download audit, and customer digital library.

### Phase 3: NFT-Ready

Wallet linking, NFT metadata model, allowlist or claim preparation, and collection gallery. No mint sale or token payment without legal approval.

### Phase 4: Native Mobile

Optional Expo app after the web core is stable. Native checkout should not bypass store payment rules.

## Boundaries

In MVP:

- Build physical book commerce.
- Support variants and stock.
- Use hosted payment only.
- Keep admin focused on products, stock, orders, and content.
- Use placeholders for legal text until professionally reviewed.

Out of MVP:

- Digital file delivery.
- NFT minting or sales.
- Token or coin sale.
- Native mobile app.
- Marketplace features.
- ERP, e-invoice, and shipping carrier automation unless added by a later prompt.

## Risks

- Payment state mistakes can create paid orders without verified payment.
- Insufficient RLS can expose customer or admin data.
- Variant and inventory shortcuts can make limited editions oversell.
- Legal pages and consent flows require professional review before launch.
- Live iyzico, Supabase service role, and storage credentials must never be committed.
- NFT and token work can trigger legal and regulatory obligations outside normal ecommerce.

## Definition Of Done

Architecture work is done when:

- Module boundaries are documented.
- MVP and future phases are separated.
- Payment, auth, storage, admin, and content responsibilities are clear.
- Explicit out-of-scope items are listed.
- Risks are recorded and visible for future prompts.
