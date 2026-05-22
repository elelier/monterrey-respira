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

Equivalent Supabase SQL editor read-only query:

```sql
select *
from public.get_latest_air_quality_per_city();
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

## Manual evidence capture packet

Use this section only when an operator has read-only access to the MtyRespira Supabase project.

### Safety constraints

Allowed:

- Run a read-only RPC call.
- Copy only sanitized evidence into this file.
- Summarize observed fields, row count, timestamps, nullability, and sampled city names.

Prohibited:

- Do not run `insert`, `update`, `delete`, `truncate`, `merge`, `create`, `alter`, `drop`, `grant`, `revoke`, or `replace function`.
- Do not change RLS, schema, tables, grants, function body, providers, WAQI station mappings, frontend runtime, pipeline runtime, or Cloudflare config.
- Do not expose Supabase URL if private, anon key, service role key, WAQI token, AirVisual token, or any secret.
- Do not paste full raw payload if it includes anything not needed for evidence.
- Do not correct data from this story.

### Preferred read-only query

```sql
select *
from public.get_latest_air_quality_per_city();
```

### Optional shape-only helper

If the SQL editor allows CTEs and the operator wants a compact shape check without pasting all rows:

```sql
with rpc_rows as (
  select *
  from public.get_latest_air_quality_per_city()
)
select
  count(*) as row_count,
  array_agg(city_name order by city_name) as observed_cities,
  count(*) filter (where city_id is null) as null_city_id_rows,
  count(*) filter (where city_name is null) as null_city_name_rows,
  count(*) filter (where api_name is null) as null_api_name_rows,
  count(*) filter (where latitude is null) as null_latitude_rows,
  count(*) filter (where longitude is null) as null_longitude_rows,
  count(*) filter (where reading_timestamp is null) as null_reading_timestamp_rows,
  count(*) filter (where aqi_us is null) as null_aqi_us_rows,
  count(*) filter (where main_pollutant_us is null) as null_main_pollutant_us_rows,
  count(*) filter (where temperature_c is null) as null_temperature_c_rows,
  count(*) filter (where humidity_percent is null) as null_humidity_percent_rows,
  count(*) filter (where wind_speed_ms is null) as null_wind_speed_ms_rows,
  count(*) filter (where wind_direction_deg is null) as null_wind_direction_deg_rows,
  count(*) filter (where weather_icon is null) as null_weather_icon_rows,
  count(*) filter (where last_successful_update_at is null) as null_last_successful_update_at_rows,
  min(reading_timestamp) as oldest_reading_timestamp,
  max(reading_timestamp) as newest_reading_timestamp,
  min(last_successful_update_at) as oldest_last_successful_update_at,
  max(last_successful_update_at) as newest_last_successful_update_at
from rpc_rows;
```

This helper is still read-only. It must not be changed into a write, DDL, grant, RLS, or function replacement.

### Sanitized evidence template

Replace the placeholders only after the read-only query has actually run.

```md
## Live read-only RPC evidence

Execution timestamp: YYYY-MM-DD HH:MM TZ  
Tool used: Supabase SQL editor / Supabase MCP / other read-only tool  
RPC executed: `get_latest_air_quality_per_city`  
Result: pass / degraded / fail

### Observed summary

- Row count: N
- Observed fields:
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
- Known cities observed:
  - City A
  - City B
- Timestamp range:
  - oldest `reading_timestamp`: VALUE
  - newest `reading_timestamp`: VALUE
  - oldest `last_successful_update_at`: VALUE
  - newest `last_successful_update_at`: VALUE

### Nullability observed

- `city_id`: N null rows
- `city_name`: N null rows
- `api_name`: N null rows
- `latitude`: N null rows
- `longitude`: N null rows
- `reading_timestamp`: N null rows
- `aqi_us`: N null rows
- `main_pollutant_us`: N null rows
- `temperature_c`: N null rows
- `humidity_percent`: N null rows
- `wind_speed_ms`: N null rows
- `wind_direction_deg`: N null rows
- `weather_icon`: N null rows
- `last_successful_update_at`: N null rows

### Findings

- `aqi_us` null rows: describe only if observed; do not correct here.
- Expected city missing: describe only if observed; do not invent cause.
- Shape drift: describe only if observed.

### Safety confirmation

- No Supabase writes performed.
- No DDL performed.
- No SQL/RPC/schema/grants/RLS changes performed.
- No secrets exposed.
- No provider/pipeline/frontend/Cloudflare changes performed.
```

## Completion rule

Do not mark Story 1.4.2 as completed until the live evidence template above is filled from an actual read-only RPC execution.

If the live query confirms expected shape and no blocking drift:

- Mark Story 1.4.2 completed in `docs/roadmap.md`.
- Mark Story 1.4 completed or degraded resolved in `docs/roadmap.md` and `docs/public-runtime-verification-gate.md`.
- Keep Story 1.4.1 completed by PR #27.

If the live query fails or shows drift:

- Keep Story 1.4 and Story 1.4.2 open.
- Document the observed failure without correction.
- Create a separate follow-up story scoped to the exact failure.

If Supabase remains unavailable:

- Do not open another duplicate blocked-evidence PR.
- Keep this file as the operator handoff.
- Ask for sanitized output from the read-only query.

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

1. Revert the PR that added or updated this evidence file.
2. Keep runtime unchanged.
3. Keep Supabase unchanged.
4. Re-open Story 1.4.2 if the evidence record is removed.
