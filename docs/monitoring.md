# Monitoring and Analytics

## Providers

- Sentry captures server/client errors and traces through `@sentry/nextjs`.
- Vercel Web Analytics and Speed Insights are mounted in the root layout.
- Application events use structured JSON logs plus Sentry breadcrumbs/exceptions.

## Required Environment

```bash
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ORG=
SENTRY_PROJECT=
SENTRY_AUTH_TOKEN=
SENTRY_TRACES_SAMPLE_RATE=0.1
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_TEST_TOKEN=
```

`SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` are needed for source map upload in CI/Vercel builds.

## Critical Events

- `checkout.payment_start.*`
- `checkout.order_created`
- `checkout.payment_attempt_created`
- `payment.confirmation.*`
- `admin.product_*`
- `admin.variant_*`
- `admin.order_*`
- `media.upload.*`
- `monitoring.sentry_test.triggered`

## Smoke Test

After configuring `SENTRY_DSN` and `SENTRY_TEST_TOKEN`, call:

```bash
curl "https://your-domain.com/api/monitoring/sentry-test?token=$SENTRY_TEST_TOKEN"
```

Expected response:

```json
{ "ok": true, "dsnConfigured": true }
```

Then verify the `Sentry monitoring smoke test` issue in the Sentry project. Without a DSN, the endpoint still returns `ok: true` but cannot deliver the event to Sentry.
