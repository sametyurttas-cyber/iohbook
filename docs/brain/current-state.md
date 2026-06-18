# Current State

Last reviewed: 2026-06-18

## Product Truth

- Production domain: `https://www.iohcoin.com` on Vercel.
- Backend: Supabase Auth, Postgres, Storage, and RLS.
- The current MVP is digital-first book commerce.
- GODCODE is sold as a digital book; physical variants remain in admin/data but
  are blocked from public cart and checkout.
- Paid digital orders create entitlements. Customers download from
  `/account/downloads` through short-lived signed URLs from private storage.
- Shopier is the active GODCODE payment path. iyzico architecture remains in the
  repository but is not the current primary live path.
- Shopier product-link checkout carries the internal order reference in `note`.
  An `order.created` webhook is verified against Shopier REST data before paid
  state is accepted.
- IOH points are application ledger points, not blockchain tokens:
  successful signup gives 10; a verified paid book order gives 30.
- NFT, wallet, token allocation, and campaign foundations exist. Automatic NFT
  minting and automatic token transfer are not enabled.

## Brand Truth

- Public UI follows the dark IOH universe from the custom home page.
- GODCODE uses gold, SYSGOD blue/cyan, CODEWAR red/orange.
- Public pages should feel editorial and cinematic, not like a SaaS dashboard.
- Admin remains dense and operational.

## Current Integrations

- Supabase: database, auth, private/public storage.
- Shopier: direct product URL, PAT-backed REST verification, webhook.
- Resend: provider-agnostic transactional email implementation.
- Sentry and Vercel Analytics/Speed Insights: observability foundations.
- Vercel: GitHub-connected production deployment from `main`.

## Launch Constraints

- Backend verification, not redirect success, finalizes payment.
- Digital files never use permanent public URLs or email attachments.
- Production secrets stay in environment variables only.
- Deploy only after explicit user instruction.
- Legal text and token/NFT activity require appropriate professional review.

## Check Before Assuming

- Run `git status --short`; the worktree may contain user or unfinished changes.
- Check latest migrations before assuming a live table exists.
- Check the production deployment commit before debugging an allegedly live fix.
- Check live order, payment attempt, entitlement, and ledger rows together when
  diagnosing commerce behavior.
