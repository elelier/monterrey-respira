import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AirQualityData, AirQualityTheme, CityAirQualityData } from '../types'; // Importa CityAirQualityData
import { getAirQualityTheme, getAirQualityStatus } from '../utils/airQualityUtils';
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

const CACHE_KEY = 'airQualityDataCache'; // Clave para el caché en localStorage
const CACHE_EXPIRATION_TIME = 60 * 60 * 1000; // 1 hora en milisegundos

export function AirQualityProvider({ children }: AirQualityProviderProps) {
  const [airQualityData, setAirQualityData] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<AirQualityTheme | null>(null);
  const [selectedCity, setSelectedCity] = useState(MONTERREY_LOCATIONS_WITH_COORDS[0]);

  const fetchAirQualityData = async () => {
    const cachedData = localStorage.getItem(CACHE_KEY); // Obtener datos del caché
    const cachedTime = localStorage.getItem(`${CACHE_KEY}_timestamp`); // Obtener hora del caché

    console.log('Checking Cache...');

    if (cachedData && cachedTime) { // Si hay datos en caché
      const timeElapsed = Date.now() - Number(cachedTime);
      console.log('Cache Time:', new Date(Number(cachedTime)).toLocaleString()); // Mostrar hora del caché {{ edit: 2 }}
      console.log('Time Elapsed:', timeElapsed / (60 * 60 * 1000), 'hours'); // Mostrar tiempo transcurrido en horas {{ edit: 2 }}

      if (timeElapsed < CACHE_EXPIRATION_TIME) { // Si el caché es reciente (menos de 1 hora)
        console.log('Data from Cache - Cache is valid'); // Mensaje más claro {{ edit: 2 }}
        const parsedCacheData = JSON.parse(cachedData); // Parsear datos del caché
        // Transformar datos cacheados al formato AirQualityData
        const transformedCacheData = transformApiResponse(parsedCacheData, selectedCity.name); // {{ edit }}
        setAirQualityData(transformedCacheData); // Usar datos del caché
        setTheme(getAirQualityTheme(transformedCacheData.status));
        setLoading(false);
        return; // Salir de la función, no hacer petición a la API
      } else {
        console.log('Cache Expired - Fetching new data from API'); // Mensaje más claro {{ edit: 2 }}
      }
    } else {
      console.log('No Cache Found - Fetching data from API'); // Mensaje si no hay caché {{ edit: 2 }}
    }

    try {
      setLoading(true);
      const cityDataArray = await fetchLatestMonterreyAirQuality(); // Obtener datos de la API (TODAS las ciudades) // {{ edit: remove selectedCity argument }}

      if (Array.isArray(cityDataArray) && cityDataArray.length > 0) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cityDataArray)); // Guardar datos en caché
        localStorage.setItem(`${CACHE_KEY}_timestamp`, Date.now().toString()); // Guardar hora en caché
        console.log('Cache Updated - New data from API'); // Mensaje al actualizar el caché {{ edit: 2 }}

        // Transformar datos de la API al formato AirQualityData
        const transformedData = transformApiResponse(cityDataArray, selectedCity.name); // {{ edit }}
        setAirQualityData(transformedData); // Usar datos transformados
        setTheme(getAirQualityTheme(transformedData.status));
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

  // Función para transformar la respuesta de la API al formato AirQualityData
  const transformApiResponse = (cityDataArray: CityAirQualityData[], cityName: string): AirQualityData => { // {{ edit }}
    const cityData = cityDataArray.find(city => city.city_name === cityName); // Encontrar datos de la ciudad seleccionada

    if (!cityData) {
      console.warn(`No se encontraron datos para la ciudad: ${cityName} en la respuesta de la API`);
      // Puedes retornar datos por defecto o manejar este caso como prefieras
      return {
        aqi: 0, status: 'unknown', pm25: 0, pm10: 0, o3: 0, no2: 0, so2: 0, co: 0, temperature: 0, humidity: 0, wind: { speed: 0, direction: 0 }, timestamp: new Date().toISOString(), location: { name: cityName, latitude: 0, longitude: 0 }
      };
    }

    return {
      aqi: cityData.aqi_us,
      status: getAirQualityStatus(cityData.aqi_us),
      pm25: 0, pm10: 0, o3: 0, no2: 0, so2: 0, co: 0,
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
    // Actualizar datos cada 5 minutos (o cuando expire el caché)
    const intervalId = setInterval(fetchAirQualityData, 5 * 60 * 1000); // Cada 5 minutos
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