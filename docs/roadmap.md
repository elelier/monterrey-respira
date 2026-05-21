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

## Gate documental vigente

Story 1.3 — Provider Continuity Readiness queda bloqueada hasta que Story 1.2.1 — Canonical Project Docs Stop esté aprobada y mergeada.

Razón:

- El repo necesitaba `AGENTS.md` raíz.
- El repo necesitaba PRD canónico o decisión explícita.
- README aún contenía lenguaje de “tiempo real” incompatible con Freshness Truth UX.
- La arquitectura y roadmap existían, pero faltaba un índice/fuente de verdad para evitar drift.

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

Estado: en curso.

Objetivo: crear o normalizar los documentos mínimos que gobiernan el proyecto antes de seguir con historias de implementación.

Alcance:

- Crear `AGENTS.md` en raíz.
- Crear `docs/PRD.md` si falta PRD canónico.
- Confirmar `docs/architecture.md` como arquitectura canónica sin duplicar `docs/ARCHITECTURE.md`.
- Confirmar `docs/roadmap.md` como roadmap canónico sin duplicar `docs/ROADMAP.md`.
- Limpiar README para no prometer “tiempo real”.
- Crear `docs/DOCUMENTATION_INDEX.md` si ayuda a explicar fuente de verdad.
- Registrar en Notion que Story 1.3 queda bloqueada hasta merge.

Criterio de salida:

- Existe `AGENTS.md` en raíz.
- Existe PRD canónico.
- Existe architecture canónica o decisión explícita de ruta.
- Existe roadmap canónico o decisión explícita de ruta.
- README ya no promete “tiempo real”.
- No hay cambios runtime, Supabase, RPC ni pipeline.

### Story 1.3 — Provider Continuity Readiness

Estado: bloqueada hasta merge de Story 1.2.1.

Objetivo: preparar fallas del proveedor activo sin romper la experiencia pública.

Alcance:

- Verificar proveedor activo contra `airquality_pipeline`, no contra memoria o README legacy.
- Clasificar errores upstream.
- Registrar estado por ciudad.
- Documentar runbook de contingencia.
- Evitar fallback productivo no verificado.

Criterio de salida:

- El equipo puede distinguir error upstream, dato viejo, ciudad sin update y estado sano.

### Story 1.4 — Public Runtime Verification Gate

Objetivo: verificar producción después de cambios relevantes.

Alcance:

- Validar `https://mtyrespira.elelier.com`.
- Validar workflow horario del pipeline.
- Validar una ciudad conocida contra el contrato.
- Registrar evidencia básica posterior a release.

Criterio de salida:

- Cada release relevante tiene evidencia mínima de app, pipeline y contrato.

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
