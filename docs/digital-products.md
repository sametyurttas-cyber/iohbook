# Digital Products and Entitlements

## Product Variant Model

Digital delivery is represented at `product_variants` level so a single product
can have physical, digital, and hybrid variants.

Fields:

- `fulfillment_type`: `physical`, `digital`, `claimable`, or `hybrid`
- `digital_delivery_bucket`: private Supabase Storage bucket, usually `digital-deliveries`
- `digital_delivery_path`: private file path for the deliverable
- `digital_download_limit`: copied to the entitlement after payment
- `digital_access_starts_at`: optional future access start
- `digital_access_expires_at`: optional access expiry

## Payment Flow

The checkout flow still creates draft/pending orders before payment. After iyzico
retrieve or webhook verification marks the payment as paid, the backend creates
entitlements for `digital` and `hybrid` order items.

Redirect success is not enough to grant access.

## Customer Downloads

Customers see digital access under `/account/downloads`.

The page never stores or renders permanent file URLs. A download button calls a
server action that:

1. Verifies the signed-in user owns the entitlement.
2. Checks status, start/expiry, and download limit.
3. Creates a five-minute signed Supabase Storage URL.
4. Increments `download_count`.
5. Writes an audit log entry.

## Hybrid Orders

Hybrid variants keep the physical order/shipping flow and also create digital
entitlements after payment. Physical-only guest checkout remains unchanged, but
digital/hybrid checkout requires a signed-in customer account so the entitlement
has an owner.
