import type { AirQualityData } from '../types';
import { AQI_STATUS_COPY } from './aqiDesignTokens';

export const NOT_AVAILABLE_LABEL = 'N/D';

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function hasReliableAqi(value: AirQualityData | number | null | undefined): boolean {
  const aqi = typeof value === 'object' && value !== null ? value.aqi : value;

  return isFiniteNumber(aqi) && aqi >= 0;
}

export function formatNullableNumber(
  value: number | null | undefined,
  suffix = '',
  maximumFractionDigits = 0,
): string {
  if (!isFiniteNumber(value)) {
    return NOT_AVAILABLE_LABEL;
  }

  return `${new Intl.NumberFormat('es-MX', {
    maximumFractionDigits,
  }).format(value)}${suffix}`;
}

export function formatNullableTimestamp(
  timestamp: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' },
): string {
  if (!timestamp) {
    return NOT_AVAILABLE_LABEL;
  }

  const parsedDate = new Date(timestamp);

  if (Number.isNaN(parsedDate.getTime())) {
    return NOT_AVAILABLE_LABEL;
  }

  return parsedDate.toLocaleString('es-MX', options);
}

export function getUnknownStateCopy() {
  return AQI_STATUS_COPY.unknown;
}

