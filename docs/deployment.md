# CI/CD and Deployment

## GitHub Actions

Workflow: `.github/workflows/ci.yml`

Required check names:

- `install`
- `lint`
- `typecheck`
- `test`
- `build`

The workflow runs on:

- Pull requests targeting `main`
- Pushes to `main`

The CI uses `npm ci` and Node.js 22. Secrets are not committed. CI uses safe placeholder environment values only so the application can compile without real production keys.

## Required Branch Protection

Configure this in GitHub:

1. Open `Settings -> Rules -> Rulesets` or `Settings -> Branches`.
2. Create a rule for `main`.
3. Require pull request before merging.
4. Require status checks to pass before merging.
5. Select these required checks: `install`, `lint`, `typecheck`, `test`, `build`.
6. Require branches to be up to date before merging.
7. Restrict direct pushes to `main` for non-admin users.

This repository cannot enforce branch protection by file alone; it must be enabled in GitHub repository settings.

## Vercel Preview Deployments

Recommended setup:

1. Import the GitHub repository into Vercel.
2. Set framework preset to Next.js.
3. Keep install command as `npm ci`.
4. Keep build command as `npm run build`.
5. Every pull request gets an automatic Vercel Preview Deployment.
6. Use preview Supabase, iyzico sandbox, Resend test domain, and Sentry preview environment variables.

Preview environment variables should be configured in Vercel Project Settings, not committed to the repo.

## Production Deployment

Recommended setup:

1. Production branch: `main`.
2. Merge to `main` only after all required GitHub checks pass.
3. Vercel deploys production from `main`.
4. Production environment variables must be set in Vercel Project Settings.
5. Supabase migrations must be applied before enabling production checkout.
6. Sentry source map upload requires `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT`.

## Secret Handling

Never commit real values for:

- `SUPABASE_SERVICE_ROLE_KEY`
- `IYZICO_API_KEY`
- `IYZICO_SECRET_KEY`
- `RESEND_API_KEY`
- `SENTRY_AUTH_TOKEN`
- Any Vercel or GitHub tokens

Use `.env.example` as a name-only template. Local values belong in `.env.local`, which is ignored by git.

## Local Verification

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

Latest local verification should be rerun before enabling branch protection. Test coverage details live in `docs/test-report.md`.
