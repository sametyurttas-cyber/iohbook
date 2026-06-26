# Session Handoff

Last updated: 2026-06-26

## Current Status

- Local dev runs with the bundled Node path; use `agy-node.cmd node_modules/next/dist/bin/next dev` or `agy-node.cmd node_modules/vitest/vitest.mjs run`.
- Production is deployed on Vercel at `https://www.iohcoin.com`.
- `next build` cannot run locally in Antigravity sandbox — Turbopack requires spawning a real `node` process which is unavailable. Vercel deployment is unaffected.

## Recently Completed Work (not yet deployed)

### Token Sale Shopier Callback + Webhook Backend
- Created `/payment/success` and `/payment/failed` pages.
- Updated callback route to redirect to the correct pages (`/payment/success` for token sale, `/checkout/success` for books).
- Implemented strict PAT REST verification in callback (POST), webhook, and GET redirect redirection (query-on-return).
- Created `confirmShopierPaymentByOrderId` to fetch and verify payments securely via Shopier API using PAT when user returns via GET redirect.
- Token allocation approval (`approveTokenAllocationsForPaidOrder`) integrated idempotently.
- Email isolation: `sendDigitalDeliveryReadyEmail` skips `claimable` fulfillment items.
- Audit log inserted on every payment status transition.
- All unit tests passing, 0 typecheck errors, 0 lint errors.

### Token Sale Limit Fix
- 24-hour expiry window for pending allocations in limit calculation (actions.ts + migration).

## Pending Migrations (apply to Supabase before deploy)

1. `supabase/migrations/20260623120000_referral_foundation.sql`
2. `supabase/migrations/20260625100000_token_allocations_optional_wallet.sql`
3. `supabase/migrations/20260625210000_expire_pending_token_allocations.sql`

## Open Risks

- **Shopier Webhook Subscription**: The webhook won't trigger until a subscription is explicitly registered on the Shopier REST API using:
  ```bash
  curl --request POST \
    --url https://api.shopier.com/v1/webhooks \
    --header 'Authorization: Bearer <PAT_TOKENIN>' \
    --header 'Content-Type: application/json' \
    --data '{
      "event": "order.created",
      "notificationUrl": "https://www.iohcoin.com/api/payments/shopier/webhook"
    }'
  ```
  The returned token must be set as `SHOPIER_WEBHOOK_TOKEN` on Vercel.
- The working tree has many uncommitted changes from recent feature work.
- Supabase migrations above must be applied before deploying token sale features to production.
- `audit_logs` table structure must be verified against live schema before deploy.

