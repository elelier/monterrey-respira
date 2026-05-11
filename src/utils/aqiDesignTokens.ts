import type { AirQualityStatus, AirQualityTheme, RecommendationInfo } from '../types';

export interface AqiRangeToken {
  min: number;
  max: number | null;
  status: AirQualityStatus;
  label: string;
}

export interface AqiStatusCopy {
  label: string;
  shortLabel: string;
  shareLabel: string;
  heroLabel: string;
  description: string;
}

export const AQI_RANGE_TOKENS: AqiRangeToken[] = [
  {
    min: 0,
    max: 50,
    status: 'good',
    label: 'Buena',
  },
  {
    min: 51,
    max: 100,
    status: 'moderate',
    label: 'Moderada',
  },
  {
    min: 101,
    max: 150,
    status: 'unhealthy-sensitive',
    label: 'Dañina para grupos sensibles',
  },
  {
    min: 151,
    max: 200,
    status: 'unhealthy',
    label: 'Dañina',
  },
  {
    min: 201,
    max: 300,
    status: 'very-unhealthy',
    label: 'Muy dañina',
  },
  {
    min: 301,
    max: null,
    status: 'hazardous',
    label: 'Peligrosa',
  },
];

export const AQI_THEME_TOKENS: Record<AirQualityStatus, AirQualityTheme> = {
  good: {
    primary: '#4ade80',
    secondary: '#10b981',
    background: '#f0fdf4',
    text: '#166534',
    gradient: 'from-green-400 to-emerald-500',
  },
  moderate: {
    primary: '#fbbf24',
    secondary: '#f59e0b',
    background: '#fffbeb',
    text: '#92400e',
    gradient: 'from-amber-400 to-yellow-500',
  },
  'unhealthy-sensitive': {
    primary: '#fb923c',
    secondary: '#f97316',
    background: '#fff7ed',
    text: '#9a3412',
    gradient: 'from-orange-400 to-orange-500',
  },
  unhealthy: {
    primary: '#f87171',
    secondary: '#ef4444',
    background: '#fef2f2',
    text: '#b91c1c',
    gradient: 'from-red-400 to-red-500',
  },
  'very-unhealthy': {
    primary: '#c084fc',
    secondary: '#a855f7',
    background: '#faf5ff',
    text: '#7e22ce',
    gradient: 'from-purple-400 to-purple-500',
  },
  hazardous: {
    primary: '#9f1239',
    secondary: '#881337',
    background: '#fff1f2',
    text: '#9f1239',
    gradient: 'from-rose-700 to-rose-800',
  },
  unknown: {
    primary: '#64748b',
    secondary: '#475569',
    background: '#f8fafc',
    text: '#334155',
    gradient: 'from-slate-400 to-slate-500',
  },
};

export const AQI_STATUS_COPY: Record<AirQualityStatus, AqiStatusCopy> = {
  good: {
    label: 'Buena',
    shortLabel: 'Buena',
    shareLabel: 'Buena',
    heroLabel: 'Aire limpio',
    description:
      'La calidad del aire es satisfactoria y representa poco o ningún riesgo para la salud.',
  },
  moderate: {
    label: 'Moderada',
    shortLabel: 'Mod.',
    shareLabel: 'Moderada',
    heroLabel: 'Moderada',
    description:
      'La calidad del aire es aceptable, pero puede haber un riesgo moderado para algunas personas sensibles.',
  },
  'unhealthy-sensitive': {
    label: 'Dañina para grupos sensibles',
    shortLabel: 'Sensibles',
    shareLabel: 'Dañina para grupos sensibles',
    heroLabel: 'Sensibles',
    description:
      'Miembros de grupos sensibles pueden experimentar efectos en la salud. El público en general no suele verse afectado.',
  },
  unhealthy: {
    label: 'Dañina',
    shortLabel: 'Dañina',
    shareLabel: 'Dañina',
    heroLabel: 'Dañina',
    description:
      'Todo el mundo puede comenzar a experimentar efectos en la salud. Las personas sensibles pueden experimentar efectos más graves.',
  },
  'very-unhealthy': {
    label: 'Muy dañina',
    shortLabel: 'Muy dañina',
    shareLabel: 'Muy dañina',
    heroLabel: 'Muy dañina',
    description:
      'Advertencias sanitarias de condiciones de emergencia. Es más probable que toda la población se vea afectada.',
  },
  hazardous: {
    label: 'Peligrosa',
    shortLabel: 'Peligrosa',
    shareLabel: 'Peligrosa',
    heroLabel: 'Peligrosa',
    description:
      'Alerta sanitaria: todos pueden experimentar efectos más graves para la salud. Se recomienda evitar cualquier actividad al aire libre.',
  },
  unknown: {
    label: 'Sin lectura',
    shortLabel: 'N/D',
    shareLabel: 'No disponible',
    heroLabel: 'Sin lectura disponible',
    description: 'No hay una lectura confiable disponible para esta ciudad en este momento.',
  },
};

export const AQI_STATUS_SHARE_LABELS: Record<AirQualityStatus, string> = {
  good: AQI_STATUS_COPY.good.shareLabel,
  moderate: AQI_STATUS_COPY.moderate.shareLabel,
  'unhealthy-sensitive': AQI_STATUS_COPY['unhealthy-sensitive'].shareLabel,
  unhealthy: AQI_STATUS_COPY.unhealthy.shareLabel,
  'very-unhealthy': AQI_STATUS_COPY['very-unhealthy'].shareLabel,
  hazardous: AQI_STATUS_COPY.hazardous.shareLabel,
  unknown: AQI_STATUS_COPY.unknown.shareLabel,
};

export const AQI_STATUS_DESCRIPTIONS: Record<AirQualityStatus, string> = {
  good: AQI_STATUS_COPY.good.description,
  moderate: AQI_STATUS_COPY.moderate.description,
  'unhealthy-sensitive': AQI_STATUS_COPY['unhealthy-sensitive'].description,
  unhealthy: AQI_STATUS_COPY.unhealthy.description,
  'very-unhealthy': AQI_STATUS_COPY['very-unhealthy'].description,
  hazardous: AQI_STATUS_COPY.hazardous.description,
  unknown: AQI_STATUS_COPY.unknown.description,
};

export const AQI_RECOMMENDATIONS: Record<AirQualityStatus, RecommendationInfo[]> = {
  good: [
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
  ],
  moderate: [
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
  ],
  'unhealthy-sensitive': [
    {
      icon: 'IoAlert',
      title: 'Grupos sensibles',
      description:
        'Niños, adultos mayores y personas con problemas respiratorios deben limitar el tiempo al aire libre.',
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
  ],
  unhealthy: [
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
  ],
  'very-unhealthy': [
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
  ],
  hazardous: [
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
  ],
  unknown: [
    {
      icon: 'IoHelpCircle',
      title: 'Dato no disponible',
      description: 'No hay una lectura confiable para esta ciudad en este momento.',
    },
    {
      icon: 'IoRefresh',
      title: 'Intenta actualizar',
      description: 'Puedes refrescar la consulta o revisar otra ciudad monitoreada.',
    },
    {
      icon: 'IoInformationCircle',
      title: 'Consulta fuentes oficiales',
      description: 'Si necesitas tomar una decisión sensible, revisa también fuentes oficiales.',
    },
  ],
};
