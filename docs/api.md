# Documentación de APIs

MonterreyRespira utiliza diversas APIs para obtener datos de calidad del aire en tiempo real. Esta documentación describe las APIs utilizadas, su implementación en el proyecto y las estrategias de fallback.

## APIs Externas

### IQAir (AirVisual)

**URL Base**: `https://api.airvisual.com/v2`

**Endpoints utilizados**:

- `/nearest_city`: Obtiene datos de la estación más cercana a las coordenadas proporcionadas

**Parámetros principales**:
- `lat`: Latitud de la ubicación
- `lon`: Longitud de la ubicación
- `key`: Clave de API (requerida)

**Implementación**: La aplicación utiliza esta API como fuente primaria para los datos de calidad del aire (AQI, PM2.5, PM10, temperatura, humedad, etc.)

**Limitaciones**:
- La versión gratuita tiene límites de peticiones (ej. 10,000/mes)
- No proporciona datos para todos los contaminantes (falta O3, NO2, SO2, CO)

### OpenAQ

**¡Importante!**: La API v2 de OpenAQ está retirada. Se debe utilizar la **API v3**.

**URL Base**: `https://api.openaq.org/v3`

**Endpoints utilizados**:

- `/locations`: Obtiene estaciones de monitoreo cerca de las coordenadas proporcionadas.

**Parámetros principales**:
- `coordinates`: Latitud y longitud en formato "lat,lon"
- `radius`: Radio de búsqueda en metros
- `limit`: Número máximo de resultados
- `X-API-Key`: Clave de API (requerida, enviada en el header de la petición)

**Nota sobre ordenamiento**: El parámetro `order_by=distance` ya no está disponible en v3. Para obtener la estación más cercana, se puede solicitar un `limit` mayor (ej. 5) y calcular la distancia en el cliente, o simplemente usar el primer resultado devuelto por la API.

**Implementación**: Se utiliza como fuente complementaria para obtener datos de contaminantes no disponibles en IQAir.

**Limitaciones**:
- No todas las estaciones proporcionan datos para todos los contaminantes
- Puede haber retrasos en la actualización de los datos

## Estrategia de Fallback

La aplicación implementa un sistema de fallback para garantizar que siempre haya datos disponibles:

1.  **Intento Principal**: Se intenta obtener datos de IQAir usando la API Key.
2.  **Complemento**: Si el intento principal es exitoso, se complementan los datos faltantes con OpenAQ v3 usando su API Key.
3.  **Fallback**: Si ambas APIs fallan o no devuelven datos útiles, se generan datos simulados basados en algoritmos determinísticos.

## Implementación

El flujo de datos está implementado en el archivo `src/services/apiService.ts`:

```typescript
// Pseudocódigo simplificado (adaptado a API Keys y OpenAQ v3)
import { getAirQualityFromIQAir, getAirQualityFromOpenAQ, getFallbackAirQualityData } from './apiCalls'; // Asumiendo funciones separadas

export const fetchLatestMonterreyAirQuality = async (location) => {
  const iqAirApiKey = process.env.REACT_APP_IQAIR_API_KEY;
  const openAqApiKey = process.env.REACT_APP_OPENAQ_API_KEY;

  if (!iqAirApiKey) {
    console.error("Falta la API Key de IQAir");
    return getFallbackAirQualityData(location); // Usar fallback si falta la llave principal
  }

  try {
    // Intentar obtener datos de IQAir
    const iqAirData = await getAirQualityFromIQAir(location.latitude, location.longitude, iqAirApiKey);

    // Construir objeto con datos iniciales de IQAir
    let airQualityData = { /* procesar datos de iqAirData */ };

    if (openAqApiKey) {
      try {
        // Complementar con datos de OpenAQ v3
        const openAQData = await getAirQualityFromOpenAQ(location.latitude, location.longitude, openAqApiKey);
        // Añadir/complementar datos faltantes en airQualityData
        // (Considerar cálculo de distancia si se obtienen varias estaciones)
      } catch (openAqError) {
        console.warn('No se pudieron obtener datos adicionales de OpenAQ:', openAqError);
      }
    } else {
        console.warn('Falta la API Key de OpenAQ, no se complementarán datos.');
    }


    return airQualityData;
  } catch (iqAirError) {
    console.error('Error al obtener datos de IQAir:', iqAirError);
    // En caso de error con IQAir, intentar fallback a OpenAQ si hay llave? O directo a simulados?
    // Por ahora, directo a simulados como en el plan original.
    return getFallbackAirQualityData(location);
  }
};
```

## Datos Simulados

Cuando las APIs no están disponibles o fallan, la aplicación genera datos simulados basados en:
- La ubicación seleccionada
- El momento del día
- Patrones históricos de contaminación

Los datos simulados se generan de manera determinística para mantener la consistencia entre recargas de la aplicación.

## Mejoras Futuras

- Implementar un servidor proxy para las peticiones a APIs externas y ocultar las llaves del cliente.
- Añadir caché de datos para reducir el número de peticiones.
- Integrar más fuentes de datos, como SIMA Monterrey y WAQI.
- Mejorar el cálculo de la estación OpenAQ más cercana si se obtienen múltiples resultados.
