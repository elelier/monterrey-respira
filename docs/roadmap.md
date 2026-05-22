# Roadmap — MtyRespira

Estado: brownfield operativo  
Fecha: 2026-05-22

## Cambio de curso

La prioridad actual de MtyRespira no es expandir superficie visible. La prioridad es blindar confianza operativa antes de agregar features nuevas.

El roadmap vigente se ordena alrededor de cuatro principios:

1. Contrato de datos verificable.
2. Frescura honesta.
3. Degradación explícita.
4. Continuidad de pipeline y proveedor.

## Estado documental vigente

Story 1.2.1 — Canonical Project Docs Stop quedó completada por PR #24 — `docs: add canonical MtyRespira project docs baseline`.

Story 1.3 — Provider Continuity Readiness quedó completada en el repo de pipeline por PR #14 — `docs: add provider continuity readiness runbook`.

Story 1.3.1 — App Docs Provider State Reconciliation + Roadmap Unlock quedó completada por PR #25 — `docs: reconcile provider state and roadmap after Story 1.3`.

Story 1.4 — Public Runtime Verification Gate sigue en estado degraded/open porque la evidencia live read-only de la RPC `get_latest_air_quality_per_city` no pudo capturarse en la sesión de Story 1.4.2 por falta de herramienta Supabase disponible.

Story 1.4.1 — Public Metadata Freshness Claim Cleanup quedó completada por PR #27 — `fix: remove real-time freshness claim from public metadata`.

Story 1.4.2 — Read-only RPC Evidence Capture queda bloqueada/degraded en esta sesión. Existe evidencia documental del bloqueo en `docs/evidence/story-1-4-2-rpc-read-only-evidence.md`, pero no existe todavía evidencia live de filas, shape observado o nullability observada contra Supabase.

Razón:

- El repo app cuenta con `AGENTS.md` raíz.
- El repo app cuenta con PRD, arquitectura, roadmap e índice documental canónicos.
- README ya no promete `tiempo real`.
- La metadata pública fue corregida por Story 1.4.1 / PR #27.
- El pipeline documenta WAQI/AQICN como proveedor activo y AirVisual/IQAir como legacy/fallback explícito.
- Falta capturar evidencia live read-only contra `get_latest_air_quality_per_city` con herramienta Supabase disponible.

## Fase 1 — Blindaje crítico

### Story 1.1 — RPC Contract Smoke + Runtime Nullability Verification

Estado: completada si existe PR merged con evidencia de smoke/nullability.

Objetivo: crear evidencia repetible de lo que devuelve `get_latest_air_quality_per_city`.

Criterio de salida:

- Existe evidencia verificable del payload real.
- `docs/shared-data-contract.md` queda actualizado si se detecta drift.

### Story 1.2 — Freshness Truth UX + Stale Data Guard

Estado: completada por PR #23 — `feat: add freshness truth UX guard`.

Objetivo: evitar que la app comunique datos viejos como si fueran frescos.

Criterio de salida:

- La UI no sobrepromete frescura.
- Un dato viejo o dudoso entra en estado explícito, no normal.

### Story 1.2.1 — Canonical Project Docs Stop: PRD + Architecture + Roadmap + AGENTS Baseline

Estado: completada por PR #24 — `docs: add canonical MtyRespira project docs baseline`.

Objetivo: crear o normalizar los documentos mínimos que gobiernan el proyecto antes de seguir con historias de implementación.

Criterio de salida:

- Existe `AGENTS.md` en raíz.
- Existe PRD canónico.
- Existe architecture canónica.
- Existe roadmap canónico.
- README ya no promete `tiempo real`.
- No hubo cambios runtime, Supabase, RPC ni pipeline en el repo app.

### Story 1.3 — Provider Continuity Readiness

Estado: completada por PR #14 en `elelier/airquality_pipeline` — `docs: add provider continuity readiness runbook`.

Objetivo: preparar fallas del proveedor activo sin romper la experiencia pública.

Criterio de salida:

- El equipo puede distinguir error upstream, dato viejo, ciudad sin update y estado sano.
- Existe runbook operativo de continuidad en `airquality_pipeline`.

### Story 1.3.1 — App Docs Provider State Reconciliation + Roadmap Unlock

Estado: completada por PR #25 — `docs: reconcile provider state and roadmap after Story 1.3`.

Objetivo: reconciliar los documentos canónicos del repo app con el estado real post-PR #14 del pipeline.

Criterio de salida:

- ROADMAP no deja Story 1.2.1 como en curso.
- ROADMAP no deja Story 1.3 como bloqueada.
- Architecture no presenta AirVisual/IQAir como provider activo.
- Shared data contract no congela el boundary como AirVisual-only.
- Story 1.4 queda como siguiente gate recomendado.

### Story 1.4 — Public Runtime Verification Gate

Estado: degraded/open.

Objetivo: verificar producción después de cambios relevantes.

Alcance:

- Validar `https://mtyrespira.elelier.com`.
- Validar workflow horario del pipeline.
- Validar una ciudad conocida contra el contrato.
- Registrar evidencia básica posterior a release.

Criterio de salida:

- Cada release relevante tiene evidencia mínima de app, pipeline y contrato.
- La evidencia RPC live read-only confirma shape/nullability esperada, o queda bloqueo explícito.

Bloqueo actual:

- No se pudo ejecutar Supabase RPC desde la sesión de Story 1.4.2 porque solo hubo tooling GitHub/Notion disponible.
- No se debe marcar Story 1.4 como completada hasta capturar evidencia live read-only de `get_latest_air_quality_per_city`.

### Story 1.4.1 — Public Metadata Freshness Claim Cleanup

Estado: completada por PR #27 — `fix: remove real-time freshness claim from public metadata`.

Objetivo: remover claims públicos de `Tiempo Real` en metadata/SEO visible sin cambiar comportamiento de datos.

Criterio de salida:

- La metadata pública de la app no promete `Tiempo Real`.
- Las apariciones restantes de `tiempo real` quedan limitadas a prohibición, riesgo o drift histórico documentado.
- Story 1.4 queda lista para Story 1.4.2 si la evidencia RPC sigue pendiente.

### Story 1.4.2 — Read-only RPC Evidence Capture

Estado: bloqueada/degraded en esta sesión.

Objetivo: capturar evidencia read-only de la RPC crítica `get_latest_air_quality_per_city` sin modificar datos, SQL, provider, pipeline, frontend ni Cloudflare.

Resultado de esta sesión:

- Se creó `docs/evidence/story-1-4-2-rpc-read-only-evidence.md`.
- No se capturó respuesta live de Supabase porque no hubo herramienta Supabase disponible.
- No hubo writes, DDL, cambios SQL/RPC/schema/grants/RLS, cambios frontend, cambios pipeline ni cambios provider.

Criterio de salida pendiente:

- Capturar timestamp de ejecución, herramienta usada, filas devueltas, ciudades observadas, shape de campos, nullability observada y timestamps presentes.
- Documentar cualquier `aqi_us` nulo o ciudad faltante sin corregirlo ni inventar causa.

## Fase 2 — Limpieza y gobernanza

No iniciar Fase 2 como trabajo principal hasta cerrar o aceptar explícitamente el bloqueo de Story 1.4 / Story 1.4.2.

### Story 2.1 — Docs Drift Cleanup

Objetivo: eliminar referencias o afirmaciones obsoletas que contradigan runtime vigente.

Alcance:

- Marcar Buildship como legacy si aparece como runtime activo.
- Marcar Netlify como legacy si aparece como deploy activo.
- Remover endpoints legacy presentados como API vigente.
- Alinear README, arquitectura, pipeline, roadmap y referencias.

### Story 2.2 — Cross-Repo Change Checklist

Objetivo: evitar cambios locales que rompan el producto coordinado.

Todo PR que toque datos debe declarar impacto sobre:

```text
pipeline -> Supabase/RPC -> frontend -> UX
```

## Fase 3 — UX y visualización posterior

Solo después de cerrar Fase 1:

- Mejoras mobile-first.
- Pulido de tarjetas AQI.
- Visualizaciones históricas más claras.
- Mejoras de accesibilidad.
- Comparativas entre ciudades.

## Fuera de alcance hasta nuevo aviso

- Auth de usuarios.
- Alertas personalizadas.
- Nuevas fuentes productivas sin contrato verificado.
- Pronóstico ambiental.
- Expansión nacional.
- Gamificación.
- Nuevas lecturas ambientales fuera del contrato actual.

## Documentos canónicos relacionados

- `AGENTS.md`
- `docs/DOCUMENTATION_INDEX.md`
- `docs/PRD.md`
- `docs/architecture.md`
- `docs/shared-data-contract.md`
- `docs/freshness-truth-ux.md`
- `docs/blindaje-y-cambio-de-curso.md`
- `docs/public-runtime-verification-gate.md`
- `docs/evidence/story-1-4-2-rpc-read-only-evidence.md`
- `elelier/airquality_pipeline/docs/provider-continuity-readiness.md`
- `elelier/airquality_pipeline/docs/provider-continuity-runbook.md`
