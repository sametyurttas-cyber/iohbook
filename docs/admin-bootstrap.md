# Admin Bootstrap

The app does not ship with a hard-coded admin username or password.

Create the first admin with a local-only `.env.local` configuration and the
service-role Supabase key.

## Required Environment

Add these values to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_FULL_NAME=IOH Admin
ADMIN_ROLE=owner
ADMIN_RESET_PASSWORD=false
```

Rules:

- Do not commit `.env.local`.
- `ADMIN_PASSWORD` must be at least 10 characters.
- `ADMIN_ROLE` can be `owner`, `admin_ops`, `editor`, or `fulfillment`.
- Use `ADMIN_RESET_PASSWORD=true` only when you intentionally want to reset the
  password for an existing admin email.

## Create The Admin

```bash
npm run admin:bootstrap
```

Then sign in at:

```text
/sign-in
```

After signing in, open:

```text
/admin
```

## What The Script Does

1. Creates the Supabase Auth user if it does not exist.
2. Confirms the email for bootstrap convenience.
3. Upserts the matching `profiles` row.
4. Grants the selected `staff_roles` role.

It does not print or store the password outside Supabase Auth.
