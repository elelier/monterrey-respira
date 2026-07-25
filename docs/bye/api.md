# Documentación de APIs legacy

Estado: legacy / no fuente de verdad operativa

Este archivo conserva notas de una implementación anterior. No describe el runtime vigente de MtyRespira.

Contrato vigente:

```text
WAQI/AQICN + Open-Meteo -> airquality_pipeline -> Supabase -> RPC -> frontend -> Cloudflare Pages
```

El frontend vigente no consulta WAQI, Open-Meteo, IQAir ni OpenAQ directamente. Consume las RPC de Supabase con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

## APIs históricas

### IQAir / AirVisual

Estado vigente: adapter legacy/fallback en `elelier/airquality_pipeline`; no es el proveedor activo del producto público.

**URL Base**: `https://api.airvisual.com/v2`

**Endpoints utilizados históricamente**:

- `/nearest_city`: Obtiene datos de la estación más cercana a las coordenadas proporcionadas

**Parámetros principales**:

- `lat`: Latitud de la ubicación
- `lon`: Longitud de la ubicación
- `key`: Clave de API (requerida)

**Implementación histórica**: una versión anterior usó esta API como fuente primaria. Ya no es el proveedor activo; WAQI/AQICN es el proveedor AQI activo confirmado por el pipeline.

**Limitaciones**:

- La versión gratuita tiene límites de peticiones (ej. 10,000/mes)
- No proporciona datos para todos los contaminantes (falta O3, NO2, SO2, CO)

### OpenAQ

Estas notas se escribieron para OpenAQ v3 y no deben usarse como guía de integración vigente.

**URL Base**: `https://api.openaq.org/v3`

**Endpoints utilizados**:

- `/locations`: Obtiene estaciones de monitoreo cerca de las coordenadas proporcionadas.

**Parámetros principales**:

- `coordinates`: Latitud y longitud en formato "lat,lon"
- `radius`: Radio de búsqueda en metros
- `limit`: Número máximo de resultados
- `X-API-Key`: Clave de API (requerida, enviada en el header de la petición)

**Nota sobre ordenamiento**: El parámetro `order_by=distance` ya no está disponible en v3. Para obtener la estación más cercana, se puede solicitar un `limit` mayor (ej. 5) y calcular la distancia en el cliente, o simplemente usar el primer resultado devuelto por la API.

**Implementación histórica**: se propuso como fuente complementaria. No forma parte del contrato vigente del frontend.

**Limitaciones**:

- No todas las estaciones proporcionan datos para todos los contaminantes
- Puede haber retrasos en la actualización de los datos

## Estrategia de fallback retirada

La estrategia siguiente está retirada y no debe reintroducirse como comportamiento vigente:

1.  **Intento Principal**: Se intenta obtener datos de IQAir usando la API Key.
2.  **Complemento**: Si el intento principal es exitoso, se complementan los datos faltantes con OpenAQ v3 usando su API Key.
3.  **Fallback**: Si ambas APIs fallan o no devuelven datos útiles, se generan datos simulados basados en algoritmos determinísticos.

El contrato vigente prohíbe inventar lecturas ambientales, usar AQI `0` como sustituto saludable o mostrar datos simulados como mediciones reales.

## Implementación retirada

El flujo retirado consultaba APIs de proveedor desde el frontend y podía devolver datos simulados si faltaban credenciales o respuestas válidas. Ese patrón mezcla secretos de proveedor con el cliente público y contradice la frontera actual de Supabase RPC.

## Datos simulados retirados

Una versión anterior generaba datos simulados basados en:

- La ubicación seleccionada
- El momento del día
- Patrones históricos de contaminación

El producto vigente no debe presentar datos simulados como lecturas ambientales.

## Notas retiradas

- No implementar un proxy de proveedor sin actualizar arquitectura y contrato.
- No integrar nuevas fuentes sin rollout documentado.
- No cambiar la frontera de lectura vigente sin coordinar `docs/shared-data-contract.md`.
