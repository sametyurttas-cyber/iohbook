# AGENTS.md

## Project Context

This repo is for the IOH / Samet Yurttas boutique author-commerce site.
The target stack is Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Radix UI, Supabase, iyzico CheckoutForm, and Vercel.

The product direction is a premium, dark, cosmic, technology-leaning book brand:
- CODE GOD: gold/yellow accent
- SYS GOD: blue/cyan accent
- CODE WAR: red/orange accent

## Context Loading Protocol

Keep context small and targeted:

1. Read this file and `docs/brain/README.md` first.
2. Read `docs/brain/current-state.md` for the current production truth.
3. Read only the one or two topic files linked by the brain index for the task.
4. Inspect the exact source files with `rg`; do not scan the full repository by default.
5. Read older `docs/*.md` files only when the brain index points to them or historical detail is needed.

If documentation conflicts, use this precedence:

1. Security and payment invariants in this file and `docs/brain/critical-invariants.md`.
2. `docs/brain/current-state.md`.
3. Executable code and the latest Supabase migrations.
4. Older domain documents.

When code proves a brain file stale, fix the code task first and update the affected brain file in the same task.

## Work Rules

Before every task:
- Follow the context loading protocol above.
- Inspect the current repo structure before changing files.
- Write a short plan in the chat before implementation.
- Keep each change scoped to the current prompt.

During implementation:
- Prefer existing project patterns once they exist.
- Use TypeScript for application code.
- Use Tailwind tokens and shadcn/Radix primitives for UI.
- Keep storefront, admin, commerce, auth, payment, and content concerns separated.
- Do not add real production secrets, live payment keys, or private credentials.
- Never print, copy into docs, or commit values from `.env.local`.
- Do not enable real iyzico production payments unless explicitly requested.
- Treat NFT and token/coin features as out of MVP scope unless the prompt is documentation-only.
- Do not commit, push, or deploy unless the user explicitly requests that action.

After implementation:
- Run the relevant verification commands available in the repo.
- Prefer, in order: lint, typecheck, tests, build.
- If a command cannot run because dependencies or tooling are missing, report that clearly.
- Summarize changed files, key decisions, verification output, and remaining risks.

## Expected Commands

Use these once the project is scaffolded:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

If the repo uses another package manager later, update this section.

## Architecture Boundaries

- Public storefront lives under the public app routes.
- Admin lives under protected `/admin` routes.
- Supabase service-role access must stay server-only.
- Supabase RLS policies must protect customer and staff data.
- Checkout success pages are UX only; order finalization must happen through backend verification and webhook/retrieve logic.
- Legal/KVKK/ETBIS/IYS text placeholders are not legal advice and need professional review before launch.

## Definition of Done

A task is done only when:
- The requested files or behavior are implemented.
- The scope did not drift into future prompts.
- Relevant verification was run or the blocker was reported.
- The final response includes changed files, validation, and remaining risks.
- `docs/brain/session-handoff.md` is updated when substantial work remains undeployed, uncommitted, blocked, or risky.
