import type { AirQualityStatus, AirQualityTheme, RecommendationInfo } from '../types';
import {
  AQI_RANGE_TOKENS,
  AQI_RECOMMENDATIONS,
  AQI_STATUS_DESCRIPTIONS,
  AQI_THEME_TOKENS,
} from './aqiDesignTokens';
import icon01d from '../assets/weather-icons/01d.png';
import icon01n from '../assets/weather-icons/01n.png';
import icon02d from '../assets/weather-icons/02d.png';
import icon02n from '../assets/weather-icons/02n.png';
import icon03d from '../assets/weather-icons/03d.png';
import icon04d from '../assets/weather-icons/04d.png';
import icon09d from '../assets/weather-icons/09d.png';
import icon10d from '../assets/weather-icons/10d.png';
import icon10n from '../assets/weather-icons/10n.png';
import icon11d from '../assets/weather-icons/11d.png';
import icon13d from '../assets/weather-icons/13d.png';
import icon04n from '../assets/weather-icons/04n.png';
import icon50d from '../assets/weather-icons/50d.png';
import iconmidhum from '../assets/icons/mid-hum.png';
import iconhighhum from '../assets/icons/high-hum.png';
import iconlowwind from '../assets/icons/low-wind.png';
import iconmidwind from '../assets/icons/mid-wind.png';
import iconwindstorm from '../assets/icons/wind-storm.png';
import icontornado from '../assets/icons/tornado.png';
import iconradioactive from '../assets/icons/radioactive.png';
import iconmty from '../assets/icons/mty.png';

export function getMainPollutantIcon(): string {
  return iconradioactive;
}

export function getMainLogoIcon(): string {
  return iconmty;
}

export function getAirQualityStatus(aqi: number | null | undefined): AirQualityStatus {
  if (aqi === null || aqi === undefined || !Number.isFinite(aqi)) {
    return 'unknown';
  }

  const range = AQI_RANGE_TOKENS.find(({ min, max }) => {
    return aqi >= min && (max === null || aqi <= max);
  });

  return range?.status ?? 'unknown';
}

export function getHumidityIcon(humidity: number): string {
  if (humidity < 40) {
    return iconmidhum;
  } else if (humidity <= 70) {
    return iconmidhum;
  } else {
    return iconhighhum;
  }
}

export function getWindIcon(
  windSpeedKmh: number | null | undefined,
  windDirectionDeg: number | null | undefined,
): { icon: string; rotation?: number } {
  if (
    windSpeedKmh === null ||
    windSpeedKmh === undefined ||
    windDirectionDeg === null ||
    windDirectionDeg === undefined
  ) {
    return { icon: '' };
  }

  let icon = '';
  let rotation = 0;

  if (windSpeedKmh < 18) {
    icon = iconlowwind;
    rotation = windDirectionDeg;
  } else if (windSpeedKmh < 54) {
    icon = iconmidwind;
    rotation = windDirectionDeg;
  } else if (windSpeedKmh < 90) {
    icon = iconwindstorm;
  } else {
    icon = icontornado;
  }

  return { icon, rotation };
}

export const getAirQualityTheme = (status: AirQualityStatus): AirQualityTheme => {
  return AQI_THEME_TOKENS[status];
};

export const getRecommendations = (status: AirQualityStatus): RecommendationInfo[] => {
  return AQI_RECOMMENDATIONS[status];
};

export const getWeatherIconUrl = (iconCode: string | null | undefined): string | undefined => {
  if (!iconCode) {
    return undefined;
  }

  const iconMap: Record<string, string> = {
    '01d': icon01d,
    '01n': icon01n,
    '02d': icon02d,
    '02n': icon02n,
    '03d': icon03d,
    '03n': icon03d,
    '04d': icon04d,
    '04n': icon04n,
    '09d': icon09d,
    '10d': icon10d,
    '10n': icon10n,
    '11d': icon11d,
    '13d': icon13d,
    '50d': icon50d,
  };

  return iconMap[iconCode];
};

export const getAQIDescription = (status: AirQualityStatus): string => {
  return AQI_STATUS_DESCRIPTIONS[status];
};

export const getPollutantInfo = (pollutant: string): { name: string; description: string } => {
  switch (pollutant) {
    case 'pm25':
    case 'p2':
      return {
        name: 'PM2.5',
        description:
          'Partículas finas con un diámetro de 2.5 micrómetros o menos, que pueden penetrar profundamente en los pulmones.',
      };
    case 'pm10':
    case 'p1':
      return {
        name: 'PM10',
        description:
          'Partículas inhalables con un diámetro de 10 micrómetros o menos, que pueden entrar en los pulmones.',
      };
    case 'o3':
      return {
        name: 'Ozono (O₃)',
        description:
          'Gas que se forma en la atmósfera a través de reacciones químicas entre contaminantes y luz solar.',
      };
    case 'no2':
      return {
        name: 'Dióxido de Nitrógeno (NO₂)',
        description:
          'Gas irritante que proviene principalmente de la quema de combustibles fósiles como carbón, petróleo y gas.',
      };
    case 'so2':
      return {
        name: 'Dióxido de Azufre (SO₂)',
        description:
          'Gas irritante producido por la quema de combustibles que contienen azufre, como carbón y petróleo.',
      };
    case 'co':
      return {
        name: 'Monóxido de Carbono (CO)',
        description: 'Gas tóxico producido por la combustión incompleta de combustibles que contienen carbono.',
      };
    default:
      return {
        name: pollutant,
        description: 'Contaminante atmosférico que puede afectar la salud y el medio ambiente.',
      };
  }
};