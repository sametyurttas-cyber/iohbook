# Critical Invariants

These rules are higher priority than convenience or UI behavior.

## Payment

- Redirect success is never proof of payment.
- Only a verified provider callback, webhook, or retrieve response may mark an
  order paid.
- Amount, currency, provider reference, and expected product/order reference
  must match before confirmation.
- Payment and order state transitions must follow `payment-state.ts`.
- Provider transaction IDs and reward/delivery side effects are idempotent.
- Database update errors must stop dependent fulfillment side effects.
- Never build a custom card collection form for the current providers.

## Shopier

- Internal order reference is sent through the product URL `note` parameter.
- `order.created` webhook data is not trusted alone; retrieve the Shopier order
  and compare note, amount, currency, quantity, and product identity.
- Duplicate/already-paid webhook handling must reconcile missing idempotent side
  effects: cart conversion, entitlement, and book reward.
- Raw provider responses belong in `payment_attempts`, not application logs with
  secrets.

## Cart And Order

- Prices and product publication state are revalidated at checkout.
- Checkout creation uses the atomic database RPC; avoid orphan order records.
- A paid order's cart becomes `converted` and must not remain active.
- Stock reservation/commit logic remains for future physical commerce.
- Public checkout rejects physical variants while the MVP is digital-first.

## Digital Delivery

- Entitlements are created only for verified paid digital order items.
- A customer can access only entitlements owned by their authenticated profile.
- Files stay in private storage; signed URLs are short-lived (currently 5 min).
- Never email files or permanent storage URLs.
- Duplicate confirmations must not create duplicate entitlements.

## IOH Points

- Points are off-chain application credits.
- Signup bonus: 10 points, once per profile.
- Paid book reward: 30 points, once per order.
- Book rewards support physical, digital, and hybrid books; exclude NFT, token,
  and claimable-only products.
- Ledger unique constraints are the final idempotency boundary.
- Point failure is logged and must not reverse a verified payment.
- Duplicate paid webhook handling must retry the idempotent reward operation.

## Auth And Security

- Service-role clients are server-only.
- Admin authorization is enforced server-side; hidden UI is not authorization.
- Customer data remains protected by RLS.
- Wallet ownership changes require signature verification.
- Never expose secrets, passwords, private files, or raw customer data in docs,
  source, logs, screenshots, or final reports.
