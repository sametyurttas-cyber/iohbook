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

The MVP Shopier adapter can send GODCODE PDF buyers to the merchant product
link, but the order is not finalized from that browser redirect. The trusted
payment signal is the Shopier REST webhook:

`POST /api/payments/shopier/webhook`

Required environment:

- `SHOPIER_API_TOKEN`: Shopier REST API personal access token.
- `SHOPIER_WEBHOOK_TOKEN`: Shopier webhook secret/token used to verify
  `Shopier-Signature`. If it is not set, the app falls back to
  `SHOPIER_SECRET`, then `SHOPIER_API_TOKEN`.

Webhook behavior:

1. The route accepts only POST JSON webhooks.
2. `order.created` webhooks are verified with HMAC-SHA256 over the raw body.
3. The webhook order id becomes `payment_attempts.provider_transaction_id`.
4. The webhook total, currency, and buyer email must match a pending Shopier
   payment attempt before the order can move to `paid`.
5. Duplicate webhooks are idempotent and do not create duplicate entitlements,
   point rewards, emails, or token allocations.

Legacy classic-form support remains in code for future Shopier merchant-id /
secret configurations, but live digital delivery should rely on the webhook
confirmation path above.

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
