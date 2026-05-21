# Referencias legacy de MonterreyRespira

Estado: legacy / no fuente de verdad operativa
Fecha: 2026-05-13

Este archivo conserva referencias históricas del proyecto. No debe usarse para tomar decisiones de runtime, pipeline, deploy ni contrato de datos.

La fuente de verdad vigente está en:

- `docs/shared-data-contract.md`
- `docs/architecture.md`
- `docs/data-pipeline.md`
- `docs/blindaje-y-cambio-de-curso.md`
- Workflow efectivo de `elelier/airquality_pipeline`

## Referencias históricas

Las siguientes referencias pueden aparecer en documentos antiguos, pero no son runtime vigente salvo evidencia nueva y explícita:

- Buildship como orquestador activo.
- Netlify como deploy activo.
- Endpoint `GET /latest-air-quality` como frontera vigente de lectura.
- API server-side propia para el frontend.

## Referencias vigentes de alto nivel

- App pública: `https://mtyrespira.elelier.com`
- Frontend: `elelier/monterrey-respira`
- Pipeline: `elelier/airquality_pipeline`
- Frontera de datos: Supabase PostgreSQL
- RPC crítica: `get_latest_air_quality_per_city`

## Regla de uso

Si este archivo contradice documentos vigentes o runtime, este archivo pierde prioridad.

No usar este archivo como base para nuevas historias de implementación.
