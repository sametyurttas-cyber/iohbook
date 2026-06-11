# Test Report

## Commands

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
npm test
```

## Latest Results

- `npm run test:unit`: 2 files, 8 tests passed.
- `npm run test:integration`: 6 files, 13 tests passed.
- `npm run test:e2e`: 3 tests passed, 1 seeded admin test skipped.
- `npm test`: 8 files, 21 tests passed.

## Coverage Added

### Unit

- Cart stock availability and quantity validation.
- Price subtotal, shipping, tax, discount, and total calculation.
- Edge case: fixed discount cannot make the total negative.
- Edge case: invalid line quantity throws.

### Integration

- Payment state machine happy path: `draft -> pending_payment -> paid -> fulfilled -> completed`.
- Payment state machine edge case: illegal skip from `paid -> completed` is blocked.
- Provider registry defaults to iyzico while future providers remain disabled.
- iyzico webhook signature verification.
- Payment confirmation idempotency for already-paid attempts.

### Playwright E2E

- Guest checkout edge case: empty cart guard is visible.
- Member login happy path: credential form and recovery link render.
- Admin order update guard: anonymous users are redirected before admin order operations.
- Seeded admin order drawer/update path exists but is skipped unless `E2E_ADMIN_EMAIL` and `E2E_ADMIN_PASSWORD` are provided with seeded Supabase staff/order data.

## Known Non-Test Blockers

- `npm run typecheck` still fails in existing cart/catalog/product/media query typing areas because Supabase nested relationship types are incomplete.
- `npm run lint` still fails before linting with the existing ESLint circular config issue.
