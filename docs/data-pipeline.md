# Pipeline de datos y API — MonterreyRespira

## Objetivo

Mantener lecturas horarias disponibles de calidad del aire para las ciudades activas del área metropolitana de Monterrey, enriquecerlas con contexto meteorológico cuando esté disponible, almacenarlas en Supabase y exponerlas al frontend público mediante la RPC `get_latest_air_quality_per_city`.

La app no promete tiempo real. Presenta la hora de medición reportada, la trazabilidad de la última escritura exitosa del pipeline y estados degradados cuando los datos no están disponibles o no cumplen el contrato.

## Runtime vigente

El runtime productor vive en el repositorio `elelier/airquality_pipeline`.

La automatización vigente usa GitHub Actions:

- Workflow: `.github/workflows/air-quality-workflow.yml`.
- Ejecución programada: `0 * * * *`.
- Ejecución manual: `workflow_dispatch`.
- Python: `3.11`.
- Validación previa: `pytest`.
- Pull requests: tests sin escritura de datos.
- Backfill meteorológico: flujo manual, controlado y separado de la ejecución horaria.

Las referencias históricas a Buildship quedan como legacy y no son fuente de verdad operativa.

## Stack y proveedores

- Proveedor AQI activo: WAQI/AQICN station feed API.
- Proveedor de contexto meteorológico: Open-Meteo.
- Proveedor AQI legacy/fallback: IQAir/AirVisual v2, únicamente cuando `AIR_QUALITY_PROVIDER=airvisual` se selecciona de forma explícita y su acceso está confirmado como sano.
- Productor: Python y GitHub Actions en `elelier/airquality_pipeline`.
- Persistencia: Supabase PostgreSQL.
- Frontera de lectura: Supabase RPC `get_latest_air_quality_per_city`.
- Consumidor: frontend React + Vite en `monterrey-respira`.
- Hosting público: Cloudflare Pages.

Open-Meteo aporta contexto meteorológico canónico. No sustituye, corrige ni altera el AQI proveniente de WAQI/AQICN.

## Flujo horario vigente

```text
1. GitHub Actions inicia la ejecución programada o manual.
2. Instala dependencias y ejecuta pytest con AIR_QUALITY_PROVIDER=waqi.
3. Configura AIR_QUALITY_PROVIDER, WAQI_API_TOKEN, SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
4. Ejecuta main.py; --force-update solo se usa cuando la ejecución manual lo solicita.
5. main.py selecciona el proveedor AQI; el valor predeterminado es waqi.
6. Con WAQI, conserva las ciudades existentes en Supabase.
7. waqi_api.py resuelve cada ciudad activa mediante un mapeo explícito ciudad -> estación.
8. Consulta WAQI con timeout, reintentos y validación fail-closed.
9. weather_context.py consulta Open-Meteo con las coordenadas canónicas de la ciudad.
10. utils.py valida AQI, timestamp y coordenadas dentro de Nuevo León.
11. update_city.py inserta la lectura válida y el contexto meteorológico válido, si existe.
12. update_city.py actualiza el estado operativo de la ciudad.
13. El frontend consume get_latest_air_quality_per_city con la anon key de Supabase.
14. Cloudflare Pages sirve el frontend estático.
```

Una falla de Open-Meteo no debe invalidar una lectura AQI que sí cumple el contrato. Si el contexto meteorológico no es válido, sus campos canónicos se omiten o permanecen nulos; no se rellenan con valores inventados ni con campos legacy de WAQI.

AirVisual/IQAir permanece como adapter de recuperación controlada. No es el proveedor activo ni un fallback automático del producto público.

## Frecuencia y límites

- Ejecución horaria: `0 * * * *`.
- Intervalo lógico de actualización AQI: 59 minutos.
- WAQI: timeout de 45 segundos y reintentos para fallas transitorias.
- Open-Meteo: timeout de 20 segundos y hasta 3 intentos para fallas reintentables.
- Delay entre ciudades: de 8 a 15 segundos con jitter.
- El caché o refresh del frontend no implica una nueva medición upstream.

## Tablas principales

### `cities`

Responsabilidades:

- Mantener la identidad estable de cada ciudad.
- Conservar metadata y coordenadas canónicas.
- Registrar el estado operativo de la última actualización.

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

Responsabilidades:

- Conservar el historial de lecturas exitosas.
- Separar el tiempo de medición upstream del tiempo de escritura.
- Mantener diferenciados el AQI y el contexto meteorológico.

Campos AQI y trazabilidad:

- `city_id`
- `reading_timestamp`
- `aqi_us`
- `main_pollutant_us`
- `raw_api_response`

Campos meteorológicos legacy de WAQI, conservados por compatibilidad:

- `temperature_c`
- `pressure_hpa`
- `humidity_percent`
- `wind_speed_ms`
- `wind_direction_deg`
- `weather_icon`

Campos canónicos de contexto meteorológico Open-Meteo:

- `weather_temperature_c`
- `weather_humidity_percent`
- `weather_wind_speed_kmh`
- `weather_wind_direction_deg`
- `weather_wind_gust_kmh`
- `weather_provider`
- `weather_timestamp`
- `weather_source_payload`

Los campos meteorológicos son nullable. Las nuevas superficies públicas y gráficas históricas deben usar `weather_*` y `avg_weather_*`; no deben hacer fallback silencioso a los campos legacy de WAQI.

## Estados operativos

Estados esperados en `cities.last_update_status`:

- `success`
- `error:*`
- `skipped: up_to_date`

No se debe cambiar la semántica de estos estados sin coordinar el pipeline, el contrato compartido y la documentación.

## RPC de lectura

La RPC crítica es `get_latest_air_quality_per_city`.

Propósitos:

- Devolver la lectura más reciente por ciudad activa.
- Exponer el payload canónico al frontend.
- Mantener el frontend desacoplado de los payloads internos de cada proveedor.

Columnas esperadas:

- `city_id`
- `city_name`
- `api_name`
- `latitude`
- `longitude`
- `reading_timestamp`
- `aqi_us`
- `main_pollutant_us`
- campos meteorológicos legacy, por compatibilidad
- `weather_temperature_c`
- `weather_humidity_percent`
- `weather_wind_speed_kmh`
- `weather_wind_direction_deg`
- `weather_wind_gust_kmh`
- `weather_provider`
- `weather_timestamp`
- `last_successful_update_at`

El shape, la nullability y las RPC históricas viven en [el contrato compartido](./shared-data-contract.md).

## Semántica temporal

- `reading_timestamp`: hora de la medición AQI reportada por el proveedor.
- `weather_timestamp`: hora del contexto meteorológico reportado por Open-Meteo.
- `last_successful_update_at`: hora de la última escritura exitosa del pipeline.

Estos timestamps no son intercambiables. Una recarga del frontend tampoco cambia ninguno de ellos.

## Reglas de integridad

- `city_id` es la identidad estable.
- `city_name`, `name` y `api_name` no son intercambiables.
- El pipeline no inventa valores faltantes.
- AQI `0` no sustituye una lectura ausente.
- El frontend degrada a estado desconocido o sin lectura cuando faltan datos críticos.
- El frontend no depende de payloads específicos de WAQI/AQICN, Open-Meteo o AirVisual/IQAir.
- Un error meteorológico no invalida un AQI válido.
- Un error AQI no puede ocultarse con datos meteorológicos.

## Variables de entorno

Pipeline (`elelier/airquality_pipeline`, secrets de GitHub Actions o entorno local):

- `AIR_QUALITY_PROVIDER`, cuyo valor predeterminado es `waqi`.
- `WAQI_API_TOKEN` para el proveedor AQI activo.
- `SUPABASE_URL`.
- `SUPABASE_SERVICE_ROLE_KEY`.
- `AIRVISUAL_API_KEY` solo para una ejecución manual con `AIR_QUALITY_PROVIDER=airvisual`.

Open-Meteo no requiere una API key en el runtime vigente.

Frontend (`monterrey-respira`, Cloudflare Pages o `.env` local):

- `VITE_SUPABASE_URL`.
- `VITE_SUPABASE_ANON_KEY`.

Variables opcionales del frontend:

- `VITE_GOOGLE_ANALYTICS_ID`.
- `VITE_ADSENSE_ENABLED`.
- `VITE_ADSENSE_CLIENT_ID`.
- `VITE_ADSENSE_SLOT_HEADER`.
- `VITE_ADSENSE_SLOT_SIDEBAR`.
- `VITE_ADSENSE_SLOT_CONTENT`.
- `VITE_CORE_DB_SUPABASE_URL`.
- `VITE_CORE_DB_SUPABASE_PUBLISHABLE_KEY`.
- `VITE_CORE_SPACE_KEY`.
- `VITE_CORE_APP_KEY`.

Nunca expongas `SUPABASE_SERVICE_ROLE_KEY`, `WAQI_API_TOKEN` ni `AIRVISUAL_API_KEY` en el frontend o en variables públicas de Cloudflare Pages.

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

Los cambios de contrato también deben validar:

- shape y grants de `get_latest_air_quality_per_city`;
- nullability observada;
- timestamps UTC;
- campos canónicos `weather_*`;
- comportamiento de degradación del frontend;
- frescura observada respecto de la cadencia horaria.

## Próximos pasos recomendados

- Mantener evidencia de smoke tests para la RPC crítica.
- Validar SQL, grants y nullability en Supabase cuando una historia cambie el contrato.
- Mantener sincronizados pipeline, contrato compartido, frontend y documentación en cualquier cambio futuro.
