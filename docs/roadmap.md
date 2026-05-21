# Roadmap — MtyRespira

Estado: brownfield operativo
Fecha: 2026-05-13

## Cambio de curso

La prioridad actual de MtyRespira no es expandir superficie visible. La prioridad es blindar confianza operativa antes de agregar features nuevas.

El roadmap vigente se ordena alrededor de cuatro principios:

1. Contrato de datos verificable.
2. Frescura honesta.
3. Degradación explícita.
4. Continuidad de pipeline y proveedor.

## Fase 1 — Blindaje crítico

### Story 1.1 — RPC Contract Smoke + Runtime Nullability Verification

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

Objetivo: evitar que la app comunique datos viejos como si fueran frescos.

Alcance:

- Distinguir medición, actualización de pipeline y refresh de frontend.
- Mostrar estado fresco, viejo, degradado o faltante.
- Evitar lenguaje de “tiempo real” cuando exceda la cadencia real del productor.

Criterio de salida:

- La UI no sobrepromete frescura.
- Un dato viejo o dudoso entra en estado explícito, no normal.

### Story 1.3 — Provider Continuity Readiness

Objetivo: preparar fallas del proveedor activo sin romper la experiencia pública.

Alcance:

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

## Documentos relacionados

- `docs/shared-data-contract.md`
- `docs/data-pipeline.md`
- `docs/architecture.md`
- `docs/blindaje-y-cambio-de-curso.md`
