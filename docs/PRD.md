# PRD — MtyRespira

Status: canonical brownfield baseline  
Date: 2026-05-21  
Owner: EL

## 1. Product summary

MtyRespira is a public web app that helps people in Monterrey and its metropolitan area understand available air-quality readings by city.

The product is brownfield and already operates publicly at:

- `https://mtyrespira.elelier.com/`

The current product value is not a promise of real-time monitoring. The value is an honest, readable presentation of reported environmental measurements, their AQI context, and their freshness state.

## 2. Current system baseline

MtyRespira operates as one coordinated product across:

- `elelier/monterrey-respira`: public React + TypeScript + Vite frontend.
- `elelier/airquality_pipeline`: Python + GitHub Actions environmental data pipeline.
- Supabase PostgreSQL environmental database.

Current shared data concepts:

- Tables: `cities`, `air_quality_readings`, `pipeline_logs` when applicable.
- Critical RPC: `get_latest_air_quality_per_city`.
- Public app hosting target: Cloudflare Pages.
- Current public app URL: `https://mtyrespira.elelier.com/`.
- Active provider: WAQI/AQICN, confirmed by pipeline docs/runtime configuration.
- Legacy/fallback provider: IQAir/AirVisual, only for explicit controlled fallback when access is healthy.

Canonical data flow:

```text
provider (WAQI/AQICN active; AirVisual/IQAir legacy/fallback) -> airquality_pipeline -> Supabase tables -> get_latest_air_quality_per_city -> frontend -> public UX
```

## 3. Objective for this brownfield phase

Stabilize trust before expanding features.

The product must evolve without breaking:

- AQI interpretation.
- Historical readings.
- Geolocation behavior.
- The shared data contract.
- The public app.
- The hourly producer assumptions.
- The distinction between measurement time and pipeline update time.
- The distinction between active provider and legacy/fallback adapters.

## 4. Users

Primary users:

- People in Monterrey and nearby municipalities checking available local air-quality readings.
- People deciding whether to take basic precautions based on AQI and pollutant context.

Maintainer/operator users:

- Product and engineering maintainers validating public UX.
- Operators reviewing pipeline/provider continuity.
- Agents working on small, safe PRs under product guardrails.

## 5. Success criteria

User success:

- A user can select a supported city and understand the AQI state, main pollutant if available, and measurement freshness.
- A user can distinguish a recent reading from a delayed, old, degraded, or unavailable reading.
- The UI does not represent missing or unreliable data as healthy/fresh.

Operational success:

- The project has canonical docs for PRD, architecture, roadmap, and agent rules.
- Future stories follow the documented roadmap instead of being invented from memory.
- Provider continuity is documented and runbook-ready in `elelier/airquality_pipeline`.
- Runtime claims in README and docs do not contradict Freshness Truth UX.
- Story 1.4 can verify runtime public behavior after this documentation reconciliation.

Technical success:

- `get_latest_air_quality_per_city` remains the critical read boundary.
- `reading_timestamp` remains the measurement-time source for freshness.
- `last_successful_update_at` remains pipeline traceability, not measurement freshness.
- No frontend code uses service-role credentials.
- Environmental readings remain in the MtyRespira Supabase boundary, not Core DB.
- The frontend contract remains provider-agnostic and based on normalized Supabase/RPC fields.

## 6. Functional requirements

### FR1 — Public city reading

The app must let a user consult available air-quality readings for supported Monterrey-area cities.

### FR2 — AQI state presentation

The app must present AQI and status using the shared AQI interpretation rules. Missing AQI must not become a normal AQI `0`.

### FR3 — Main pollutant presentation

The app may present the main pollutant when available. Missing pollutant data must degrade to `N/D` or equivalent unknown copy, not invented values.

### FR4 — Measurement freshness

The app must use `reading_timestamp` as the source for environmental measurement freshness.

### FR5 — Pipeline traceability

The app may show `last_successful_update_at` as pipeline traceability, but it must not treat that timestamp as the measurement time.

### FR6 — Degraded states

The app must communicate degraded, stale, old, unknown, or unavailable states explicitly when the data contract is incomplete or stale.

### FR7 — Shared contract consumption

The frontend must consume environmental readings through `get_latest_air_quality_per_city` unless an architecture decision explicitly changes that contract.

### FR8 — City identity

The product must reconcile cities by `city_id` where available, not by display names.

### FR9 — Historical readings

Historical air-quality views must not invent missing series, timestamps, pollutants, or AQI values.

### FR10 — Geolocation

Geolocation UX must preserve the supported-area boundary and must not imply coverage outside the product scope unless explicitly implemented.

### FR11 — Provider continuity

Provider continuity work must classify upstream failures and maintain honest public states without adding unverified fallback providers.

Current status: requirement documented/runbook-ready by PR #14 in `elelier/airquality_pipeline`. Remaining work is runtime public verification, not a blocker for provider docs readiness.

### FR12 — Documentation governance

Changes that affect runtime, contract, freshness, provider, or public claims must update the relevant canonical docs in the same PR or explicitly document the gap.

## 7. Non-functional requirements

### NFR1 — Honesty of freshness

The product must not use “tiempo real” as a promise unless the runtime can truly support that meaning. Current copy should use honest language such as “lecturas disponibles”, “medición reportada”, or “actualización por pipeline horario”.

### NFR2 — Data integrity

The product must fail closed when data is missing, stale, null, malformed, or contract-uncertain.

### NFR3 — Security

The frontend must never include service-role keys, provider API keys, or privileged secrets.

### NFR4 — Static deploy compatibility

The public app must remain compatible with a static Vite frontend deployment unless architecture is explicitly revised.

### NFR5 — Contract stability

The RPC `get_latest_air_quality_per_city` must not be renamed, removed, or semantically changed without a coordinated rollout.

### NFR6 — Cross-repo safety

Any environmental data change must consider app, pipeline, Supabase/RPC, and UX together.

### NFR7 — Documentation traceability

README and docs must not present legacy providers, Buildship, Netlify, or obsolete runtime paths as current truth.

## 8. Out of scope

Out of scope for this brownfield stabilization phase:

- User authentication.
- Personalized alerts.
- National expansion.
- New unsupported cities.
- Forecasting.
- Gamification.
- New environmental providers without contract work.
- Core DB as a store for environmental readings.
- Public dashboards for internal product telemetry.
- Any service-role usage in the frontend.

## 9. Open risks

- Runtime public verification still needs explicit evidence after documentation/provider-state reconciliation.
- RPC SQL/grants/nullability may still need direct Supabase verification if not fully closed by prior smoke evidence.
- Some historical docs may still include legacy references that need cleanup in later stories.
- WAQI/AQICN availability, token health, and station mapping remain operational risks.
- AirVisual/IQAir must not be treated as a normal fallback while access is unproven or unhealthy.

## 10. Relationship to roadmap

This PRD supports the roadmap in `docs/roadmap.md`.

Current gate/status:

- Story 1.1: completed when PR evidence confirms RPC contract smoke/runtime nullability.
- Story 1.2: completed by PR #23 — `feat: add freshness truth UX guard`.
- Story 1.2.1: completed by PR #24 — `docs: add canonical MtyRespira project docs baseline`.
- Story 1.3: completed by PR #14 in `elelier/airquality_pipeline` — `docs: add provider continuity readiness runbook`.
- Story 1.3.1: reconciles app docs with the post-PR #14 provider state.
- Story 1.4: next recommended gate — Public Runtime Verification Gate.

## 11. Source of truth

When there is drift, use this order:

1. Runtime/workflow evidence for production behavior.
2. `docs/shared-data-contract.md` for shared data semantics.
3. `docs/PRD.md` for product scope.
4. `docs/architecture.md` for architecture of record.
5. `docs/roadmap.md` for story order.
6. `AGENTS.md` for agent execution rules.
7. README for contributor orientation.
8. Provider continuity docs in `elelier/airquality_pipeline` for operational runbook details.

Do not use stale README claims as product truth when they conflict with the contract or freshness docs.
