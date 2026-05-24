# Story 1.4.2 — Read-only RPC Evidence Capture

Status: completed  
Date: 2026-05-24  
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
- Confirmed Supabase project `monterrey-respira-db` was available and active.
- Executed a read-only shape/nullability aggregation against `public.get_latest_air_quality_per_city()`.
- Captured sanitized evidence only.
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

## Live read-only RPC evidence

Execution timestamp: 2026-05-24 10:58 America/Mexico_City  
Tool used: Supabase MCP / `execute_sql` read-only query  
Supabase project: `monterrey-respira-db`  
RPC executed: `get_latest_air_quality_per_city`  
Result: pass

### Read-only query executed

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

### Observed summary

- Row count: 9
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
  - Cadereyta Jimenez
  - Ciudad Benito Juárez
  - Garcia
  - General Escobedo
  - Guadalupe
  - Monterrey
  - San Nicolas de los Garza
  - San Pedro Garza Garcia
  - Santa Catarina
- Timestamp range:
  - oldest `reading_timestamp`: `2026-05-24 14:00:00+00`
  - newest `reading_timestamp`: `2026-05-24 14:00:00+00`
  - oldest `last_successful_update_at`: `2026-05-24 15:53:29.937394+00`
  - newest `last_successful_update_at`: `2026-05-24 15:54:50.632156+00`

### Nullability observed

- `city_id`: 0 null rows
- `city_name`: 0 null rows
- `api_name`: 0 null rows
- `latitude`: 0 null rows
- `longitude`: 0 null rows
- `reading_timestamp`: 0 null rows
- `aqi_us`: 0 null rows
- `main_pollutant_us`: 0 null rows
- `temperature_c`: 0 null rows
- `humidity_percent`: 0 null rows
- `wind_speed_ms`: 0 null rows
- `wind_direction_deg`: 9 null rows
- `weather_icon`: 9 null rows
- `last_successful_update_at`: 0 null rows

### Findings

- The RPC responded successfully and returned an aggregate over 9 rows.
- All expected active cities were observed.
- No nulls were observed in identity, location, AQI, main pollutant, weather metric, measurement timestamp, or pipeline traceability fields except for nullable fields listed below.
- `wind_direction_deg` was null for all 9 rows.
- `weather_icon` was null for all 9 rows.
- The two all-null fields are treated as nullable environmental context, not a blocking shape drift.
- No expected city was missing from the observed city list.
- No `aqi_us` null rows were observed.

### Safety confirmation

- No Supabase writes performed.
- No DDL performed.
- No SQL/RPC/schema/grants/RLS changes performed.
- No secrets exposed.
- No provider/pipeline/frontend/Cloudflare changes performed.

## Completion rule outcome

Story 1.4.2 can be marked completed because live read-only evidence was captured from an actual RPC execution and no blocking drift was observed.

Story 1.4 can be marked completed / degraded resolved when the roadmap and public runtime verification gate are reconciled with this evidence.

## No-op / rollback

This file is documentation only.

Rollback:

1. Revert the PR that updated this evidence file.
2. Keep runtime unchanged.
3. Keep Supabase unchanged.
4. Re-open Story 1.4.2 if the evidence record is removed.
