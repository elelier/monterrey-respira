import { createClient } from '@supabase/supabase-js';
import { CityAirQuality, HistoricalData } from '../types';

// --- CONFIGURACIÓN DE SUPABASE ---
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL; // ¡Usa variables de entorno!
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Verifica que las variables de entorno estén configuradas
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Error: Las variables de entorno de Supabase no están configuradas.");
    throw new Error("La configuración de Supabase no está completa.");
}

// Crea el cliente de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ---  LISTA DE LOCACIONES (SIN CAMBIOS - CONSTANTE) ---
export const MONTERREY_LOCATIONS_WITH_COORDS = [
  { city_id: 5, name: 'Monterrey', latitude: 25.67507, longitude: -100.31847 },
  { city_id: 2, name: 'San Pedro Garza Garcia', latitude: 25.65716, longitude: -100.40268 },
  { city_id: 12, name: 'Ciudad Apodaca', latitude: 25.79002, longitude: -100.18639 },
  { city_id: 7, name: 'Guadalupe', latitude: 25.67678, longitude: -100.25646 },
  { city_id: 8, name: 'General Escobedo', latitude: 25.800555555556, longitude: -100.34444444444 },
  { city_id: 3, name: 'San Nicolas de los Garza', latitude: 25.74167, longitude: -100.30222 },
  { city_id: 1, name: 'Santa Catarina', latitude: 25.67325, longitude: -100.45813 },
  { city_id: 4, name: 'Parque Industrial Ciudad Mitras', latitude: 25.78861, longitude: -100.44778 },
  { city_id: 9, name: 'Garcia', latitude: 25.783333333333, longitude: -100.58583333333 },
  { city_id: 10, name: 'Cuidad Benito Juarez', latitude: 25.64724, longitude: -100.09582 },
  { city_id: 11, name: 'Ciudad de Allende', latitude: 25.27673, longitude: -100.01442 },
  { city_id: 13, name: 'Cadereyta Jimenez', latitude: 25.58896, longitude: -100.00156 },
];

// --- NUEVA FUNCIÓN PARA CONSULTAR DATOS DESDE SUPABASE (DIRECTO) ---
export const fetchLatestMonterreyAirQuality = async (): Promise<CityAirQuality[]> => {
    try {
        // Llama a la función RPC de Supabase (mismo nombre de función)
        const { data, error } = await supabase
            .rpc('get_latest_air_quality_per_city'); // 👈  Nombre de tu función en Supabase

        if (error) {
            console.error("Error al consultar función de Supabase:", error);
            throw new Error(`Error al obtener datos de Supabase: ${error.message}`);
        }

        if (!Array.isArray(data)) {
            console.error("Respuesta inesperada de la función de Supabase:", data);
            throw new Error("La respuesta de Supabase no tiene el formato esperado (no es un array).");
        }

        return data as CityAirQuality[]; // Castea el tipo de dato
    } catch (error: any) {
        let errorMessage = "Error al obtener los datos de calidad del aire desde Supabase.";
        if (error instanceof Error) { errorMessage = error.message; }
        console.error("Detalle del error en fetchLatestMonterreyAirQuality (Supabase):", error);
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