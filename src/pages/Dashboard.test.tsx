import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AirQualityData } from '../types';

const mockState = vi.hoisted(() => ({
  refreshData: vi.fn(),
}));

const airQualityData: AirQualityData = {
  aqi: 42,
  status: 'good',
  dataQuality: 'fresh',
  measurementFreshness: 'fresh',
  pm25: null,
  pm10: null,
  o3: null,
  no2: null,
  so2: null,
  co: null,
  temperature: 26.4,
  humidity: 45,
  wind: {
    speed: 9.2,
    direction: 120,
  },
  timestamp: '2026-07-26T18:20:00Z',
  last_successful_update_at: '2026-07-26T18:25:00Z',
  location: {
    name: 'Monterrey',
    latitude: 25.6866,
    longitude: -100.3161,
  },
  weather_icon: null,
  main_pollutant_us: 'pm25',
  weather_provider: 'open-meteo',
  weather_timestamp: '2026-07-26T18:15:00Z',
};

vi.mock('../context/AirQualityContext', () => ({
  useAirQuality: () => ({
    airQualityData,
    loading: false,
    error: null,
    refreshData: mockState.refreshData,
    changeCity: vi.fn(),
    theme: {
      primary: '#4ade80',
      secondary: '#166534',
      background: '#f0fdf4',
      text: '#14532d',
      gradient: 'from-emerald-500 to-green-600',
    },
    selectedCity: {
      city_id: 1,
      name: 'Monterrey',
      latitude: 25.6866,
      longitude: -100.3161,
    },
    cityOptions: [],
    cityRows: [
      {
        city_id: 1,
        city_name: 'Monterrey',
        api_name: 'Monterrey',
        latitude: 25.6866,
        longitude: -100.3161,
        reading_timestamp: '2026-07-26T18:20:00Z',
        aqi_us: 42,
        main_pollutant_us: 'pm25',
        temperature_c: null,
        humidity_percent: null,
        wind_speed_ms: null,
        wind_direction_deg: null,
        weather_icon: '02d',
        last_successful_update_at: '2026-07-26T18:25:00Z',
        weather_temperature_c: 26.4,
        weather_humidity_percent: 45,
        weather_wind_speed_kmh: 9.2,
        weather_wind_direction_deg: 120,
        weather_wind_gust_kmh: 14,
        weather_provider: 'open-meteo',
        weather_timestamp: '2026-07-26T18:15:00Z',
      },
    ],
  }),
}));

vi.mock('../components/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));
vi.mock('../components/CitySelector', () => ({ default: () => null }));
vi.mock('../components/CityHistoricalTrend', () => ({ default: () => null }));
vi.mock('../components/Recommendations', () => ({ default: () => null }));
vi.mock('../components/AirQualityMap', () => ({ default: () => null }));
vi.mock('../components/DataTrustExplainer', () => ({ default: () => null }));

import Dashboard from './Dashboard';

describe('Dashboard AQI home v2 integration', () => {
  beforeEach(() => {
    mockState.refreshData.mockReset();
  });

  it('promotes the lab AQI experience to the real Home with canonical weather icon data', () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('region', { name: 'Lectura de calidad del aire en Monterrey: Buena' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Riesgo bajo')).toBeInTheDocument();
    expect(screen.getByText('Parcialmente nublado')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Refrescar datos' }));
    expect(mockState.refreshData).toHaveBeenCalledTimes(1);
  });
});
