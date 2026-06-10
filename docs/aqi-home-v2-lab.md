# AQI Home v2 Lab

Ruta experimental: `/lab/aqi-home-v2`.

## Objetivo

Probar una presentación alternativa de la lectura principal de AQI antes de integrarla al home público.

## Alcance

- Solo frontend.
- No reemplaza `/`.
- No toca pipeline, Supabase ni RPCs.
- Reutiliza `AirQualityContext` y la data real ya disponible en la app.

## Elementos del prototipo

- Gauge circular de AQI basado en `data.aqi`.
- Riesgo compacto basado en `data.status`.
- Contaminante principal mostrado una sola vez.
- Frescura de lectura con estado visual tenue.
- Tarjeta glass de contexto ambiental con clima, temperatura, humedad y viento.

## Contratos respetados

- `get_latest_air_quality_per_city` sigue siendo la fuente de datos.
- `weather_*` se trata como contexto ambiental, no como AQI.
- Si falta AQI confiable, se muestra estado `unknown` / degradado.
- Si falta clima visual, se mantiene el bloque como contexto ambiental sin inventar condición.

## Validación pendiente

- `npm run build` / typecheck local o CI.
- Revisión visual mobile 390px.
- Revisión visual desktop.
- Decidir si el componente se integra a `/` después de pulido.
