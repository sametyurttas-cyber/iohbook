# Session Handoff

Last updated: 2026-06-26

## Current Status

- Local dev runs with the bundled Node path; use `agy-node.cmd node_modules/next/dist/bin/next dev` or `agy-node.cmd node_modules/vitest/vitest.mjs run`.
- Production is fully deployed and running on Vercel at `https://www.iohcoin.com`.
- All features including token sale limit calculation, automated points awarding, and dynamic site URL redirects are live.
- `next build` cannot run locally in Antigravity sandbox — Turbopack requires spawning a real `node` process which is unavailable. Vercel deployment is unaffected.

## Deployed Features (June 2026)

### Token Sale Shopier Callback + Webhook Backend
- Created `/payment/success` and `/payment/failed` pages.
- Updated callback route to redirect to the correct pages (`/payment/success` for token sale, `/checkout/success` for books).
- Implemented dynamic `siteUrl` resolution using request `host` header to resolve the Vercel branch password/deployment protection block during redirects.
- Implemented strict PAT REST verification in callback (POST), webhook, and GET redirect redirection (query-on-return).
- Token allocation approval (`approveTokenAllocationsForPaidOrder`) integrated idempotently.
- Points are awarded automatically upon order verification.
- Email isolation: `sendDigitalDeliveryReadyEmail` skips `claimable` fulfillment items.
- Audit log inserted on every payment status transition.
- All unit tests passing, 0 typecheck errors, 0 lint errors.

## Verification & Active Tests
- Order `IOH-20260626-CCE07DAA` (trans ID `284127409`) was manually reconciled and verified successfully via the newly created dynamic script, validating the verification loop.
- Dynamic site URL resolution successfully deployed on Vercel.

## Open Risks
- Supabase migrations are fully applied and active in production.
- Shopier classic OSB is configured on the panel pointing to the callback URL `https://www.iohcoin.com/api/payments/shopier/callback`.


