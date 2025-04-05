import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AirQualityData, AirQualityTheme } from '../types';
import { getAirQualityTheme, getAirQualityStatus } from '../utils/airQualityUtils'; // {{ edit }}
import { fetchLatestMonterreyAirQuality, MONTERREY_LOCATIONS_WITH_COORDS } from '../services/apiService';

interface AirQualityContextType {
  airQualityData: AirQualityData | null;
  loading: boolean;
  error: string | null;
  theme: AirQualityTheme | null;
  refreshData: () => Promise<void>;
  selectedCity: { name: string; latitude: number; longitude: number };
  changeCity: (city: { name: string; latitude: number; longitude: number }) => void;
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
  children: ReactNode;
}

export function AirQualityProvider({ children }: AirQualityProviderProps) {
  const [airQualityData, setAirQualityData] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<AirQualityTheme | null>(null);
  const [selectedCity, setSelectedCity] = useState(MONTERREY_LOCATIONS_WITH_COORDS[0]);
  const fetchAirQualityData = async () => {
    try {
      setLoading(true);
      // Pasar la ciudad seleccionada a la función que obtiene los datos
      const cityDataArray = await fetchLatestMonterreyAirQuality(selectedCity);
      // setAirQualityData(data);
      // setTheme(getAirQualityTheme(data.status));
      // setError(null);
      if (Array.isArray(cityDataArray) && cityDataArray.length > 0) {
        const cityData = cityDataArray[0];
        const transformedData: AirQualityData = {
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
            name: cityData.city_name,
            latitude: cityData.latitude,
            longitude: cityData.longitude,
          },
        };
        setAirQualityData(transformedData);
        setTheme(getAirQualityTheme(transformedData.status));
        console.log('Data from Buildship API:', transformedData);
      } else {
        setError('No se pudieron cargar los datos de calidad del aire');
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching air quality data:', err);
      setError('No se pudieron cargar los datos de calidad del aire');
    } finally {
      setLoading(false);
    }
  };

  // Función para cambiar la ciudad seleccionada
  const changeCity = (city: { name: string; latitude: number; longitude: number }) => {
    setSelectedCity(city);
  };

  // Actualizar los datos cuando cambia la ciudad seleccionada
  useEffect(() => {
    fetchAirQualityData();
  }, [selectedCity]);

  useEffect(() => {
    // Actualizar datos cada 5 minutos
    const intervalId = setInterval(fetchAirQualityData, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const value = {
    airQualityData,
    loading,
    error,
    theme,
    refreshData: fetchAirQualityData,
    selectedCity,
    changeCity
  };

  return <AirQualityContext.Provider value={value}>{children}</AirQualityContext.Provider>;
}