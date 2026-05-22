# Story 1.4.2 — Read-only RPC Evidence Capture

Status: blocked / degraded evidence  
Date: 2026-05-22  
Repo: `elelier/monterrey-respira`  
Reference repo: `elelier/airquality_pipeline`  
Scope: QA / Docs / PM-PO only

## Objective

Capture safe evidence for the critical Supabase RPC consumed by the public MtyRespira app:

```ts
supabase.rpc('get_latest_air_quality_per_city')
```

This story exists to close the remaining Story 1.4 verification gap without changing runtime, frontend behavior, provider behavior, Supabase schema, RPC definitions, grants, RLS, tables, or live environmental data.

## Scope executed

- Verified that the canonical documentation gate exists before proceeding.
- Reviewed the app-side RPC consumption path as read-only reference.
- Prepared a safe evidence record for the RPC check.
- Did not execute data writes.
- Did not execute DDL.
- Did not modify SQL, grants, schema, RLS, function body, WAQI stations, provider runtime, frontend runtime, Cloudflare config, or pipeline runtime.

## Canonical docs checked

Minimum canonical docs are present:

- `AGENTS.md`
- `docs/PRD.md`
- `docs/architecture.md`
- `docs/roadmap.md`

Related docs checked for this evidence gate:

- `README.md`
- `docs/DOCUMENTATION_INDEX.md`
- `docs/shared-data-contract.md`
- `docs/freshness-truth-ux.md`
- `docs/blindaje-y-cambio-de-curso.md`
- `docs/public-runtime-verification-gate.md`

## Query / RPC intended

Read-only target:

```ts
supabase.rpc('get_latest_air_quality_per_city')
```

Expected fields from `docs/shared-data-contract.md`:

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

## Evidence captured

Result: blocked / degraded evidence.

Reason:

- The active session exposed GitHub and Notion tooling, but no Supabase connector/tool for live RPC execution.
- No Supabase URL/key/secret was requested, copied, printed, committed, or exposed.
- No live RPC response was retrieved from Supabase in this session.

Safe evidence available from repo review:

- The frontend consumes `get_latest_air_quality_per_city` through `src/services/apiService.ts`.
- The app asserts that the RPC response must be an array before returning it to the UI.
- The shared data contract defines the canonical latest RPC payload shape listed above.
- The public runtime verification gate already treats missing RPC evidence as degraded/pass blocker rather than success.

## Evidence not captured

Because live Supabase access was not available, this file does not claim:

- row count,
- sample city values,
- observed nullability,
- observed `reading_timestamp`,
- observed `last_successful_update_at`,
- current `aqi_us` values,
- current pollutant values,
- whether any expected city is currently missing.

Do not infer or invent any environmental values from this document.

## Outcome

Story 1.4.2 should remain open / blocked until an operator or future agent session with Supabase read-only access captures the RPC response safely.

Story 1.4 remains degraded/open because its two relevant threads are now split as follows:

- Story 1.4.1 — public metadata freshness claim cleanup: completed by PR #27.
- Story 1.4.2 — read-only RPC evidence capture: blocked in this session because live Supabase RPC access was unavailable.

## Required follow-up evidence

A future read-only evidence run should record:

- execution timestamp,
- tool used,
- RPC name,
- number of rows returned,
- one or more known supported cities if present,
- field names observed,
- nullability observed,
- timestamp fields observed,
- any `aqi_us = null` rows without correcting them,
- any missing expected city without inventing cause.

## No-op / rollback

This file is documentation only.

Rollback:

1. Revert the PR that added this evidence file.
2. Keep runtime unchanged.
3. Keep Supabase unchanged.
4. Re-open Story 1.4.2 if the evidence record is removed.
