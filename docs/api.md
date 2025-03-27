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
- `key`: Clave de API

**Implementación**: La aplicación utiliza esta API como fuente primaria para los datos de calidad del aire (AQI, PM2.5, PM10, temperatura, humedad, etc.)

**Limitaciones**:
- La versión gratuita tiene límites de peticiones (10,000/mes)
- No proporciona datos para todos los contaminantes (falta O3, NO2, SO2, CO)

### OpenAQ

**URL Base**: `https://api.openaq.org/v2`

**Endpoints utilizados**:

- `/locations`: Obtiene estaciones de monitoreo cerca de las coordenadas proporcionadas

**Parámetros principales**:
- `coordinates`: Latitud y longitud en formato "lat,lon"
- `radius`: Radio de búsqueda en metros
- `limit`: Número máximo de resultados
- `order_by`: Criterio de orden

**Implementación**: Se utiliza como fuente complementaria para obtener datos de contaminantes no disponibles en IQAir.

**Limitaciones**:
- No todas las estaciones proporcionan datos para todos los contaminantes
- Puede haber retrasos en la actualización de los datos

## Estrategia de Fallback

La aplicación implementa un sistema de fallback para garantizar que siempre haya datos disponibles:

1. **Intento Principal**: Se intenta obtener datos de IQAir
2. **Complemento**: Si el intento principal es exitoso, se complementan los datos faltantes con OpenAQ
3. **Fallback**: Si ambas APIs fallan, se generan datos simulados basados en algoritmos determinísticos

## Implementación

El flujo de datos está implementado en el archivo `src/services/apiService.ts`:

```typescript
// Pseudocódigo simplificado
export const getCurrentAirQualityData = async (location) => {
  try {
    // Intentar obtener datos de IQAir
    const iqAirData = await getAirQualityFromIQAir(location.latitude, location.longitude);

    // Construir objeto con datos de IQAir
    const airQualityData = { /* datos de IQAir */ };

    try {
      // Complementar con datos de OpenAQ
      const openAQData = await getAirQualityFromOpenAQ(location.latitude, location.longitude);
      // Añadir datos faltantes
    } catch (error) {
      console.log('No se pudieron obtener datos adicionales de OpenAQ');
    }

    return airQualityData;
  } catch (error) {
    // En caso de error, usar datos simulados
    return getFallbackAirQualityData(location);
  }
};
```

## Datos Simulados

Cuando las APIs no están disponibles, la aplicación genera datos simulados basados en:
- La ubicación seleccionada
- El momento del día
- Patrones históricos de contaminación

Los datos simulados se generan de manera determinística para mantener la consistencia entre recargas de la aplicación.

## Mejoras Futuras

- Implementar un servidor proxy para las peticiones a APIs externas
- Añadir caché de datos para reducir el número de peticiones
- Integrar más fuentes de datos, como SIMA Monterrey y WAQI
