import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  IoBodyOutline,
  IoChevronDownOutline,
  IoCloudOutline,
  IoHelpCircleOutline,
  IoHappyOutline,
  IoInformationCircleOutline,
  IoLeafOutline,
  IoRefreshOutline,
  IoSadOutline,
  IoSkullOutline,
  IoTimeOutline,
  IoWarningOutline,
} from 'react-icons/io5';
import { AirQualityData, AirQualityStatus } from '../types';
import {
  getHumidityIcon,
  getMainPollutantIcon,
  getPollutantInfo,
  getWeatherIconUrl,
  getWindIcon,
} from '../utils/airQualityUtils';
import {
  AQI_RECOMMENDATIONS,
  AQI_STATUS_COPY,
  AQI_THEME_TOKENS,
} from '../utils/aqiDesignTokens';
import { useAirQuality } from '../context/AirQualityContext';

interface AirQualityCardProps {
  data: AirQualityData;
  className?: string;
}

const STATUS_CLASSES: Record<
  AirQualityStatus,
  {
    gradient: string;
    accent: string;
    accentText: string;
    softBg: string;
    ring: string;
    chip: string;
    chart: string;
  }
> = {
  good: {
    gradient: 'from-emerald-500 via-green-500 to-teal-500',
    accent: 'text-emerald-600',
    accentText: 'text-emerald-700',
    softBg: 'bg-emerald-50',
    ring: 'ring-emerald-200',
    chip: 'bg-emerald-700/80',
    chart: 'text-emerald-600',
  },
  moderate: {
    gradient: 'from-amber-400 via-yellow-500 to-orange-400',
    accent: 'text-amber-600',
    accentText: 'text-amber-700',
    softBg: 'bg-amber-50',
    ring: 'ring-amber-200',
    chip: 'bg-amber-700/70',
    chart: 'text-amber-600',
  },
  'unhealthy-sensitive': {
    gradient: 'from-orange-500 via-orange-500 to-amber-500',
    accent: 'text-orange-600',
    accentText: 'text-orange-700',
    softBg: 'bg-orange-50',
    ring: 'ring-orange-200',
    chip: 'bg-orange-700/75',
    chart: 'text-orange-600',
  },
  unhealthy: {
    gradient: 'from-rose-600 via-red-500 to-orange-500',
    accent: 'text-rose-600',
    accentText: 'text-rose-700',
    softBg: 'bg-rose-50',
    ring: 'ring-rose-200',
    chip: 'bg-rose-900/65',
    chart: 'text-rose-600',
  },
  'very-unhealthy': {
    gradient: 'from-purple-700 via-fuchsia-600 to-purple-500',
    accent: 'text-purple-600',
    accentText: 'text-purple-700',
    softBg: 'bg-purple-50',
    ring: 'ring-purple-200',
    chip: 'bg-purple-950/60',
    chart: 'text-purple-600',
  },
  hazardous: {
    gradient: 'from-rose-950 via-rose-800 to-red-700',
    accent: 'text-rose-800',
    accentText: 'text-rose-900',
    softBg: 'bg-rose-50',
    ring: 'ring-rose-300',
    chip: 'bg-black/35',
    chart: 'text-rose-800',
  },
  unknown: {
    gradient: 'from-slate-600 via-slate-500 to-slate-400',
    accent: 'text-slate-600',
    accentText: 'text-slate-700',
    softBg: 'bg-slate-50',
    ring: 'ring-slate-200',
    chip: 'bg-slate-800/45',
    chart: 'text-slate-600',
  },
};

function formatTime(timestamp: string | null | undefined) {
  if (!timestamp) {
    return 'N/D';
  }

  const parsedDate = new Date(timestamp);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'N/D';
  }

  return parsedDate.toLocaleTimeString('es-MX', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatNullableMetric(value: number | null | undefined, suffix: string) {
  if (value === null || value === undefined) {
    return 'N/D';
  }

  return `${value}${suffix}`;
}

function getStatusIcon(status: AirQualityStatus, className: string) {
  switch (status) {
    case 'good':
      return <IoHappyOutline className={className} aria-label="Aire limpio" />;
    case 'moderate':
      return <IoLeafOutline className={className} aria-label="Moderada" />;
    case 'unhealthy-sensitive':
      return <IoBodyOutline className={className} aria-label="Sensibles" />;
    case 'unhealthy':
      return <IoSadOutline className={className} aria-label="Danina" />;
    case 'very-unhealthy':
      return <IoSkullOutline className={className} aria-label="Muy danina" />;
    case 'hazardous':
      return <IoWarningOutline className={className} aria-label="Peligrosa" />;
    default:
      return <IoHelpCircleOutline className={className} aria-label="Sin lectura" />;
  }
}

function getFreshnessLabel(data: AirQualityData) {
  switch (data.measurementFreshness) {
    case 'stale':
      return 'Medicion';
    case 'degraded':
      return 'Medicion';
    case 'unknown':
      return 'Medicion';
    default:
      return 'Medicion';
  }
}

export default function AirQualityCard({ data, className = '' }: AirQualityCardProps) {
  const [showDetails, setShowDetails] = useState<boolean>(true);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const [hasMounted, setHasMounted] = useState(false);
  const { refreshData } = useAirQuality();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const status = data.status || 'unknown';
  const copy = AQI_STATUS_COPY[status];
  const theme = AQI_THEME_TOKENS[status];
  const classes = STATUS_CLASSES[status];
  const isUnknown = status === 'unknown';
  const mainRecommendation = AQI_RECOMMENDATIONS[status][0];
  const aqiLabel = isUnknown ? AQI_STATUS_COPY.unknown.shortLabel : data.aqi;
  const mainPollutantLabel = data.main_pollutant_us
    ? getPollutantInfo(data.main_pollutant_us).name
    : 'N/D';
  const measurementTime = isUnknown ? 'N/D' : formatTime(data.timestamp);
  const pipelineTime = data.last_successful_update_at
    ? formatTime(data.last_successful_update_at)
    : 'N/D';

  return (
    <motion.section
      layout
      className={`overflow-hidden rounded-[1.35rem] bg-white shadow-[0_18px_45px_rgba(15,23,42,0.14)] ring-1 dark:bg-slate-800 ${classes.ring} ${className}`}
      aria-label={`Calidad del aire en ${data.location.name}: ${copy.label}`}
    >
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${classes.gradient} px-6 py-6 text-white sm:px-8`}
      >
        <div className="absolute inset-0 bg-[url('/images/seo/share-image.png')] bg-[length:125%_auto] bg-[right_center] bg-no-repeat opacity-30 mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/5 to-transparent" />
        <div className="absolute -right-24 bottom-0 h-44 w-64 rounded-full bg-white/20 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-2xl font-bold leading-none tracking-normal sm:text-3xl">
                {data.location.name}
              </p>
              <p className="mt-2 text-sm font-semibold text-white/90">
                Contaminante principal: <span className="font-black">{mainPollutantLabel}</span>
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.04 }}
              onClick={() => refreshData()}
              className="rounded-full bg-white/20 p-2 text-white shadow-sm backdrop-blur-md transition hover:bg-white/30"
              aria-label="Refrescar datos"
              type="button"
            >
              <IoRefreshOutline className="h-5 w-5" />
            </motion.button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-end gap-2">
              <motion.div
                key={String(aqiLabel)}
                initial={hasMounted ? { opacity: 0, scale: 0.95 } : false}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="text-[4.8rem] font-black leading-[0.86] tracking-normal text-white drop-shadow-lg sm:text-8xl"
              >
                {aqiLabel}
              </motion.div>
              <div className="mb-1 text-xl font-medium leading-tight text-white/95 sm:text-2xl">
                <span className="block">AQI</span>
                <span className="block">US</span>
              </div>
            </div>

            <div
              className={`flex shrink-0 items-center gap-2 rounded-full ${classes.chip} px-4 py-3 text-white shadow-lg backdrop-blur-md`}
              style={{ backgroundColor: isUnknown ? undefined : `${theme.secondary}cc` }}
            >
              {getStatusIcon(status, 'h-7 w-7 shrink-0')}
              <span className="whitespace-nowrap text-lg font-black">{copy.heroLabel}</span>
            </div>
          </div>

          <p className="mt-5 max-w-[28rem] text-lg font-medium leading-snug text-white sm:text-xl">
            {copy.description}
          </p>

          {mainRecommendation && (
            <p className="mt-3 max-w-[28rem] rounded-2xl bg-white/14 px-4 py-3 text-sm font-semibold leading-snug text-white backdrop-blur-md">
              {isUnknown ? mainRecommendation.description : mainRecommendation.description}
            </p>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3 sm:max-w-sm">
            <InfoPill
              icon={<IoTimeOutline className={`h-6 w-6 ${classes.accent}`} />}
              label={getFreshnessLabel(data)}
              value={measurementTime}
            />
            <InfoPill
              icon={<PulseIcon className={`h-6 w-6 ${classes.accent}`} />}
              label="Pipeline"
              value={pipelineTime}
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/30"
          type="button"
          aria-expanded={showDetails}
        >
          <span className="flex items-center gap-3">
            <IoLeafOutline className={`h-7 w-7 ${classes.chart}`} />
            <span className="text-xl font-black text-slate-950 dark:text-white">
              Detalles ambientales
            </span>
          </span>
          <motion.span animate={{ rotate: showDetails ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <IoChevronDownOutline className="h-6 w-6 text-slate-500 dark:text-slate-400" />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mx-4 mb-4 grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                <DetailItem
                  label="Temperatura"
                  value={formatNullableMetric(data.temperature, ' °C')}
                  accentClass={classes.accent}
                  softBgClass={classes.softBg}
                  weatherIcon={data.weather_icon}
                  useWeatherIconAsMainIcon={true}
                />
                <DetailItem
                  label="Humedad"
                  value={formatNullableMetric(data.humidity, ' %')}
                  accentClass="text-blue-600"
                  softBgClass="bg-blue-50"
                  useHumidityIcon={true}
                  humidityValue={data.humidity}
                />
                <DetailItem
                  label="Viento"
                  value={formatNullableMetric(data.wind?.speed, ' km/h')}
                  accentClass="text-blue-600"
                  softBgClass="bg-blue-50"
                  useWindIcon={true}
                  windSpeed={data.wind?.speed}
                  windDirection={data.wind?.direction}
                />
                <DetailItem
                  useMainPollutantIcon={true}
                  label="Contaminante"
                  value={mainPollutantLabel}
                  accentClass={classes.accent}
                  softBgClass={isUnknown ? 'bg-slate-100' : 'bg-purple-50'}
                  tooltipText={
                    data.main_pollutant_us
                      ? getPollutantInfo(data.main_pollutant_us).description
                      : 'No hay informacion disponible sobre el contaminante principal.'
                  }
                />
              </div>
              {isUnknown && (
                <p className="px-5 pb-4 text-sm font-medium text-slate-500 dark:text-slate-300">
                  Los datos ambientales son informativos y no sustituyen una lectura de AQI.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

interface InfoPillProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoPill({ icon, label, value }: InfoPillProps) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl bg-white/92 px-4 py-3 text-slate-950 shadow-sm backdrop-blur-md">
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-slate-500">{label}</span>
        <span className="block truncate text-base font-black">{value}</span>
      </span>
    </div>
  );
}

function PulseIcon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
      <path
        d="M3 12h4l2.5-6 5 12L17 12h4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

interface DetailItemProps {
  label: string;
  value: string;
  accentClass: string;
  softBgClass: string;
  weatherIcon?: string | null;
  useWeatherIconAsMainIcon?: boolean;
  tooltipText?: string;
  useHumidityIcon?: boolean;
  humidityValue?: number | null;
  useWindIcon?: boolean;
  windSpeed?: number | null;
  windDirection?: number | null;
  useMainPollutantIcon?: boolean;
}

function DetailItem({
  label,
  value,
  weatherIcon,
  useWeatherIconAsMainIcon,
  tooltipText,
  useHumidityIcon,
  humidityValue,
  useWindIcon,
  windSpeed,
  windDirection,
  useMainPollutantIcon,
  accentClass,
  softBgClass,
}: DetailItemProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const iconNode = (() => {
    if (useWeatherIconAsMainIcon && weatherIcon) {
      return <img src={getWeatherIconUrl(weatherIcon)} alt="Clima" className="h-9 w-9" />;
    }

    if (useHumidityIcon && humidityValue !== null && humidityValue !== undefined) {
      return <img src={getHumidityIcon(humidityValue)} alt="Humedad" className="h-9 w-9" />;
    }

    if (
      useWindIcon
      && windSpeed !== null
      && windSpeed !== undefined
      && windDirection !== null
      && windDirection !== undefined
    ) {
      const windIcon = getWindIcon(windSpeed, windDirection);
      return (
        <img
          src={windIcon.icon}
          alt="Viento"
          className="h-9 w-9"
          style={{ transform: `rotate(${windIcon.rotation}deg)` }}
        />
      );
    }

    if (useMainPollutantIcon) {
      return <img src={getMainPollutantIcon()} alt="Contaminante" className="h-9 w-9" />;
    }

    return <IoCloudOutline className={`h-7 w-7 ${accentClass}`} />;
  })();

  return (
    <div className="relative flex min-w-0 items-center gap-2 border-b border-r border-slate-200 p-3 last:border-r-0 even:border-r-0 [&:nth-last-child(-n+2)]:border-b-0 dark:border-slate-700">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${softBgClass}`}>
        {iconNode}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-300">{label}</p>
          {tooltipText && (
            <div className="relative">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => setShowTooltip(!showTooltip)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                type="button"
                aria-label={`Informacion sobre ${label}`}
              >
                <IoInformationCircleOutline className="h-4 w-4" />
              </button>
              <AnimatePresence>
                {showTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute bottom-full right-0 z-20 mb-2 w-44 rounded-lg bg-white p-2 text-xs text-slate-800 shadow-lg ring-1 ring-slate-200 dark:bg-slate-700 dark:text-white dark:ring-slate-600"
                  >
                    {tooltipText}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
        <p className="truncate text-xl font-black text-slate-950 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
