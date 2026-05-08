# Shared Data Contract

Status: Brownfield baseline

This document freezes the shared product boundary for MtyRespira:

`AirVisual -> airquality_pipeline -> Supabase tables -> RPC -> monterrey-respira frontend`

## Source of truth hierarchy

When implementation, docs, tests, and runtime disagree, use this order:

1. Effective workflow behavior in `airquality_pipeline/.github/workflows/air-quality-workflow.yml`
2. This document
3. Producer and consumer code
4. Supporting docs such as `docs/data-pipeline.md` and `docs/architecture.md`

## Repos involved

- `elelier/monterrey-respira`
  - Public deployment target: `https://mtyrespira.elelier.com`
  - Consumer paths:
    - `src/services/apiService.ts`
    - `src/context/AirQualityContext.tsx`
    - `src/types/index.ts`
- `elelier/airquality_pipeline`
  - Producer paths:
    - `main.py`
    - `update_city.py`
    - `utils.py`
    - `.github/workflows/air-quality-workflow.yml`

## Critical latest RPC

The frontend consumes this Supabase RPC directly for the current dashboard:

```ts
supabase.rpc('get_latest_air_quality_per_city')
```

Compatibility rule: do not rename it, remove output fields, change timestamp semantics, or change one-row-per-active-city behavior without a coordinated rollout.

## Additive history RPC

The frontend may consume this additive Supabase RPC for historical city trends:

```ts
supabase.rpc('get_air_quality_history_for_city', {
  p_city_id: cityId,
  p_hours: hours,
})
```

Compatibility rule: this RPC is additive and must not replace or modify `get_latest_air_quality_per_city`.

Manual SQL to create or replace the function:

```sql
create or replace function public.get_air_quality_history_for_city(
  p_city_id bigint,
  p_hours integer default 24
)
returns table (
  city_id bigint,
  city_name text,
  reading_timestamp timestamptz,
  aqi_us smallint,
  main_pollutant_us text,
  temperature_c real,
  humidity_percent smallint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id as city_id,
    c.name as city_name,
    r.reading_timestamp,
    r.aqi_us,
    r.main_pollutant_us,
    r.temperature_c,
    r.humidity_percent
  from public.air_quality_readings r
  join public.cities c on c.id = r.city_id
  where c.id = p_city_id
    and c.is_active = true
    and r.reading_timestamp >= now() - make_interval(hours => greatest(1, least(coalesce(p_hours, 24), 24 * 14)))
  order by r.reading_timestamp asc;
$$;

grant execute on function public.get_air_quality_history_for_city(bigint, integer) to anon, authenticated;
```

Rollback SQL:

```sql
drop function if exists public.get_air_quality_history_for_city(bigint, integer);
```

## Canonical latest RPC payload

The frontend expects an array compatible with this shape:

```jsonc
[
  {
    "city_id": 9,
    "city_name": "Monterrey",
    "api_name": "Monterrey",
    "latitude": 25.67507,
    "longitude": -100.31847,
    "reading_timestamp": "2026-01-01T00:00:00+00:00",
    "aqi_us": 75,
    "main_pollutant_us": "p2",
    "temperature_c": 23,
    "humidity_percent": 45,
    "wind_speed_ms": 2.5,
    "wind_direction_deg": 90,
    "weather_icon": "01d",
    "last_successful_update_at": "2026-01-01T00:03:00+00:00"
  }
]
```

## Canonical history RPC payload

The history RPC returns rows ordered by `reading_timestamp` ascending:

```jsonc
[
  {
    "city_id": 9,
    "city_name": "Monterrey",
    "reading_timestamp": "2026-01-01T00:00:00+00:00",
    "aqi_us": 75,
    "main_pollutant_us": "p2",
    "temperature_c": 23,
    "humidity_percent": 45
  }
]
```

## Field contract

| Field | TypeScript expectation | Nullability rule | Notes |
| --- | --- | --- | --- |
| `city_id` | `number` | required | Stable identity key. |
| `city_name` | `string` | required | Display label from RPC. |
| `api_name` | `string` | required | Upstream API naming value. |
| `latitude` | `number \| null` | nullable | Frontend falls back to static city coordinates if null. |
| `longitude` | `number \| null` | nullable | Frontend falls back to static city coordinates if null. |
| `reading_timestamp` | `string` | required | Source measurement time. Treat as UTC. |
| `aqi_us` | `number \| null` | nullable | If null, frontend must degrade to `unknown`. History chart excludes null AQI rows. |
| `main_pollutant_us` | `string \| null` | nullable | UI shows `N/D` if missing. |
| `temperature_c` | `number \| null` | nullable | UI shows `N/D` if missing. |
| `humidity_percent` | `number \| null` | nullable | UI shows `N/D` if missing. |
| `wind_speed_ms` | `number \| null` | nullable | UI shows `N/D` if missing. |
| `wind_direction_deg` | `number \| null` | nullable | UI hides icon rotation if missing. |
| `weather_icon` | `string \| null` | nullable | UI hides weather icon if missing. |
| `last_successful_update_at` | `string \| null` | nullable | Pipeline write success time. Treat as UTC. |

## Freshness rules

Confirmed product cadence:

- Producer workflow cron: `0 * * * *`
- Pipeline update interval: `59` minutes
- Frontend cache TTL: `60 * 60 * 1000` ms
- Frontend refresh interval: every `5` minutes

Rules:

- `reading_timestamp` is measurement time.
- `last_successful_update_at` is pipeline write success time.
- The UI must not imply stronger freshness than the hourly producer cadence.
- If data is missing, stale, nullable in critical fields, or contract-invalid, the frontend must fail closed to an explicit degraded/unknown state.
- Historical charts are based only on stored measurements available in `air_quality_readings`; gaps are allowed and must not be filled with invented zeroes.

## Degradation rules

Allowed:

- Missing city from latest RPC -> `status: 'unknown'`, `dataQuality: 'degraded'`.
- Missing `aqi_us` in latest RPC -> `status: 'unknown'`, `dataQuality: 'degraded'`.
- Missing secondary weather fields -> show `N/D`, not invented values.
- Missing or unavailable history RPC -> hide the chart and show a small degraded history state while preserving the latest dashboard.

Prohibited:

- Do not invent upstream values in the pipeline.
- Do not represent missing data as AQI `0`.
- Do not label a client refresh as a new upstream measurement.
- Do not match cities by name when `city_id` is available.
- Do not fallback historical charts to random, mocked, or zero-filled series.

## Release checklist for contract-affecting changes

Before merge:

- [ ] Validate `npm run lint` and `npm run build` for frontend changes.
- [ ] Validate `pytest` for pipeline changes.
- [ ] Check whether the change affects RPC shape, nullability, freshness, timestamps, cache, or city identity.
- [ ] Update this document if the shared contract changes.
- [ ] Add or update fixture/smoke evidence for `get_latest_air_quality_per_city`.
- [ ] Include rollback guidance when a change touches Supabase/RPC, pipeline, public deploy, or routing.

After deploy:

- [ ] Validate public site availability at `https://mtyrespira.elelier.com`.
- [ ] Validate expected hourly workflow behavior in `airquality_pipeline`.
- [ ] Validate at least one known city payload against the canonical fixture.
