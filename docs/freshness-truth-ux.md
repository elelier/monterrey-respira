# Freshness Truth UX

Status: Story 1.2 frontend note; public methodology hardening updated by Story UX-Trust-Next.

Scope: `monterrey-respira` frontend only. No Supabase schema changes, no RPC changes, no pipeline runtime changes, no provider changes, and no service role in the app.

## Timestamp roles

- `reading_timestamp` is the environmental measurement time. It drives the dashboard freshness status.
- `last_successful_update_at` is pipeline success traceability. It may be shown as `Pipeline ...`, but it is not measurement freshness.
- `weather_timestamp` is weather context measurement time when canonical weather fields are available.
- Frontend cache or refresh time only means the app fetched or read data. It must not be described as a new measurement.

## Latest-reading thresholds

| Status | Age by `reading_timestamp` | UI copy |
| --- | --- | --- |
| `fresh` | `<= 2h` | `Medicion reciente` |
| `stale` | `> 2h` and `<= 6h` | `Medicion con retraso` |
| `old` | `> 6h` | `Dato viejo` |
| `unknown` | missing, invalid, future timestamp outside tolerance, or no reliable AQI | `Sin lectura disponible` |

## Fail-closed rules

- Missing latest RPC row degrades to `unknown`.
- `aqi_us: null` degrades to `unknown`; it must never become healthy AQI `0`.
- Missing or invalid `reading_timestamp` degrades freshness to `unknown`.
- Stale or old readings may keep the AQI value visible, but the UI must mark the reading as degraded and show caution copy.
- Missing secondary weather fields render as `N/D`; they are not invented.

## UI presentation rule

The AQI card should distinguish:

- `Medicion ...` from `reading_timestamp`.
- `Pipeline ...` from `last_successful_update_at`.

Do not use stronger freshness language than the hourly producer cadence can support.

## Public source and methodology surface

Public copy may expose a compact and full methodology surface, but it must stay aligned with the shared data contract:

- AQI source: WAQI/AQICN through the pipeline and Supabase/RPC.
- Weather context: Open-Meteo when canonical `weather_*` fields are available; this is secondary context and must not be described as the AQI source.
- Attribution: WAQI/AQICN and the EPA/source originator must be visible where source methodology is explained.
- Degraded states: `Medicion con retraso`, `Dato viejo`, and `Sin lectura disponible` must be explained in user-facing language.
- CTAs should route to existing product surfaces only. Do not add a public problem/suggestion submission CTA until there is a specific Core DB `submit_signal` integration for that signal kind.
- Core DB remains limited to product signals and is not a source of AQI, weather, historical readings, or provider state.
