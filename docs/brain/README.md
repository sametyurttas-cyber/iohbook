# IOHBOOK Brain

This directory is the compact operational memory for humans and coding agents.
It exists to avoid rereading the whole repository and to prevent stale prompts
from overriding production reality.

## Read Order

Always read:

1. Root `AGENTS.md`.
2. This index.
3. `current-state.md`.

Then choose only what the task needs:

| Task | Read |
| --- | --- |
| Payment, cart, order, Shopier, points, downloads | `critical-invariants.md` |
| Route, module, table, file ownership | `system-map.md` |
| Test, migration, production, deploy, incident | `operations.md` |
| Why a durable choice exists | `decisions.md` |
| Continuing unfinished work | `session-handoff.md` |
| Writing a precise new task | `task-template.md` |

Use older files in `docs/` only for deeper domain detail. `architecture.md` and
`product-scope.md` describe the original physical-commerce baseline and are not
the current MVP source of truth.

## Source Precedence

1. Security and commerce invariants.
2. Current state.
3. Code plus latest migrations.
4. Historical documents.

Code wins when it exposes stale documentation, but the documentation must be
updated before the task is considered finished.

## Memory Rules

- Keep facts short, dated when temporary, and linked to real files.
- Store decisions and invariants, not chat transcripts.
- Never store passwords, API keys, tokens, customer addresses, or private data.
- Do not duplicate full schemas or route source; point to their owners.
- Update `current-state.md` only for product or production behavior changes.
- Update `decisions.md` only for durable architectural choices.
- Update `session-handoff.md` whenever work remains unfinished or undeployed.
- Delete resolved handoff items instead of building an endless history.
