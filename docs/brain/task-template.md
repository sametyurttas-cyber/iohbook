# Task Template

Use this compact prompt shape to reduce ambiguity and repeated explanation.

```text
Goal:
One observable outcome.

Scope:
Routes/modules that may change.

Do not touch:
Sensitive or unrelated behavior.

Acceptance:
1. User-visible behavior.
2. Data/security invariant.
3. Required regression test.

Verify:
npm run typecheck
npm run lint
npm test
npm run build

Delivery:
Local only / commit / push / deploy.
```

For bug reports, add:

```text
Observed:
Expected:
Account/order reference (non-secret):
Environment: local / preview / production
```

Avoid pasting the complete architecture into prompts. Refer to the brain file and
state only the requested delta.
