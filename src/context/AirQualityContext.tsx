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
import {
  getCityFromSearch,
  readStoredCityId,
  updateCityQueryParam,
  writeStoredCityId,
  findCityById,
} from '../utils/cityRoutingUtils';
import { hasReliableAqi } from '../utils/airQualityDisplay';
import {
  getMeasurementFreshness,
  getMeasurementFreshnessReason,
} from '../utils/freshness';

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

const CACHE_KEY = 'airQualityDataCache:v2-weather-context';
const CACHE_EXPIRATION_TIME = 60 * 60 * 1000;

function getRpcFailureReason(error: unknown): string {
  if (!isAirQualityServiceError(error)) {
    return 'No se pudo consultar la fuente publica de calidad del aire.';
  }

  switch (error.code) {
    case 'supabase_config_missing':
      return 'El deployment publico no tiene configurada la conexion de Supabase.';
    case 'supabase_rpc_error':
      return 'Supabase rechazo o no pudo ejecutar la RPC publica de calidad del aire.';
    case 'supabase_unexpected_response':
      return 'La RPC de calidad del aire respondio con un formato inesperado.';
    default:
      return 'No se pudo consultar la fuente publica de calidad del aire.';
  }
}

function buildDegradedAirQualityData(city: CityOption, reason: string): AirQualityData {
  return {
    aqi: null,
    status: 'unknown',
    dataQuality: 'degraded',
    degradationReason: reason,
    measurementFreshness: 'unknown',
    pm25: null,
    pm10: null,
    o3: null,
    no2: null,
    so2: null,
    co: null,
    temperature: null,
    humidity: null,
    wind: {
      speed: null,
      direction: null,
    },
    timestamp: null,
    last_successful_update_at: null,
    location: {
      name: city.name,
      latitude: city.latitude,
      longitude: city.longitude,
    },
    weather_icon: null,
    main_pollutant_us: null,
    weather_provider: null,
    weather_timestamp: null,
  };
}

function getCityAvailability(row: CityAirQualityData | undefined): CityDataAvailability {
  if (!row) {
    return 'missing';
  }

  return hasReliableAqi(row.aqi_us) ? 'available' : 'invalid-aqi';
}

function getCityDisabledReason(availability: CityDataAvailability): string | undefined {
  switch (availability) {
    case 'missing':
      return 'Sin datos recientes';
    case 'invalid-aqi':
      return 'Ultima lectura no disponible';
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

  if (!hasReliableAqi(cityData.aqi_us)) {
    return buildDegradedAirQualityData(
      city,
      `Ultima lectura no disponible para ${city.name}.`,
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
    pm25: null,
    pm10: null,
    o3: null,
    no2: null,
    so2: null,
    co: null,
    temperature: cityData.weather_temperature_c,
    humidity: cityData.weather_humidity_percent,
    wind: {
      speed: cityData.weather_wind_speed_kmh,
      direction: cityData.weather_wind_direction_deg,
    },
    timestamp: cityData.reading_timestamp,
    last_successful_update_at: cityData.last_successful_update_at,
    location: {
      name: cityData.city_name ?? city.name,
      latitude: cityData.latitude ?? city.latitude,
      longitude: cityData.longitude ?? city.longitude,
    },
    weather_icon: null,
    main_pollutant_us: cityData.main_pollutant_us,
    weather_provider: cityData.weather_provider,
    weather_timestamp: cityData.weather_timestamp,
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

function resolveInitialCity(locations: readonly CityOption[], defaultCity: CityOption): CityOption {
  const cityFromQueryParam = getCityFromSearch(locations, window.location.search);

  if (cityFromQueryParam) {
    return cityFromQueryParam;
  }

  return findCityById(locations, readStoredCityId()) ?? defaultCity;
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
  const [selectedCity, setSelectedCity] = useState<CityOption>(() => (
    resolveInitialCity(locations, defaultCity)
  ));

  const updateSelectedCityState = useCallback((cityData: CityAirQualityData[], city: CityOption) => {
    const transformed = transformApiResponse(cityData, city);

    setAirQualityData(transformed);
    setTheme(getAirQualityTheme(transformed.aqi));
  }, []);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const cityData = await fetchLatestMonterreyAirQuality();
      const cityOptions = buildCityOptions(cityData);
      const selectedAvailability = getCityAvailability(
        cityData.find((row) => row.city_id === selectedCity.city_id),
      );
      const nextCity = selectedAvailability === 'available'
        ? selectedCity
        : findFirstAvailableCity(cityOptions) ?? selectedCity;

      setCityDataArray(cityData);
      writeCachedData(cityData);

      if (nextCity.city_id !== selectedCity.city_id) {
        setSelectedCity(nextCity);
        writeStoredCityId(nextCity.city_id);
        updateCityQueryParam(nextCity);
      }

      updateSelectedCityState(cityData, nextCity);
    } catch (err) {
      console.error('Error al obtener datos de calidad del aire:', err);
      const fallbackReason = getRpcFailureReason(err);
      const cachedData = readCachedData();

      if (cachedData) {
        const cachedOptions = buildCityOptions(cachedData);
        const selectedAvailability = getCityAvailability(
          cachedData.find((row) => row.city_id === selectedCity.city_id),
        );
        const nextCity = selectedAvailability === 'available'
          ? selectedCity
          : findFirstAvailableCity(cachedOptions) ?? selectedCity;

        setCityDataArray(cachedData);
        updateSelectedCityState(cachedData, nextCity);
        setError(`${fallbackReason} Mostrando la ultima lectura guardada localmente.`);
      } else {
        setCityDataArray([]);
        const degraded = buildDegradedAirQualityData(selectedCity, fallbackReason);
        setAirQualityData(degraded);
        setTheme(getAirQualityTheme(null));
        setError(fallbackReason);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedCity, updateSelectedCityState]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const changeCity = useCallback((city: CityOption) => {
    setSelectedCity(city);
    writeStoredCityId(city.city_id);
    updateCityQueryParam(city);

    if (cityDataArray.length > 0) {
      updateSelectedCityState(cityDataArray, city);
    }
  }, [cityDataArray, updateSelectedCityState]);

  const cityOptions = useMemo(() => buildCityOptions(cityDataArray), [cityDataArray]);

  return (
    <AirQualityContext.Provider
      value={{
        airQualityData,
        loading,
        error,
        theme,
        refreshData,
        selectedCity,
        cityOptions,
        cityRows: cityDataArray,
        changeCity,
      }}
    >
      {children}
    </AirQualityContext.Provider>
  );
}