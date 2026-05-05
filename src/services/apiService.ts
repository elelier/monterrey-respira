import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CityAirQualityData, HistoricalData } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient: SupabaseClient | null = null;

const getSupabaseClient = () => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('La configuración pública de Supabase no está disponible para este deployment.');
  }

  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  return supabaseClient;
};

export const MONTERREY_LOCATIONS_WITH_COORDS = [
  { city_id: 9, name: 'Monterrey', latitude: 25.67507, longitude: -100.31847 },
  { city_id: 12, name: 'San Pedro Garza Garcia', latitude: 25.65716, longitude: -100.40268 },
  { city_id: 7, name: 'Guadalupe', latitude: 25.67678, longitude: -100.25646 },
  { city_id: 6, name: 'General Escobedo', latitude: 25.800555555556, longitude: -100.34444444444 },
  { city_id: 11, name: 'San Nicolas de los Garza', latitude: 25.74167, longitude: -100.30222 },
  { city_id: 13, name: 'Santa Catarina', latitude: 25.67325, longitude: -100.45813 },
  { city_id: 5, name: 'Garcia', latitude: 25.783333333333, longitude: -100.58583333333 },
  { city_id: 4, name: 'Ciudad Benito Juarez', latitude: 25.64724, longitude: -100.09582 },
  { city_id: 1, name: 'Cadereyta Jimenez', latitude: 25.58896, longitude: -100.00156 },
];

export const fetchLatestMonterreyAirQuality = async (): Promise<CityAirQualityData[]> => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('get_latest_air_quality_per_city');

    if (error) {
      console.error('Error al consultar función de Supabase:', error);
      throw new Error(`Error al obtener datos de Supabase: ${error.message}`);
    }

    if (!Array.isArray(data)) {
      console.error('Respuesta inesperada de la función de Supabase:', data);
      throw new Error('La respuesta de Supabase no tiene el formato esperado (no es un array).');
    }

    return data as CityAirQualityData[];
  } catch (error: unknown) {
    const errorMessage = error instanceof Error
      ? error.message
      : 'Error al obtener los datos de calidad del aire desde Supabase.';

    console.error('Detalle del error en fetchLatestMonterreyAirQuality (Supabase):', error);
    throw new Error(errorMessage);
  }
};

export const getFallbackHistoricalData = (): HistoricalData[] => {
  console.warn('Usando datos históricos SIMULADOS. Implementar fetch real cuando esté disponible.');
  const historicalData: HistoricalData[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    const pm25 = Math.floor(Math.random() * 141) + 10;
    const pm10 = Math.floor(Math.random() * 161) + 20;

    historicalData.push({
      date: dateString,
      aqi: Math.max(pm25, pm10),
      pm25,
      pm10,
    });
  }

  return historicalData;
};
