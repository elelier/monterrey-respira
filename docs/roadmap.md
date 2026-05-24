# Roadmap — MtyRespira

Estado: brownfield operativo  
Fecha: 2026-05-24

## Cambio de curso

La prioridad actual de MtyRespira es blindar confianza operativa antes de agregar features nuevas.

Principios vigentes:

1. Contrato de datos verificable.
2. Frescura honesta.
3. Degradación explícita.
4. Continuidad de pipeline y proveedor.

## Estado documental vigente

Story 1.2.1 — Canonical Project Docs Stop: completada por PR #24.

Story 1.3 — Provider Continuity Readiness: completada en `elelier/airquality_pipeline` por PR #14.

Story 1.3.1 — App Docs Provider State Reconciliation + Roadmap Unlock: completada por PR #25.

Story 1.4 — Public Runtime Verification Gate: completada / degraded resolved por Story 1.4.1 y Story 1.4.2.

Story 1.4.1 — Public Metadata Freshness Claim Cleanup: completada por PR #27.

Story 1.4.2 — Read-only RPC Evidence Capture: completada por PR #30 con evidencia live read-only en `docs/evidence/story-1-4-2-rpc-read-only-evidence.md`.

Resultado Story 1.4.2:

- RPC verificada: `get_latest_air_quality_per_city`.
- Resultado: pass.
- Filas observadas: 9.
- Ciudades observadas: Cadereyta Jimenez, Ciudad Benito Juárez, Garcia, General Escobedo, Guadalupe, Monterrey, San Nicolas de los Garza, San Pedro Garza Garcia, Santa Catarina.
- Sin drift bloqueante de shape/nullability.
- `wind_direction_deg` y `weather_icon` fueron nulos en 9 filas y se mantienen como contexto nullable.
- No hubo cambios runtime, frontend, pipeline, provider, Cloudflare ni contrato de datos.

## Fase 1 — Blindaje crítico

### Story 1.1 — RPC Contract Smoke + Runtime Nullability Verification

Estado: completada si existe PR merged con evidencia de smoke/nullability.

### Story 1.2 — Freshness Truth UX + Stale Data Guard

Estado: completada por PR #23.

### Story 1.2.1 — Canonical Project Docs Stop

Estado: completada por PR #24.

### Story 1.3 — Provider Continuity Readiness

Estado: completada por PR #14 en `elelier/airquality_pipeline`.

### Story 1.3.1 — App Docs Provider State Reconciliation + Roadmap Unlock

Estado: completada por PR #25.

### Story 1.4 — Public Runtime Verification Gate

Estado: completada / degraded resolved.

Resultado:

- Story 1.4.1 mitigó el drift público de metadata/frescura.
- Story 1.4.2 capturó evidencia live read-only de la RPC crítica.
- No queda bloqueo activo para cerrar Fase 1.

### Story 1.4.1 — Public Metadata Freshness Claim Cleanup

Estado: completada por PR #27.

### Story 1.4.2 — Read-only RPC Evidence Capture

Estado: completada por PR #30.

## Fase 2 — Limpieza y gobernanza

Fase 2 puede iniciar después del merge de PR #30 porque el bloqueo de Story 1.4 queda resuelto.

### Story 2.1 — Docs Drift Cleanup

Objetivo: eliminar referencias o afirmaciones obsoletas que contradigan runtime vigente.

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
