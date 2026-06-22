# Session Handoff

Last updated: 2026-06-22

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

## Unreleased Encyclopedia Work

- `/encyclopedia` is implemented locally as a cinematic IOH Universe archive.
- The page includes data-driven character, city, faction, technology and
  timeline sections using optimized user-provided artwork.
- The shared scene header, standard public header, mobile navigation, footer
  and sitemap now link to `/encyclopedia`.
- This work is not committed or deployed in the current session.

## Unreleased Amazon Verification Work

- Customer rewards/message-center routes and admin verification routes are
  implemented locally, including private attachments and signed URLs.
- Approval now uses a service-role-only atomic RPC with owner/admin_ops role
  verification, 30/250/default-zero reward rules, automatic reply, audit log,
  and duplicate/idempotent handling.
- All three verification migrations were applied to the connected Supabase
  project on 2026-06-22. Tables, RLS policies, the private
  `verification-attachments` bucket and approval RPC were verified through the
  database and PostgREST.
- Attachment objects are accessed only by server-side service-role storage
  calls after ownership/staff authorization through the application tables.
- Verification reply/approved/rejected email templates remain a documented
  TODO; no email failure can currently affect an admin action.
- This work is not committed or deployed in the current session.

## Last Verification

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: 35 files, 120 tests passed.
- `npm run build`: passed; 57 pages generated and all account/admin verification
  routes were included in the route manifest.

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
