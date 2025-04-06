export interface CityAirQualityData {
  city_id: number;
  city_name: string;
  api_name: string;
  latitude: number;
  longitude: number;
  reading_timestamp: string;
  aqi_us: number;
  main_pollutant_us: string;
  temperature_c: number;
  humidity_percent: number;
  wind_speed_ms: number;
  wind_direction_deg: number;
  weather_icon: string;
  last_successful_update_at: string;
}

export interface AirQualityData {
  aqi: number;
  status: AirQualityStatus;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
  temperature: number;
  humidity: number;
  wind: {
    speed: number;
    direction: number;
  };
  timestamp: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  weatherIcon?: string;
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
