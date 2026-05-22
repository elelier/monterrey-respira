# Public Runtime Verification Gate — MtyRespira

Status: Story 1.4 QA/docs baseline  
Date: 2026-05-22  
Scope: `elelier/monterrey-respira` with `elelier/airquality_pipeline` as read-only operational reference

## 1. Purpose

This gate defines the minimum safe verification required after documentation, runtime, provider, deploy, or contract-affecting changes.

The goal is not to change production. The goal is to record enough evidence to know whether the public app, pipeline assumptions, and Supabase/RPC contract still agree.

This gate protects against the highest-risk MtyRespira failure mode: the public site staying online while presenting old, missing, null, or incomplete environmental readings as fresh and trustworthy.

## 2. Non-negotiables

Do not use this gate to make runtime changes.

Prohibited during this gate unless a future story explicitly authorizes it:

- Do not push directly to `main`.
- Do not change frontend runtime.
- Do not change AQI, historical chart, geolocation, cache, or city-selection behavior.
- Do not write to Supabase.
- Do not modify SQL, grants, schema, tables, or RPCs.
- Do not rename or replace `get_latest_air_quality_per_city`.
- Do not expose secrets.
- Do not use privileged database keys in the frontend/app.
- Do not change provider runtime.
- Do not change WAQI station mappings.
- Do not run forced live ingestion as part of routine verification.
- Do not silently switch from WAQI/AQICN to AirVisual/IQAir.

## 3. Source-of-truth order

Use this order when evidence conflicts:

1. Current runtime/workflow evidence from `elelier/airquality_pipeline`.
2. `docs/shared-data-contract.md`.
3. `docs/PRD.md`.
4. `docs/architecture.md`.
5. `docs/roadmap.md`.
6. `docs/freshness-truth-ux.md`.
7. `docs/blindaje-y-cambio-de-curso.md`.
8. README.

## 4. Public app verification

Verify the public app URL:

- `https://mtyrespira.elelier.com/`

Minimum checks:

- The public page responds and loads a MtyRespira experience.
- The visible experience does not present missing data as AQI `0`.
- The visible experience distinguishes environmental measurement freshness from frontend refresh when those values are available.
- The app does not claim a stronger freshness guarantee than the hourly producer cadence.
- Degraded, stale, old, or missing states remain explicit.

Evidence to capture in the PR:

- Timestamp of verification.
- URL checked.
- Browser/tool used.
- Any visible freshness/degradation state.
- Any public copy or metadata drift found.

### Current Story 1.4 observation

A safe public fetch of `https://mtyrespira.elelier.com/` on 2026-05-22 returned the page title:

```text
MonterreyRespira - Calidad del Aire en Tiempo Real
```

This is public metadata/runtime copy, not a documentation claim. It should be treated as follow-up drift because the canonical docs prohibit using `tiempo real` as a product promise unless runtime can support that meaning.

Do not fix this in this docs-only gate. Open a separate app runtime/SEO copy story if the team decides to remove that title claim.

### Story 1.4.1 follow-up

Story 1.4.1 — Public Metadata Freshness Claim Cleanup mitigates this metadata drift in source by replacing the public app title and social metadata with `MonterreyRespira - Lecturas de calidad del aire`.

The remaining degraded-pass blocker is Supabase/RPC read-only evidence for `get_latest_air_quality_per_city`; this follow-up does not change data flow, provider behavior, Supabase schema, RPCs, AQI rendering, historical views, or geolocation.

## 5. Documentation drift verification

Run or document equivalent:

```bash
rg "tiempo real|AirVisual|IQAir|WAQI|AQICN|Buildship|Netlify|privileged database key|Core DB" README.md docs AGENTS.md
```

Allowed appearances:

- `tiempo real` only as a prohibition, historical drift note, or explicit risk.
- WAQI/AQICN as active provider when sourced from pipeline evidence.
- AirVisual/IQAir only as legacy/fallback, not active provider.
- Privileged database key wording only as security prohibition or pipeline-only secret context.
- Core DB only as a clarification that it is not used for environmental readings.
- Buildship/Netlify only as legacy context, not active runtime.

Disallowed appearances:

- `tiempo real` as public product promise in docs or README.
- AirVisual/IQAir as active provider.
- Core DB as storage for environmental readings.
- Privileged database keys as app/frontend credentials.
- Buildship/Netlify as current runtime.

## 6. Pipeline read-only verification

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

Do not run the scheduled/write path from this gate.

Safe checks:

- Inspect the latest workflow configuration.
- Inspect recent workflow status if GitHub Actions access is available.
- Use the read-only RPC health mode only when an operator intentionally wants read-only RPC evidence.

Unsafe checks:

- Forced live ingestion.
- Manual runs intended to insert readings unless a separate operations story authorizes it.

## 7. Supabase/RPC read-only verification

The critical RPC is:

```ts
supabase.rpc('get_latest_air_quality_per_city')
```

Preferred read-only evidence:

- RPC responds successfully.
- Response is an array.
- At least one known supported city appears.
- Each sampled row preserves expected fields from `docs/shared-data-contract.md`.
- `reading_timestamp` remains the measurement timestamp.
- `last_successful_update_at` remains pipeline traceability.
- Nullable fields remain treated as nullable.

If Supabase is not connected to the agent, do not guess. Record the blocker and ask an operator to run a read-only sample of `get_latest_air_quality_per_city` in Supabase.

Manual reviewer should verify:

- `city_id`
- `city_name`
- `api_name`
- `reading_timestamp`
- `aqi_us`
- `main_pollutant_us`
- `temperature_c`
- `humidity_percent`
- `wind_speed_ms`
- `wind_direction_deg`
- `weather_icon`
- `last_successful_update_at`

Do not change SQL, grants, schema, function body, RLS, or data as part of this gate.

## 8. Pass / degraded / fail outcomes

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

## 9. Current Story 1.4 result

Result: degraded pass pending read-only RPC evidence.

Evidence:

- Public app URL responded on 2026-05-22.
- Public metadata included `Calidad del Aire en Tiempo Real`; Story 1.4.1 mitigates this runtime/SEO copy drift in source.
- Pipeline workflow config confirms hourly schedule, default `waqi`, explicit `waqi` / `airvisual` dispatch options, and read-only RPC health mode.
- No Supabase live query was executed from this agent session because no Supabase connector/tool was available here.
- No runtime files were changed.
- No pipeline files were changed.
- No Supabase writes were performed.

## 10. Follow-up recommendations

Recommended next follow-up after this gate and Story 1.4.1:

1. Manual or agent-enabled read-only Supabase RPC evidence capture for `get_latest_air_quality_per_city`.
2. Fase 2 Story 2.1 — Docs Drift Cleanup only after RPC evidence is captured or explicitly accepted as a remaining degraded-pass blocker.

## 11. Rollback

This file is documentation only.

Rollback:

1. Revert the PR that added this file.
2. Keep runtime unchanged.
3. Re-open Story 1.4 if the removed evidence still needs to be captured.
