import axios from 'axios';
// Asegúrate que la ruta a tus tipos sea correcta
import { CityAirQuality, HistoricalData } from '../types';
// Asegúrate que la ruta a tus utilidades sea correcta (si se usa getAirQualityStatus fuera de este archivo)
// import { getAirQualityStatus } from '../utils/airQualityUtils';

// URL de la API de MonterreyRespira (Buildship) desde variables de entorno
// ACTUALIZADO: URL de la API de Buildship
const MONTERREYRESPIRA_API_URL = 'https://81ocg9.buildship.run/latestAirQuality-bc7943d5c68b';

// --- ACTUALIZADO: Lista de locaciones basada en DATOS REALES CON COORDENADAS ---
// Esta lista es útil para selectores de UI o vistas de mapa iniciales.
// Solo incluye ciudades que SÍ tienen lat/lon en tu API.
// Si necesitas la lista COMPLETA de nombres, obténla del resultado de la API en tu componente.
export const MONTERREY_LOCATIONS_WITH_COORDS = [
  { city_id: 1, name: 'Santa Catarina', latitude: 25.67325, longitude: -100.45813 },
  { city_id: 2, name: 'San Pedro Garza Garcia', latitude: 25.65716, longitude: -100.40268 },
  { city_id: 3, name: 'San Nicolas de los Garza', latitude: 25.74167, longitude: -100.30222 },
  { city_id: 4, name: 'Parque Industrial Ciudad Mitras', latitude: 25.78861, longitude: -100.44778 },
  { city_id: 5, name: 'Monterrey', latitude: 25.67507, longitude: -100.31847 },
  { city_id: 6, name: 'Ladrillera (Entronque Pesqueria)', latitude: 25.75, longitude: -100.1 }, // Coordenadas aproximadas
  { city_id: 7, name: 'Guadalupe', latitude: 25.67678, longitude: -100.25646 },
  { city_id: 8, name: 'General Escobedo', latitude: 25.800555555556, longitude: -100.34444444444 },
  { city_id: 9, name: 'Garcia', latitude: 25.783333333333, longitude: -100.58583333333 },
  { city_id: 10, name: 'Cuidad Benito Juarez', latitude: 25.64724, longitude: -100.09582 },
  { city_id: 11, name: 'Ciudad de Allende', latitude: 25.27673, longitude: -100.01442 },
  { city_id: 12, name: 'Ciudad Apodaca', latitude: 25.79002, longitude: -100.18639 },
  { city_id: 13, name: 'Cadereyta Jimenez', latitude: 25.58896, longitude: -100.00156 },
];export const fetchLatestMonterreyAirQuality = async (): Promise<CityAirQuality[]> => {
  if (!MONTERREYRESPIRA_API_URL) {
    console.error("Error: La variable de entorno VITE_MONTERREYRESPIRA_API_URL no está configurada.");
    throw new Error("La configuración de la API no está completa.");
  }
  try {
    // console.log(`Fetching data from: ${MONTERREYRESPIRA_API_URL}`);
    const response = await axios.get<CityAirQuality[]>(MONTERREYRESPIRA_API_URL, { timeout: 15000 });
    if (!Array.isArray(response.data)) {
      console.error("Respuesta inesperada de la API:", response.data);
      throw new Error("La respuesta de la API no tiene el formato esperado (no es un array).");
    }
    // console.log(`Data received successfully: ${response.data.length} cities.`);
    return response.data;
  } catch (error: any) {
    let errorMessage = "Error al obtener los datos de calidad del aire.";
    if (axios.isAxiosError(error)) {
        errorMessage = `Error de red o servidor: ${error.message}`;
        if (error.response) { errorMessage += ` (Status: ${error.response.status})`; }
        else if (error.request) { errorMessage += " No se recibió respuesta del servidor."; }
    } else if (error instanceof Error) { errorMessage = error.message; }
    console.error("Detalle del error en fetchLatestMonterreyAirQuality:", error);
    throw new Error(errorMessage);
  }
};

// --- DATOS HISTÓRICOS (Simulados - sin cambios) ---
export const getFallbackHistoricalData = (): HistoricalData[] => {
    console.warn("Usando datos históricos SIMULADOS. Implementar fetch real cuando esté disponible.");
    const historicalData: HistoricalData[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today); date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        historicalData.push({ date: dateString, pm25: Math.floor(Math.random() * 141) + 10, pm10: Math.floor(Math.random() * 161) + 20, });
    }
    return historicalData;
};