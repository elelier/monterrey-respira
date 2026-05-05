# Arquitectura de MonterreyRespira

## Visión General

MonterreyRespira es una web app pública de información ambiental cívica para consultar calidad del aire en Monterrey y su área metropolitana.

El producto opera como un sistema coordinado entre dos repos:

- `elelier/monterrey-respira`: frontend React + TypeScript + Vite.
- `elelier/airquality_pipeline`: pipeline Python ejecutado por GitHub Actions.

El sitio público se expone en:

- `https://mtyrespira.elelier.com`

El target operativo actual del frontend es Cloudflare Pages. Cualquier referencia histórica a Netlify o Buildship debe tratarse como legacy y no como runtime vigente.

## Principios de arquitectura

- Brownfield-first: preservar lo que ya funciona.
- Un solo producto coordinado entre frontend, pipeline y Supabase.
- Supabase es la frontera compartida de datos.
- La RPC `get_latest_air_quality_per_city` es un contrato crítico de producto.
- No introducir runtime server-side para el flujo público principal.
- No inventar datos cuando el contrato falle; degradar de forma explícita.

## Flujo end-to-end vigente

```text
AirVisual / IQAir
  -> airquality_pipeline GitHub Actions
  -> Supabase tables: cities, air_quality_readings
  -> Supabase RPC: get_latest_air_quality_per_city
  -> monterrey-respira frontend
  -> mtyrespira.elelier.com
```

## Frontend

Stack principal:

- React 18
- TypeScript strict
- Vite
- Tailwind CSS
- React Router
- Supabase JS client
- Framer Motion

Rutas públicas principales:

- `/`
- `/asociaciones`
- `/acerca-de`
- `/datos-y-apis`
- `/politica-de-privacidad`

La app centraliza la obtención y transformación de datos en:

- `src/services/apiService.ts`
- `src/context/AirQualityContext.tsx`
- `src/types/index.ts`

El frontend consume Supabase mediante variables públicas con prefijo `VITE_`:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

No debe usar claves privilegiadas como `SUPABASE_SERVICE_ROLE_KEY` ni `AIRVISUAL_API_KEY`.

## Pipeline backend

El pipeline actual vive en `elelier/airquality_pipeline` y se ejecuta con GitHub Actions.

Workflow vigente:

- `.github/workflows/air-quality-workflow.yml`
- Cron: `0 * * * *`
- Runtime: Python 3.11
- Runner: `windows-latest`
- Ejecuta `pytest` antes de `main.py`

Responsabilidades:

- Obtener ciudades disponibles desde AirVisual.
- Leer ciudades existentes desde Supabase.
- Sincronizar altas/desactivaciones.
- Evaluar si cada ciudad necesita actualización.
- Consultar datos de calidad del aire.
- Validar payload antes de insertar.
- Insertar lecturas en `air_quality_readings`.
- Actualizar estado operativo en `cities`.

## Supabase y contrato compartido

Tablas compartidas:

- `cities`
- `air_quality_readings`

RPC crítica:

- `get_latest_air_quality_per_city`

Reglas:

- No renombrar la RPC sin rollout coordinado.
- No remover columnas del payload sin coordinación.
- No cambiar semántica de timestamps silenciosamente.
- Reconciliar ciudades por `city_id`, no por nombre.
- Tratar `reading_timestamp` como tiempo de medición.
- Tratar `last_successful_update_at` como tiempo de éxito del pipeline.

El contrato detallado vive en:

- `docs/shared-data-contract.md`

## Frescura y cache

Parámetros actuales:

- Productor: cada hora.
- Lógica de actualización: 59 minutos.
- Frontend cache TTL: 1 hora.
- Frontend refresh: cada 5 minutos.

Implicación importante:

El frontend puede consultar cada 5 minutos, pero eso no significa que exista una nueva medición upstream cada 5 minutos. La UI debe distinguir medición, consulta y degradación.

## Degradación esperada

El frontend debe fallar cerrado cuando:

- La RPC no devuelve una ciudad seleccionada.
- `aqi_us` llega nulo.
- El payload no tiene forma esperada.
- La consulta a Supabase falla.

Comportamiento esperado:

- `status: 'unknown'`
- `dataQuality: 'degraded'`
- campos secundarios como `N/D`
- mensaje visible si el dato no es confiable

No se debe representar un valor faltante como AQI `0` normal.

## Verificación mínima

Frontend:

```bash
npm run lint
npm run build
```

Pipeline:

```bash
pytest
```

Cambios de contrato:

- Validar shape de `get_latest_air_quality_per_city`.
- Validar nullability real.
- Validar timestamps UTC.
- Actualizar `docs/shared-data-contract.md`.

## Riesgos abiertos

- SQL exacto, grants y nullability runtime de la RPC aún requieren validación directa en Supabase.
- La configuración exacta de Cloudflare Pages puede no estar expresada como IaC dentro del repo.
- La continuidad de proveedor upstream debe tratarse como riesgo operativo de producto.
- Falta automatizar un smoke test canónico real contra la RPC en entorno controlado.
