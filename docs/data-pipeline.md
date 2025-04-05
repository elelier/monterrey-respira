# Documentación del Pipeline de Datos y API - MonterreyRespira

## 1. Objetivo

El propósito de este proyecto es crear un sistema automatizado para obtener datos actualizados de calidad del aire y clima de diversos municipios en el área metropolitana de Monterrey y sus alrededores. Estos datos se almacenan de forma persistente para ser consumidos por la webapp "MonterreyRespira". El sistema debe ser eficiente, reintentando automáticamente las actualizaciones fallidas y evitando llamadas innecesarias a la API externa si los datos existentes son recientes y fueron obtenidos exitosamente (dentro de un intervalo definido).

## 2. Tecnologías Utilizadas

*   **Base de Datos:** [Supabase](https://supabase.com/) (PostgreSQL con API REST y cliente JS)
*   **Orquestación / Automatización:** [Buildship](https://buildship.com/) (Plataforma para crear flujos de trabajo y APIs)
*   **Fuente de Datos Primaria:** API de Calidad del Aire de [AirVisual (IQAir)](https://www.iqair.com/commercial/air-quality-monitors/airvisual-platform/api)
*   **Lenguaje (Buildship Scripts):** TypeScript

## 3. Diseño de Base de Datos (Supabase)

Se utilizan dos tablas principales en Supabase.

### 3.1. Tabla `cities`

*   **Propósito:** Almacena la lista maestra de ciudades/localidades monitoreadas, sus identificadores para la API externa, metadatos y el estado/historial de la última actualización.
*   **Columnas Principales:**
    *   `id`: `BIGINT` (Primary Key, Autoincremental) - Identificador único interno.
    *   `name`: `TEXT NOT NULL UNIQUE` - Nombre común/mostrable (ej. "Monterrey").
    *   `api_name`: `TEXT NOT NULL UNIQUE` - Nombre exacto usado por AirVisual (ej. "Monterrey", "Ciudad Apodaca"). **Clave para llamadas API**.
    *   `state`: `TEXT` (Default: 'Nuevo Leon').
    *   `country`: `TEXT` (Default: 'Mexico').
    *   `latitude`: `FLOAT8 NULLABLE` - Latitud (actualizada desde la API).
    *   `longitude`: `FLOAT8 NULLABLE` - Longitud (actualizada desde la API).
    *   `last_successful_update_at`: `TIMESTAMPTZ NULLABLE` - Cuándo se insertó *exitosamente* la última lectura en `air_quality_readings`. **Clave para la lógica de intervalo**.
    *   `last_update_status`: `TEXT NULLABLE` - Resultado del último intento de fetch/actualización (ej. 'success', 'error: city_not_found', 'error: rate_limit', 'skipped: up_to_date'). **Clave para priorización**.
    *   `is_active`: `BOOLEAN` (Default: `TRUE`) - Indica si la ciudad debe ser monitoreada activamente (basado en si AirVisual la reporta).
    *   `created_at`: `TIMESTAMPTZ` (Default: `now()`).
    *   `updated_at`: `TIMESTAMPTZ` (Default: `now()`) - Timestamp de última modificación (útil con Triggers para auto-actualización).
*   **RLS (Row Level Security):** **Habilitado**. Buildship **DEBE** usar la `service_role` key (secreta) para **ignorar** RLS en todas las operaciones del pipeline. Policies solo serían necesarias para acceso directo a tablas desde frontends (con `anon` key).

### 3.2. Tabla `air_quality_readings`

*   **Propósito:** Almacena el historial detallado de *cada* lectura exitosa obtenida de la API.
*   **Columnas Principales:**
    *   `id`: `BIGINT` (Primary Key, Autoincremental).
    *   `city_id`: `BIGINT NOT NULL REFERENCES cities(id) ON DELETE CASCADE`.
    *   `reading_timestamp`: `TIMESTAMPTZ NOT NULL` - El timestamp **de la medición** proporcionado por la API (campo `ts`). **Clave para ordenamiento histórico y selección de última lectura**.
    *   `aqi_us`: `SMALLINT NULLABLE` - AQI (US).
    *   `main_pollutant_us`: `TEXT NULLABLE` - Contaminante principal (US).
    *   `temperature_c`: `REAL NULLABLE` - Temperatura (Celsius).
    *   `pressure_hpa`: `INTEGER NULLABLE` - Presión (hPa).
    *   `humidity_percent`: `SMALLINT NULLABLE` - Humedad (%).
    *   `wind_speed_ms`: `REAL NULLABLE` - Velocidad del viento (m/s).
    *   `wind_direction_deg`: `SMALLINT NULLABLE` - Dirección del viento (grados).
    *   `weather_icon`: `TEXT NULLABLE` - Código del icono del clima.
    *   `raw_api_response`: `JSONB NULLABLE` - Almacena la respuesta JSON cruda de la API (sección `data`). Muy útil para debugging.
    *   `created_at`: `TIMESTAMPTZ` (Default: `now()`) - Cuándo se insertó la fila en Supabase.
*   **Índices:** `city_id`, `reading_timestamp`. **Recomendado:** Índice compuesto `(city_id, reading_timestamp DESC)` para la función `get_latest_air_quality_per_city`.

## 4. Pipeline de Datos (Flujo en Buildship)

El flujo se ejecuta mediante un **Schedule Trigger**. Para mantenerse bajo ~10,000 llamadas/mes (con ~13 ciudades), se recomienda un intervalo de **60 minutos o más**.
*   **Expresión CRON para cada hora:** `0 * * * *`

1.  **Nodo 1: "Fetch Cities from AirVisual"**
    *   **Input:** `apiKey` (AirVisual API Key - Secret).
    *   **Lógica:** Llama a `/v2/cities` (NL, MX). Incluye retries con delay exponencial. Valida respuesta (`status: 'success'`, `data` es array).
    *   **Output:** Array `apiCitiesList`: `[{ city: "Ciudad Apodaca" }, ...]`

2.  **Nodo 2: "Get Existing Cities from Supabase"**
    *   **Input:** `supabaseUrl`, `supabaseServiceRoleKey` (Secret).
    *   **Lógica:** Ejecuta `SELECT id, api_name, is_active FROM cities;`.
    *   **Output:** Array `dbCitiesList`: `[{ id, api_name, is_active }, ...]`

3.  **Nodo 3: "Sync Cities (Add New / Deactivate Old)"**
    *   **Input:** `apiCitiesList`, `dbCitiesList`, credenciales Supabase, `deactivateMissingCities` (boolean, default `true`).
    *   **Lógica:** Compara listas. `INSERT` nuevas ciudades (`name` y `api_name` inicializados con el nombre API). Opcionalmente, `UPDATE cities SET is_active = false` para las ausentes en la lista API.
    *   **Output:** Objeto resumen `{ newCitiesAdded, citiesDeactivated, errors }`.

4.  **Nodo 4: "Get Active Cities with Timestamps (Prioritized)"**
    *   **Input:** Credenciales de Supabase.
    *   **Lógica:** Ejecuta `SELECT id, api_name, last_successful_update_at, last_update_status FROM cities WHERE is_active = true;`. **Ordena** los resultados en JS: primero las ciudades cuyo `last_update_status` NO es 'success' (o es null), y luego por `last_successful_update_at` más antiguo.
    *   **Output:** Array **ordenado** `activeCities`: `[{ id, api_name, last_successful_update_at, last_update_status }, ...]`

5.  **Nodo 5: Loop/Map Structure (Buildship Feature)**
    *   **Input:** Array ordenado `activeCities` del Nodo 4.
    *   **Lógica:** Itera sobre cada objeto de ciudad y ejecuta los nodos 6-9.

6.  **Nodo 6 (Dentro del Loop): "Check if Update Needed"**
    *   **Input:** Objeto `city` actual del loop (`{ id, api_name, last_successful_update_at, last_update_status }`).
    *   **Lógica:**
        *   Si `last_update_status` **NO** es `'success'`, establece `needsUpdate = true`.
        *   Si `last_update_status` **ES** `'success'`, compara `last_successful_update_at` con la hora actual. Si es `null` o han pasado más de `UPDATE_INTERVAL_MINUTES` (ej. 59 min), establece `needsUpdate = true`.
    *   **Output:** Objeto `city` original, aumentado con `needsUpdate: boolean`.

7.  **Nodo 7 (Dentro del Loop - Condicional: `needsUpdate == true`)**: "Fetch AirVisual Data for City"
    *   **Input:** Objeto `cityInfo` (`{ id, api_name }`), `airVisualApiKey` (Secret), `state`, `country`.
    *   **Lógica:** Llama a `/v2/city` usando `fetchWithRetry`. Procesa la respuesta exitosa extrayendo coordenadas, calidad del aire, clima y el `reading_timestamp` (ISO). Clasifica errores (`city_not_found`, `rate_limit`, etc.). **Incluye un delay post-éxito** (ej. 5-12 segundos) antes de retornar para espaciar las operaciones.
    *   **Output:** Un *único* objeto estructurado:
        *   Éxito: `{ city_id, status: 'success', municipio, api_name_used, coordenadas: {lat, lon}, calidad_aire: {...}, clima: {...}, ultima_actualizacion, reading_timestamp_iso, api_raw_response }`
        *   Error: `{ city_id, status: 'error', municipio, api_name_used, errorType: '...', message: '...' }`

8.  **Nodo 8 (Dentro del Loop): "Prepare Supabase Data"**
    *   **Input:** Output del Nodo 7 o del Nodo 6 (`fetchOrSkipResult`).
    *   **Lógica:** Basado en el input (`status: 'success'`, `status: 'error'`, o `needsUpdate: false`), prepara:
        *   `readingDataToInsert`: Objeto para `air_quality_readings` (con `city_id`, `reading_timestamp` ISO, datos parseados, `raw_api_response`) o `null`.
        *   `cityStatusToUpdate`: Objeto para `cities` (con `last_successful_update_at` [ahora], `last_update_status`, `updated_at`, `latitude`, `longitude`).
    *   **Output:** `{ city_id, readingDataToInsert: obj | null, cityStatusToUpdate: obj }`.

9.  **Nodo 9 (Dentro del Loop): "Execute Supabase Updates"**
    *   **Input:** Output del Nodo 8, credenciales Supabase.
    *   **Lógica:** Ejecuta `INSERT` en `air_quality_readings` (si `readingDataToInsert` no es null). Ejecuta `UPDATE` en `cities` (usando `cityStatusToUpdate`). Incluye `try...catch` para cada operación.
    *   **Output:** `{ city_id, readingInserted: boolean, cityStatusUpdated: boolean, insertError?: string, updateError?: string }`.

10. **Nodo 10 (Opcional - Fuera del Loop): "Workflow Summary"**
    *   **Input:** Colección de outputs del Nodo 9.
    *   **Lógica:** Agrega resultados.
    *   **Output:** Resumen. Posible notificación de errores.

## 5. API de Lectura para Frontend (`GET /latest-air-quality`)

Para exponer los datos al frontend de manera eficiente.

### 5.1. Función SQL en Supabase (`get_latest_air_quality_per_city`)

*   **Propósito:** Obtener la lectura más reciente para cada ciudad *activa*.
*   **Lógica Clave:** Usa `JOIN` entre `cities` y `air_quality_readings`, filtra por `cities.is_active = true`, y utiliza `ROW_NUMBER() OVER(PARTITION BY city_id ORDER BY reading_timestamp DESC)` para encontrar la fila más reciente (`rn = 1`) por ciudad.
*   **Columnas Devueltas:** `city_id`, `city_name`, `api_name`, `latitude`, `longitude`, `reading_timestamp`, `aqi_us`, `main_pollutant_us`, `temperature_c`, `humidity_percent`, `wind_speed_ms`, `wind_direction_deg`, `weather_icon`, `last_successful_update_at`.
*   **Configuración:** `SECURITY DEFINER`. `GRANT EXECUTE` a `service_role`.

### 5.2. Endpoint API en Buildship

*   **Trigger:** API Endpoint `GET /latest-air-quality` (o similar).
*   **Nodo Script: "Call Supabase Function"**
    *   **Input:** Credenciales Supabase, `functionName: "get_latest_air_quality_per_city"`.
    *   **Lógica:** Usa `supabase.rpc(functionName)` para llamar a la función SQL.
    *   **Output:** El array de resultados devuelto por la función SQL.
*   **Nodo Respuesta:** Envía el output del nodo script como respuesta JSON con status 200 (o maneja errores con status 500).

## 6. Configuración Importante

*   **Secrets (Buildship):** `airVisualApiKey`, `supabaseServiceRoleKey`.
*   **RLS (Supabase):** Habilitado. Usar `service_role` key en Buildship.
*   **Schedule Trigger (Buildship):** Intervalo de >= 60 minutos (ej. CRON `0 * * * *`).
*   **Intervalo Lógica (Nodo 6):** `UPDATE_INTERVAL_MINUTES` ajustado a un valor ligeramente menor que el del trigger (ej. 59).
*   **Dependencias (Buildship):** `@supabase/supabase-js`.

## 7. Consideraciones y Próximos Pasos

*   **Monitoreo:** Implementar Nodo 10 o usar herramientas de Buildship/Supabase.
*   **Fallback Pesquería:** Pendiente si `city_not_found` persiste.
*   **Fuentes Alternativas:** SIMA, etc.
*   **Frontend:** Desarrollo de la UI consumiendo la API de lectura.
*   **Historial/Gráficos:** Crear endpoints/lógica para consultar rangos de fechas en `air_quality_readings`.
*   **Notificaciones:** Flujos adicionales para alertas AQI.

