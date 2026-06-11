# IOHBOOK

Boutique author-commerce foundation for the IOH / Samet Yurttas book brand.

This repo is planned for:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui and Radix UI
- Supabase
- iyzico CheckoutForm
- Vercel

The current state includes the project skeleton, design-system foundation, public shell, Supabase schema, auth/RLS foundation, and protected admin shell. Commerce behavior, payments, product admin, checkout, storage, and fulfillment are intentionally left for later prompts.

## Local Development

Install dependencies:

```bash
npm ci
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run build
```

CI uses the same npm scripts through GitHub Actions. See [docs/deployment.md](docs/deployment.md).

## Project Structure

```text
docs/
  architecture.md
  product-scope.md
src/
  app/
  components/
  features/
  lib/
  styles/
  types/
```

## Current Boundaries

- No production secrets belong in this repo.
- No real iyzico production payment flow is enabled.
- NFT, token, coin, native mobile, and digital delivery features are out of the MVP skeleton.
- Legal and compliance text must be reviewed before launch.

## Auth And Staff Bootstrap

Supabase Auth uses email/password for customer access. New auth users are mirrored into `public.profiles` by the database trigger in the auth/RLS migration.

The first `owner` staff role must be granted manually with Supabase SQL editor or a server-only service-role script after migrations are applied. Do not expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.

## Storage

Storage buckets and policies are defined in Supabase migrations. Public covers and banners use `public-media`; private exports, admin uploads, and future digital deliveries stay private. See [docs/storage.md](docs/storage.md).
