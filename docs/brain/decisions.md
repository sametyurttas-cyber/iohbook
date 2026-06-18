# Decision Log

Record only durable decisions. New entries use `YYYY-MM-DD - title`, followed by
decision, reason, and consequence in a few lines.

## 2026-06-18 - Digital-First MVP

The first live commerce path sells private PDF/EPUB-style digital variants.
Physical catalog, inventory, shipping, and fulfillment structures remain for a
later phase but public purchase is disabled.

## 2026-06-18 - Shopier Direct Product Verification

GODCODE checkout redirects to a Shopier product link with quantity and the
internal payment reference in `note`. An `order.created` webhook triggers REST
retrieval and strict comparison before the order becomes paid.

## 2026-06-18 - Entitlement Delivery

Digital files use private Supabase Storage. A verified paid order creates an
entitlement; authenticated owners receive a five-minute signed URL from the
account download action. Email links to the account, never to a permanent file.

## 2026-06-18 - IOH Points Are Off-Chain

IOH points use a balance plus immutable ledger model. Signup and book rewards
are database-idempotent. They are not tokens, transferable assets, or payment.

## 2026-06-18 - Explicit Deployment Control

Local implementation and verification do not imply deployment. Commit, push,
and deploy happen only after an explicit user request.
