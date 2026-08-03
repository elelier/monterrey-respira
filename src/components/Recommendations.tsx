import {
  IoBicycleOutline,
  IoHelpCircleOutline,
  IoHomeOutline,
  IoLeafOutline,
  IoMedicalOutline,
  IoSunnyOutline,
  IoWalkOutline,
  IoWarningOutline,
} from 'react-icons/io5';
import { AirQualityStatus } from '../types';
import { AQI_RECOMMENDATIONS } from '../utils/aqiDesignTokens';

interface RecommendationsProps {
  status: AirQualityStatus;
  className?: string;
}

const STATUS_CLASSES: Record<
  AirQualityStatus,
  { accent: string; bg: string; border: string; iconBg: string }
> = {
  good: {
    accent: 'text-emerald-600',
    bg: 'bg-emerald-50/80',
    border: 'border-emerald-100',
    iconBg: 'bg-emerald-100',
  },
  moderate: {
    accent: 'text-amber-600',
    bg: 'bg-amber-50/80',
    border: 'border-amber-100',
    iconBg: 'bg-amber-100',
  },
  'unhealthy-sensitive': {
    accent: 'text-orange-600',
    bg: 'bg-orange-50/80',
    border: 'border-orange-100',
    iconBg: 'bg-orange-100',
  },
  unhealthy: {
    accent: 'text-rose-600',
    bg: 'bg-rose-50/80',
    border: 'border-rose-100',
    iconBg: 'bg-rose-100',
  },
  'very-unhealthy': {
    accent: 'text-purple-600',
    bg: 'bg-purple-50/80',
    border: 'border-purple-100',
    iconBg: 'bg-purple-100',
  },
  hazardous: {
    accent: 'text-rose-800',
    bg: 'bg-rose-50/90',
    border: 'border-rose-100',
    iconBg: 'bg-rose-100',
  },
  unknown: {
    accent: 'text-slate-600',
    bg: 'bg-slate-50/90',
    border: 'border-slate-100',
    iconBg: 'bg-slate-100',
  },
};

function getRecommendationIcon(iconName: string, className: string) {
  switch (iconName) {
    case 'IoSunny':
      return <IoSunnyOutline className={className} />;
    case 'IoWalk':
      return <IoWalkOutline className={className} />;
    case 'IoHome':
      return <IoHomeOutline className={className} />;
    case 'IoMedical':
      return <IoMedicalOutline className={className} />;
    case 'IoAlert':
    case 'IoWarning':
      return <IoWarningOutline className={className} />;
    case 'IoHelpCircle':
    case 'IoRefresh':
    case 'IoInformationCircle':
      return <IoHelpCircleOutline className={className} />;
    default:
      return <IoBicycleOutline className={className} />;
  }
}

export default function Recommendations({ status, className = '' }: RecommendationsProps) {
  const recommendations = AQI_RECOMMENDATIONS[status].slice(0, 3);
  const classes = STATUS_CLASSES[status];

  return (
    <section
      className={`surface-card rounded-[1.15rem] p-3 sm:rounded-[1.35rem] sm:p-4 ${className}`}
      aria-labelledby="recommendations-title"
    >
      <div className="mb-3 flex items-center gap-2.5 sm:mb-4 sm:gap-3">
        <IoLeafOutline className={`h-[1.1rem] w-[1.1rem] ${classes.accent} sm:h-7 sm:w-7`} />
        <div>
          <h2 id="recommendations-title" className="text-[0.94rem] font-semibold leading-tight text-[var(--mty-text)] sm:text-xl sm:font-black">
            Recomendaciones
          </h2>
          <p className="mt-0.5 text-[0.62rem] leading-tight text-[var(--mty-muted-text)] sm:text-sm">
            Guía rápida según el AQI disponible.
          </p>
        </div>
      </div>

      <ul className="space-y-1.5 sm:space-y-2" aria-label="Recomendaciones de salud y actividad">
        {recommendations.map((recommendation) => (
          <li
            key={`${recommendation.title}-${recommendation.icon}`}
            className={`grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2 rounded-lg border ${classes.border} ${classes.bg} px-2.5 py-2 sm:gap-3 sm:rounded-2xl sm:px-3 sm:py-3`}
          >
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${classes.iconBg} sm:h-12 sm:w-12`}>
              {getRecommendationIcon(recommendation.icon, `h-4 w-4 ${classes.accent} sm:h-7 sm:w-7`)}
            </div>
            <div className="min-w-0">
              <h3 className="text-[0.76rem] font-semibold leading-tight text-[var(--mty-text)] sm:text-base sm:font-black">
                {recommendation.title}
              </h3>
              <p className="mt-0.5 text-[0.62rem] leading-snug text-[var(--mty-muted-text)] sm:text-sm">
                {recommendation.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
