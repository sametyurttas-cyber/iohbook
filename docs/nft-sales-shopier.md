# NFT Sales And Shopier

## Scope

NFT sales use the existing commerce core as `product.type = nft` with
`product_variants.fulfillment_type = claimable`.

This phase does not auto-mint. After payment is verified, the customer receives
a pending `entitlements` row and staff completes manual fulfillment from
`/admin/nft-orders`.

## Customer Flow

1. Customer verifies a wallet from `/account/wallets`.
2. Customer adds an NFT/claimable product to cart or uses direct buy.
3. Checkout blocks NFT payment if the customer has no verified wallet.
4. Payment is started with the selected hosted provider.
5. Provider callback is verified on the backend.
6. Paid orders create pending claimable entitlements.
7. Customer sees the item in `/account/nft-collection`.

## Shopier

Provider id: `shopier`

Environment variables:

- `SHOPIER_MERCHANT_ID`
- `SHOPIER_API_KEY`
- `SHOPIER_SECRET`
- `SHOPIER_PAYMENT_URL`

Payment attempts are stored with `provider = shopier`.
Callback payloads are stored in `payment_attempts.raw_response`.

The return redirect is only a UX signal. Orders move to `paid` only after the
server callback signature is verified and the payment state machine accepts the
transition.

## Admin Operations

`/admin/nft-orders` shows:

- NFT entitlement status
- Payment provider/status
- Order/customer summary
- Verified wallet addresses
- Manual fulfillment status update

Staff cannot mark an NFT entitlement `active` unless the customer has a verified
wallet.

## Remaining Live Checklist

- Confirm the exact Shopier callback field names in the merchant panel.
- Set production Shopier keys in Vercel environment variables.
- Run a Shopier test transaction and compare callback payload with
  `src/features/checkout/shopier.ts`.
- Define legal terms for NFT delivery, refundability, wallet loss, and manual
  fulfillment timing.
