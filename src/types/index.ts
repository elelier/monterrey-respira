export interface CityAirQualityData {
  city_id: number;
  city_name: string;
  api_name: string;
  latitude: number | null;
  longitude: number | null;
  reading_timestamp: string;
  aqi_us: number | null;
  main_pollutant_us: string | null;
  temperature_c: number | null;
  humidity_percent: number | null;
  wind_speed_ms: number | null;
  wind_direction_deg: number | null;
  weather_icon: string | null;
  last_successful_update_at: string | null;
}

export type AirQualityDataQuality = 'fresh' | 'degraded';

export interface AirQualityData {
  aqi: number;
  status: AirQualityStatus;
  dataQuality: AirQualityDataQuality;
  degradationReason?: string;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
  iaqi?: Partial<Record<'pm25' | 'pm10' | 'o3' | 'no2' | 'so2' | 'co', { v: number }>>;
  temperature: number;
  humidity: number;
  wind: {
    speed: number;
    direction: number;
  };
  timestamp: string;
  last_successful_update_at?: string | null;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  weather_icon?: string | null;
  main_pollutant_us?: string | null;
}

export type AirQualityStatus =
  | 'good'
  | 'moderate'
  | 'unhealthy-sensitive'
  | 'unhealthy'
  | 'very-unhealthy'
  | 'hazardous'
  | 'unknown';

export interface HistoricalData {
  date: string;
  aqi: number;
  pm25?: number;
  pm10?: number;
}

export interface Station {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  aqi: number;
  status: AirQualityStatus;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  wind: {
    speed: number;
    direction: number;
  };
  conditions: string;
}

export interface AirQualityTheme {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  gradient: string;
}

export interface RecommendationInfo {
  icon: string;
  title: string;
  description: string;
}
