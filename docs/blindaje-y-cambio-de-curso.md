# Mapa de blindaje y cambio de curso — MtyRespira

Estado: baseline operativo recomendado
Fecha: 2026-05-13

## Propósito

Este documento convierte el PreMortem de MtyRespira en un mapa accionable de blindaje. El objetivo no es ampliar superficie por impulso, sino proteger la confiabilidad del producto público antes de agregar nuevas capacidades.

MtyRespira debe tratarse como un solo producto coordinado entre:

- `elelier/monterrey-respira` — app pública React + TypeScript + Vite.
- `elelier/airquality_pipeline` — pipeline Python + GitHub Actions.
- Supabase PostgreSQL ambiental — tablas `cities`, `air_quality_readings`, `pipeline_logs` cuando aplique.
- RPC crítica `get_latest_air_quality_per_city`.
- Deploy público `https://mtyrespira.elelier.com`.

## Cambio de curso

El cambio de curso recomendado es pasar de “agregar features visibles” a “blindar confianza operativa”.

Prioridad nueva:

1. Confiabilidad del dato.
2. Frescura honesta.
3. Contrato RPC verificable.
4. Degradación explícita.
5. Documentación viva alineada a runtime.
6. UX mobile solo después de no maquillar estados de datos.

No se debe avanzar expansión, pronóstico, alertas personalizadas, nuevas ciudades, auth ni dashboards internos hasta cerrar los riesgos críticos de contrato y frescura.

## Premisa de fracaso a evitar

El peor fracaso no es que el sitio caiga. El peor fracaso es que el sitio siga en línea y muestre datos ambientales viejos, nulos o incompletos como si fueran frescos y confiables.

## Invariantes no negociables

- No romper `get_latest_air_quality_per_city`.
- No romper la cadencia horaria del pipeline.
- No romper `https://mtyrespira.elelier.com`.
- No inventar AQI, contaminantes, clima, coordenadas ni timestamps.
- No usar `service_role` en frontend.
- No usar Core DB para lecturas ambientales.
- Usar `city_id` como identidad estable; no reconciliar por nombre.
- Tratar `reading_timestamp` como tiempo de medición.
- Tratar `last_successful_update_at` como tiempo operativo de pipeline.
- Fallar cerrado ante duda de contrato, frescura o integridad.

## Mapa de riesgos y blindaje

| Riesgo | Fracaso observable | Blindaje requerido | Área |
| --- | --- | --- | --- |
| Frescura sobreprometida | La UI parece actual aunque el pipeline esté atrasado | Freshness Truth UX + stale guard | app / UX |
| RPC sin smoke test | Cambio en shape rompe o degrada silenciosamente | RPC contract smoke + fixture canónico | BD / app / pipeline |
| Nullability no alineada | Campos nulos se muestran como cero, PM2.5 o fecha inventada | Runtime nullability hardening | app / BD |
| Proveedor upstream falla | API expirada o limitada deja ciudades sin update | Provider continuity readiness | pipeline |
| Docs legacy guían cambios malos | Agentes siguen Buildship/Netlify como verdad vigente | Docs drift cleanup | docs |
| Cambios cross-repo locales | PR de un repo rompe el otro | Checklist `pipeline -> Supabase/RPC -> frontend` | QA / PM-PO |
| Deploy no verificado | Main está bien, producción no refleja cambios | Public runtime verification gate | Cloudflare / app |
| Histórico pesado o engañoso | Gráficas rellenan huecos o inventan series | Historical truth guard | app / BD |

## Backlog recomendado

### 1. RPC Contract Smoke + Runtime Nullability Verification

Objetivo: crear evidencia repetible de lo que devuelve `get_latest_air_quality_per_city`.

Alcance:

- Validar columnas esperadas.
- Validar nullability observada.
- Validar timestamps UTC.
- Validar una o más ciudades conocidas.
- Documentar SQL/grants reales si se inspeccionan desde Supabase.

No hacer:

- No cambiar shape de la RPC.
- No hacer writes live.
- No introducir service_role fuera del pipeline.

### 2. Freshness Truth UX + Stale Data Guard

Objetivo: evitar que el usuario confunda refresh frontend con nueva medición.

Alcance:

- Mostrar diferencia entre medición y actualización de pipeline.
- Detectar stale data.
- Estado claro: fresco, viejo, degradado, sin lectura.
- Evitar `tiempo real` si no corresponde a la cadencia real.

### 3. Provider Continuity Readiness

Objetivo: preparar fallas de WAQI/AQICN o cualquier proveedor activo sin romper la UX.

Alcance:

- Clasificar errores upstream.
- Registrar última ejecución sana.
- Mantener estado por ciudad.
- Runbook de contingencia.

### 4. Docs Drift Cleanup

Objetivo: dejar clara la fuente de verdad operativa.

Alcance:

- Eliminar o marcar como legacy referencias a Buildship y Netlify si contradicen runtime vigente.
- Actualizar README, roadmap y referencias.
- Mantener `docs/shared-data-contract.md` como frontera de producto.

### 5. Public Runtime Verification Gate

Objetivo: después de merge, verificar que producción siga sana.

Alcance:

- Validar carga pública.
- Validar selección de una ciudad conocida.
- Validar timestamp y estado de degradación.
- Validar que el workflow horario del pipeline esté sano.

## Orden de ejecución recomendado

1. Contrato y nullability.
2. Frescura y degradación visible.
3. Continuidad proveedor/pipeline.
4. Limpieza documental.
5. UX polish posterior.

## Limpieza de documentación obsoleta

Se consideran obsoletas como fuente de verdad vigente:

- Referencias a Buildship como runtime activo del pipeline.
- Referencias a Netlify como deploy activo si contradicen Cloudflare Pages.
- Referencias a endpoint `GET /latest-air-quality` si se presentan como API vigente frente a la RPC Supabase.
- Roadmaps que promueven expansión antes del blindaje de contrato/frescura.
- Documentos bajo carpetas legacy como `docs/bye/` cuando repiten plataformas o endpoints no vigentes.

Regla: si un documento legacy se conserva, debe decir explícitamente que no es fuente de verdad operativa.

## Checklist para PRs futuros

Antes de merge:

- [ ] ¿Toca app, pipeline, BD/RPC, Cloudflare o UX?
- [ ] ¿Afecta `reading_timestamp`, `last_successful_update_at`, cache o frescura?
- [ ] ¿Afecta nullability o campos del contrato?
- [ ] ¿Puede mostrar datos viejos como frescos?
- [ ] ¿Puede inventar datos por fallback?
- [ ] ¿Requiere validar ambos repos?
- [ ] ¿Actualiza `docs/shared-data-contract.md` si toca contrato?
- [ ] ¿Tiene rollback claro?

Después de merge:

- [ ] Validar producción en `https://mtyrespira.elelier.com`.
- [ ] Validar workflow horario en `airquality_pipeline`.
- [ ] Validar al menos una ciudad conocida.
- [ ] Confirmar que no se introdujeron referencias legacy como verdad vigente.

## Definición de blindaje completo

MtyRespira estará blindado cuando:

- La RPC crítica tenga smoke test o fixture canónico.
- La app maneje nulls sin inventar datos.
- La UI distinga dato fresco, viejo, degradado y faltante.
- El pipeline tenga evidencia operativa por ciudad.
- Los docs principales no contradigan runtime.
- Cada PR de datos declare impacto cross-repo.
