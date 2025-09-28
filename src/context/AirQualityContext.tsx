import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { AirQualityData, AirQualityTheme, CityAirQualityData } from '../types';
import { getAirQualityTheme, getAirQualityStatus } from '../utils/airQualityUtils';
import { fetchLatestMonterreyAirQuality, MONTERREY_LOCATIONS_WITH_COORDS } from '../services/apiService';

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
  console.log('useAirQuality context:', context);
  if (context === undefined) {
    throw new Error('useAirQuality must be used within an AirQualityProvider');
  }
  return context;
}

interface AirQualityProviderProps {
  children: ReactNode;
}

const CACHE_KEY = 'airQualityDataCache';
const CACHE_EXPIRATION_TIME = 60 * 60 * 1000;

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

  const fetchAirQualityData = async () => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cachedTime = localStorage.getItem(`${CACHE_KEY}_timestamp`);

    console.log('Checking Cache...');

    if (cachedData && cachedTime) {
      const timeElapsed = Date.now() - Number(cachedTime);
      console.log('Cache Time:', new Date(Number(cachedTime)).toLocaleString());
      console.log('Time Elapsed:', timeElapsed / (60 * 60 * 1000), 'hours');

      if (timeElapsed < CACHE_EXPIRATION_TIME) {
        console.log('Data from Cache - Cache is valid');
        const parsedCacheData: CityAirQualityData[] = JSON.parse(cachedData);
        const transformedCacheData = transformApiResponse(parsedCacheData, selectedCity);
        setAirQualityData(transformedCacheData);
        setTheme(getAirQualityTheme(transformedCacheData.status));
        setLoading(false);
        return;
      }

      console.log('Cache Expired - Fetching new data from API');
    } else {
      console.log('No Cache Found - Fetching data from API');
    }

    try {
      setLoading(true);
      const cityDataArray = await fetchLatestMonterreyAirQuality();

      if (Array.isArray(cityDataArray) && cityDataArray.length > 0) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cityDataArray));
        localStorage.setItem(`${CACHE_KEY}_timestamp`, Date.now().toString());
        console.log('Cache Updated - New data from API');

        const transformedData = transformApiResponse(cityDataArray, selectedCity);
        setAirQualityData(transformedData);
        setTheme(getAirQualityTheme(transformedData.status));
        setError(null);
      } else {
        setError('No se pudieron cargar los datos de calidad del aire');
      }
    } catch (err) {
      console.error('Error fetching air quality data:', err);
      setError('No se pudieron cargar los datos de calidad del aire');
    } finally {
      setLoading(false);
    }
  };

  const transformApiResponse = (cityDataArray: CityAirQualityData[], city: CityOption): AirQualityData => {
    const cityData = cityDataArray.find((item) => item.city_id === city.city_id);

    if (!cityData) {
      console.warn(`No se encontraron datos para la ciudad con id ${city.city_id} (${city.name}) en la respuesta de la API`);
      return {
        aqi: 0,
        status: 'unknown',
        pm25: 0,
        pm10: 0,
        o3: 0,
        no2: 0,
        so2: 0,
        co: 0,
        temperature: 0,
        humidity: 0,
        wind: { speed: 0, direction: 0 },
        timestamp: new Date().toISOString(),
        location: { name: city.name, latitude: city.latitude, longitude: city.longitude },
      };
    }

    return {
      aqi: cityData.aqi_us,
      status: getAirQualityStatus(cityData.aqi_us),
      pm25: 0,
      pm10: 0,
      o3: 0,
      no2: 0,
      so2: 0,
      co: 0,
      temperature: cityData.temperature_c,
      humidity: cityData.humidity_percent,
      wind: {
        speed: cityData.wind_speed_ms,
        direction: cityData.wind_direction_deg,
      },
      timestamp: cityData.reading_timestamp,
      location: {
        name: cityData.city_name ?? city.name,
        latitude: cityData.latitude,
        longitude: cityData.longitude,
      },
      weather_icon: cityData.weather_icon,
      main_pollutant_us: cityData.main_pollutant_us,
    };
  };

  const changeCity = (city: CityOption) => {
    setSelectedCity(city);
  };

  useEffect(() => {
    fetchAirQualityData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity.city_id]);

  useEffect(() => {
    const intervalId = setInterval(fetchAirQualityData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

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
