import {
  IoBicycleOutline,
  IoChevronForwardOutline,
  IoHelpCircleOutline,
  IoHomeOutline,
  IoLeafOutline,
  IoMedicalOutline,
  IoSunnyOutline,
  IoWalkOutline,
  IoWarningOutline,
} from 'react-icons/io5';
import { AirQualityStatus } from '../types';
import { AQI_RECOMMENDATIONS, AQI_THEME_TOKENS } from '../utils/aqiDesignTokens';

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
  const theme = AQI_THEME_TOKENS[status];

  return (
    <section
      className={`rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-800 ${className}`}
      aria-labelledby="recommendations-title"
    >
      <div className="mb-3 flex items-center gap-3">
        <IoLeafOutline className={`h-7 w-7 ${classes.accent}`} />
        <h2 id="recommendations-title" className="text-xl font-black text-slate-950 dark:text-white">
          Recomendaciones
        </h2>
      </div>

      <div className="space-y-2">
        {recommendations.map((recommendation) => (
          <article
            key={`${recommendation.title}-${recommendation.icon}`}
            className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border ${classes.border} ${classes.bg} px-3 py-3`}
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${classes.iconBg}`}>
              {getRecommendationIcon(recommendation.icon, `h-7 w-7 ${classes.accent}`)}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-black leading-tight text-slate-950 dark:text-white">
                {recommendation.title}
              </h3>
              <p className="line-clamp-2 text-sm leading-snug text-slate-600 dark:text-slate-300">
                {recommendation.description}
              </p>
            </div>
            <IoChevronForwardOutline
              className="h-6 w-6 shrink-0"
              style={{ color: theme.secondary }}
              aria-hidden="true"
            />
          </article>
        ))}
      </div>
    </section>
  );
}
