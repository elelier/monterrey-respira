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
import {
  formatNullableNumber,
  formatNullableTimestamp,
  getUnknownStateCopy,
  hasReliableAqi,
} from '../utils/airQualityDisplay';
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
    heroOverlay: string;
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
    heroOverlay: 'from-emerald-500/95 via-emerald-500/82 to-teal-500/18',
  },
  moderate: {
    gradient: 'from-amber-400 via-yellow-500 to-orange-400',
    accent: 'text-amber-600',
    accentText: 'text-amber-700',
    softBg: 'bg-amber-50',
    ring: 'ring-amber-200',
    chip: 'bg-amber-700/70',
    chart: 'text-amber-600',
    heroOverlay: 'from-amber-400/95 via-yellow-500/82 to-orange-300/18',
  },
  'unhealthy-sensitive': {
    gradient: 'from-orange-500 via-orange-500 to-amber-500',
    accent: 'text-orange-600',
    accentText: 'text-orange-700',
    softBg: 'bg-orange-50',
    ring: 'ring-orange-200',
    chip: 'bg-orange-700/75',
    chart: 'text-orange-600',
    heroOverlay: 'from-orange-500/95 via-orange-500/82 to-amber-400/18',
  },
  unhealthy: {
    gradient: 'from-rose-600 via-red-500 to-orange-500',
    accent: 'text-rose-600',
    accentText: 'text-rose-700',
    softBg: 'bg-rose-50',
    ring: 'ring-rose-200',
    chip: 'bg-rose-900/65',
    chart: 'text-rose-600',
    heroOverlay: 'from-rose-600/95 via-red-500/82 to-orange-500/18',
  },
  'very-unhealthy': {
    gradient: 'from-purple-700 via-fuchsia-600 to-purple-500',
    accent: 'text-purple-600',
    accentText: 'text-purple-700',
    softBg: 'bg-purple-50',
    ring: 'ring-purple-200',
    chip: 'bg-purple-950/60',
    chart: 'text-purple-600',
    heroOverlay: 'from-purple-700/95 via-fuchsia-600/82 to-purple-500/18',
  },
  hazardous: {
    gradient: 'from-rose-950 via-rose-800 to-red-700',
    accent: 'text-rose-800',
    accentText: 'text-rose-900',
    softBg: 'bg-rose-50',
    ring: 'ring-rose-300',
    chip: 'bg-black/35',
    chart: 'text-rose-800',
    heroOverlay: 'from-rose-950/95 via-rose-800/86 to-red-700/20',
  },
  unknown: {
    gradient: 'from-slate-600 via-slate-500 to-slate-400',
    accent: 'text-slate-600',
    accentText: 'text-slate-700',
    softBg: 'bg-slate-50',
    ring: 'ring-slate-200',
    chip: 'bg-slate-800/45',
    chart: 'text-slate-600',
    heroOverlay: 'from-slate-700/95 via-slate-600/84 to-slate-400/22',
  },
};

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
      return 'Ultima medicion';
    case 'degraded':
      return 'Ultima medicion';
    case 'unknown':
      return 'Ultima medicion';
    default:
      return 'Ultima medicion';
  }
}

export default function AirQualityCard({ data, className = '' }: AirQualityCardProps) {
  const [showDetails, setShowDetails] = useState<boolean>(true);
  const [hasMounted, setHasMounted] = useState(false);
  const { refreshData } = useAirQuality();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const reliableAqi = hasReliableAqi(data);
  const status = reliableAqi ? data.status : 'unknown';
  const copy = reliableAqi ? AQI_STATUS_COPY[status] : getUnknownStateCopy();
  const theme = AQI_THEME_TOKENS[status];
  const classes = STATUS_CLASSES[status];
  const isUnknown = status === 'unknown';
  const aqiLabel = reliableAqi ? formatNullableNumber(data.aqi) : AQI_STATUS_COPY.unknown.shortLabel;
  const mainPollutantLabel = data.main_pollutant_us
    ? getPollutantInfo(data.main_pollutant_us).name
    : 'N/D';
  const measurementTime = reliableAqi ? formatNullableTimestamp(data.timestamp) : 'N/D';

  return (
    <motion.section
      layout
      className={`space-y-2 sm:space-y-3 ${className}`}
      aria-label={`Calidad del aire en ${data.location.name}: ${copy.label}`}
    >
      <div
        className={`relative min-h-[26.25rem] overflow-hidden rounded-[1.35rem] bg-gradient-to-br ${classes.gradient} px-5 py-5 text-white shadow-[0_16px_34px_rgba(15,23,42,0.18)] ring-1 ${classes.ring} sm:min-h-[25rem] sm:rounded-[1.6rem] sm:px-8 sm:py-7`}
      >
        <div
          className="absolute inset-0 bg-[url('/images/monterrey-cerro-silla.jpg')] bg-cover bg-[70%_100%] opacity-95"
          aria-hidden="true"
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${classes.heroOverlay}`} aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-white/18" aria-hidden="true" />

        <div className="relative z-10">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[1.42rem] font-black leading-tight tracking-normal sm:text-4xl">
                {data.location.name}
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => refreshData()}
              className="rounded-full bg-white/16 p-2 text-white/95 shadow-sm backdrop-blur-md transition hover:bg-white/25"
              aria-label="Refrescar datos"
              type="button"
            >
              <IoRefreshOutline className="h-5 w-5" />
            </motion.button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-end gap-3">
              <motion.div
                key={String(aqiLabel)}
                initial={hasMounted ? { opacity: 0, scale: 0.95 } : false}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="text-[5.85rem] font-black leading-[0.78] tracking-normal text-white drop-shadow-xl sm:text-9xl"
              >
                {aqiLabel}
              </motion.div>
              <div className="mb-2 text-[1.45rem] font-medium leading-tight text-white/95 sm:text-3xl">
                <span className="block">AQI</span>
                <span className="block">US</span>
              </div>
            </div>

            <div
              className={`flex shrink-0 items-center gap-2 rounded-full ${classes.chip} px-4 py-3 text-white shadow-lg backdrop-blur-md sm:px-5 sm:py-4`}
              style={{ backgroundColor: isUnknown ? undefined : `${theme.secondary}cc` }}
            >
              {getStatusIcon(status, 'h-7 w-7 shrink-0 sm:h-9 sm:w-9')}
              <span className="whitespace-nowrap text-[1.08rem] font-black sm:text-2xl">{copy.heroLabel}</span>
            </div>
          </div>

          <p className="mt-5 text-[1rem] font-semibold leading-tight text-white/95 sm:text-xl">
            Contaminante principal: <span className="font-semibold sm:font-black">{mainPollutantLabel}</span>
          </p>

          <p className="mt-3 max-w-[34rem] text-[0.98rem] font-medium leading-snug text-white sm:text-xl">
            {copy.description}
          </p>

          <div className="mt-4 max-w-[16.5rem]">
            <InfoPill
              icon={<IoTimeOutline className="h-6 w-6" />}
              label={getFreshnessLabel(data)}
              value={measurementTime}
            />
          </div>
        </div>
      </div>

      <div
        className={`overflow-hidden rounded-[1.15rem] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.10)] ring-1 dark:bg-slate-800 ${classes.ring} sm:rounded-[1.35rem]`}
      >
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/30 sm:px-6 sm:py-5"
          type="button"
          aria-expanded={showDetails}
        >
          <span className="flex items-center gap-3">
            <IoLeafOutline className={`h-7 w-7 ${classes.chart} sm:h-8 sm:w-8`} />
            <span className="text-[1.2rem] font-black text-slate-950 dark:text-white sm:text-2xl">
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
              <div className="mx-4 mb-4 grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 sm:mx-5 sm:mb-5">
                <DetailItem
                  label="Temperatura"
                  value={formatNullableNumber(data.temperature, ' °C', 1)}
                  accentClass={classes.accent}
                  softBgClass={classes.softBg}
                  weatherIcon={data.weather_icon}
                  useWeatherIconAsMainIcon={true}
                />
                <DetailItem
                  label="Humedad"
                  value={formatNullableNumber(data.humidity, ' %')}
                  accentClass="text-blue-600"
                  softBgClass="bg-blue-50"
                  useHumidityIcon={true}
                  humidityValue={data.humidity}
                />
                <DetailItem
                  label="Viento"
                  value={formatNullableNumber(data.wind?.speed, ' km/h', 1)}
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
    <div className="flex min-w-0 items-center gap-3 rounded-xl bg-white/95 px-3 py-2.5 text-slate-950 shadow-md backdrop-blur-md sm:rounded-2xl sm:px-4 sm:py-3">
      <span className="shrink-0 text-amber-500 [&>svg]:h-7 [&>svg]:w-7 sm:[&>svg]:h-8 sm:[&>svg]:w-8">{icon}</span>
      <span className="min-w-0">
        <span className="block truncate text-[0.78rem] font-semibold text-slate-500 sm:text-sm">{label}</span>
        <span className="block text-[0.9rem] font-black leading-tight sm:text-lg">{value}</span>
      </span>
    </div>
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
      return <img src={getWeatherIconUrl(weatherIcon)} alt="Clima" className="h-8 w-8 sm:h-10 sm:w-10" />;
    }

    if (useHumidityIcon && humidityValue !== null && humidityValue !== undefined) {
      return <img src={getHumidityIcon(humidityValue)} alt="Humedad" className="h-8 w-8 sm:h-10 sm:w-10" />;
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
          className="h-8 w-8 sm:h-10 sm:w-10"
          style={{ transform: `rotate(${windIcon.rotation}deg)` }}
        />
      );
    }

    if (useMainPollutantIcon) {
      return <img src={getMainPollutantIcon()} alt="Contaminante" className="h-8 w-8 sm:h-10 sm:w-10" />;
    }

    return <IoCloudOutline className={`h-7 w-7 ${accentClass}`} />;
  })();

  return (
    <div className="relative flex min-w-0 items-center gap-3 border-b border-r border-slate-200 p-3 last:border-r-0 even:border-r-0 [&:nth-last-child(-n+2)]:border-b-0 dark:border-slate-700 sm:gap-4 sm:p-4">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${softBgClass} sm:h-14 sm:w-14`}>
        {iconNode}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className="truncate text-[0.85rem] font-semibold text-slate-500 dark:text-slate-300 sm:text-base">{label}</p>
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
        <p className="truncate text-[1.25rem] font-black text-slate-950 dark:text-white sm:text-2xl">{value}</p>
      </div>
    </div>
  );
}

