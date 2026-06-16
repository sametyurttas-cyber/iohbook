# AGENTS.md

## Project Context

This repo is for the IOH / Samet Yurttas boutique author-commerce site.
The target stack is Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Radix UI, Supabase, iyzico CheckoutForm, and Vercel.

The product direction is a premium, dark, cosmic, technology-leaning book brand:
- CODE GOD: gold/yellow accent
- SYS GOD: blue/cyan accent
- CODE WAR: red/orange accent

## Work Rules

Before every task:
- Read this file and any relevant docs in `docs/`.
- Inspect the current repo structure before changing files.
- Write a short plan in the chat before implementation.
- Keep each change scoped to the current prompt.

During implementation:
- Prefer existing project patterns once they exist.
- Use TypeScript for application code.
- Use Tailwind tokens and shadcn/Radix primitives for UI.
- Keep storefront, admin, commerce, auth, payment, and content concerns separated.
- Do not add real production secrets, live payment keys, or private credentials.
- Do not enable real iyzico production payments unless explicitly requested.
- Treat NFT and token/coin features as out of MVP scope unless the prompt is documentation-only.

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
