import { MeasurementFreshness } from '../types';

export const FRESHNESS_STALE_THRESHOLD_HOURS = 2;
export const FRESHNESS_OLD_THRESHOLD_HOURS = 6;
const FUTURE_CLOCK_SKEW_TOLERANCE_HOURS = 5 / 60;

export interface FreshnessDisplayCopy {
  label: string;
  shortLabel: string;
}

export function getMeasurementAgeHours(
  readingTimestamp: string | null | undefined,
  now = Date.now(),
): number | null {
  if (!readingTimestamp) {
    return null;
  }

  const readingTime = new Date(readingTimestamp).getTime();

  if (Number.isNaN(readingTime)) {
    return null;
  }

  const ageHours = (now - readingTime) / (60 * 60 * 1000);

  if (ageHours < -FUTURE_CLOCK_SKEW_TOLERANCE_HOURS) {
    return null;
  }

  return Math.max(ageHours, 0);
}

export function getMeasurementFreshness(
  readingTimestamp: string | null | undefined,
  now = Date.now(),
): MeasurementFreshness {
  const ageHours = getMeasurementAgeHours(readingTimestamp, now);

  if (ageHours === null) {
    return 'unknown';
  }

  if (ageHours > FRESHNESS_OLD_THRESHOLD_HOURS) {
    return 'old';
  }

  if (ageHours > FRESHNESS_STALE_THRESHOLD_HOURS) {
    return 'stale';
  }

  return 'fresh';
}

export function getMeasurementFreshnessReason(
  freshness: MeasurementFreshness,
  cityName: string,
): string | undefined {
  switch (freshness) {
    case 'old':
      return `Dato viejo para ${cityName}; revisar con cautela.`;
    case 'stale':
      return `La medición ambiental de ${cityName} tiene retraso frente a la cadencia esperada.`;
    case 'unknown':
      return `No se pudo validar la hora de medición ambiental para ${cityName}.`;
    default:
      return undefined;
  }
}

export function getFreshnessDisplayCopy(freshness: MeasurementFreshness): FreshnessDisplayCopy {
  switch (freshness) {
    case 'fresh':
      return {
        label: 'Medición reciente',
        shortLabel: 'Reciente',
      };
    case 'stale':
      return {
        label: 'Medición con retraso',
        shortLabel: 'Con retraso',
      };
    case 'old':
      return {
        label: 'Dato viejo',
        shortLabel: 'Viejo',
      };
    default:
      return {
        label: 'Sin lectura disponible',
        shortLabel: 'Sin lectura',
      };
  }
}
