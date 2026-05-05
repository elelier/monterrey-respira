# Pipeline de Datos y API - MonterreyRespira

## Objetivo

Mantener lecturas horarias de calidad del aire para ciudades activas del área metropolitana de Monterrey, almacenarlas en Supabase y exponerlas al frontend público mediante la RPC `get_latest_air_quality_per_city`.

## Runtime vigente

El runtime vigente del pipeline vive en el repo:

- `elelier/airquality_pipeline`

La automatización vigente es GitHub Actions:

- `.github/workflows/air-quality-workflow.yml`
- Cron: `0 * * * *`
- Manual trigger: `workflow_dispatch`
- Python: `3.11`
- Tests antes de ejecución: `pytest`

Las referencias históricas a Buildship quedan como legacy y no deben tratarse como fuente de verdad operativa.

## Stack

- Fuente upstream: IQAir / AirVisual API v2.
- Productor: Python + GitHub Actions.
- Storage: Supabase PostgreSQL.
- Frontera de lectura: Supabase RPC `get_latest_air_quality_per_city`.
- Consumidor: React + Vite frontend en `monterrey-respira`.

## Flujo vigente

```text
1. GitHub Actions ejecuta el workflow horario.
2. El workflow instala dependencias.
3. El workflow ejecuta pytest.
4. El workflow configura AIRVISUAL_API_KEY, SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
5. El workflow ejecuta main.py.
6. main.py obtiene ciudades desde AirVisual.
7. main.py obtiene ciudades existentes desde Supabase.
8. sync_cities.py agrega nuevas ciudades o desactiva las ausentes.
9. utils.py decide si una ciudad necesita actualización.
10. airvisual_api.py consulta AirVisual por ciudad con reintentos y timeout.
11. utils.py valida AQI, temperatura y coordenadas.
12. update_city.py inserta una lectura válida en air_quality_readings.
13. update_city.py actualiza estado operativo en cities.
14. El frontend lee la RPC get_latest_air_quality_per_city desde Supabase.
```

## Frecuencia y límites

- Workflow horario: `0 * * * *`.
- Intervalo lógico de actualización: 59 minutos.
- Timeout HTTP por request: 45 segundos.
- Delay entre ciudades: 8 a 15 segundos con jitter.
- Reintentos: 3 intentos para llamadas upstream críticas.

## Tablas principales

### `cities`

Responsabilidad:

- Identidad estable de ciudad.
- Metadata de ciudad.
- Estado operativo de última actualización.

Campos críticos:

- `id`
- `name`
- `api_name`
- `latitude`
- `longitude`
- `last_successful_update_at`
- `last_update_status`
- `is_active`

### `air_quality_readings`

Responsabilidad:

- Historial de lecturas exitosas.
- Separar tiempo de medición de tiempo de escritura.

Campos críticos:

- `city_id`
- `reading_timestamp`
- `aqi_us`
- `main_pollutant_us`
- `temperature_c`
- `pressure_hpa`
- `humidity_percent`
- `wind_speed_ms`
- `wind_direction_deg`
- `weather_icon`
- `raw_api_response`

## Estados operativos

Estados esperados en `cities.last_update_status`:

- `success`
- `error:*`
- `skipped: up_to_date`

Regla: no cambiar semántica de estos estados sin actualizar pipeline, contrato compartido y documentación.

## RPC de lectura

Nombre:

- `get_latest_air_quality_per_city`

Propósito:

- Devolver la lectura más reciente por ciudad activa.
- Exponer el payload canónico al frontend.

Columnas esperadas:

- `city_id`
- `city_name`
- `api_name`
- `latitude`
- `longitude`
- `reading_timestamp`
- `aqi_us`
- `main_pollutant_us`
- `temperature_c`
- `humidity_percent`
- `wind_speed_ms`
- `wind_direction_deg`
- `weather_icon`
- `last_successful_update_at`

El contrato completo vive en `docs/shared-data-contract.md`.

## Reglas de integridad

- `city_id` es la identidad estable.
- `city_name`, `name` y `api_name` no son intercambiables.
- `reading_timestamp` representa el tiempo de medición upstream.
- `last_successful_update_at` representa el tiempo de escritura exitosa del pipeline.
- El pipeline no debe inventar valores faltantes.
- El frontend debe degradar a estado desconocido cuando falten datos críticos.

## Variables de entorno

Pipeline:

- `AIRVISUAL_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Frontend:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Regla de seguridad:

- Nunca exponer `SUPABASE_SERVICE_ROLE_KEY` ni `AIRVISUAL_API_KEY` en frontend.

## Verificación

Pipeline:

```bash
pytest
```

Frontend:

```bash
npm run lint
npm run build
```

Cambios que afecten contrato deben validar también:

- shape de la RPC
- nullability observada
- timestamps UTC
- comportamiento de degradación en frontend

## Próximos pasos recomendados

- Validar directamente SQL, grants y nullability runtime de `get_latest_air_quality_per_city` en Supabase.
- Agregar smoke test canónico de contrato RPC con fixture.
- Reconciliar cualquier diferencia entre runtime de Cloudflare Pages y documentación operativa.
