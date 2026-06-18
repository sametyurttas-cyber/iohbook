# Session Handoff

Last updated: 2026-06-18

This file contains only unfinished or operationally relevant work. Clear items
after they are completed and verified.

## Latest Release Scope

- Shopier cart finalization is implemented locally so paid carts become
  `converted`, update errors are not ignored, and duplicate confirmations repair
  the cart.
- Duplicate/already-paid Shopier webhook handling locally reconciles both the
  entitlement and the idempotent 30 IOH book reward.
- Regression coverage exists for cart finalization and duplicate-webhook reward.
- Git and Vercel are the source of truth for commit and deployment status; do
  not infer release state from this file.

## Last Verification

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: 31 files, 102 tests passed.
- `npm run build`: passed.

## Live Repair

- The paid GODCODE test orders observed on 2026-06-18 have entitlement access.
- Missing IOH rewards found during investigation were reconciled through the
  idempotent points RPC.
- One paid cart left active by the old path was manually converted.

## Release Verification

For the release containing these changes, run a new-account paid-order smoke
test verifying:

1. cart disappears;
2. order is paid;
3. entitlement appears;
4. balance is 40 (10 signup + 30 book);
5. duplicate webhook changes none of those counts.
