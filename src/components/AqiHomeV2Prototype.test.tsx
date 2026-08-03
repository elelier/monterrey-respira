import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { AirQualityData, AirQualityStatus, MeasurementFreshness } from '../types';
import AqiHomeV2Prototype from './AqiHomeV2Prototype';

const baseData: AirQualityData = {
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
  weather_icon: '02d',
  main_pollutant_us: 'pm25',
  weather_provider: 'open-meteo',
  weather_timestamp: '2026-07-26T18:15:00Z',
};

function renderCard(overrides: Partial<AirQualityData> = {}) {
  return render(
    <AqiHomeV2Prototype
      data={{
        ...baseData,
        ...overrides,
        wind: overrides.wind ?? baseData.wind,
        location: overrides.location ?? baseData.location,
      }}
      onRefresh={vi.fn()}
    />,
  );
}

describe('AqiHomeV2Prototype', () => {
  it('presents the lab visual as a production air-quality region', () => {
    renderCard();

    expect(
      screen.getByRole('region', { name: 'Lectura de calidad del aire en Monterrey: Buena' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Lectura ambiental')).toBeInTheDocument();
    expect(screen.queryByText(/Laboratorio AQI v2/i)).not.toBeInTheDocument();
  });

  it.each<[AirQualityStatus, number, string, string]>([
    ['good', 42, 'Aire limpio', 'Riesgo bajo'],
    ['moderate', 84, 'Moderada', 'Riesgo moderado'],
    ['unhealthy-sensitive', 126, 'Sensibles', 'Riesgo para sensibles'],
    ['unhealthy', 172, 'Dañina', 'Riesgo alto'],
    ['very-unhealthy', 238, 'Muy dañina', 'Riesgo muy alto'],
    ['hazardous', 321, 'Peligrosa', 'Riesgo extremo'],
  ])('keeps the semantic copy for %s AQI', (status, aqi, heroLabel, riskLabel) => {
    renderCard({ status, aqi });

    expect(screen.getByText(heroLabel)).toBeInTheDocument();
    expect(screen.getByText(riskLabel)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: `AQI ${aqi}` })).toBeInTheDocument();
  });

  it('renders honest fallbacks when pollutant and weather context are absent', () => {
    renderCard({
      main_pollutant_us: null,
      weather_icon: null,
      temperature: null,
      humidity: null,
      wind: { speed: null, direction: null },
    });

    expect(screen.getByText('Contexto ambiental')).toBeInTheDocument();
    expect(screen.getAllByText('N/D')).toHaveLength(4);
  });

  it.each<[MeasurementFreshness, string]>([
    ['fresh', 'Actual'],
    ['stale', '+12 h'],
    ['old', '+24 h'],
    ['unknown', 'Sin validar'],
  ])('shows %s freshness without changing the measurement timestamp', (measurementFreshness, label) => {
    renderCard({ measurementFreshness });

    expect(screen.getByText(new RegExp(`^${label.replace('+', '\\+')} ·`))).toBeInTheDocument();
  });

  it('shows degraded and missing-reading states without inventing AQI', () => {
    renderCard({
      aqi: null,
      status: 'unknown',
      dataQuality: 'degraded',
      measurementFreshness: 'unknown',
      degradationReason: 'Sin lectura disponible para Monterrey.',
    });

    expect(screen.getByText('Sin lectura disponible')).toBeInTheDocument();
    expect(screen.getByText('Sin lectura')).toBeInTheDocument();
    expect(screen.getByText('Sin lectura disponible para Monterrey.')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'AQI N/D' })).toBeInTheDocument();
  });
});
