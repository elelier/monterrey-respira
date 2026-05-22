# Roadmap — MtyRespira

Estado: brownfield operativo  
Fecha: 2026-05-21

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

Story 1.4 — Public Runtime Verification Gate queda como gate de verificación documental/QA en curso, con Story 1.4.1 como follow-up mínimo para corregir metadata pública de frescura.

Razón:

- El repo app ya cuenta con `AGENTS.md` raíz.
- El repo app ya cuenta con PRD, arquitectura, roadmap e índice documental canónicos.
- README ya no promete “tiempo real”.
- El pipeline ya documentó WAQI/AQICN como proveedor activo y AirVisual/IQAir como legacy/fallback explícito.
- La siguiente necesidad crítica es verificar runtime público, workflow horario y contrato después de cambios relevantes.

## Fase 1 — Blindaje crítico

### Story 1.1 — RPC Contract Smoke + Runtime Nullability Verification

Estado: completada si existe PR merged con evidencia de smoke/nullability.

Objetivo: crear evidencia repetible de lo que devuelve `get_latest_air_quality_per_city`.

Alcance:

- Validar columnas esperadas.
- Validar nullability observada.
- Validar timestamps UTC.
- Validar una o más ciudades conocidas.
- Dejar fixture o smoke test canónico.

Criterio de salida:

- Existe evidencia verificable del payload real.
- `docs/shared-data-contract.md` queda actualizado si se detecta drift.

### Story 1.2 — Freshness Truth UX + Stale Data Guard

Estado: completada por PR #23 — `feat: add freshness truth UX guard`.

Objetivo: evitar que la app comunique datos viejos como si fueran frescos.

Alcance:

- Distinguir medición, actualización de pipeline y refresh de frontend.
- Mostrar estado fresco, viejo, degradado o faltante.
- Evitar lenguaje de “tiempo real” cuando exceda la cadencia real del productor.

Criterio de salida:

- La UI no sobrepromete frescura.
- Un dato viejo o dudoso entra en estado explícito, no normal.

### Story 1.2.1 — Canonical Project Docs Stop: PRD + Architecture + Roadmap + AGENTS Baseline

Estado: completada por PR #24 — `docs: add canonical MtyRespira project docs baseline`.

Objetivo: crear o normalizar los documentos mínimos que gobiernan el proyecto antes de seguir con historias de implementación.

Alcance completado:

- Crear `AGENTS.md` en raíz.
- Crear `docs/PRD.md` como PRD canónico.
- Confirmar `docs/architecture.md` como arquitectura canónica sin duplicar `docs/ARCHITECTURE.md`.
- Confirmar `docs/roadmap.md` como roadmap canónico sin duplicar `docs/ROADMAP.md`.
- Limpiar README para no prometer “tiempo real”.
- Crear `docs/DOCUMENTATION_INDEX.md` como índice/fuente de verdad.

Criterio de salida:

- Existe `AGENTS.md` en raíz.
- Existe PRD canónico.
- Existe architecture canónica.
- Existe roadmap canónico.
- README ya no promete “tiempo real”.
- No hubo cambios runtime, Supabase, RPC ni pipeline en el repo app.

### Story 1.3 — Provider Continuity Readiness

Estado: completada por PR #14 en `elelier/airquality_pipeline` — `docs: add provider continuity readiness runbook`.

Objetivo: preparar fallas del proveedor activo sin romper la experiencia pública.

Alcance completado:

- Verificar proveedor activo contra `airquality_pipeline`, no contra memoria o README legacy.
- Documentar WAQI/AQICN como provider activo.
- Documentar AirVisual/IQAir como provider legacy/fallback, no activo.
- Confirmar `AIR_QUALITY_PROVIDER=waqi` como default.
- Confirmar `workflow_dispatch` con opciones `waqi` / `airvisual`.
- Documentar taxonomía de errores upstream.
- Documentar runbook de contingencia.
- Evitar fallback productivo no verificado.

Criterio de salida:

- El equipo puede distinguir error upstream, dato viejo, ciudad sin update y estado sano.
- Existe runbook operativo de continuidad en `airquality_pipeline`.

### Story 1.3.1 — App Docs Provider State Reconciliation + Roadmap Unlock

Estado: completada por PR #25 — `docs: reconcile provider state and roadmap after Story 1.3`.

Objetivo: reconciliar los documentos canónicos del repo app con el estado real post-PR #14 del pipeline.

Alcance completado:

- Desbloquear roadmap post Story 1.3.
- Alinear arquitectura a WAQI/AQICN como provider activo.
- Alinear contrato compartido a provider genérico con WAQI/AQICN activo y AirVisual/IQAir legacy/fallback.
- Alinear PRD e índice documental con el estado post-PR #14.

Criterio de salida:

- ROADMAP no deja Story 1.2.1 como en curso.
- ROADMAP no deja Story 1.3 como bloqueada.
- Architecture no presenta AirVisual/IQAir como provider activo.
- Shared data contract no congela el boundary como AirVisual-only.
- Story 1.4 queda como siguiente gate recomendado.

### Story 1.4 — Public Runtime Verification Gate

Estado: en curso por esta historia.

Objetivo: verificar producción después de cambios relevantes.

Alcance:

- Validar `https://mtyrespira.elelier.com`.
- Validar workflow horario del pipeline.
- Validar una ciudad conocida contra el contrato.
- Registrar evidencia básica posterior a release.

Criterio de salida:

- Cada release relevante tiene evidencia mínima de app, pipeline y contrato.
- Si falta acceso a Supabase/RPC o aparece drift de copy pública, se registra como degraded pass o follow-up explícito.

### Story 1.4.1 — Public Metadata Freshness Claim Cleanup

Estado: en curso por PR pequeño de metadata/copy.

Objetivo: remover claims públicos de `Tiempo Real` en metadata/SEO visible sin cambiar comportamiento de datos.

Alcance:

- Actualizar `<title>`, description y metadata social pública si contienen o heredan claim de frescura excesivo.
- Mantener intactos AQI card behavior, históricos, geolocalización, Supabase/RPC, provider y pipeline.
- Actualizar el gate de Story 1.4 para dejar claro que el drift de metadata queda mitigado y que la evidencia RPC read-only sigue pendiente si no se captura.

Criterio de salida:

- La metadata pública de la app no promete `Tiempo Real`.
- Las apariciones restantes de `tiempo real` quedan limitadas a prohibición, riesgo o drift histórico documentado.
- Story 1.4 queda lista para Story 1.4.2 — Read-only RPC Evidence Capture si la evidencia RPC sigue pendiente.

## Fase 2 — Limpieza y gobernanza

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
- `elelier/airquality_pipeline/docs/provider-continuity-readiness.md`
- `elelier/airquality_pipeline/docs/provider-continuity-runbook.md`
