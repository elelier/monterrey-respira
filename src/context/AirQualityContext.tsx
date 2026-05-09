import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  AirQualityData,
  AirQualityTheme,
  CityAirQualityData,
  CityDataAvailability,
  CitySelectorOption,
} from '../types';
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
  cityOptions: CitySelectorOption[];
  cityRows: CityAirQualityData[];
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
const MEASUREMENT_DEGRADED_HOURS = 2;
const MEASUREMENT_STALE_HOURS = 6;

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
    measurementFreshness: 'unknown',
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

function getMeasurementAgeHours(readingTimestamp: string): number | null {
  const readingTime = new Date(readingTimestamp).getTime();

  if (Number.isNaN(readingTime)) {
    return null;
  }

  return (Date.now() - readingTime) / (60 * 60 * 1000);
}

function getMeasurementFreshness(readingTimestamp: string): AirQualityData['measurementFreshness'] {
  const ageHours = getMeasurementAgeHours(readingTimestamp);

  if (ageHours === null) {
    return 'unknown';
  }

  if (ageHours > MEASUREMENT_STALE_HOURS) {
    return 'stale';
  }

  if (ageHours > MEASUREMENT_DEGRADED_HOURS) {
    return 'degraded';
  }

  return 'fresh';
}

function getMeasurementFreshnessReason(
  freshness: AirQualityData['measurementFreshness'],
  cityName: string,
): string | undefined {
  switch (freshness) {
    case 'stale':
      return `Medicion ambiental retrasada para ${cityName}. El pipeline puede estar actualizado, pero la ultima medicion disponible es antigua.`;
    case 'degraded':
      return `La medicion ambiental de ${cityName} tiene retraso frente a la cadencia esperada.`;
    case 'unknown':
      return `No se pudo validar la hora de medicion ambiental para ${cityName}.`;
    default:
      return undefined;
  }
}

function getCityAvailability(row: CityAirQualityData | undefined): CityDataAvailability {
  if (!row) {
    return 'missing';
  }

  return row.aqi_us === null ? 'invalid-aqi' : 'available';
}

function getCityDisabledReason(availability: CityDataAvailability): string | undefined {
  switch (availability) {
    case 'missing':
      return 'Sin datos recientes';
    case 'invalid-aqi':
      return 'Última lectura no disponible';
    default:
      return undefined;
  }
}

function buildCityOptions(cityDataArray: CityAirQualityData[]): CitySelectorOption[] {
  const rowsByCityId = new Map(cityDataArray.map((row) => [row.city_id, row]));

  return MONTERREY_LOCATIONS_WITH_COORDS.map((city) => {
    const row = rowsByCityId.get(city.city_id);
    const availability = getCityAvailability(row);

    return {
      ...city,
      availability,
      disabledReason: getCityDisabledReason(availability),
      readingTimestamp: row?.reading_timestamp,
    };
  });
}

function findFirstAvailableCity(cityOptions: CitySelectorOption[]): CityOption | undefined {
  return cityOptions.find((city) => city.availability === 'available');
}

function transformApiResponse(
  cityDataArray: CityAirQualityData[],
  city: CityOption,
): AirQualityData {
  const cityData = cityDataArray.find((item) => item.city_id === city.city_id);

  if (!cityData) {
    return buildDegradedAirQualityData(
      city,
      `Sin datos recientes para ${city.name}.`,
    );
  }

  if (cityData.aqi_us === null) {
    return buildDegradedAirQualityData(
      city,
      `Última lectura no disponible para ${city.name}.`,
    );
  }

  const measurementFreshness = getMeasurementFreshness(cityData.reading_timestamp);
  const measurementFreshnessReason = getMeasurementFreshnessReason(
    measurementFreshness,
    cityData.city_name ?? city.name,
  );

  return {
    aqi: cityData.aqi_us,
    status: getAirQualityStatus(cityData.aqi_us),
    dataQuality: measurementFreshness === 'fresh' ? 'fresh' : 'degraded',
    degradationReason: measurementFreshnessReason,
    measurementFreshness,
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

function readCachedData(): CityAirQualityData[] | null {
  const cachedData = localStorage.getItem(CACHE_KEY);
  const cachedTime = localStorage.getItem(`${CACHE_KEY}_timestamp`);

  if (!cachedData || !cachedTime) {
    return null;
  }

  const timeElapsed = Date.now() - Number(cachedTime);

  if (timeElapsed >= CACHE_EXPIRATION_TIME) {
    return null;
  }

  try {
    const parsedCacheData = JSON.parse(cachedData) as unknown;
    return Array.isArray(parsedCacheData) ? (parsedCacheData as CityAirQualityData[]) : null;
  } catch (cacheError) {
    console.warn('No se pudo leer cache local de calidad del aire:', cacheError);
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(`${CACHE_KEY}_timestamp`);
    return null;
  }
}

function writeCachedData(cityDataArray: CityAirQualityData[]) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cityDataArray));
  localStorage.setItem(`${CACHE_KEY}_timestamp`, Date.now().toString());
}

export function AirQualityProvider({ children }: AirQualityProviderProps) {
  const locations = useMemo(() => MONTERREY_LOCATIONS_WITH_COORDS, []);
  const defaultCity = locations[0];

  if (!defaultCity) {
    throw new Error('No hay ciudades configuradas para el selector de aire.');
  }

  const [airQualityData, setAirQualityData] = useState<AirQualityData | null>(null);
  const [cityDataArray, setCityDataArray] = useState<CityAirQualityData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<AirQualityTheme | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityOption>(defaultCity);

  const cityOptions = useMemo(() => buildCityOptions(cityDataArray), [cityDataArray]);

  const applyTransformedData = useCallback((dataRows: CityAirQualityData[], city: CityOption) => {
    const options = buildCityOptions(dataRows);
    const cityAvailability = options.find((option) => option.city_id === city.city_id)?.availability;
    const nextCity = cityAvailability === 'available' ? city : findFirstAvailableCity(options) ?? city;
    const transformedData = transformApiResponse(dataRows, nextCity);

    if (nextCity.city_id !== city.city_id) {
      setSelectedCity(nextCity);
    }

    setCityDataArray(dataRows);
    setAirQualityData(transformedData);
    setTheme(getAirQualityTheme(transformedData.status));
    setError(null);
  }, []);

  const fetchAirQualityData = useCallback(async (skipCache = false) => {
    if (!skipCache) {
      const cachedRows = readCachedData();

      if (cachedRows) {
        applyTransformedData(cachedRows, selectedCity);
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);
      const freshRows = await fetchLatestMonterreyAirQuality();

      if (Array.isArray(freshRows) && freshRows.length > 0) {
        writeCachedData(freshRows);
        applyTransformedData(freshRows, selectedCity);
      } else {
        const degradedData = buildDegradedAirQualityData(
          selectedCity,
          'Supabase devolvio una respuesta vacia para la RPC de calidad del aire.',
        );
        setCityDataArray([]);
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

  const refreshData = useCallback(async () => {
    await fetchAirQualityData(true);
  }, [fetchAirQualityData]);

  const changeCity = (city: CityOption) => {
    const option = cityOptions.find((item) => item.city_id === city.city_id);

    if (option && option.availability !== 'available') {
      const degradedData = transformApiResponse(cityDataArray, city);
      setSelectedCity(city);
      setAirQualityData(degradedData);
      setTheme(getAirQualityTheme('unknown'));
      return;
    }

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
    refreshData,
    selectedCity,
    cityOptions,
    cityRows: cityDataArray,
    changeCity,
  };

  return <AirQualityContext.Provider value={value}>{children}</AirQualityContext.Provider>;
}
