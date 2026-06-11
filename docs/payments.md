# Payments Architecture

## Goal

The payment layer is provider-agnostic. iyzico CheckoutForm is the first MVP
provider, but the checkout flow must be able to add Shopier, manual bank
transfer, or another provider without rewriting order creation.

## Provider Contract

Providers live under `src/features/checkout/providers`.

Every provider implements `PaymentProvider`:

- `id`: stable database/provider id such as `iyzico`, `shopier`, `bank_transfer`.
- `label`: user-facing checkout label.
- `type`: `hosted_checkout` or `manual`.
- `availability()`: runtime feature flag and config validation.
- `startPayment(context)`: returns a normalized payment start result.

The checkout action never calls iyzico directly. It resolves the selected
provider from the registry and stores the provider result into
`payment_attempts`.

## payment_attempts Field Policy

- `provider`: stable adapter id.
- `provider_reference`: provider-facing checkout reference, token, or manual
  transfer reference. For iyzico this is the CheckoutForm token.
- `provider_status`: raw provider lifecycle status, separate from normalized
  `status`.
- `status`: normalized internal payment state.
- `request_payload`: request sent to the provider or manual instruction payload.
- `raw_response`: last raw provider response/event used for audit.
- `response_payload`: legacy compatibility mirror of `raw_response`.
- `provider_token`: legacy iyzico compatibility mirror of `provider_reference`.
- `provider_transaction_id`: immutable provider transaction/payment id after
  backend verification. It remains uniquely indexed with `provider`.
- `verified_at`: set only after backend retrieve/webhook verification.
- `failure_reason`: provider-agnostic support/admin reason.
- `failure_message` and `failure_code`: legacy/provider-specific fields.

Browser redirects are UX signals only. A redirect never marks an order as paid
without backend verification.

## State Machine

Order happy path:

`draft -> pending_payment -> paid -> fulfilled -> completed`

Order exits:

- `draft -> cancelled`
- `pending_payment -> cancelled`
- `pending_payment -> refunded`
- `paid -> refunded`
- `fulfilled -> refunded`
- `completed -> refunded`

Payment happy path:

`initiated -> pending -> paid`

Payment exits:

- `initiated/pending -> failed`
- `initiated/pending/authorized -> cancelled`
- `authorized/paid -> refunded`

## Existing Providers

### iyzico

Enabled when `IYZICO_API_KEY` and `IYZICO_SECRET_KEY` are present. It uses
CheckoutForm hosted checkout and writes the returned token as
`provider_reference`.

### Shopier

The current adapter targets a legacy hosted checkout URL configured by
`SHOPIER_PAYMENT_URL` and defaults to `https://www.shopier.com/ShowProduct/api_pay4.php`.
The public Shopier developer pages available during implementation did not
provide a verifiable hosted-form `api_pay4.php` request/callback signature
specification. Treat this adapter as **verification-gated** before live use.

Live enablement requirements:

1. Obtain Shopier's official merchant integration document or capture a
   Shopier sandbox/live test callback from the merchant panel.
2. Confirm request field names for `API_key`, `merchant_id`,
   `platform_order_id`, `total_order_value`, `currency`, `callback_url`, and
   `signature`.
3. Confirm callback field names for order reference, provider transaction id,
   status, amount, currency, and signature/hash.
4. Update `src/features/checkout/shopier.ts` and tests to the confirmed
   canonical signature string. Do not infer this format from examples.
5. Keep backend checks that require paid callbacks to match
   `payment_attempts.amount_minor` and `payment_attempts.currency` before any
   order can move to `paid`.
6. Keep duplicate callback handling idempotent by checking provider transaction
   references before mutating orders.

### Manual Bank Transfer

Adapter placeholder only. It models an internal reference and pending payment
state, but is disabled in MVP to avoid operational ambiguity.

## Adding a Provider

1. Create a file under `src/features/checkout/providers`.
2. Implement `PaymentProvider`.
3. Add it to `PAYMENT_PROVIDERS`.
4. Store provider references in `provider_reference`.
5. Store provider raw statuses in `provider_status`.
6. Store raw API responses/events in `raw_response`.
7. Confirm payments only through backend verification.
8. Make duplicate webhook handling idempotent by checking provider transaction
   references before mutating orders.
