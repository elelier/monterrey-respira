# Story 4.9 — SEO + Route Metadata Pass Evidence

Status: implemented in `ux/seo-route-metadata-pass`

## Scope

App / UX / SEO only.

No changes were made to:

- `elelier/airquality_pipeline`
- Supabase schema or data
- `get_latest_air_quality_per_city`
- historical RPCs
- AQI provider behavior
- weather provider behavior
- Cloudflare Pages configuration
- Core DB / `submit_signal`

## Route metadata matrix

| Route | Metadata intent | Canonical URL |
| --- | --- | --- |
| `/` | Public dashboard for available AQI readings, pollutant context, environmental context, and measurement freshness. | `https://mtyrespira.elelier.com/` |
| `/acerca-de` | Purpose and trust posture for reading reported measurements and freshness states in the ZMM. | `https://mtyrespira.elelier.com/acerca-de` |
| `/datos-y-apis` | Methodology, AQI source, weather context, and freshness limits. | `https://mtyrespira.elelier.com/datos-y-apis` |
| `/asociaciones` | Civic organizations, external references, and ways to participate without implying affiliation. | `https://mtyrespira.elelier.com/asociaciones` |
| `/politica-de-privacidad` | Privacy information for the public web app. | `https://mtyrespira.elelier.com/politica-de-privacidad` |

## Metadata contract notes

- Route-level metadata is centralized in `src/components/RouteMetadata.tsx` using the existing `react-helmet-async` provider.
- The base `index.html` metadata remains honest for no-JS/static preview fallbacks.
- The stable OG image path remains `https://mtyrespira.elelier.com/images/seo/share-image.png`; no remote third-party image was introduced.
- Metadata copy avoids claiming that MtyRespira is an official source, a certified source, a complete dataset, or a real-time monitor.
- `/datos-y-apis` metadata explicitly separates AQI reported by WAQI/AQICN from Open-Meteo weather context.

## Dangerous-claim grep notes

Target command for reviewer:

```bash
rg -n "tiempo real|real-time|oficial|certific|completo|precis|simulad|estimad" src docs
```

Expected interpretation:

- Existing docs intentionally say the product must **not** promise `tiempo real`.
- Existing public copy may reference an external government resource as `red oficial`; this is not a MtyRespira source claim.
- Existing roadmap/docs may mention `datos simulados` as a cleanup target for prior stories.
- This story does not add new metadata claims using `tiempo real`, `real-time`, `oficial`, `certific`, `completo`, `precis`, `simulad`, or `estimad`.

## Validation status

Connector session changes completed through GitHub API.

Not run in this session because the connector environment cannot execute repo commands:

```bash
npm run lint
npm run typecheck
npm run build
```

Reviewer should run the commands above before merge.

## Rollback

Revert the commits on `ux/seo-route-metadata-pass`.

No pipeline, Supabase, RPC, BD, Core DB, or Cloudflare rollback is required.
