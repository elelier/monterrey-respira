import { AirQualityStatus, AirQualityTheme, RecommendationInfo } from '../types';

export const getAirQualityStatus = (aqi: number): AirQualityStatus => {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'unhealthy-sensitive';
  if (aqi <= 200) return 'unhealthy';
  if (aqi <= 300) return 'very-unhealthy';
  return 'hazardous';
};

export const getAirQualityTheme = (status: AirQualityStatus): AirQualityTheme => {
  switch (status) {
    case 'good':
      return {
        primary: '#4ade80',
        secondary: '#10b981',
        background: '#f0fdf4',
        text: '#166534',
        gradient: 'from-green-400 to-emerald-500',
      };
    case 'moderate':
      return {
        primary: '#fbbf24',
        secondary: '#f59e0b',
        background: '#fffbeb',
        text: '#92400e',
        gradient: 'from-amber-400 to-yellow-500',
      };
    case 'unhealthy-sensitive':
      return {
        primary: '#fb923c',
        secondary: '#f97316',
        background: '#fff7ed',
        text: '#9a3412',
        gradient: 'from-orange-400 to-orange-500',
      };
    case 'unhealthy':
      return {
        primary: '#f87171',
        secondary: '#ef4444',
        background: '#fef2f2',
        text: '#b91c1c',
        gradient: 'from-red-400 to-red-500',
      };
    case 'very-unhealthy':
      return {
        primary: '#c084fc',
        secondary: '#a855f7',
        background: '#faf5ff',
        text: '#7e22ce',
        gradient: 'from-purple-400 to-purple-500',
      };
    case 'hazardous':
      return {
        primary: '#9f1239',
        secondary: '#881337',
        background: '#fff1f2',
        text: '#9f1239',
        gradient: 'from-rose-700 to-rose-800',
      };
  }
};

export const getRecommendations = (status: AirQualityStatus): RecommendationInfo[] => {
  switch (status) {
    case 'good':
      return [
        {
          icon: 'IoSunny',
          title: 'Actividades al aire libre',
          description: 'Hoy es seguro realizar actividades al aire libre, ¡disfruta del buen clima!',
        },
        {
          icon: 'IoWalk',
          title: 'Ejercicio',
          description: 'Condiciones ideales para hacer ejercicio en exteriores.',
        },
        {
          icon: 'IoHappy',
          title: 'Calidad del aire',
          description: 'La calidad del aire es excelente, sin riesgos para la salud.',
        },
      ];
    case 'moderate':
      return [
        {
          icon: 'IoSunny',
          title: 'Actividades al aire libre',
          description: 'Puedes realizar actividades al aire libre, pero con moderación.',
        },
        {
          icon: 'IoWalk',
          title: 'Ejercicio',
          description: 'Personas sensibles deben considerar reducir el ejercicio intenso al aire libre.',
        },
        {
          icon: 'IoWarning',
          title: 'Precaución',
          description: 'Personas con condiciones respiratorias deben estar atentas a síntomas.',
        },
      ];
    case 'unhealthy-sensitive':
      return [
        {
          icon: 'IoAlert',
          title: 'Grupos sensibles',
          description: 'Niños, adultos mayores y personas con problemas respiratorios deben limitar el tiempo al aire libre.',
        },
        {
          icon: 'IoWalk',
          title: 'Ejercicio',
          description: 'Considera realizar ejercicio en interiores o reducir la intensidad.',
        },
        {
          icon: 'IoWarning',
          title: 'Monitoreo',
          description: 'Mantente informado sobre el nivel de contaminación a lo largo del día.',
        },
      ];
    case 'unhealthy':
      return [
        {
          icon: 'IoAlert',
          title: 'Limita exposición',
          description: 'Evita ejercicio en exteriores y reduce actividades al aire libre.',
        },
        {
          icon: 'IoHome',
          title: 'Interior',
          description: 'Mantén ventanas cerradas para reducir la entrada de aire contaminado.',
        },
        {
          icon: 'IoMedical',
          title: 'Salud',
          description: 'Usa cubrebocas en exteriores, especialmente si tienes condiciones respiratorias.',
        },
      ];
    case 'very-unhealthy':
      return [
        {
          icon: 'IoWarning',
          title: 'Evita exteriores',
          description: 'Permanece en interiores y evita cualquier actividad física al aire libre.',
        },
        {
          icon: 'IoHome',
          title: 'En casa',
          description: 'Mantén todas las ventanas cerradas y considera usar purificador de aire.',
        },
        {
          icon: 'IoMedical',
          title: 'Protección',
          description: 'Usa cubrebocas N95 si debes salir, la contaminación es peligrosa.',
        },
      ];
    case 'hazardous':
      return [
        {
          icon: 'IoWarning',
          title: 'Emergencia',
          description: 'Condiciones de emergencia sanitaria, evita completamente salir de casa.',
        },
        {
          icon: 'IoHome',
          title: 'Refugio',
          description: 'Permanece en interiores, sella ventanas y puertas si es posible.',
        },
        {
          icon: 'IoMedical',
          title: 'Protección',
          description: 'Si sales, usa cubrebocas N95 y limita tu tiempo de exposición al mínimo.',
        },
      ];
  }
};

export const getAQIDescription = (status: AirQualityStatus): string => {
  switch (status) {
    case 'good':
      return 'La calidad del aire es satisfactoria y representa poco o ningún riesgo para la salud.';
    case 'moderate':
      return 'La calidad del aire es aceptable, pero puede haber un riesgo moderado para algunas personas sensibles.';
    case 'unhealthy-sensitive':
      return 'Miembros de grupos sensibles pueden experimentar efectos en la salud. El público en general no suele verse afectado.';
    case 'unhealthy':
      return 'Todo el mundo puede comenzar a experimentar efectos en la salud. Las personas sensibles pueden experimentar efectos más graves.';
    case 'very-unhealthy':
      return 'Advertencias sanitarias de condiciones de emergencia. Es más probable que toda la población se vea afectada.';
    case 'hazardous':
      return 'Alerta sanitaria: todos pueden experimentar efectos más graves para la salud. Se recomienda evitar cualquier actividad al aire libre.';
  }
};

export const getPollutantInfo = (pollutant: string): { name: string; description: string } => {
  switch (pollutant) {
    case 'pm25':
      return {
        name: 'PM2.5',
        description: 'Partículas finas con un diámetro de 2.5 micrómetros o menos, que pueden penetrar profundamente en los pulmones.',
      };
    case 'pm10':
      return {
        name: 'PM10',
        description: 'Partículas inhalables con un diámetro de 10 micrómetros o menos, que pueden entrar en los pulmones.',
      };
    case 'o3':
      return {
        name: 'Ozono (O₃)',
        description: 'Gas que se forma en la atmósfera a través de reacciones químicas entre contaminantes y luz solar.',
      };
    case 'no2':
      return {
        name: 'Dióxido de Nitrógeno (NO₂)',
        description: 'Gas irritante que proviene principalmente de la quema de combustibles fósiles como carbón, petróleo y gas.',
      };
    case 'so2':
      return {
        name: 'Dióxido de Azufre (SO₂)',
        description: 'Gas irritante producido por la quema de combustibles que contienen azufre, como carbón y petróleo.',
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
