# System Map

## Route Ownership

| Area | Routes | Primary code |
| --- | --- | --- |
| Brand/storefront | `/`, `/books`, `/books/[slug]`, `/collections`, `/author`, `/journal`, `/contact` | `src/app`, `src/features/home`, `src/features/catalog`, `src/features/content` |
| Cart/checkout | `/cart`, `/checkout`, `/checkout/success` | `src/features/cart`, `src/features/checkout` |
| Payment APIs | `/api/payments/shopier/*`, `/api/iyzico/*` | `src/app/api`, `src/features/checkout` |
| Customer account | `/account/*` | `src/features/account`, `src/features/auth`, `src/features/entitlements`, `src/features/points` |
| Admin | `/admin/*` | `src/features/products`, `orders`, `admin-users`, `content`, `media`, `nft`, `token-sale` |
| Web3-facing | `/nft/*`, `/token-sale`, `/account/wallets` | `src/features/nft`, `wallets`, `web3`, `token-sale` |

## Commerce Ownership

- Catalog reads: `src/features/catalog/queries.ts`.
- Cart mutation and validation: `src/features/cart/actions.ts` and
  `cart-rules.ts`.
- Checkout creation: `src/features/checkout/actions.ts` plus atomic Supabase RPC.
- Provider adapters: `src/features/checkout/providers/`.
- Shopier parsing and verification: `shopier.ts` and `shopier-confirmation.ts`.
- iyzico verification: `payment-confirmation.ts` and `iyzico-webhook.ts`.
- Payment transitions: `payment-state.ts`; change only with explicit review.
- Digital access: `src/features/entitlements/`.
- IOH points: `src/features/points/`.
- Order operations: `src/features/orders/`.
- Email events/templates: `src/features/email/`.

## Data Ownership

The schema source is `supabase/migrations/`; TypeScript projections live in
`src/types/database.ts`.

Important groups:

- Identity: `profiles`, `staff_roles`, `addresses`.
- Catalog: `products`, `product_variants`, `product_media`, `inventory_items`.
- Commerce: `carts`, `cart_items`, `orders`, `order_items`, `payment_attempts`.
- Delivery: `entitlements`, private `digital-deliveries` storage.
- Rewards: `ioh_point_balances`, `ioh_point_ledger`.
- Operations: `fulfillment_shipments`, `email_events`, `audit_logs`.
- Web3 readiness: `user_wallets`, NFT and token allocation tables.

## Shared Infrastructure

- Supabase clients: `src/lib/supabase/`.
- Observability: `src/lib/observability.ts`, Sentry config, Vercel instrumentation.
- Public layout: `src/components/layout/`.
- UI primitives: `src/components/ui/`.
- Design tokens: `tailwind.config.ts`, `src/app/globals.css`.
- Environment contract: `.env.example`; secret values never belong in docs.
