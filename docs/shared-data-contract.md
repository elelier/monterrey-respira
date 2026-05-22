# Shared Data Contract

Status: Brownfield baseline

This document freezes the shared product boundary for MtyRespira:

`provider (WAQI/AQICN active; AirVisual/IQAir legacy/fallback) -> airquality_pipeline -> Supabase tables -> RPC -> monterrey-respira frontend`

The contract is intentionally provider-agnostic from the frontend perspective. The frontend must consume normalized Supabase/RPC fields and must not depend on AirVisual-only, WAQI-only, or provider-specific payload internals.

## Source of truth hierarchy

When implementation, docs, tests, and runtime disagree, use this order:

1. Effective workflow behavior in `airquality_pipeline/.github/workflows/air-quality-workflow.yml`
2. This document
3. Producer and consumer code
4. Supporting docs such as `docs/architecture.md`
5. Provider continuity docs in `elelier/airquality_pipeline/docs/provider-continuity-readiness.md` and `elelier/airquality_pipeline/docs/provider-continuity-runbook.md`

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
    - `waqi_api.py`
    - `airvisual_api.py`
    - `update_city.py`
    - `utils.py`
    - `.github/workflows/air-quality-workflow.yml`

## Provider boundary

Runtime provider state confirmed by the pipeline:

- WAQI/AQICN is the active provider.
- `AIR_QUALITY_PROVIDER=waqi` is the default.
- WAQI uses existing Supabase cities and explicit city -> station mapping.
- AirVisual/IQAir is a legacy/fallback adapter only; it is not the active provider.
- `workflow_dispatch.provider` can explicitly select `waqi` or `airvisual` for controlled manual runs.

Contract rule: provider-specific ingestion can change only through a coordinated pipeline/contract rollout. The frontend contract remains the normalized Supabase/RPC payload, not the upstream provider response.

## Critical latest RPC

The frontend consumes this Supabase RPC directly for the current dashboard:

```ts
supabase.rpc('get_latest_air_quality_per_city')
```

Compatibility rule: do not rename it, remove output fields, change timestamp semantics, or change one-row-per-active-city behavior without a coordinated rollout.

## Additive raw history RPC

The frontend may consume this additive Supabase RPC for raw historical city trends up to 31 days:

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
    and r.reading_timestamp >= now() - make_interval(hours => greatest(1, least(coalesce(p_hours, 24), 24 * 31)))
  order by r.reading_timestamp asc;
$$;

grant execute on function public.get_air_quality_history_for_city(bigint, integer) to anon, authenticated;
```

## Additive daily aggregate history RPC

The frontend may consume this additive Supabase RPC for 6 month daily aggregates:

```ts
supabase.rpc('get_daily_air_quality_history_for_city', {
  p_city_id: cityId,
  p_days: days,
})
```

Manual SQL to create or replace the function:

```sql
create or replace function public.get_daily_air_quality_history_for_city(
  p_city_id bigint,
  p_days integer default 183
)
returns table (
  city_id bigint,
  city_name text,
  reading_date date,
  avg_aqi_us numeric,
  max_aqi_us smallint,
  avg_temperature_c numeric,
  avg_humidity_percent numeric,
  dominant_pollutant_us text,
  reading_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  with base as (
    select
      c.id as city_id,
      c.name as city_name,
      r.reading_timestamp::date as reading_date,
      r.aqi_us,
      r.main_pollutant_us,
      r.temperature_c,
      r.humidity_percent
    from public.air_quality_readings r
    join public.cities c on c.id = r.city_id
    where c.id = p_city_id
      and c.is_active = true
      and r.reading_timestamp >= now() - make_interval(days => greatest(1, least(coalesce(p_days, 183), 366)))
  ), pollutant_counts as (
    select
      city_id,
      reading_date,
      main_pollutant_us,
      count(*) as pollutant_count,
      row_number() over (
        partition by city_id, reading_date
        order by count(*) desc, main_pollutant_us asc
      ) as pollutant_rank
    from base
    where main_pollutant_us is not null
    group by city_id, reading_date, main_pollutant_us
  )
  select
    b.city_id,
    max(b.city_name) as city_name,
    b.reading_date,
    round(avg(b.aqi_us)::numeric, 1) as avg_aqi_us,
    max(b.aqi_us) as max_aqi_us,
    round(avg(b.temperature_c)::numeric, 1) as avg_temperature_c,
    round(avg(b.humidity_percent)::numeric, 1) as avg_humidity_percent,
    max(pc.main_pollutant_us) filter (where pc.pollutant_rank = 1) as dominant_pollutant_us,
    count(*) as reading_count
  from base b
  left join pollutant_counts pc
    on pc.city_id = b.city_id
   and pc.reading_date = b.reading_date
   and pc.pollutant_rank = 1
  group by b.city_id, b.reading_date
  order by b.reading_date asc;
$$;

grant execute on function public.get_daily_air_quality_history_for_city(bigint, integer) to anon, authenticated;
```

Rollback SQL:

```sql
drop function if exists public.get_daily_air_quality_history_for_city(bigint, integer);
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

## Canonical raw history RPC payload

The raw history RPC returns rows ordered by `reading_timestamp` ascending:

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

## Canonical daily history RPC payload

The daily history RPC returns rows ordered by `reading_date` ascending:

```jsonc
[
  {
    "city_id": 9,
    "city_name": "Monterrey",
    "reading_date": "2026-01-01",
    "avg_aqi_us": 75.4,
    "max_aqi_us": 92,
    "avg_temperature_c": 23.1,
    "avg_humidity_percent": 45.2,
    "dominant_pollutant_us": "p2",
    "reading_count": 24
  }
]
```

## Field contract

| Field | TypeScript expectation | Nullability rule | Notes |
| --- | --- | --- | --- |
| `city_id` | `number` | required | Stable identity key. |
| `city_name` | `string` | required | Display label from RPC. |
| `api_name` | `string` | required | Upstream/provider naming value normalized through Supabase. |
| `latitude` | `number \| null` | nullable | Frontend falls back to static city coordinates if null. |
| `longitude` | `number \| null` | nullable | Frontend falls back to static city coordinates if null. |
| `reading_timestamp` | `string` | required | Source measurement time. Treat as UTC. |
| `reading_date` | `string` | required for daily aggregate RPC | Daily bucket date derived from `reading_timestamp`. |
| `aqi_us` | `number \| null` | nullable | If null, frontend must degrade to `unknown`. History chart excludes null metric rows. |
| `avg_aqi_us` | `number \| null` | nullable | Daily aggregate average. |
| `max_aqi_us` | `number \| null` | nullable | Daily aggregate max. |
| `main_pollutant_us` | `string \| null` | nullable | Dominant pollutant marker, not pollutant concentration. |
| `dominant_pollutant_us` | `string \| null` | nullable | Daily dominant pollutant marker, not pollutant concentration. |
| `temperature_c` | `number \| null` | nullable | UI shows `N/D` if missing. |
| `avg_temperature_c` | `number \| null` | nullable | Daily aggregate average. |
| `humidity_percent` | `number \| null` | nullable | UI shows `N/D` if missing. |
| `avg_humidity_percent` | `number \| null` | nullable | Daily aggregate average. |
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
- 24h, 7d, and 30d use raw readings by `reading_timestamp`.
- 6m uses daily aggregates to avoid heavy mobile chart rendering.

## Pollutant data limitation

The current normalized contract exposes AQI and dominant pollutant keys from provider payloads. Under WAQI/AQICN, pollutant concentration availability is provider/station dependent and is not guaranteed by this frontend contract. Under legacy AirVisual/IQAir, historical concentration series are also not part of the current contract.

Allowed:

- Show `main_pollutant_us` or `dominant_pollutant_us` as dominant pollutant metadata.
- Show distribution/frequency of dominant pollutant values.

Prohibited:

- Do not graph PM2.5, PM10, O3, NO2, SO2, or CO as concentration series unless new columns or a confirmed provider contract exist.
- Do not infer pollutant concentrations from AQI or dominant pollutant markers.

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
- Do not switch to AirVisual/IQAir silently to mask WAQI/AQICN failure.

## Release checklist for contract-affecting changes

Before merge:

- [ ] Validate `npm run lint` and `npm run build` for frontend changes.
- [ ] Validate `pytest` for pipeline changes.
- [ ] Check whether the change affects RPC shape, nullability, freshness, timestamps, cache, provider, or city identity.
- [ ] Update this document if the shared contract changes.
- [ ] Add or update fixture/smoke evidence for `get_latest_air_quality_per_city`.
- [ ] Include rollback guidance when a change touches Supabase/RPC, pipeline, public deploy, provider, or routing.

After deploy:

- [ ] Validate public site availability at `https://mtyrespira.elelier.com`.
- [ ] Validate expected hourly workflow behavior in `airquality_pipeline`.
- [ ] Validate at least one known city payload against the canonical fixture.
