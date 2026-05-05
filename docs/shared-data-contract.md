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

## Critical RPC

The frontend consumes this Supabase RPC directly:

```ts
supabase.rpc('get_latest_air_quality_per_city')
```

Compatibility rule: do not rename it, remove output fields, change timestamp semantics, or change one-row-per-active-city behavior without a coordinated rollout.

## Canonical RPC payload

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

## Field contract

| Field | TypeScript expectation | Nullability rule | Notes |
| --- | --- | --- | --- |
| `city_id` | `number` | required | Stable identity key. |
| `city_name` | `string` | required | Display label from RPC. |
| `api_name` | `string` | required | Upstream API naming value. |
| `latitude` | `number \| null` | nullable | Frontend falls back to static city coordinates if null. |
| `longitude` | `number \| null` | nullable | Frontend falls back to static city coordinates if null. |
| `reading_timestamp` | `string` | required | Source measurement time. Treat as UTC. |
| `aqi_us` | `number \| null` | nullable | If null, frontend must degrade to `unknown`. |
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

## Degradation rules

Allowed:

- Missing city from RPC -> `status: 'unknown'`, `dataQuality: 'degraded'`.
- Missing `aqi_us` -> `status: 'unknown'`, `dataQuality: 'degraded'`.
- Missing secondary weather fields -> show `N/D`, not invented values.

Prohibited:

- Do not invent upstream values in the pipeline.
- Do not represent missing data as AQI `0`.
- Do not label a client refresh as a new upstream measurement.
- Do not match cities by name when `city_id` is available.

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
