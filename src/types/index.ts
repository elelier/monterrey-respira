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
}

export type AirQualityStatus = 'good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous';

export interface HistoricalData {
  date: string;
  aqi: number;
  pm25: number;
  pm10: number;
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
