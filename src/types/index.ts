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
  weather_temperature_c: number | null;
  weather_humidity_percent: number | null;
  weather_wind_speed_kmh: number | null;
  weather_wind_direction_deg: number | null;
  weather_wind_gust_kmh: number | null;
  weather_provider: string | null;
  weather_timestamp: string | null;
}

export interface AirQualityHistoryRow {
  city_id: number;
  city_name: string;
  reading_timestamp: string;
  aqi_us: number | null;
  main_pollutant_us: string | null;
  temperature_c: number | null;
  humidity_percent: number | null;
  weather_temperature_c: number | null;
  weather_humidity_percent: number | null;
  weather_wind_speed_kmh: number | null;
  weather_timestamp: string | null;
  weather_provider: string | null;
}

export interface AirQualityDailyHistoryRow {
  city_id: number;
  city_name: string;
  reading_date: string;
  avg_aqi_us: number | null;
  max_aqi_us: number | null;
  avg_temperature_c: number | null;
  avg_humidity_percent: number | null;
  avg_weather_temperature_c: number | null;
  avg_weather_humidity_percent: number | null;
  avg_weather_wind_speed_kmh: number | null;
  dominant_pollutant_us: string | null;
  reading_count: number;
  weather_reading_count: number;
}

export type AirQualityTrend = 'rising' | 'falling' | 'stable' | 'insufficient-data';

export type AirQualityHistoryMetric =
  | 'aqi_us'
  | 'weather_temperature_c'
  | 'weather_humidity_percent'
  | 'weather_wind_speed_kmh';

export type AirQualityDataQuality = 'fresh' | 'degraded';

export type MeasurementFreshness = 'fresh' | 'stale' | 'old' | 'unknown';

export type CityDataAvailability = 'available' | 'missing' | 'invalid-aqi';

export interface CitySelectorOption {
  city_id: number;
  name: string;
  latitude: number;
  longitude: number;
  availability: CityDataAvailability;
  disabledReason?: string;
  readingTimestamp?: string;
}

export interface AirQualityData {
  aqi: number | null;
  status: AirQualityStatus;
  dataQuality: AirQualityDataQuality;
  degradationReason?: string;
  measurementFreshness: MeasurementFreshness;
  pm25: number | null;
  pm10: number | null;
  o3: number | null;
  no2: number | null;
  so2: number | null;
  co: number | null;
  iaqi?: Partial<Record<'pm25' | 'pm10' | 'o3' | 'no2' | 'so2' | 'co', { v: number }>>;
  temperature: number | null;
  humidity: number | null;
  wind: {
    speed: number | null;
    direction: number | null;
  };
  timestamp: string | null;
  last_successful_update_at?: string | null;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  weather_icon?: string | null;
  main_pollutant_us?: string | null;
  weather_provider?: string | null;
  weather_timestamp?: string | null;
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
