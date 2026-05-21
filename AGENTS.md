# AGENTS.md — MtyRespira

Status: canonical agent baseline  
Scope: `elelier/monterrey-respira` with `elelier/airquality_pipeline` as the read-only reference repo when a change touches environmental data flow.

## Product boundary

MtyRespira is the public air-quality product for Monterrey and its metropolitan area.

Canonical public app:

- `https://mtyrespira.elelier.com/`

Repos:

- App/public UX: `elelier/monterrey-respira`
- Environmental data pipeline: `elelier/airquality_pipeline`

Shared environmental data boundary:

```text
provider -> airquality_pipeline -> Supabase tables -> get_latest_air_quality_per_city -> frontend
```

Current environmental database concepts:

- Supabase PostgreSQL environmental project
- Tables: `cities`, `air_quality_readings`, `pipeline_logs` when applicable
- Critical RPC: `get_latest_air_quality_per_city`

Provider state:

- Active provider: WAQI/AQICN when confirmed by current pipeline/runtime evidence
- Legacy/fallback provider: IQAir/AirVisual when confirmed by current pipeline/runtime evidence

If provider docs and runtime disagree, verify `airquality_pipeline` before changing product claims.

## Operating rules for agents

- Work only on MtyRespira in this repo context.
- Do not mix this project with Oficina Digital, Core DB CRM, MiRancho, ConectaTech, Polymarket, QR Scan Tracker, or any other product.
- Do not push directly to `main`.
- Every change must go through a branch and pull request.
- Do not commit secrets.
- Do not expose service-role credentials in the frontend/app.
- `service_role` belongs only to the pipeline if it is already configured as a protected secret.
- Do not invent environmental data: AQI, pollutant, weather, coordinates, timestamps, cities, provider status, or freshness.
- Do not break AQI rendering, historical views, geolocation, or the shared data contract.
- Do not rename, remove, or silently change the RPC `get_latest_air_quality_per_city`.
- Do not change Supabase schema, RPC behavior, pipeline runtime, provider behavior, or writes live unless the story explicitly authorizes it.
- Do not promise "tiempo real" as a product claim. Use honest language such as "lecturas disponibles", "medición reportada", or "actualización por pipeline horario".

## When to inspect each repo

Use `monterrey-respira` when the change touches:

- public UI/UX
- AQI card or AQI visual state
- city selector/search/geolocation
- frontend cache or refresh behavior
- copy, SEO, README, public docs, or routing
- Supabase anon client consumption

Use `airquality_pipeline` as reference when the change touches or claims anything about:

- provider behavior
- hourly workflow
- ingestion cadence
- payload validation
- city synchronization
- `cities` or `air_quality_readings` writes
- pipeline logs/statuses
- `last_successful_update_at`

Do not edit `airquality_pipeline` from this repo unless the story explicitly says to open a separate pipeline PR.

## Core DB rule

Core DB may be referenced only for product signals or product feedback signals. It is not the source of environmental readings and must not be used for AQI, weather, historical air-quality readings, or provider pipeline state.

## Canonical documentation

Use this hierarchy when docs, runtime, and memory disagree:

1. Runtime and workflow evidence from `airquality_pipeline` for data production.
2. `docs/shared-data-contract.md` for the shared data boundary.
3. `docs/PRD.md` for product scope and requirements.
4. `docs/architecture.md` for architecture of record.
5. `docs/roadmap.md` for story order and gates.
6. `docs/freshness-truth-ux.md` for freshness UX semantics.
7. `docs/blindaje-y-cambio-de-curso.md` for risk posture and change-of-course rationale.
8. README for public contributor orientation only.

If there is conflict, do not guess. Mark the drift and update documentation in the same PR when in scope.

## Required PR notes

Every PR must explain impact on:

```text
app / pipeline / Supabase RPC / BD MtyRespira / UX / Cloudflare
```

For data-affecting PRs, also include:

```text
pipeline -> Supabase/RPC -> frontend -> UX
```

Required PR sections:

- Summary
- Area touched
- Contract impact
- Validation
- Risks / pending items
- Rollback

## Validation expectations

Documentation-only changes:

- Review relative links.
- Run or document equivalent grep/ripgrep for obsolete claims when possible.

Frontend changes:

```bash
npm run lint
npm run build
```

If available:

```bash
npm run typecheck
```

Pipeline changes:

```bash
pytest
```

Contract changes:

- Validate shape and semantics of `get_latest_air_quality_per_city`.
- Update `docs/shared-data-contract.md` in the same PR or a clearly coordinated rollout.
- Document rollback.

## Prohibited shortcuts

- No silent fallback that makes old, missing, null, or unreliable data look fresh.
- No AQI `0` as a healthy substitute for missing AQI.
- No hidden provider changes.
- No new environmental source without contract and rollout plan.
- No runtime server dependency for the public frontend unless architecture is explicitly revised.
- No claims based only on stale README or old docs.
