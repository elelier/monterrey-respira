import axios from 'axios';
import { AirQualityData, HistoricalData, Station } from '../types';
import { getAirQualityStatus } from '../utils/airQualityUtils';

// Para este proyecto de demostración, usaremos datos simulados.
// En una implementación real, se integrarían APIs como AQICN, OpenWeatherMap, o AirVisual.

// Coordenadas aproximadas de Monterrey, Nuevo León
const MONTERREY_LAT = 25.6866;
const MONTERREY_LONG = -100.3161;

const MONTERREY_STATIONS: Station[] = [
  {
    id: 'station-1',
    name: 'San Nicolás',
    latitude: 25.7456,
    longitude: -100.3073,
    aqi: 42,
    status: 'good',
  },
  {
    id: 'station-2',
    name: 'Centro',
    latitude: 25.6716,
    longitude: -100.3092,
    aqi: 78,
    status: 'moderate',
  },
  {
    id: 'station-3',
    name: 'San Pedro',
    latitude: 25.6500,
    longitude: -100.4000,
    aqi: 35,
    status: 'good',
  },
  {
    id: 'station-4',
    name: 'Guadalupe',
    latitude: 25.6769,
    longitude: -100.2594,
    aqi: 102,
    status: 'unhealthy-sensitive',
  },
  {
    id: 'station-5',
    name: 'Santa Catarina',
    latitude: 25.6730,
    longitude: -100.4590,
    aqi: 90,
    status: 'moderate',
  },
];

// En un entorno real, estos datos vendrían de APIs externas
export const getCurrentAirQuality = async (): Promise<AirQualityData> => {
  try {
    // Simulamos una llamada a la API
    // const response = await axios.get(`https://api.waqi.info/feed/monterrey/?token=YOUR_TOKEN_HERE`);

    // Para la demostración, generamos datos simulados
    const aqi = Math.floor(Math.random() * 200) + 30; // AQI entre 30 y 230
    const status = getAirQualityStatus(aqi);

    return {
      aqi,
      status,
      pm25: Math.floor(Math.random() * 50) + 5,
      pm10: Math.floor(Math.random() * 80) + 10,
      o3: Math.floor(Math.random() * 60) + 20,
      no2: Math.floor(Math.random() * 40) + 5,
      so2: Math.floor(Math.random() * 20) + 2,
      co: Math.floor(Math.random() * 400) + 100,
      temperature: Math.floor(Math.random() * 15) + 20, // 20-35°C
      humidity: Math.floor(Math.random() * 30) + 40, // 40-70%
      wind: {
        speed: Math.floor(Math.random() * 20) + 5,
        direction: Math.floor(Math.random() * 360),
      },
      timestamp: new Date().toISOString(),
      location: {
        name: 'Monterrey, Nuevo León',
        latitude: MONTERREY_LAT,
        longitude: MONTERREY_LONG,
      },
    };
  } catch (error) {
    console.error('Error al obtener datos de calidad del aire:', error);
    throw error;
  }
};

export const getHistoricalData = async (): Promise<HistoricalData[]> => {
  // En una implementación real, esto vendría de una API
  const data: HistoricalData[] = [];
  const today = new Date();

  // Generar datos para los últimos 7 días
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];

    data.push({
      date: dateString,
      aqi: Math.floor(Math.random() * 150) + 30,
      pm25: Math.floor(Math.random() * 50) + 5,
      pm10: Math.floor(Math.random() * 80) + 10,
    });
  }

  return data;
};

export const getStations = async (): Promise<Station[]> => {
  // En una implementación real, esto vendría de una API
  return MONTERREY_STATIONS.map(station => ({
    ...station,
    aqi: Math.floor(Math.random() * 200) + 30, // Actualizar con valores aleatorios para simular cambios
    status: getAirQualityStatus(station.aqi), // Recalcular el estado
  }));
};

// Función para obtener datos en tiempo real (simulado para este ejemplo)
export const getRealtimeData = async (): Promise<AirQualityData> => {
  return getCurrentAirQuality();
};
