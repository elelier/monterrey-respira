import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  IoBodyOutline,
  IoChevronDownOutline,
  IoCloudOutline,
  IoHelpCircleOutline,
  IoInformationCircleOutline,
  IoLeafOutline,
  IoRefreshOutline,
  IoSkullOutline,
  IoTimeOutline,
  IoWarningOutline,
} from 'react-icons/io5';
import { AirQualityData, AirQualityStatus } from '../types';
import {
  getAQIDescription,
  getHumidityIcon,
  getMainPollutantIcon,
  getPollutantInfo,
  getWeatherIconUrl,
  getWindIcon,
} from '../utils/airQualityUtils';
import { useAirQuality } from '../context/AirQualityContext';

interface AirQualityCardProps {
  data: AirQualityData;
  className?: string;
}

export default function AirQualityCard({ data, className = '' }: AirQualityCardProps) {
  const [dateTime, setDateTime] = useState<string>('');
  const [showDetails, setShowDetails] = useState<boolean>(true);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  const { refreshData } = useAirQuality();

  useEffect(() => {
    const timestamp = new Date(data.timestamp);
    const formattedDate = `${timestamp.toLocaleTimeString('es-MX', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })} - ${timestamp.toLocaleDateString('es-MX', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    })}`;
    setDateTime(formattedDate.replace(/^\w/, (character) => character.toUpperCase()));
  }, [data]);

  const getStatusStyle = (
    type: 'gradient' | 'iconColor' | 'bgColor' | 'textColor' | 'ringColor',
  ) => {
    const styles: Record<AirQualityStatus, Record<string, string>> = {
      good: {
        gradient: 'from-green-400 to-green-500',
        iconColor: 'text-green-600',
        bgColor: 'bg-green-500',
        textColor: 'text-green-700',
        ringColor: 'ring-green-500',
      },
      moderate: {
        gradient: 'from-yellow-400 to-yellow-500',
        iconColor: 'text-yellow-600',
        bgColor: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        ringColor: 'ring-yellow-500',
      },
      'unhealthy-sensitive': {
        gradient: 'from-orange-400 to-orange-500',
        iconColor: 'text-orange-600',
        bgColor: 'bg-orange-500',
        textColor: 'text-orange-700',
        ringColor: 'ring-orange-500',
      },
      unhealthy: {
        gradient: 'from-red-400 to-red-500',
        iconColor: 'text-red-600',
        bgColor: 'bg-red-500',
        textColor: 'text-red-700',
        ringColor: 'ring-red-500',
      },
      'very-unhealthy': {
        gradient: 'from-purple-400 to-purple-500',
        iconColor: 'text-purple-600',
        bgColor: 'bg-purple-500',
        textColor: 'text-purple-700',
        ringColor: 'ring-purple-500',
      },
      hazardous: {
        gradient: 'from-rose-500 to-rose-600',
        iconColor: 'text-rose-600',
        bgColor: 'bg-rose-600',
        textColor: 'text-rose-700',
        ringColor: 'ring-rose-600',
      },
      unknown: {
        gradient: 'from-slate-400 to-slate-500',
        iconColor: 'text-slate-600',
        bgColor: 'bg-slate-500',
        textColor: 'text-slate-700',
        ringColor: 'ring-slate-500',
      },
    };
    const currentStatus = data.status || 'unknown';
    const selectedStyle = styles[currentStatus] || styles.unknown;

    if (type === 'textColor' && ['unhealthy', 'very-unhealthy', 'hazardous'].includes(currentStatus)) {
      return 'text-white';
    }
    if (type === 'textColor') return 'text-slate-800';
    if (type === 'iconColor') return selectedStyle.iconColor;
    if (type === 'ringColor') return selectedStyle.ringColor;
    if (type === 'bgColor') return selectedStyle.bgColor;

    return selectedStyle.gradient;
  };

  const getStatusText = (status: AirQualityStatus | undefined): string => {
    switch (status) {
      case 'good':
        return 'Buena';
      case 'moderate':
        return 'Moderada';
      case 'unhealthy-sensitive':
        return 'Dañina (Grupos Sensibles)';
      case 'unhealthy':
        return 'Dañina';
      case 'very-unhealthy':
        return 'Muy Dañina';
      case 'hazardous':
        return 'Peligrosa';
      default:
        return 'Desconocida';
    }
  };

  const getStatusIcon = (status: AirQualityStatus | undefined) => {
    const iconClass = `h-6 w-6 ${getStatusStyle('iconColor')}`;
    switch (status) {
      case 'good':
        return <IoLeafOutline className={iconClass} aria-label="Buena" />;
      case 'moderate':
        return <IoCloudOutline className={iconClass} aria-label="Moderada" />;
      case 'unhealthy-sensitive':
        return <IoBodyOutline className={iconClass} aria-label="Dañina para Grupos Sensibles" />;
      case 'unhealthy':
        return <IoWarningOutline className={iconClass} aria-label="Dañina" />;
      case 'very-unhealthy':
        return <IoSkullOutline className={iconClass} aria-label="Muy Dañina" />;
      case 'hazardous':
        return <IoSkullOutline className={`${iconClass} animate-pulse`} aria-label="Peligrosa" />;
      default:
        return <IoHelpCircleOutline className={iconClass} aria-label="Desconocida" />;
    }
  };

  const formatNullableMetric = (value: number | null | undefined, suffix: string) => {
    if (value === null || value === undefined) {
      return 'N/D';
    }

    return `${value}${suffix}`;
  };

  const freshnessLabel = data.dataQuality === 'fresh' ? 'última medición' : 'dato no verificado';

  return (
    <motion.div
      layout
      className={`overflow-hidden rounded-2xl border-2 bg-white shadow-md dark:bg-slate-800 ${className} ${getStatusStyle(
        'ringColor',
      )}/20`}
    >
      <div className={`relative bg-gradient-to-br p-4 sm:p-6 ${getStatusStyle('gradient')} ${getStatusStyle('textColor')}`}>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-white/90">
            <IoTimeOutline className="h-3 w-3" />
            <span>{dateTime}</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full bg-white/15 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
              <span>{freshnessLabel}</span>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => refreshData()}
              className="rounded-full bg-white/15 p-1.5 text-white transition-all hover:bg-white/25"
              aria-label="Refrescar datos"
            >
              <IoRefreshOutline className="h-4 w-4" />
            </motion.button>
          </div>
        </div>

        <div className="mb-3 flex flex-col items-center justify-center text-center">
          <motion.div
            key={`${data.status}-icon`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            className="mb-3 flex cursor-pointer items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm"
          >
            <motion.div whileHover={{ scale: 1.2, transition: { duration: 0.2 } }} className="flex h-8 w-8 items-center justify-center">
              {getStatusIcon(data.status)}
            </motion.div>
            <span className="text-lg font-semibold text-white">{getStatusText(data.status)}</span>
          </motion.div>

          <div className="relative mb-2 flex items-center justify-center">
            <motion.div
              key={data.aqi ?? 'unknown'}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.15, 1], transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' } }}
              className="text-7xl font-bold text-white"
              style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.15)' }}
            >
              {data.aqi ?? 'N/D'}
            </motion.div>

            <div className="absolute -right-12 flex flex-col items-start">
              <div className="flex items-center">
                <span className="text-sm font-semibold text-white">AQI</span>
                <div className="relative">
                  <button
                    aria-label="¿Qué es AQI?"
                    className="ml-1 text-white/70 hover:text-white"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    onClick={() => setShowTooltip(!showTooltip)}
                  >
                    <IoHelpCircleOutline className="h-4 w-4" />
                  </button>

                  <AnimatePresence>
                    {showTooltip && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute right-0 z-20 w-48 rounded-lg bg-white p-2 text-left text-xs text-slate-800 shadow-lg dark:bg-slate-800 dark:text-slate-200"
                      >
                        AQI (Índice de Calidad del Aire) es una medida estandarizada de la calidad del aire. Valores más bajos indican mejor calidad del aire.
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <span className="text-xs text-white/80">US</span>
            </div>
          </div>

          <p className="mx-auto mt-1 max-w-xs text-sm font-medium text-white/90">
            {data.degradationReason ?? getAQIDescription(data.status)}
          </p>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex w-full items-center justify-between border-b border-slate-200 px-4 py-2 hover:bg-slate-100 dark:border-slate-700/50 dark:hover:bg-slate-700/30"
        >
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Detalles Ambientales</h4>
          <motion.div animate={{ rotate: showDetails ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <IoChevronDownOutline className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          </motion.div>
        </button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-4 p-4">
                <DetailItem
                  label="Temperatura"
                  value={formatNullableMetric(data.temperature, '°C')}
                  iconColorClass={getStatusStyle('iconColor')}
                  weatherIcon={data.weather_icon}
                  useWeatherIconAsMainIcon={true}
                />
                <DetailItem
                  label="Humedad"
                  value={formatNullableMetric(data.humidity, '%')}
                  iconColorClass={getStatusStyle('iconColor')}
                  useHumidityIcon={true}
                  humidityValue={data.humidity}
                />
                <DetailItem
                  label="Viento"
                  value={formatNullableMetric(data.wind?.speed, ' km/h')}
                  iconColorClass={getStatusStyle('iconColor')}
                  useWindIcon={true}
                  windSpeed={data.wind?.speed}
                  windDirection={data.wind?.direction}
                />
                <DetailItem
                  useMainPollutantIcon={true}
                  label="Contaminantes"
                  value={data.main_pollutant_us ? getPollutantInfo(data.main_pollutant_us).name : 'N/D'}
                  iconColorClass={getStatusStyle('iconColor')}
                  tooltipText={
                    data.main_pollutant_us
                      ? getPollutantInfo(data.main_pollutant_us).description
                      : 'No hay información disponible sobre el contaminante principal.'
                  }
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

interface DetailItemProps {
  icon?: React.ReactNode;
  label: string;
  value: string;
  iconColorClass: string;
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
  icon,
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
}: DetailItemProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50"
    >
      {!useWeatherIconAsMainIcon && !useHumidityIcon && !useWindIcon && !useMainPollutantIcon ? (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-current bg-opacity-10 dark:bg-opacity-20">
          <span className="h-4 w-4 text-white dark:text-white">{icon}</span>
        </div>
      ) : useWeatherIconAsMainIcon ? (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
          {weatherIcon && <img src={getWeatherIconUrl(weatherIcon)} alt="Clima" className="h-8 w-8" />}
        </div>
      ) : useHumidityIcon ? (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
          {humidityValue !== null && humidityValue !== undefined && (
            <img src={getHumidityIcon(humidityValue)} alt="Humedad" className="h-8 w-8" />
          )}
        </div>
      ) : useWindIcon ? (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
          {windSpeed !== null && windSpeed !== undefined && windDirection !== null && windDirection !== undefined && (
            <img
              src={getWindIcon(windSpeed, windDirection).icon}
              alt="Viento"
              className="h-8 w-8"
              style={{ transform: `rotate(${getWindIcon(windSpeed, windDirection).rotation}deg)` }}
            />
          )}
        </div>
      ) : useMainPollutantIcon ? (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
          <img src={getMainPollutantIcon()} alt="Contaminante" className="h-8 w-8" />
        </div>
      ) : null}
      <div className="flex-1">
        <div className="flex items-center">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-300">{label}</div>
          {tooltipText && (
            <div className="relative ml-1">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <IoInformationCircleOutline className="h-3 w-3" />
              </button>
              <AnimatePresence>
                {showTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute bottom-full left-0 z-10 mb-1 w-40 rounded bg-white p-2 text-xs text-slate-800 shadow-lg dark:bg-slate-700 dark:text-white"
                  >
                    {tooltipText}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
        <div className="text-sm font-semibold text-slate-900 dark:text-white">{value}</div>
      </div>
    </motion.div>
  );
}
