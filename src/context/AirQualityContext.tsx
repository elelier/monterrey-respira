import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AirQualityData, AirQualityTheme, CityAirQualityData } from '../types';
import { getAirQualityStatus, getAirQualityTheme } from '../utils/airQualityUtils';
import {
  fetchLatestMonterreyAirQuality,
  isAirQualityServiceError,
  MONTERREY_LOCATIONS_WITH_COORDS,
} from '../services/apiService';

type CityOption = (typeof MONTERREY_LOCATIONS_WITH_COORDS)[number];

interface AirQualityContextType {
  airQualityData: AirQualityData | null;
  loading: boolean;
  error: string | null;
  theme: AirQualityTheme | null;
  refreshData: () => Promise<void>;
  selectedCity: CityOption;
  changeCity: (city: CityOption) => void;
}

const AirQualityContext = createContext<AirQualityContextType | undefined>(undefined);

export function useAirQuality() {
  const context = useContext(AirQualityContext);

  if (context === undefined) {
    throw new Error('useAirQuality must be used within an AirQualityProvider');
  }

  return context;
}

interface AirQualityProviderProps {
  children: React.ReactNode;
}

const CACHE_KEY = 'airQualityDataCache';
const CACHE_EXPIRATION_TIME = 60 * 60 * 1000;

function getRpcFailureReason(error: unknown): string {
  if (!isAirQualityServiceError(error)) {
    return 'No se pudo consultar la fuente pública de calidad del aire.';
  }

  switch (error.code) {
    case 'supabase_config_missing':
      return 'El deployment público no tiene configurada la conexión de Supabase.';
    case 'supabase_rpc_error':
      return 'Supabase rechazó o no pudo ejecutar la RPC pública de calidad del aire.';
    case 'supabase_unexpected_response':
      return 'La RPC de calidad del aire respondió con un formato inesperado.';
    default:
      return 'No se pudo consultar la fuente pública de calidad del aire.';
  }
}

function buildDegradedAirQualityData(city: CityOption, reason: string): AirQualityData {
  return {
    aqi: 0,
    status: 'unknown',
    dataQuality: 'degraded',
    degradationReason: reason,
    pm25: 0,
    pm10: 0,
    o3: 0,
    no2: 0,
    so2: 0,
    co: 0,
    temperature: 0,
    humidity: 0,
    wind: {
      speed: 0,
      direction: 0,
    },
    timestamp: new Date().toISOString(),
    last_successful_update_at: null,
    location: {
      name: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
    },
    weather_icon: null,
    main_pollutant_us: null,
  };
}

function transformApiResponse(
  cityDataArray: CityAirQualityData[],
  city: CityOption,
): AirQualityData {
  const cityData = cityDataArray.find((item) => item.city_id === city.city_id);

  if (!cityData) {
    return buildDegradedAirQualityData(
      city,
      `La ciudad ${city.name} no aparece en la respuesta de calidad del aire.`,
    );
  }

  if (cityData.aqi_us === null) {
    return buildDegradedAirQualityData(
      city,
      `La ciudad ${city.name} no tiene AQI valido en la respuesta actual.`,
    );
  }

  return {
    aqi: cityData.aqi_us,
    status: getAirQualityStatus(cityData.aqi_us),
    dataQuality: 'fresh',
    pm25: 0,
    pm10: 0,
    o3: 0,
    no2: 0,
    so2: 0,
    co: 0,
    temperature: cityData.temperature_c ?? 0,
    humidity: cityData.humidity_percent ?? 0,
    wind: {
      speed: cityData.wind_speed_ms ?? 0,
      direction: cityData.wind_direction_deg ?? 0,
    },
    timestamp: cityData.reading_timestamp,
    last_successful_update_at: cityData.last_successful_update_at,
    location: {
      name: cityData.city_name ?? city.name,
      latitude: cityData.latitude ?? city.latitude,
      longitude: cityData.longitude ?? city.longitude,
    },
    weather_icon: cityData.weather_icon,
    main_pollutant_us: cityData.main_pollutant_us,
  };
}

export function AirQualityProvider({ children }: AirQualityProviderProps) {
  const locations = useMemo(() => MONTERREY_LOCATIONS_WITH_COORDS, []);
  const defaultCity = locations[0];

  if (!defaultCity) {
    throw new Error('No hay ciudades configuradas para el selector de aire.');
  }

  const [airQualityData, setAirQualityData] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<AirQualityTheme | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityOption>(defaultCity);

  const applyTransformedData = useCallback((cityDataArray: CityAirQualityData[], city: CityOption) => {
    const transformedData = transformApiResponse(cityDataArray, city);
    setAirQualityData(transformedData);
    setTheme(getAirQualityTheme(transformedData.status));
    setError(null);
  }, []);

  const fetchAirQualityData = useCallback(async () => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(`${CACHE_KEY}_timestamp`);

    if (cachedData && cachedTime) {
      const timeElapsed = Date.now() - Number(cachedTime);

      if (timeElapsed < CACHE_EXPIRATION_TIME) {
        try {
          const parsedCacheData = JSON.parse(cachedData) as CityAirQualityData[];
          applyTransformedData(parsedCacheData, selectedCity);
          setLoading(false);
          return;
        } catch (cacheError) {
          console.warn('No se pudo leer cache local de calidad del aire:', cacheError);
          localStorage.removeItem(CACHE_KEY);
          localStorage.removeItem(`${CACHE_KEY}_timestamp`);
        }
      }
    }

    try {
      setLoading(true);
      const cityDataArray = await fetchLatestMonterreyAirQuality();

      if (Array.isArray(cityDataArray) && cityDataArray.length > 0) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cityDataArray));
        localStorage.setItem(`${CACHE_KEY}_timestamp`, Date.now().toString());
        applyTransformedData(cityDataArray, selectedCity);
      } else {
        const degradedData = buildDegradedAirQualityData(
          selectedCity,
          'Supabase devolvio una respuesta vacia para la RPC de calidad del aire.',
        );
        setAirQualityData(degradedData);
        setTheme(getAirQualityTheme('unknown'));
        setError('No se pudieron cargar datos frescos de calidad del aire.');
      }
    } catch (err) {
      console.error('Error fetching air quality data:', err);
      const degradedData = buildDegradedAirQualityData(selectedCity, getRpcFailureReason(err));
      setAirQualityData(degradedData);
      setTheme(getAirQualityTheme('unknown'));
      setError('No se pudieron cargar datos frescos de calidad del aire.');
    } finally {
      setLoading(false);
    }
  }, [applyTransformedData, selectedCity]);

  const changeCity = (city: CityOption) => {
    setSelectedCity(city);
  };

  useEffect(() => {
    fetchAirQualityData();
  }, [fetchAirQualityData]);

  useEffect(() => {
    const intervalId = window.setInterval(fetchAirQualityData, 5 * 60 * 1000);
    return () => window.clearInterval(intervalId);
  }, [fetchAirQualityData]);

  const value: AirQualityContextType = {
    airQualityData,
    loading,
    error,
    theme,
    refreshData: fetchAirQualityData,
    selectedCity,
    changeCity,
  };

  return <AirQualityContext.Provider value={value}>{children}</AirQualityContext.Provider>;
}
