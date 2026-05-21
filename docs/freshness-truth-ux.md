# Freshness Truth UX

Status: Story 1.2 frontend note

Scope: `monterrey-respira` frontend only. No Supabase schema changes, no RPC changes, no pipeline runtime changes, no provider changes, and no service role in the app.

## Timestamp roles

- `reading_timestamp` is the environmental measurement time. It drives the dashboard freshness status.
- `last_successful_update_at` is pipeline success traceability. It may be shown as `Pipeline ...`, but it is not measurement freshness.
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
