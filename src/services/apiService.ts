import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AirQualityDailyHistoryRow, AirQualityHistoryRow, CityAirQualityData } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export type AirQualityServiceErrorCode =
  | 'supabase_config_missing'
  | 'supabase_rpc_error'
  | 'supabase_unexpected_response'
  | 'unknown_fetch_error';

export class AirQualityServiceError extends Error {
  code: AirQualityServiceErrorCode;
  originalError?: unknown;

  constructor(code: AirQualityServiceErrorCode, message: string, originalError?: unknown) {
    super(message);
    this.name = 'AirQualityServiceError';
    this.code = code;
    this.originalError = originalError;
  }
}

export function isAirQualityServiceError(error: unknown): error is AirQualityServiceError {
  return error instanceof AirQualityServiceError;
}

let supabaseClient: SupabaseClient | null = null;

const getSupabaseClient = () => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new AirQualityServiceError(
      'supabase_config_missing',
      'Falta VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en el deployment público.',
    );
  }

  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  return supabaseClient;
};

function assertRpcArray(data: unknown, context: string) {
  if (!Array.isArray(data)) {
    console.warn(`Respuesta inesperada de ${context}:`, data);
    throw new AirQualityServiceError(
      'supabase_unexpected_response',
      `La respuesta de ${context} no tiene el formato esperado.`,
      data,
    );
  }
}

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
      throw new AirQualityServiceError(
        'supabase_rpc_error',
        `No se pudo consultar get_latest_air_quality_per_city: ${error.message}`,
        error,
      );
    }

    assertRpcArray(data, 'la RPC de calidad del aire');

    return data as CityAirQualityData[];
  } catch (error: unknown) {
    if (isAirQualityServiceError(error)) {
      throw error;
    }

    const errorMessage = error instanceof Error
      ? error.message
      : 'Error al obtener los datos de calidad del aire desde Supabase.';

    console.error('Detalle del error en fetchLatestMonterreyAirQuality (Supabase):', error);
    throw new AirQualityServiceError('unknown_fetch_error', errorMessage, error);
  }
};

export const fetchAirQualityHistoryForCity = async (
  cityId: number,
  hours: number,
): Promise<AirQualityHistoryRow[]> => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('get_air_quality_history_for_city', {
      p_city_id: cityId,
      p_hours: hours,
    });

    if (error) {
      console.warn('No se pudo consultar histórico de calidad del aire:', error);
      throw new AirQualityServiceError(
        'supabase_rpc_error',
        `No se pudo consultar get_air_quality_history_for_city: ${error.message}`,
        error,
      );
    }

    assertRpcArray(data, 'histórico de calidad del aire');

    return data as AirQualityHistoryRow[];
  } catch (error: unknown) {
    if (isAirQualityServiceError(error)) {
      throw error;
    }

    const errorMessage = error instanceof Error
      ? error.message
      : 'Error al obtener histórico de calidad del aire desde Supabase.';

    console.warn('Detalle del error en fetchAirQualityHistoryForCity (Supabase):', error);
    throw new AirQualityServiceError('unknown_fetch_error', errorMessage, error);
  }
};

export const fetchDailyAirQualityHistoryForCity = async (
  cityId: number,
  days: number,
): Promise<AirQualityDailyHistoryRow[]> => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('get_daily_air_quality_history_for_city', {
      p_city_id: cityId,
      p_days: days,
    });

    if (error) {
      console.warn('No se pudo consultar histórico diario de calidad del aire:', error);
      throw new AirQualityServiceError(
        'supabase_rpc_error',
        `No se pudo consultar get_daily_air_quality_history_for_city: ${error.message}`,
        error,
      );
    }

    assertRpcArray(data, 'histórico diario de calidad del aire');

    return data as AirQualityDailyHistoryRow[];
  } catch (error: unknown) {
    if (isAirQualityServiceError(error)) {
      throw error;
    }

    const errorMessage = error instanceof Error
      ? error.message
      : 'Error al obtener histórico diario de calidad del aire desde Supabase.';

    console.warn('Detalle del error en fetchDailyAirQualityHistoryForCity (Supabase):', error);
    throw new AirQualityServiceError('unknown_fetch_error', errorMessage, error);
  }
};
