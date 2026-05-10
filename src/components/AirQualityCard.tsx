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
      className={`space-y-2 sm:space-y-3 ${className}`}
      aria-label={`Calidad del aire en ${data.location.name}: ${copy.label}`}
    >
      <div
        className={`relative h-[12.25rem] overflow-hidden rounded-[1.15rem] bg-gradient-to-br ${classes.gradient} px-4 py-3 text-white shadow-[0_12px_26px_rgba(15,23,42,0.14)] ring-1 ${classes.ring} sm:h-auto sm:rounded-[1.35rem] sm:px-8 sm:py-6`}
      >
        <div
          className="absolute inset-0 bg-[url('/images/monterrey-cerro-silla.jpg')] bg-cover bg-[78%_100%] opacity-95"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(100deg, ${theme.primary} 0%, ${theme.primary}f7 36%, ${theme.primary}d9 51%, ${theme.secondary}55 68%, transparent 100%)`,
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-white/10" />

        <div className="relative z-10">
          <div className="mb-1.5 flex items-start justify-between gap-3">
            <div>
              <p className="text-[1.18rem] font-semibold leading-none tracking-normal sm:text-3xl sm:font-bold">
                {data.location.name}
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.04 }}
              onClick={() => refreshData()}
              className="absolute right-0 top-0 hidden rounded-full bg-white/20 p-2 text-white shadow-sm backdrop-blur-md transition hover:bg-white/30 sm:block"
              aria-label="Refrescar datos"
              type="button"
            >
              <IoRefreshOutline className="h-5 w-5" />
            </motion.button>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-end gap-2">
              <motion.div
                key={String(aqiLabel)}
                initial={hasMounted ? { opacity: 0, scale: 0.95 } : false}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="text-[3.55rem] font-black leading-[0.82] tracking-normal text-white drop-shadow-lg sm:text-8xl"
              >
                {aqiLabel}
              </motion.div>
              <div className="mb-1 text-[1.05rem] font-medium leading-tight text-white/95 sm:text-2xl">
                <span className="block">AQI</span>
                <span className="block">US</span>
              </div>
            </div>

            <div
              className={`flex shrink-0 items-center gap-1.5 rounded-full ${classes.chip} px-2.5 py-2 text-white shadow-lg backdrop-blur-md sm:px-4 sm:py-3`}
              style={{ backgroundColor: isUnknown ? undefined : `${theme.secondary}cc` }}
            >
              {getStatusIcon(status, 'h-[1.1rem] w-[1.1rem] shrink-0 sm:h-7 sm:w-7')}
              <span className="whitespace-nowrap text-[0.84rem] font-semibold sm:text-lg sm:font-black">{copy.heroLabel}</span>
            </div>
          </div>

          <p className="mt-1 text-[0.76rem] font-medium leading-tight text-white/95 sm:text-base sm:font-semibold">
            Contaminante principal: <span className="font-semibold sm:font-black">{mainPollutantLabel}</span>
          </p>

          <p className="mt-1 max-w-[28rem] text-[0.72rem] font-normal leading-snug text-white sm:text-xl sm:font-medium">
            {copy.description}
          </p>

          <div className="mt-1.5 grid grid-cols-2 gap-2.5 sm:max-w-sm">
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

      <div
        className={`overflow-hidden rounded-[1.15rem] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.10)] ring-1 dark:bg-slate-800 ${classes.ring} sm:rounded-[1.35rem]`}
      >
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex w-full items-center justify-between px-4 py-1 text-left hover:bg-slate-50 dark:hover:bg-slate-700/30 sm:px-5 sm:py-4"
          type="button"
          aria-expanded={showDetails}
        >
          <span className="flex items-center gap-3">
            <IoLeafOutline className={`h-[1.125rem] w-[1.125rem] ${classes.chart} sm:h-7 sm:w-7`} />
            <span className="text-[0.96rem] font-semibold text-slate-950 dark:text-white sm:text-xl sm:font-black">
              Detalles ambientales
            </span>
          </span>
          <motion.span animate={{ rotate: showDetails ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <IoChevronDownOutline className="h-5 w-5 text-slate-500 dark:text-slate-400" />
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
              <div className="mx-3 mb-2 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 sm:mx-4 sm:mb-4 sm:rounded-2xl">
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
    <div className="flex min-w-0 items-center gap-2 rounded-lg bg-white/95 px-2.5 py-1.5 text-slate-950 shadow-sm backdrop-blur-md sm:rounded-xl sm:px-4 sm:py-3">
      <span className="shrink-0 [&>svg]:h-[1.125rem] [&>svg]:w-[1.125rem] sm:[&>svg]:h-6 sm:[&>svg]:w-6">{icon}</span>
      <span className="min-w-0">
        <span className="block truncate text-[0.68rem] font-medium text-slate-500 sm:text-sm">{label}</span>
        <span className="block truncate text-[0.78rem] font-semibold sm:text-base sm:font-black">{value}</span>
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
      return <img src={getWeatherIconUrl(weatherIcon)} alt="Clima" className="h-[1.125rem] w-[1.125rem] sm:h-9 sm:w-9" />;
    }

    if (useHumidityIcon && humidityValue !== null && humidityValue !== undefined) {
      return <img src={getHumidityIcon(humidityValue)} alt="Humedad" className="h-[1.125rem] w-[1.125rem] sm:h-9 sm:w-9" />;
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
          className="h-[1.125rem] w-[1.125rem] sm:h-9 sm:w-9"
          style={{ transform: `rotate(${windIcon.rotation}deg)` }}
        />
      );
    }

    if (useMainPollutantIcon) {
      return <img src={getMainPollutantIcon()} alt="Contaminante" className="h-[1.125rem] w-[1.125rem] sm:h-9 sm:w-9" />;
    }

    return <IoCloudOutline className={`h-7 w-7 ${accentClass}`} />;
  })();

  return (
    <div className="relative flex min-w-0 items-center gap-1.5 border-b border-r border-slate-200 p-1 last:border-r-0 even:border-r-0 [&:nth-last-child(-n+2)]:border-b-0 dark:border-slate-700 sm:gap-2 sm:p-3">
      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${softBgClass} sm:h-12 sm:w-12`}>
        {iconNode}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className="truncate text-[0.64rem] font-medium text-slate-500 dark:text-slate-300 sm:text-sm">{label}</p>
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
        <p className="truncate text-[0.78rem] font-semibold text-slate-950 dark:text-white sm:text-xl sm:font-black">{value}</p>
      </div>
    </div>
  );
}
