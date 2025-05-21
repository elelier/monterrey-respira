import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'; // Import useMemo
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
  allCitiesData: CityAirQualityData[] | null; // Added allCitiesData
  filteredCities: Array<{ name: string; latitude: number; longitude: number; city_id?: number }>; // Added filteredCities
}

const AirQualityContext = createContext<AirQualityContextType | undefined>(undefined);

export function useAirQuality() {
  const context = useContext(AirQualityContext);
  console.log("useAirQuality context:", context);
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
  const [allCitiesData, setAllCitiesData] = useState<CityAirQualityData[] | null>(null); // Added allCitiesData state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<AirQualityTheme | null>(null);
  const [selectedCity, setSelectedCity] = useState(MONTERREY_LOCATIONS_WITH_COORDS[0]);

  const filteredCities = useMemo(() => {
    if (!allCitiesData) {
      return []; // Return empty array if allCitiesData is not available
    }
    return MONTERREY_LOCATIONS_WITH_COORDS.filter(staticCity =>
      allCitiesData.some(apiCity => apiCity.city_name === staticCity.name && apiCity.aqi_us !== null && apiCity.aqi_us !== undefined)
    );
  }, [allCitiesData]);

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
        setAllCitiesData(parsedCacheData); // Also set allCitiesData from cache
        // Transformar datos cacheados al formato AirQualityData
        const transformedCacheData = transformApiResponse(parsedCacheData, selectedCity.name); // {{ edit }}
        if (transformedCacheData) {
          setAirQualityData(transformedCacheData); // Usar datos del caché
          setTheme(getAirQualityTheme(transformedCacheData.status));
        } else {
          setAirQualityData(null);
          setTheme(getAirQualityTheme('unknown'));
        }
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
        setAllCitiesData(cityDataArray); // Populate allCitiesData
        localStorage.setItem(CACHE_KEY, JSON.stringify(cityDataArray)); // Guardar datos en caché
        localStorage.setItem(`${CACHE_KEY}_timestamp`, Date.now().toString()); // Guardar hora en caché
        console.log('Cache Updated - New data from API'); // Mensaje al actualizar el caché {{ edit: 2 }}

        // Transformar datos de la API al formato AirQualityData
        const transformedData = transformApiResponse(cityDataArray, selectedCity.name); // {{ edit }}
        if (transformedData) {
          setAirQualityData(transformedData); // Usar datos transformados
          setTheme(getAirQualityTheme(transformedData.status));
        } else {
          setAirQualityData(null);
          setTheme(getAirQualityTheme('unknown'));
        }
      } else {
        setAllCitiesData(null); // No data from API
        setAirQualityData(null);
        setTheme(getAirQualityTheme('unknown'));
        setError('No se pudieron cargar los datos de calidad del aire');
      }
      setError(null); // Clear previous errors if successful
      } catch (err) {
          console.error('Error fetching air quality data:', err);
          setError('No se pudieron cargar los datos de calidad del aire');
      } finally {
          setLoading(false);
      }
  };

  // Función para transformar la respuesta de la API al formato AirQualityData
  const transformApiResponse = (cityDataArray: CityAirQualityData[] | null, cityName: string): AirQualityData | null => { // {{ edit }}
    if (!cityDataArray) {
      console.warn(`cityDataArray is null in transformApiResponse for cityName: ${cityName}`);
      return null;
    }
    const cityData = cityDataArray.find(city => city.city_name === cityName); // Encontrar datos de la ciudad seleccionada

    if (!cityData || cityData.aqi_us === null || cityData.aqi_us === undefined) { // Check for null/undefined AQI
      console.warn(`No se encontraron datos válidos para la ciudad: ${cityName} en la respuesta de la API o AQI es nulo/indefinido.`);
      return null; // Return null if city data not found or AQI is invalid
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
        weather_icon: cityData.weather_icon,
        main_pollutant_us: cityData.main_pollutant_us,
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
  }, []); // Removed fetchAirQualityData from dependency array to avoid loop with selectedCity change

  // Effect to validate and update selectedCity based on filteredCities
  useEffect(() => {
    if (filteredCities && filteredCities.length > 0) {
      const currentSelectedCityStillValid = filteredCities.some(city => city.name === selectedCity.name);
      if (!currentSelectedCityStillValid) {
        setSelectedCity(filteredCities[0]);
        // Data will be fetched by the useEffect watching selectedCity
      }
    } else if (filteredCities && filteredCities.length === 0 && allCitiesData) {
      // If allCitiesData is loaded, but filteredCities is empty,
      // it means no city has valid data.
      // The current selectedCity might be one without data.
      // transformApiResponse will return null for it, leading to null airQualityData.
      // CitySelector will show "No cities available".
      // If selectedCity needs to be explicitly nulled or set to a default,
      // this is where that logic would go, but current setup handles airQualityData correctly.
      // For instance, ensure fetch is triggered if selectedCity changes to one without data.
      const cityData = allCitiesData.find(c => c.city_name === selectedCity.name);
      if (!cityData || cityData.aqi_us === null || cityData.aqi_us === undefined) {
        setAirQualityData(null);
        setTheme(getAirQualityTheme('unknown'));
      }
    }
  }, [filteredCities, selectedCity.name, allCitiesData]); // Add allCitiesData

  const value = {
    airQualityData,
    loading,
    error,
    theme,
    refreshData: fetchAirQualityData,
    selectedCity,
    changeCity,
    allCitiesData, // Expose allCitiesData
    filteredCities // Expose filteredCities
  };

  return <AirQualityContext.Provider value={value}>{children}</AirQualityContext.Provider>;
}