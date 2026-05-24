# Public Runtime Verification Gate — MtyRespira

Status: Story 1.4 completed / degraded resolved  
Date: 2026-05-24  
Scope: `elelier/monterrey-respira` with `elelier/airquality_pipeline` as read-only operational reference

## Purpose

This gate records the minimum verification needed to trust that the public app, pipeline assumptions, and Supabase/RPC contract still agree after relevant changes.

The gate exists to avoid the highest-risk MtyRespira failure mode: the public site staying online while presenting old, missing, null, or incomplete environmental readings as fresh and trustworthy.

## Non-negotiables

This gate is evidence-only unless a future story explicitly authorizes implementation.

Rules:

- No direct push to `main`.
- No frontend runtime changes.
- No AQI rendering, historical chart, geolocation, cache, or city-selection behavior changes.
- No database writes.
- No RPC contract changes.
- No secrets in docs, app, or PR comments.
- No provider runtime changes.
- No WAQI station mapping changes.
- No forced live ingestion.
- No hidden provider switch.

## Source-of-truth order

Use this order when evidence conflicts:

1. Current runtime/workflow evidence from `elelier/airquality_pipeline`.
2. `docs/shared-data-contract.md`.
3. `docs/PRD.md`.
4. `docs/architecture.md`.
5. `docs/roadmap.md`.
6. `docs/freshness-truth-ux.md`.
7. `docs/blindaje-y-cambio-de-curso.md`.
8. README.

## Public app verification

Public URL:

- `https://mtyrespira.elelier.com/`

Minimum checks:

- The public page responds and loads a MtyRespira experience.
- Missing data is not presented as AQI `0`.
- Measurement freshness and frontend refresh remain distinct when both values are available.
- The app does not claim a stronger freshness guarantee than the hourly producer cadence.
- Degraded, stale, old, or missing states remain explicit.

### Story 1.4.1 result

Story 1.4.1 — Public Metadata Freshness Claim Cleanup mitigated the prior metadata drift in source.

Merged evidence:

- PR #27 — `fix: remove real-time freshness claim from public metadata`.
- Corrected title/copy target: `MonterreyRespira - Lecturas de calidad del aire`.

No data flow, provider behavior, Supabase schema, RPC, AQI rendering, historical view, or geolocation behavior changed.

## Documentation drift verification

Run or document equivalent:

```bash
rg "Story 1.4|Story 1.4.1|Story 1.4.2|get_latest_air_quality_per_city|tiempo real|Tiempo Real|AirVisual|IQAir|WAQI|AQICN|service_role|Core DB" README.md docs AGENTS.md
```

Allowed appearances:

- `tiempo real` only as a prohibition, historical drift note, or explicit risk.
- WAQI/AQICN as active provider when sourced from pipeline evidence.
- AirVisual/IQAir only as legacy/fallback.
- `service_role` only as security prohibition or pipeline-only secret context.
- Core DB only as clarification that it is not used for environmental readings.
- Story 1.4 / 1.4.1 / 1.4.2 evidence and status references.

## Pipeline read-only verification

Use `elelier/airquality_pipeline` as read-only reference.

Minimum files to inspect:

- `README.md`
- `.github/workflows/air-quality-workflow.yml`
- `main.py`
- `waqi_api.py`
- `airvisual_api.py`
- `update_city.py`
- `utils.py`
- `docs/provider-continuity-readiness.md`
- `docs/provider-continuity-runbook.md`

Expected workflow evidence:

- Scheduled workflow exists with cron `0 * * * *`.
- Normal scheduled provider defaults to `waqi`.
- Manual provider selector allows only `waqi` and `airvisual`.
- Read-only RPC health mode exists.
- Pull requests run tests without writing live environmental data.

## Supabase/RPC read-only verification

Critical RPC:

```ts
supabase.rpc('get_latest_air_quality_per_city')
```

Preferred read-only evidence:

- RPC responds successfully.
- Response is an array or aggregate over the expected RPC rows.
- Known supported cities appear.
- Expected fields from `docs/shared-data-contract.md` are preserved.
- `reading_timestamp` remains the measurement timestamp.
- `last_successful_update_at` remains pipeline traceability.
- Nullable fields remain treated as nullable.

Expected fields:

- `city_id`
- `city_name`
- `api_name`
- `latitude`
- `longitude`
- `reading_timestamp`
- `aqi_us`
- `main_pollutant_us`
- `temperature_c`
- `humidity_percent`
- `wind_speed_ms`
- `wind_direction_deg`
- `weather_icon`
- `last_successful_update_at`

### Story 1.4.2 result

Story 1.4.2 captured live read-only RPC evidence in PR #30.

Evidence file:

- `docs/evidence/story-1-4-2-rpc-read-only-evidence.md`

Result: pass.

Observed summary:

- RPC: `get_latest_air_quality_per_city`.
- Row count: 9.
- Observed cities: Cadereyta Jimenez, Ciudad Benito Juárez, Garcia, General Escobedo, Guadalupe, Monterrey, San Nicolas de los Garza, San Pedro Garza Garcia, Santa Catarina.
- No nulls in identity, location, AQI, main pollutant, temperature, humidity, wind speed, measurement timestamp, or pipeline traceability.
- `wind_direction_deg` and `weather_icon` were null in all 9 rows and remain nullable context, not blocking drift.
- No runtime, provider, pipeline, frontend, Cloudflare, or data-contract behavior changed.

## Pass / degraded / fail outcomes

### Pass

Use pass when:

- Public app loads.
- No public/docs freshness overpromise is found.
- Pipeline read-only evidence still confirms WAQI/AQICN default.
- RPC read-only evidence confirms expected shape.

### Degraded pass

Use degraded pass when:

- Public app loads, but there is non-blocking copy/metadata drift.
- Supabase/RPC cannot be checked by the agent, but a manual checklist is provided.
- GitHub Actions recent runtime status is unavailable, but workflow config remains correct.

### Fail

Use fail when:

- Public app is unavailable.
- Runtime copy materially overpromises freshness.
- Workflow config no longer defaults to WAQI/AQICN.
- RPC shape changed or is unavailable.
- Any data appears invented, zero-filled, or falsely fresh.

## Current Story 1.4 result

Result: completed / degraded resolved.

Evidence:

- Story 1.4.1 / PR #27 mitigated public metadata freshness-claim drift in source.
- Pipeline workflow config previously confirmed hourly schedule, default `waqi`, explicit `waqi` / `airvisual` dispatch options, and read-only RPC health mode.
- Story 1.4.2 / PR #30 captured live read-only evidence from `get_latest_air_quality_per_city`.
- No runtime files were changed by Story 1.4.2.
- No pipeline files were changed by Story 1.4.2.
- No Supabase writes were performed.

## Follow-up recommendations

Recommended next follow-up:

1. Start Fase 2 only after PR #30 is merged.
2. Keep future data-touching PRs aligned with `pipeline -> Supabase/RPC -> frontend -> UX`.
3. Treat nullable environmental context fields as nullable unless a future contract story changes that expectation.

## Rollback

This file is documentation only.

Rollback:

1. Revert the PR that updated this file.
2. Keep runtime unchanged.
3. Re-open Story 1.4 / Story 1.4.2 if the evidence status still needs to be tracked.
