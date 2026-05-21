# Documentation Index — MtyRespira

Status: canonical documentation map  
Date: 2026-05-21

## Purpose

This index explains which documents govern MtyRespira and how agents should resolve drift.

MtyRespira must remain scoped to the public air-quality product for Monterrey. Do not mix this documentation with Oficina Digital, Core DB CRM, MiRancho, ConectaTech, QR Scan Tracker, Polymarket, or any other project.

## Canonical docs

| Document | Role | Notes |
| --- | --- | --- |
| `AGENTS.md` | Agent execution rules | Start here before any agent-driven change. |
| `docs/PRD.md` | Product requirements baseline | Defines product scope, users, requirements, out-of-scope items, and current gate. |
| `docs/architecture.md` | Architecture of record | Canonical architecture file. Keep lowercase path to avoid duplicate drift. |
| `docs/roadmap.md` | Roadmap of record | Canonical story order and stop/gates. Keep lowercase path to avoid duplicate drift. |
| `docs/shared-data-contract.md` | Shared data contract | Canonical boundary for `pipeline -> Supabase/RPC -> frontend`. |
| `docs/freshness-truth-ux.md` | Freshness UX semantics | Canonical copy/threshold rules for measurement freshness. |
| `docs/blindaje-y-cambio-de-curso.md` | Risk posture | Premortem-derived guardrails and change-of-course map. |
| `README.md` | Public contributor orientation | Must stay honest, but is not the deepest source of truth. |

## Explicit canonical path decisions

- Architecture stays at `docs/architecture.md`.
- Roadmap stays at `docs/roadmap.md`.
- PRD lives at `docs/PRD.md`.
- Agent rules live at root `AGENTS.md`.

Do not create duplicate uppercase/lowercase variants unless a future migration deliberately redirects old paths.

## Source-of-truth hierarchy

When files disagree:

1. Current runtime/workflow evidence.
2. `docs/shared-data-contract.md`.
3. `docs/PRD.md`.
4. `docs/architecture.md`.
5. `docs/roadmap.md`.
6. `docs/freshness-truth-ux.md`.
7. `docs/blindaje-y-cambio-de-curso.md`.
8. `README.md`.

## Drift cleanup rules

Any mention of these terms must be reviewed before merge:

```bash
rg "tiempo real|AirVisual|Buildship|Netlify|service_role|Core DB" README.md docs AGENTS.md
```

Allowed appearances:

- Legacy context clearly marked as legacy.
- Prohibitions or security rules.
- Provider state that is explicitly tied to current runtime evidence.
- Core DB clarification that it is not used for environmental readings.

Disallowed appearances:

- `tiempo real` as a product promise.
- Buildship/Netlify as active runtime if current evidence says otherwise.
- `service_role` in frontend guidance.
- Core DB as storage for environmental readings.

## Current gate

Story 1.3 — Provider Continuity Readiness remains blocked until Story 1.2.1 — Canonical Project Docs Stop is merged.
