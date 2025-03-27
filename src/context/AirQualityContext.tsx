import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AirQualityData, AirQualityTheme } from '../types';
import { getAirQualityTheme } from '../utils/airQualityUtils';
import { getCurrentAirQualityData, MONTERREY_LOCATIONS } from '../services/apiService';

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
  const [selectedCity, setSelectedCity] = useState(MONTERREY_LOCATIONS[0]);

  const fetchAirQualityData = async () => {
    try {
      setLoading(true);
      // Pasar la ciudad seleccionada a la función que obtiene los datos
      const data = await getCurrentAirQualityData(selectedCity);
      setAirQualityData(data);
      setTheme(getAirQualityTheme(data.status));
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
