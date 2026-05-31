# Story 4.11 — Public Web Presence QA Matrix

Status: ready for repeated manual QA in future web-presence PRs.

## Purpose

MtyRespira needs a repeatable public QA matrix for every web-presence change after the recent route metadata/static HTML and navigation cleanup work. Use this document before opening or merging PRs that touch public routes, navigation, CTAs, route metadata, trust copy, visual layout, public links, or route-level content.

This matrix is intentionally manual-first. It can later become Playwright/Lighthouse automation, but it should be useful even when screenshots or browser tooling are unavailable.

## Non-negotiable project boundaries

This QA matrix must not be used to justify changing runtime data behavior without a separate story.

- App repo: `elelier/monterrey-respira`.
- Pipeline repo: `elelier/airquality_pipeline`.
- Production: `https://mtyrespira.elelier.com/`.
- Hosting: Cloudflare Pages.
- Environmental DB: Supabase PostgreSQL with `cities`, `air_quality_readings`, `pipeline_logs`.
- Critical frontend RPC: `get_latest_air_quality_per_city`.
- Active AQI provider: WAQI/AQICN.
- Weather context provider: Open-Meteo fields in `weather_*` and `avg_weather_*`.
- Core DB `elelier/elelier-core-db` is only for product signals such as `submit_signal`; it is not a source for environmental readings.

Do not introduce or imply:

- Real-time monitoring.
- Official/certified status for MtyRespira.
- Complete environmental coverage.
- Simulated production readings.
- Environmental writes through Core DB.
- Frontend `service_role` usage.

## Commands and build verification

Run when the change touches UI, routes, metadata, Vite inputs, redirects, or public content. For docs-only PRs, document when commands were not run and why.

```bash
npm run lint
npm run typecheck
npm run build
```

After `npm run build`, verify route-specific static HTML exists:

```bash
ls dist/acerca-de/index.html \
  dist/datos-y-apis/index.html \
  dist/asociaciones/index.html \
  dist/politica-de-privacidad/index.html
```

Optional metadata spot checks:

```bash
rg -n "<title>|canonical|og:url|twitter:title|description" \
  dist/index.html \
  dist/acerca-de/index.html \
  dist/datos-y-apis/index.html \
  dist/asociaciones/index.html \
  dist/politica-de-privacidad/index.html
```

Dangerous-claim scan:

```bash
rg -n "tiempo real|real-time|oficial|certific|completo|precis|simulad|estimad" src docs *.html */index.html
```

Interpretation rules:

- Docs may say MtyRespira must not promise `tiempo real`; that is expected.
- External sources may be described as official only when clearly referring to the external source, not to MtyRespira.
- Historical docs may mention simulated data as cleanup context; production UI must not present simulated readings as real.
- Any new public copy that implies real-time, certified, complete, official, or simulated production data is a blocker.

## Viewports

Validate at minimum:

| Viewport | Purpose | Pass criteria |
| --- | --- | --- |
| Mobile `390px` width | Realistic small phone layout and bottom nav behavior. | No horizontal overflow, no blocked CTAs, bottom nav usable, hamburger usable, footer visible. |
| Desktop `1024px+` width | Public desktop reading and nav. | Header nav visible, content readable, footer links visible, chart/card sections not clipped. |

Use real device QA when possible for mobile, especially Android Chrome/PWA.

## Route checklist

### `/` Home

| Check | Mobile 390px | Desktop 1024px+ | Notes |
| --- | --- | --- | --- |
| Page loads without blank screen or stuck loading. | [ ] | [ ] | Loading should resolve or degrade honestly. |
| AQI card communicates available reading and freshness without promising real time. | [ ] | [ ] | Respect `reading_timestamp` meaning. |
| City selector/map/card interaction remains usable. | [ ] | [ ] | No broken geolocation affordance. |
| Historical or pollutant sections remain readable if present. | [ ] | [ ] | No clipped labels/ticks. |
| Share CTA works or degrades gracefully. | [ ] | [ ] | No broken icon/button. |
| Header desktop nav / mobile hamburger / mobile bottom nav behave as expected. | [ ] | [ ] | See nav matrix below. |
| Footer visible and links usable. | [ ] | [ ] | Footer should be present mobile and desktop. |

### `/acerca-de`

| Check | Mobile 390px | Desktop 1024px+ | Notes |
| --- | --- | --- | --- |
| Route loads directly and through in-app nav. | [ ] | [ ] | Refresh/direct URL must not fall back visually to wrong page. |
| Copy explains purpose and trust posture honestly. | [ ] | [ ] | No official/certified/real-time claim. |
| Any external/community references are clearly framed. | [ ] | [ ] | Avoid implying affiliation unless documented. |
| Metadata/static HTML exists after build. | [ ] | [ ] | Verify `dist/acerca-de/index.html`. |
| Footer link returns correctly. | [ ] | [ ] | Footer is part of regression scope from PR #45. |

### `/datos-y-apis`

| Check | Mobile 390px | Desktop 1024px+ | Notes |
| --- | --- | --- | --- |
| Route loads directly and through nav. | [ ] | [ ] | Direct URL and client route both pass. |
| Explains WAQI/AQICN as AQI source. | [ ] | [ ] | AQI provider remains WAQI/AQICN. |
| Explains Open-Meteo only as weather context. | [ ] | [ ] | Must not imply Open-Meteo AQI. |
| Freshness terminology is aligned. | [ ] | [ ] | `reading_timestamp`, `last_successful_update_at`, `weather_timestamp`. |
| Anchor `#metodologia-y-limites` scrolls to expected section. | [ ] | [ ] | Hash route must work from same page and other pages. |
| Anchor `#como-leer-aqi` scrolls to expected section if present. | [ ] | [ ] | If missing, document as follow-up instead of inventing. |
| Static HTML exists after build. | [ ] | [ ] | Verify `dist/datos-y-apis/index.html`. |

### `/asociaciones`

| Check | Mobile 390px | Desktop 1024px+ | Notes |
| --- | --- | --- | --- |
| Route loads directly and through nav. | [ ] | [ ] | Direct URL and client route both pass. |
| Association cards/logos/images are not broken. | [ ] | [ ] | Broken icons/images are visible regressions. |
| External links open safely. | [ ] | [ ] | Use `target="_blank"` + `rel="noopener noreferrer"` when applicable. |
| CTA campaign/external action is clear. | [ ] | [ ] | No hidden or dead button. |
| Anchor `#desahogate` scrolls to action section. | [ ] | [ ] | Critical from mobile bottom nav PR #45. |
| Static HTML exists after build. | [ ] | [ ] | Verify `dist/asociaciones/index.html`. |

### `/politica-de-privacidad`

| Check | Mobile 390px | Desktop 1024px+ | Notes |
| --- | --- | --- | --- |
| Route loads directly and through hamburger/footer. | [ ] | [ ] | Not in mobile bottom nav; should remain discoverable. |
| Privacy copy remains readable and honest. | [ ] | [ ] | Location/browser/external services should be clearly framed. |
| No environmental data collection claim is introduced. | [ ] | [ ] | Environmental readings come from provider/pipeline/DB, not users. |
| Static HTML exists after build. | [ ] | [ ] | Verify `dist/politica-de-privacidad/index.html`. |

## Anchor matrix

| Anchor | Source surfaces | Pass criteria |
| --- | --- | --- |
| `/datos-y-apis#metodologia-y-limites` | Desktop nav, hamburger, footer, any inline methodology CTA. | Navigates to `/datos-y-apis` and lands near methodology/limits section. |
| `/datos-y-apis#como-leer-aqi` | Inline AQI education links, if present. | Navigates to AQI explainer section. If section does not exist, log follow-up. |
| `/asociaciones#desahogate` | Mobile bottom nav `Acción`, hamburger `Acción ciudadana`, CTA links. | Navigates to `/asociaciones` and lands near citizen action/campaign CTA. |

## Navigation matrix

| Surface | Mobile 390px | Desktop 1024px+ | Pass criteria |
| --- | --- | --- | --- |
| Desktop nav | N/A | [ ] | Shows core public routes; active state does not obscure text. |
| Hamburger mobile | [ ] | N/A | Opens/closes; links route correctly; menu closes after route selection. |
| Bottom nav mobile | [ ] | N/A | Shows `Inicio`, `Datos`, `Acción`; no overlap with content/CTAs. |
| Footer links | [ ] | [ ] | Visible on both mobile and desktop; routes/anchors work. |
| Logo/home link | [ ] | [ ] | Returns to `/` without losing app shell. |

## CTA and external-link matrix

| CTA/link type | Expected behavior | Pass criteria |
| --- | --- | --- |
| Campaign/external action CTA | Opens correct external page or action target. | Clear label, no dead button, safe new tab handling where applicable. |
| GitHub link | Opens repository/project reference. | Correct target and safe external attributes. |
| Ko-fi link | Opens support page. | Correct target and not hidden on mobile. |
| Associations links | Open external organization resources. | No broken icons/logos; no false affiliation claim. |
| Share action | Uses browser share or fallback behavior. | Does not throw visible error; does not fabricate AQI. |

## UX state matrix

These states can be checked through local mocks/devtools only if the existing app supports it without changing DB, pipeline, or provider behavior.

| State | Pass criteria | Boundary |
| --- | --- | --- |
| Loading | Shows non-blocking loading affordance; no permanent blank screen. | Do not fake data in production. |
| Data available | Shows AQI, pollutant/context if available, and measurement freshness. | Use existing RPC contract. |
| Degraded / old reading | Clearly communicates stale/degraded state. | Must use `reading_timestamp`/freshness semantics. |
| No reading | Honest empty state; no simulated production reading. | No Supabase writes. |
| Weather context missing | AQI can still render if weather is unavailable. | Open-Meteo fields are contextual, not AQI source. |
| Geolocation unavailable/denied | App remains usable by city/manual selection. | Do not force location. |

## Contrast and focus basics

| Check | Mobile 390px | Desktop 1024px+ | Pass criteria |
| --- | --- | --- | --- |
| Text contrast in light mode. | [ ] | [ ] | Body/card text readable on light backgrounds. |
| Text contrast in dark mode. | [ ] | [ ] | Body/card text readable on dark backgrounds. |
| Chart/pollutant labels visible. | [ ] | [ ] | Axis/tick labels readable in both modes. |
| Keyboard focus visible. | [ ] | [ ] | Links/buttons show visible focus or browser default focus. |
| Tap targets usable. | [ ] | N/A | Bottom nav/hamburger/CTA links are not too small or overlapped. |

## Images, logos, and external resources

| Check | Pass criteria |
| --- | --- |
| Logo/favicon load. | No broken app identity assets. |
| SEO share image path remains stable. | `https://mtyrespira.elelier.com/images/seo/share-image.png` resolves in production/previews when checked. |
| Association logos/cards load. | No broken images, missing alt intent, or layout collapse. |
| External icons render. | React icons or image icons visible and not clipped. |
| Missing external resource degradation. | Page remains readable if a third-party image fails. |

## SEO/static HTML matrix

After `npm run build`, check:

| Built file | Must contain |
| --- | --- |
| `dist/index.html` | Home title, description, canonical `/`, OG/Twitter tags. |
| `dist/acerca-de/index.html` | Acerca title, description, canonical `/acerca-de`, OG/Twitter tags. |
| `dist/datos-y-apis/index.html` | Datos title, description, canonical `/datos-y-apis`, OG/Twitter tags. |
| `dist/asociaciones/index.html` | Asociaciones title, description, canonical `/asociaciones`, OG/Twitter tags. |
| `dist/politica-de-privacidad/index.html` | Privacy title, description, canonical `/politica-de-privacidad`, OG/Twitter tags. |

Also verify that `_redirects`/route handling still serves direct no-JS route HTML for the non-home public routes when Cloudflare Pages deploys the built output.

## Data contract and limits checklist

| Contract | QA expectation |
| --- | --- |
| `reading_timestamp` | Measurement timestamp from source/provider; used for freshness messaging. |
| `last_successful_update_at` | Pipeline success/tracing timestamp; not measurement freshness. |
| `weather_timestamp` | Weather-context measurement timestamp; not AQI timestamp. |
| `get_latest_air_quality_per_city` | Critical public data RPC; do not change shape in web-presence PRs. |
| AQI provider | WAQI/AQICN remains AQI source. |
| Open-Meteo | Weather context only. |
| Core DB | Product signals only; no environmental readings. |
| Frontend secrets | No `service_role` or provider tokens in frontend. |

## Boundary check for each PR

Fill this in the PR body:

| Area | Changed? | Notes |
| --- | --- | --- |
| app | [ ] yes / [ ] no |  |
| pipeline | [ ] yes / [ ] no | Should be no for this matrix/story. |
| Supabase RPC | [ ] yes / [ ] no | Should be no unless separate data story. |
| BD MtyRespira | [ ] yes / [ ] no | No writes/migrations for web-presence QA docs. |
| Core DB | [ ] yes / [ ] no | Product signals only; no environmental readings. |
| Cloudflare | [ ] yes / [ ] no | Config changes require explicit review. |
| UX | [ ] yes / [ ] no | Document routes/viewports checked. |

## PR usage template

Include this summary in future web-presence PRs:

```md
## Public QA

- Viewports checked: mobile 390px, desktop 1024px+.
- Routes checked: `/`, `/acerca-de`, `/datos-y-apis`, `/asociaciones`, `/politica-de-privacidad`.
- Anchors checked: `/datos-y-apis#metodologia-y-limites`, `/datos-y-apis#como-leer-aqi`, `/asociaciones#desahogate`.
- Static HTML checked after build: yes/no.
- Dangerous-claim scan checked: yes/no.
- Broken image/external link pass: yes/no.
- Data contract impact: none / explain.
```

## Rollback

For docs-only changes, revert the PR commit.

For future web-presence PRs that use this matrix:

1. Revert the app/UI/content commit or PR.
2. Confirm no Supabase, RPC, pipeline, provider, Core DB, or Cloudflare rollback is needed.
3. If route/static HTML or `_redirects` changed, rebuild and verify direct public routes again.
4. If a bad public claim shipped, hotfix copy first, then complete deeper remediation.

## Acceptance criteria mapping

- Clear, actionable, reusable QA matrix: covered.
- Each public route has a checklist: covered.
- Commands included: `npm run lint`, `npm run typecheck`, `npm run build`.
- Static route HTML verification included: covered.
- Data contract and limits section included: covered.
- Rollback and future PR usage included: covered.
- Scope remains docs-only and does not touch app runtime, pipeline, BD, RPC, Core DB, or Cloudflare config.
