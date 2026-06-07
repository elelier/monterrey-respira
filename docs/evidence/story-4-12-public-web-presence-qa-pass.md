# Story 4.12 — Public Web Presence QA Evidence Pass

Status: PARTIAL — connector evidence pass created; runtime/browser commands not run in this connector session.
Date: 2026-06-07
Context: first evidence pass after PR #46 (`docs: add public web presence QA matrix`).

## Purpose

Convert the Story 4.11 public QA matrix into a reusable evidence artifact before continuing public UX/SEO changes.

This pass is intentionally docs-only. It does not change runtime UI, data fetching, Supabase, RPCs, provider behavior, pipeline behavior, Cloudflare configuration, or Core DB usage.

## Source matrix

Matrix used:

- `docs/public-web-presence-qa-matrix.md`

Relevant baseline confirmed from matrix:

- Public app repo: `elelier/monterrey-respira`.
- Pipeline reference repo: `elelier/airquality_pipeline`.
- Production: `https://mtyrespira.elelier.com/`.
- Critical latest RPC: `get_latest_air_quality_per_city`.
- Active AQI provider: WAQI/AQICN.
- Weather context: Open-Meteo fields in `weather_*` and `avg_weather_*`.
- Core DB is only for product signals such as `submit_signal`; it is not a source for environmental readings.

## Connector validation

| Check | Result | Evidence |
| --- | --- | --- |
| Correct repository | PASS | `get_repo elelier/monterrey-respira` returned repository `elelier/monterrey-respira`. |
| Base branch | PASS | Default branch is `main`. |
| PR #46 merged | PASS | PR #46 is closed and merged. |
| PR #46 scope | PASS | One file added: `docs/public-web-presence-qa-matrix.md`; docs-only matrix. |
| Branch for Story 4.12 | PASS | `docs/public-web-presence-qa-evidence-pass`. |

## Docs reviewed

| Document | Review result |
| --- | --- |
| `AGENTS.md` | Confirms MtyRespira-only scope, no push to `main`, no secrets, no frontend service role, no invented environmental data, no real-time claim, and required PR impact sections. |
| `README.md` | Confirms app stack, Supabase RPC, Cloudflare Pages, and data flow `provider -> airquality_pipeline -> Supabase tables -> get_latest_air_quality_per_city -> frontend`. |
| `docs/shared-data-contract.md` | Confirms provider boundary, active WAQI/AQICN, AirVisual/IQAir legacy/fallback, normalized frontend contract, critical RPC, and Open-Meteo weather-context fields. |
| `docs/freshness-truth-ux.md` | Confirms `reading_timestamp`, `last_successful_update_at`, and `weather_timestamp` roles and that cache/refresh time must not be presented as a new measurement. |
| `docs/public-web-presence-qa-matrix.md` | Matrix used as the execution checklist for this story. |
| `docs/roadmap.md`, `docs/PRD.md`, `docs/architecture.md`, `docs/style-guide.md` | Required for full local review; not fully expanded in connector output during this pass. No runtime changes were made based on unstated assumptions. |

## Commands

Connector limitation: this GitHub connector can read/write repository files and create PRs, but it cannot execute local shell commands. These commands were therefore **not run** in this session.

| Command | Result | Notes |
| --- | --- | --- |
| `npm run lint` | NOT RUN | Connector cannot execute npm. Script exists in `package.json` and runs `eslint src && tsc --noEmit`. |
| `npm run typecheck` | NOT RUN | Connector cannot execute npm. Script exists in `package.json` and runs `tsc --noEmit`. |
| `npm run build` | NOT RUN | Connector cannot execute npm. Script exists in `package.json` and runs `vite build`. |

Recommended local/CI command block before merge or immediately after checkout:

```bash
npm run lint
npm run typecheck
npm run build
```

## Static HTML verification

Expected files after `npm run build`:

```bash
ls dist/acerca-de/index.html \
  dist/datos-y-apis/index.html \
  dist/asociaciones/index.html \
  dist/politica-de-privacidad/index.html
```

| Built file | Expected metadata minimum | Result |
| --- | --- | --- |
| `dist/index.html` | Home title, description, canonical `/`, `og:url`, Twitter tags | NOT RUN — requires build output. |
| `dist/acerca-de/index.html` | Acerca title, description, canonical `/acerca-de`, `og:url`, Twitter tags | NOT RUN — requires build output. |
| `dist/datos-y-apis/index.html` | Datos title, description, canonical `/datos-y-apis`, `og:url`, Twitter tags | NOT RUN — requires build output. |
| `dist/asociaciones/index.html` | Asociaciones title, description, canonical `/asociaciones`, `og:url`, Twitter tags | NOT RUN — requires build output. |
| `dist/politica-de-privacidad/index.html` | Privacy title, description, canonical `/politica-de-privacidad`, `og:url`, Twitter tags | NOT RUN — requires build output. |

Metadata spot-check command after build:

```bash
rg -n "<title>|canonical|og:url|twitter:title|description" \
  dist/index.html \
  dist/acerca-de/index.html \
  dist/datos-y-apis/index.html \
  dist/asociaciones/index.html \
  dist/politica-de-privacidad/index.html
```

## Dangerous-claim grep

Command to run locally/CI:

```bash
rg -n "tiempo real|real-time|oficial|certific|completo|precis|simulad|estimad" src docs *.html */index.html
```

Interpretation rules from Story 4.11 matrix:

| Finding class | Interpretation |
| --- | --- |
| Docs saying MtyRespira must not promise `tiempo real` | Allowed / expected. |
| References to official external sources | Allowed only when clearly about the external source, not MtyRespira. |
| Historical docs mentioning simulated data cleanup/context | Allowed if not public production copy implying simulated readings as real. |
| New public UI copy promising real-time, certified, complete, official, precise, or simulated production readings | BLOCKER. |

Result for this pass: **NOT RUN** — connector cannot execute `rg`. No new public copy was added in this PR, so this docs-only change does not introduce new runtime dangerous claims.

## Manual QA checklist

This pass prepares the exact manual QA checklist from Story 4.11. It was not browser-executed in this connector session.

### Routes

| Route | Mobile 390px | Desktop 1024px+ | Result |
| --- | --- | --- | --- |
| `/` | Prepared | Prepared | NOT RUN — browser QA required. |
| `/acerca-de` | Prepared | Prepared | NOT RUN — browser QA required. |
| `/datos-y-apis` | Prepared | Prepared | NOT RUN — browser QA required. |
| `/asociaciones` | Prepared | Prepared | NOT RUN — browser QA required. |
| `/politica-de-privacidad` | Prepared | Prepared | NOT RUN — browser QA required. |

### Anchors

| Anchor | Expected behavior | Result |
| --- | --- | --- |
| `/datos-y-apis#metodologia-y-limites` | Navigates to `/datos-y-apis` and lands near methodology/limits section. | NOT RUN — browser QA required. |
| `/datos-y-apis#como-leer-aqi` | Navigates to AQI explainer section if present; if missing, log follow-up rather than inventing. | NOT RUN — browser QA required. |
| `/asociaciones#desahogate` | Navigates to `/asociaciones` and lands near citizen action/campaign CTA. | NOT RUN — browser QA required. |

### Navigation surfaces

| Surface | Expected behavior | Result |
| --- | --- | --- |
| Desktop nav | Core public routes visible and usable at 1024px+. | NOT RUN — browser QA required. |
| Mobile hamburger | Opens/closes, routes correctly, closes after route selection. | NOT RUN — browser QA required. |
| Mobile bottom nav | Shows `Inicio`, `Datos`, `Acción`; no overlap with content/CTAs. | NOT RUN — browser QA required. |
| Footer links | Visible on mobile and desktop; routes/anchors work. | NOT RUN — browser QA required. |
| Logo/home link | Returns to `/` without losing app shell. | NOT RUN — browser QA required. |

### CTAs and external links

| Link/CTA type | Expected behavior | Result |
| --- | --- | --- |
| Campaign/external action CTA | Correct external page or action target; clear label; safe new tab when applicable. | NOT RUN — browser QA required. |
| GitHub link | Correct target and safe external attributes. | NOT RUN — browser QA required. |
| Ko-fi link | Correct target and not hidden on mobile. | NOT RUN — browser QA required. |
| Associations links | No broken icons/logos; no false affiliation claim. | NOT RUN — browser QA required. |
| Share action | Uses browser share or fallback; does not throw visible error or fabricate AQI. | NOT RUN — browser QA required. |

### Contrast, focus, images, and external resources

| Category | Expected behavior | Result |
| --- | --- | --- |
| Light/dark contrast | Body/card text and chart labels readable in both modes. | NOT RUN — browser QA required. |
| Keyboard focus | Links/buttons show visible focus or browser default focus. | NOT RUN — browser QA required. |
| Tap targets | Bottom nav, hamburger, CTA links usable on 390px. | NOT RUN — browser QA required. |
| Images/logos | App identity, association cards/logos, icons, and SEO share image do not visibly break. | NOT RUN — browser QA required. |
| External resources | Page remains readable if third-party image/resource fails. | NOT RUN — browser QA required. |

## UX state coverage

| State | Expected behavior | Result |
| --- | --- | --- |
| Loading | Non-blocking loading affordance; no permanent blank screen. | NOT RUN — browser/devtools QA required. |
| Data available | AQI and freshness shown using existing RPC contract. | NOT RUN — browser/devtools QA required. |
| Degraded / old reading | Clear stale/degraded messaging using `reading_timestamp`. | NOT RUN — browser/devtools QA required. |
| No reading | Honest empty state; no simulated production reading. | NOT RUN — browser/devtools QA required. |
| Weather context missing | AQI can still render if weather is unavailable; weather is contextual only. | NOT RUN — browser/devtools QA required. |
| Geolocation unavailable/denied | App remains usable by city/manual selection. | NOT RUN — browser/devtools QA required. |

## Boundary evidence

| Area | Changed? | Evidence / notes |
| --- | --- | --- |
| app | No runtime change | Docs-only evidence file. No `src/`, routing, metadata, Vite, or `_redirects` change. |
| pipeline | No | Did not touch `elelier/airquality_pipeline`; no provider/runtime behavior change. |
| Supabase RPC | No | No change to `get_latest_air_quality_per_city` or historical RPCs. |
| BD MtyRespira | No | No writes, migrations, schema changes, or data edits. |
| Core DB | No | No `submit_signal` change; Core DB remains product-signal only, not environmental. |
| Cloudflare | No | No Cloudflare Pages config or deploy configuration changed. |
| UX | Process only | Adds QA evidence artifact; no public runtime visual change. |

## Contract impact

- No AQI contract change.
- No weather contract change.
- No geolocation behavior change.
- No data fetching change.
- No public route/runtime behavior change.
- No metadata implementation change.
- No service-role/frontend secret risk introduced.
- No environmental data invented.

## Result

**PARTIAL**

Reason: evidence artifact was created and the checklist is now ready/repeatable, but connector-only execution cannot run `npm`, inspect built `dist/*` files, open a browser at 390px/1024px, or verify links/anchors visually.

Blocking issues found in this docs-only pass: **none**.

Required follow-up before treating Story 4.12 as full PASS:

```bash
npm run lint
npm run typecheck
npm run build
ls dist/acerca-de/index.html \
  dist/datos-y-apis/index.html \
  dist/asociaciones/index.html \
  dist/politica-de-privacidad/index.html
rg -n "<title>|canonical|og:url|twitter:title|description" \
  dist/index.html \
  dist/acerca-de/index.html \
  dist/datos-y-apis/index.html \
  dist/asociaciones/index.html \
  dist/politica-de-privacidad/index.html
rg -n "tiempo real|real-time|oficial|certific|completo|precis|simulad|estimad" src docs *.html */index.html
```

Then complete browser QA for:

- Mobile 390px.
- Desktop 1024px+.
- Routes `/`, `/acerca-de`, `/datos-y-apis`, `/asociaciones`, `/politica-de-privacidad`.
- Anchors `/datos-y-apis#metodologia-y-limites`, `/datos-y-apis#como-leer-aqi`, `/asociaciones#desahogate`.
- Desktop nav, mobile hamburger, mobile bottom nav, footer links, external CTAs, contrast/focus, and images/logos.

## Rollback

Revert this docs-only PR.

No app runtime rollback, pipeline rollback, Supabase rollback, RPC rollback, BD rollback, Core DB rollback, or Cloudflare rollback is required.
