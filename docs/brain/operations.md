# Operations Runbook

## Start A Task

1. Read `AGENTS.md`, brain index, current state, and one relevant brain file.
2. Run `git status --short`; preserve unrelated changes.
3. Locate code with targeted `rg` queries.
4. State a short implementation plan.
5. Change only the requested behavior.

## Verification Ladder

Use the smallest meaningful checks while iterating, then complete the ladder for
commerce, auth, shared UI, or deployment work:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Use `npm run test:e2e` when browser behavior is materially changed and the
required test environment is available. Never weaken or delete a test merely to
make CI green.

## Database Changes

1. Inspect the latest related migration and real column/enum names.
2. Add a new timestamped migration; do not edit an applied migration.
3. Make migrations idempotent where practical.
4. Update `src/types/database.ts` when the contract changes.
5. Apply to live Supabase only with clear authorization and report the result.
6. Verify actual rows/RPC behavior without printing secrets or customer data.

## Commerce Incident Checklist

Check one order across the full chain:

1. `orders`: profile, cart, status, amount, `paid_at`.
2. `payment_attempts`: provider status/reference, verified time, raw response.
3. `order_items`: variant, fulfillment type, snapshots.
4. `carts`: paid order cart is `converted`.
5. `entitlements`: active row exists for each paid digital item.
6. `ioh_point_ledger`: one reward row for a paid book order.
7. `email_events`: expected event status.
8. Vercel runtime logs: confirm which production deployment executed the route.

Repair data only with an idempotent operation and verify the final state.

## Git And Deploy

- Do not commit, push, or deploy without an explicit user request.
- Before commit: inspect the complete diff and exclude unrelated files/secrets.
- Before deploy: typecheck, lint, tests, and build must pass.
- Confirm the deployed commit in Vercel, then smoke-test the affected live flow.
- A successful build is not proof that migrations or environment variables exist.

## End A Task

Report only high-signal facts:

- Root cause or decision.
- Changed files/behavior.
- Exact verification result.
- Deployment status.
- Remaining risk or next action.

Update `session-handoff.md` when anything remains uncommitted, undeployed,
blocked, manually repaired, or operationally risky.
