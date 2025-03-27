import axios from 'axios';
import { AirQualityData, Station, HistoricalData } from '../types';
import { getAirQualityStatus } from '../utils/airQualityUtils';

// API Keys
// Nota: En una aplicación real, estas claves deberían estar en variables de entorno
// Esta es una clave demo que puede tener limitaciones
const IQAIR_API_KEY = '7f0e0cf3-ef7a-4d8f-8ed6-b72f76401e8d';
const OPENAQ_TOKEN = ''; // No requiere token para endpoints públicos básicos

// URLs de las APIs
const IQAIR_BASE_URL = 'https://api.airvisual.com/v2';
const OPENAQ_BASE_URL = 'https://api.openaq.org/v2';

// Configuración para el manejo de errores y datos simulados
const USE_SIMULATED_DATA = true; // Forzar el uso de datos simulados siempre
const SUPPRESS_API_ERROR_LOGS = true; // No mostrar errores en consola

// Coordenadas de Monterrey y principales municipios del área metropolitana
export const MONTERREY_LOCATIONS = [
  { name: 'Monterrey Centro', latitude: 25.6866, longitude: -100.3161 },
  { name: 'San Pedro Garza García', latitude: 25.6581, longitude: -100.4029 },
  { name: 'San Nicolás de los Garza', latitude: 25.7456, longitude: -100.3073 },
  { name: 'Guadalupe', latitude: 25.6775, longitude: -100.2597 },
  { name: 'Santa Catarina', latitude: 25.6732, longitude: -100.4593 },
  { name: 'Apodaca', latitude: 25.7832, longitude: -100.1883 },
  { name: 'Escobedo', latitude: 25.7959, longitude: -100.3182 },
];

// Obtener datos de calidad del aire mediante IQAir (AirVisual)
export const getAirQualityFromIQAir = async (latitude: number, longitude: number): Promise<any> => {
  try {
    // Si estamos usando datos simulados, no intentar la API
    if (USE_SIMULATED_DATA) {
      throw new Error('Usando datos simulados (configurado)');
    }

    const response = await axios.get(`${IQAIR_BASE_URL}/nearest_city`, {
      params: {
        lat: latitude,
        lon: longitude,
        key: IQAIR_API_KEY
      }
    });

    if (response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error('Error al obtener datos de IQAir');
    }
  } catch (error: any) {
    // Solo mostrar el error en consola si no estamos suprimiendo errores
    if (!SUPPRESS_API_ERROR_LOGS) {
      console.error('Error obteniendo datos de IQAir:', error.message);
    }
    throw error;
  }
};

// Obtener datos de OpenAQ
export const getAirQualityFromOpenAQ = async (latitude: number, longitude: number, radius = 50000): Promise<any> => {
  try {
    // Si estamos usando datos simulados, no intentar la API
    if (USE_SIMULATED_DATA) {
      throw new Error('Usando datos simulados (configurado)');
    }

    const response = await axios.get(`${OPENAQ_BASE_URL}/locations`, {
      params: {
        coordinates: `${latitude},${longitude}`,
        radius: radius, // Radio de búsqueda en metros (50km por defecto)
        limit: 10,
        order_by: 'distance'
      }
    });

    if (response.data.results && response.data.results.length > 0) {
      return response.data.results;
    } else {
      throw new Error('No se encontraron estaciones cercanas en OpenAQ');
    }
  } catch (error: any) {
    // Solo mostrar el error en consola si no estamos suprimiendo errores
    if (!SUPPRESS_API_ERROR_LOGS) {
      console.error('Error obteniendo datos de OpenAQ:', error.message);
    }
    throw error;
  }
};

// Función principal para obtener datos de calidad del aire
export const getCurrentAirQualityData = async (
  selectedLocation = MONTERREY_LOCATIONS[0] // Default: Monterrey Centro
): Promise<AirQualityData> => {
  try {
    // Si no estamos usando datos simulados, intentar obtener datos reales
    if (!USE_SIMULATED_DATA) {
      try {
        // Intenta obtener datos de IQAir
        const iqAirData = await getAirQualityFromIQAir(selectedLocation.latitude, selectedLocation.longitude);

        // Extraer los datos relevantes
        const currentPollution = iqAirData.current.pollution;
        const currentWeather = iqAirData.current.weather;

        // Calcular el AQI usando los datos disponibles
        const aqi = currentPollution.aqius || currentPollution.aqicn || 0;
        const status = getAirQualityStatus(aqi);

        // Construir el objeto de retorno
        const airQualityData: AirQualityData = {
          aqi,
          status,
          pm25: currentPollution.pm25 || 0,
          pm10: currentPollution.pm10 || 0,
          o3: 0, // IQAir no proporciona directamente O3, NO2, SO2, CO en API gratuita
          no2: 0,
          so2: 0,
          co: 0,
          temperature: currentWeather.tp || 0,
          humidity: currentWeather.hu || 0,
          wind: {
            speed: currentWeather.ws || 0,
            direction: currentWeather.wd || 0,
          },
          timestamp: new Date().toISOString(),
          location: {
            name: selectedLocation.name,
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
          },
        };

        try {
          // Intentar complementar con datos de OpenAQ si están disponibles
          const openAQStations = await getAirQualityFromOpenAQ(
            selectedLocation.latitude,
            selectedLocation.longitude
          );

          if (openAQStations.length > 0) {
            const nearestStation = openAQStations[0];

            if (nearestStation.parameters) {
              // Complementar con valores disponibles en OpenAQ
              nearestStation.parameters.forEach((param: any) => {
                switch (param.parameter) {
                  case 'o3':
                    airQualityData.o3 = param.lastValue;
                    break;
                  case 'no2':
                    airQualityData.no2 = param.lastValue;
                    break;
                  case 'so2':
                    airQualityData.so2 = param.lastValue;
                    break;
                  case 'co':
                    airQualityData.co = param.lastValue;
                    break;
                  case 'pm25':
                    // Solo usar si no tenemos datos de IQAir
                    if (!airQualityData.pm25) {
                      airQualityData.pm25 = param.lastValue;
                    }
                    break;
                  case 'pm10':
                    // Solo usar si no tenemos datos de IQAir
                    if (!airQualityData.pm10) {
                      airQualityData.pm10 = param.lastValue;
                    }
                    break;
                }
              });
            }
          }
        } catch (openAQError) {
          // Si falla, usamos datos simulados pero no mostramos el error
          if (!SUPPRESS_API_ERROR_LOGS) {
            console.log('No se pudieron obtener datos adicionales de OpenAQ:', openAQError);
          }
          // Continuar con los datos de IQAir solamente
        }

        // Si faltan valores de contaminantes, generamos valores aproximados
        // basados en el AQI para efectos de demostración
        if (airQualityData.o3 === 0) airQualityData.o3 = Math.round(aqi * 0.4);
        if (airQualityData.no2 === 0) airQualityData.no2 = Math.round(aqi * 0.3);
        if (airQualityData.so2 === 0) airQualityData.so2 = Math.round(aqi * 0.2);
        if (airQualityData.co === 0) airQualityData.co = Math.round(aqi * 5);

        return airQualityData;
      } catch (apiError) {
        // Si falla, usamos datos simulados pero no mostramos el error
        if (!SUPPRESS_API_ERROR_LOGS) {
          console.log('Fallback a datos simulados:', apiError);
        }
        return getFallbackAirQualityData(selectedLocation);
      }
    }

    // Si llegamos aquí, significa que estamos usando datos simulados
    return getFallbackAirQualityData(selectedLocation);
  } catch (error) {
    // Esta excepción solo debería ocurrir si hay un error en getFallbackAirQualityData
    // que sería muy raro - por precaución lo manejamos
    if (!SUPPRESS_API_ERROR_LOGS) {
      console.error('Error crítico al obtener datos simulados:', error);
    }
    // Generar datos de emergencia muy básicos para evitar errores en la UI
    return getEmergencyFallbackData(selectedLocation);
  }
};

// Función para datos de emergencia ultra básicos si todo lo demás falla
const getEmergencyFallbackData = (location: { name: string; latitude: number; longitude: number }): AirQualityData => {
  return {
    aqi: 50,
    status: 'moderate',
    pm25: 12,
    pm10: 25,
    o3: 20,
    no2: 15,
    so2: 5,
    co: 100,
    temperature: 25,
    humidity: 45,
    wind: {
      speed: 10,
      direction: 180,
    },
    timestamp: new Date().toISOString(),
    location: {
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
    },
  };
};

// Obtener estaciones de monitoreo
export const getMonitoringStations = async (): Promise<Station[]> => {
  try {
    // Solo intentar APIs reales si la bandera lo permite
    if (!USE_SIMULATED_DATA) {
      const stations: Station[] = [];

      // Obtener datos para cada ubicación en el área metropolitana
      for (const location of MONTERREY_LOCATIONS) {
        try {
          const iqAirData = await getAirQualityFromIQAir(location.latitude, location.longitude);
          const aqi = iqAirData.current.pollution.aqius || 0;
          const status = getAirQualityStatus(aqi);

          stations.push({
            id: `station-${location.name.replace(/\s+/g, '-').toLowerCase()}`,
            name: location.name,
            latitude: location.latitude,
            longitude: location.longitude,
            aqi,
            status
          });
        } catch (locationError) {
          // Si falla, usamos datos simulados pero no mostramos el error
          if (!SUPPRESS_API_ERROR_LOGS) {
            console.warn(`No se pudieron obtener datos para ${location.name}:`, locationError);
          }
          // Continuar con la siguiente ubicación
        }
      }

      if (stations.length === 0) {
        throw new Error('No se pudieron obtener datos para ninguna estación');
      }

      return stations;
    } else {
      // Usar datos simulados directamente
      return getSimulatedStations();
    }
  } catch (error) {
    // Si falla, usamos datos simulados pero no mostramos el error
    if (!SUPPRESS_API_ERROR_LOGS) {
      console.error('Error al obtener estaciones de monitoreo:', error);
    }
    // Fallback a estaciones simuladas
    return getSimulatedStations();
  }
};

// Obtener datos históricos
export const getHistoricalAirQualityData = async (
  cityLocation = MONTERREY_LOCATIONS[0] // Default: Monterrey Centro
): Promise<HistoricalData[]> => {
  try {
    // Solo intentar APIs reales si la bandera lo permite
    if (!USE_SIMULATED_DATA) {
      // Intentar obtener estaciones de OpenAQ cerca de la ubicación seleccionada
      const openAQStations = await getAirQualityFromOpenAQ(
        cityLocation.latitude,
        cityLocation.longitude
      );

      if (!openAQStations || openAQStations.length === 0) {
        throw new Error('No se encontraron estaciones de OpenAQ cercanas');
      }

      const nearestStation = openAQStations[0];
      const locationId = nearestStation.id;

      // Determinar fechas para datos históricos (últimos 7 días)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);

      const dateFrom = startDate.toISOString();
      const dateTo = endDate.toISOString();

      // Obtener datos históricos para PM2.5 (principal indicador)
      const historicalData = await getHistoricalDataFromOpenAQ(
        locationId,
        'pm25',
        dateFrom,
        dateTo
      );

      // Procesar los datos para el formato requerido
      const processedData: HistoricalData[] = [];
      const groupedByDate: Record<string, { pm25: number[], pm10: number[], measurements: number }> = {};

      // Agrupar mediciones por día y calcular promedios
      historicalData.forEach((measurement: any) => {
        const date = measurement.date.utc.split('T')[0];

        if (!groupedByDate[date]) {
          groupedByDate[date] = { pm25: [], pm10: [], measurements: 0 };
        }

        groupedByDate[date].pm25.push(measurement.value);
        groupedByDate[date].measurements += 1;
      });

      // Calcular promedios diarios
      Object.entries(groupedByDate).forEach(([date, data]) => {
        const avgPm25 = data.pm25.reduce((sum, val) => sum + val, 0) / data.pm25.length;
        const estimatedAqi = Math.round(avgPm25 * 4.5); // Estimación simple de AQI basada en PM2.5

        processedData.push({
          date,
          pm25: Math.round(avgPm25),
          pm10: Math.round(avgPm25 * 1.5), // Estimación PM10 basada en PM2.5
          aqi: estimatedAqi
        });
      });

      // Ordenar por fecha
      processedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return processedData;
    } else {
      // Usar datos simulados directamente
      return getFallbackHistoricalData();
    }
  } catch (error) {
    // Si falla, usamos datos simulados pero no mostramos el error
    if (!SUPPRESS_API_ERROR_LOGS) {
      console.error('Error al obtener datos históricos:', error);
    }
    // Fallback a datos históricos simulados
    return getFallbackHistoricalData();
  }
};

// Obtener mediciones de una estación específica de OpenAQ (mantener para versiones futuras)
export const getMeasurementsFromOpenAQ = async (locationId: string): Promise<any> => {
  try {
    if (USE_SIMULATED_DATA) {
      throw new Error('Usando datos simulados (configurado)');
    }

    const response = await axios.get(`${OPENAQ_BASE_URL}/measurements`, {
      params: {
        location_id: locationId,
        limit: 100,
        order_by: 'datetime',
        sort: 'desc'
      }
    });

    if (response.data.results && response.data.results.length > 0) {
      return response.data.results;
    } else {
      throw new Error('No se encontraron mediciones para esta estación');
    }
  } catch (error: any) {
    // Solo mostrar el error en consola si no estamos suprimiendo errores
    if (!SUPPRESS_API_ERROR_LOGS) {
      console.error('Error obteniendo mediciones de OpenAQ:', error.message);
    }
    throw error;
  }
};

// Obtener datos históricos de OpenAQ (mantener para versiones futuras)
export const getHistoricalDataFromOpenAQ = async (locationId: string, parameter: string, dateFrom: string, dateTo: string): Promise<any> => {
  try {
    if (USE_SIMULATED_DATA) {
      throw new Error('Usando datos simulados (configurado)');
    }

    const response = await axios.get(`${OPENAQ_BASE_URL}/measurements`, {
      params: {
        location_id: locationId,
        parameter,
        date_from: dateFrom,
        date_to: dateTo,
        limit: 100,
        order_by: 'datetime',
        sort: 'asc'
      }
    });

    if (response.data.results && response.data.results.length > 0) {
      return response.data.results;
    } else {
      throw new Error('No se encontraron datos históricos para este parámetro');
    }
  } catch (error: any) {
    // Solo mostrar el error en consola si no estamos suprimiendo errores
    if (!SUPPRESS_API_ERROR_LOGS) {
      console.error('Error obteniendo datos históricos de OpenAQ:', error.message);
    }
    throw error;
  }
};

// Datos de fallback en caso de error en las APIs
const getFallbackAirQualityData = (
  selectedLocation = MONTERREY_LOCATIONS[0]
): AirQualityData => {
  // Uso de números determinísticos para cada ubicación para mantener consistencia
  // Obtenemos un "hash" simple basado en el nombre de la ubicación
  const nameHash = selectedLocation.name.split('').reduce((hash, char) => {
    return char.charCodeAt(0) + ((hash << 5) - hash);
  }, 0);

  // Ajustamos AQI según la ubicación para tener datos simulados diferentes pero consistentes
  const baseAqi = Math.abs(nameHash % 150) + 30; // Entre 30 y 180
  const aqi = baseAqi;
  const status = getAirQualityStatus(aqi);

  // Generar valores derivados del AQI base para mantener consistencia
  const pm25 = Math.round(aqi * 0.4) + 5;
  const pm10 = Math.round(aqi * 0.6) + 10;
  const o3 = Math.round(aqi * 0.3) + 20;
  const no2 = Math.round(aqi * 0.2) + 5;
  const so2 = Math.round(aqi * 0.1) + 2;
  const co = Math.round(aqi * 2) + 100;

  // Temperatura y humedad también derivadas del hash para consistencia
  const temperature = (Math.abs(nameHash % 15) + 20); // 20-35°C
  const humidity = (Math.abs(nameHash % 30) + 40); // 40-70%
  const windSpeed = (Math.abs(nameHash % 20) + 5); // 5-25 km/h
  const windDirection = (Math.abs(nameHash % 360)); // 0-359 grados

  return {
    aqi,
    status,
    pm25,
    pm10,
    o3,
    no2,
    so2,
    co,
    temperature,
    humidity,
    wind: {
      speed: windSpeed,
      direction: windDirection,
    },
    timestamp: new Date().toISOString(),
    location: {
      name: selectedLocation.name,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
    },
  };
};

// Estaciones simuladas con datos realistas
const getSimulatedStations = (): Station[] => {
  return MONTERREY_LOCATIONS.map((location) => {
    // Usar el algoritmo de hash simple para generar datos consistentes
    const nameHash = location.name.split('').reduce((hash, char) => {
      return char.charCodeAt(0) + ((hash << 5) - hash);
    }, 0);

    const aqi = Math.abs(nameHash % 150) + 30; // Entre 30 y 180

    return {
      id: `station-${location.name.replace(/\s+/g, '-').toLowerCase()}`,
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      aqi,
      status: getAirQualityStatus(aqi)
    };
  });
};

// Datos históricos de fallback en caso de error en las APIs
const getFallbackHistoricalData = (): HistoricalData[] => {
  const data: HistoricalData[] = [];
  const today = new Date();

  // Generamos datos ligeramente más realistas con tendencias
  const baseAqi = 70; // Base AQI para variar alrededor
  const weekPattern = [0.9, 1.0, 1.2, 1.1, 1.3, 1.4, 1.0]; // Patrón para la semana

  // Generar datos para los últimos 7 días
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    // Aplicar un patrón más realista con variación
    const dayFactor = weekPattern[6-i];
    const dailyVariation = Math.random() * 20 - 10; // -10 a +10

    const dailyAqi = Math.round(baseAqi * dayFactor + dailyVariation);
    const pm25 = Math.round(dailyAqi * 0.4);
    const pm10 = Math.round(dailyAqi * 0.6);

    data.push({
      date: dateString,
      aqi: dailyAqi,
      pm25,
      pm10,
    });
  }

  return data;
};
