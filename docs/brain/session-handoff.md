# Session Handoff

## Verification Duplicate and Messaging Repair

- Verification submission and customer/admin reply actions now use deterministic
  request IDs, so repeated form delivery cannot create the same record twice.
- Exact duplicate legacy submissions created within two minutes are collapsed in
  customer and admin lists without deleting records or attachments.
- Customer submission/reply and admin reply interfaces now use pending states,
  clear request-specific copy, responsive form layouts and conversation bubbles.
- Verification regression tests, the full 164-test suite, lint, typecheck and the
  production build all passed on 2026-06-22.

Last updated: 2026-06-22

This file contains only unfinished or operationally relevant work. Clear items
after they are completed and verified.

## Unreleased Analytics Foundation

- Privacy-safe first-party event collection is implemented locally through
  `/api/analytics/track` and the root App Router layout.
- The migration creates `analytics_events`, `analytics_sessions`, and
  `analytics_daily_rollups`, with owner/admin_ops read policies and a
  service-role-only atomic ingestion RPC.
- Tracking requires the existing analytics cookie consent. Admin, API,
  callback, and webhook paths are excluded from page views.
- Business-event tracking is wired to auth, book/product views, cart, checkout,
  verified payments, digital downloads, Amazon verification, IOH point awards,
  and encyclopedia entity visibility. Server-side writes are best effort and
  cannot fail the owning business transaction.
- The migration has not been applied to Supabase and this work has not been
  committed or deployed in the current session.
- Latest local verification: typecheck and lint passed; 42 test files / 140
  tests passed; production build passed with `/api/analytics/track` included.
  `/books/godcode` and `/encyclopedia` also passed a local browser smoke check.

## Unreleased Admin Analytics Dashboard

- `/admin` is now an owner/admin_ops-only operations dashboard with eight
  summary metrics, five 30-day trend panels, recent operational lists and the
  top ten public pages.
- `20260622140000_admin_dashboard_queries.sql` adds service-role-only,
  actor-verified read RPCs for totals, 30-day series and top pages. Page-view
  series prefer `analytics_daily_rollups` and fall back to raw analytics events.
- Recent orders, users, verification submissions and IOH ledger entries are
  each limited to ten rows in application queries.
- The dashboard migration has not been applied to Supabase. Prompt 2, Prompt 3
  and this dashboard must be migrated together before the route can load with
  real data in a deployed environment.
- Latest local verification: typecheck and lint passed; 43 test files / 147
  tests passed; production build passed with `/admin` rendered dynamically.
- The restarted local server returned HTTP 200 for `/admin`; in-app visual
  verification could not be completed because browser control was unavailable.

## Unreleased Analytics Rollups

- `/admin/analytics` adds 7/30/90-day traffic summaries, top pages, source,
  device, UTM campaign, referrer, funnel and encyclopedia breakdowns.
- Support can read analytics but cannot trigger rollups. Owner/admin_ops can
  manually run the 90-day refresh from the page.
- `20260622150000_analytics_rollups_and_reports.sql` recomputes up to 90 days
  and idempotently upserts one row per day into `analytics_daily_rollups`.
- `/api/admin/analytics/rollup` is scheduled daily at 02:15 UTC in
  `vercel.json`. It returns 503 without `CRON_SECRET` and 401 for a mismatched
  bearer token.
- `CRON_SECRET` still needs to be configured in Vercel Production. The new
  migration has not been applied to Supabase and none of this work is deployed.
- Latest verification: typecheck and lint passed; 45 test files / 159 tests
  passed; production build passed with both analytics routes present.

## Analytics Final Smoke Test

- Local public routes `/`, `/books`, `/books/godcode` and `/encyclopedia`
  returned HTTP 200. The analytics endpoint returned `202 consent_required`
  without consent and `500 storage_error` with consent because the four
  analytics migrations are still not applied to the connected Supabase
  project.
- `/api/admin/analytics/rollup` returned `503 cron_not_configured` without
  `CRON_SECRET`, as designed. Anonymous requests to `/admin` and
  `/admin/analytics` resolved to the unauthorized flow.
- The 7/30/90-day unique visitor summary no longer sums daily unique counts;
  it counts distinct profile/anonymous identities across the selected range.
- Final local verification: typecheck and lint passed; 45 test files / 161
  tests passed; production build passed. Playwright passed 3 flows and skipped
  the seeded-admin flow because E2E admin credentials were not configured.
- Real database page-view, UTM, dashboard, rollup, authenticated business-event
  and RLS reads remain blocked until migrations `20260622120000` through
  `20260622150000` are applied. `CRON_SECRET` also remains required in Vercel.

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
