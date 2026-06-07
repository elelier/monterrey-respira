import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  IoAlertCircleOutline,
  IoCloudOutline,
  IoLeafOutline,
  IoPulseOutline,
  IoRefreshOutline,
  IoSpeedometerOutline,
  IoWaterOutline,
} from 'react-icons/io5';
import type { AirQualityData, AirQualityStatus } from '../types';
import { AQI_STATUS_COPY, AQI_THEME_TOKENS } from '../utils/aqiDesignTokens';
import {
  getPollutantInfo,
  getWeatherIconUrl,
  getWeatherLabel,
} from '../utils/airQualityUtils';
import {
  formatNullableNumber,
  hasReliableAqi,
  isFiniteNumber,
} from '../utils/airQualityDisplay';

interface AqiHomeV2PrototypeProps {
  data: AirQualityData;
  weatherIcon?: string | null;
  onRefresh: () => void;
}

const MAX_AQI_FOR_GAUGE = 500;
const GAUGE_RADIUS = 72;
const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

const RISK_COPY: Record<AirQualityStatus, string> = {
  good: 'Riesgo bajo',
  moderate: 'Riesgo moderado',
  'unhealthy-sensitive': 'Riesgo para sensibles',
  unhealthy: 'Riesgo alto',
  'very-unhealthy': 'Riesgo muy alto',
  hazardous: 'Riesgo extremo',
  unknown: 'Sin lectura',
};

const FRESHNESS_LABELS: Record<AirQualityData['measurementFreshness'], string> = {
  fresh: 'Actual',
  stale: '+12 h',
  old: '+24 h',
  unknown: 'Sin validar',
};

const FRESHNESS_DOT_CLASSES: Record<AirQualityData['measurementFreshness'], string> = {
  fresh: 'bg-emerald-300 shadow-[0_0_22px_rgba(110,231,183,0.75)]',
  stale: 'bg-amber-300 shadow-[0_0_22px_rgba(252,211,77,0.7)]',
  old: 'bg-orange-300 shadow-[0_0_22px_rgba(253,186,116,0.7)]',
  unknown: 'bg-slate-300 shadow-[0_0_18px_rgba(203,213,225,0.55)]',
};

function formatCompactTime(value: string | null | undefined) {
  if (!value) {
    return 'N/D';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'N/D';
  }

  const time = new Intl.DateTimeFormat('es-MX', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

  if (date.toDateString() === new Date().toDateString()) {
    return time;
  }

  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function getGaugeProgress(aqi: number | null | undefined) {
  if (!isFiniteNumber(aqi) || aqi < 0) {
    return 0;
  }

  return Math.min(aqi, MAX_AQI_FOR_GAUGE) / MAX_AQI_FOR_GAUGE;
}

function getWeatherProviderLabel(provider: string | null | undefined) {
  if (!provider) {
    return 'Clima contextual';
  }

  if (provider.toLowerCase() === 'open-meteo') {
    return 'Open-Meteo';
  }

  return provider;
}

function MiniMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-md">
      <div className="flex items-center gap-1.5 text-white/70">
        <span className="shrink-0 text-white/80">{icon}</span>
        <span className="truncate text-[0.66rem] font-semibold uppercase tracking-[0.16em]">{label}</span>
      </div>
      <p className="mt-1 truncate text-[1rem] font-black leading-none text-white sm:text-lg">{value}</p>
    </div>
  );
}

export default function AqiHomeV2Prototype({ data, weatherIcon, onRefresh }: AqiHomeV2PrototypeProps) {
  const reliableAqi = hasReliableAqi(data);
  const status = reliableAqi ? data.status : 'unknown';
  const theme = AQI_THEME_TOKENS[status];
  const statusCopy = reliableAqi ? AQI_STATUS_COPY[status] : AQI_STATUS_COPY.unknown;
  const aqiLabel = reliableAqi ? formatNullableNumber(data.aqi) : 'N/D';
  const gaugeProgress = getGaugeProgress(data.aqi);
  const gaugeOffset = GAUGE_CIRCUMFERENCE * (1 - gaugeProgress);
  const pollutantLabel = data.main_pollutant_us ? getPollutantInfo(data.main_pollutant_us).name : 'N/D';
  const resolvedWeatherIcon = weatherIcon ?? data.weather_icon;
  const weatherIconUrl = getWeatherIconUrl(resolvedWeatherIcon);
  const weatherLabel = getWeatherLabel(resolvedWeatherIcon);
  const measurementTime = formatCompactTime(data.timestamp);

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative isolate overflow-hidden rounded-[2rem] bg-slate-950 p-4 text-white shadow-[0_24px_60px_rgba(15,23,42,0.3)] ring-1 ring-white/10 sm:p-6 lg:p-8"
      aria-label={`Prototipo de lectura ambiental: ${data.location.name}`}
    >
      <div className="absolute inset-0 bg-[url('/images/monterrey-cerro-silla.jpg')] bg-cover bg-[62%_100%] opacity-55" aria-hidden="true" />
      <div
        className="absolute inset-0 opacity-95"
        style={{
          background: `radial-gradient(circle at 20% 12%, ${theme.primary}99 0, transparent 34%), linear-gradient(135deg, ${theme.secondary}f2 0%, rgba(15,23,42,0.88) 52%, rgba(15,23,42,0.95) 100%)`,
        }}
        aria-hidden="true"
      />
      <div className="absolute -right-20 top-16 h-52 w-52 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-24 left-8 h-64 w-64 rounded-full bg-black/30 blur-3xl" aria-hidden="true" />

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/65">Laboratorio AQI v2</p>
          <h2 className="mt-1 text-3xl font-black leading-none sm:text-5xl">{data.location.name}</h2>
        </div>
        <button
          onClick={onRefresh}
          className="rounded-full border border-white/20 bg-white/10 p-3 text-white shadow-sm backdrop-blur-md transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/70"
          type="button"
          aria-label="Refrescar datos"
        >
          <IoRefreshOutline className="h-5 w-5" />
        </button>
      </div>

      <div className="relative z-10 mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center">
        <div className="grid gap-5 sm:grid-cols-[12rem_minmax(0,1fr)] sm:items-center">
          <div className="relative mx-auto h-48 w-48 sm:mx-0">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 180 180" role="img" aria-label={`AQI ${aqiLabel}`}>
              <circle
                cx="90"
                cy="90"
                r={GAUGE_RADIUS}
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="14"
              />
              <motion.circle
                cx="90"
                cy="90"
                r={GAUGE_RADIUS}
                fill="none"
                stroke={theme.primary}
                strokeLinecap="round"
                strokeWidth="14"
                strokeDasharray={GAUGE_CIRCUMFERENCE}
                initial={{ strokeDashoffset: GAUGE_CIRCUMFERENCE }}
                animate={{ strokeDashoffset: gaugeOffset }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[4.7rem] font-black leading-none tracking-[-0.08em]">{aqiLabel}</span>
              <span className="mt-1 text-sm font-bold uppercase tracking-[0.28em] text-white/70">AQI US</span>
            </div>
          </div>

          <div className="space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/14 px-4 py-2 text-sm font-black text-white shadow-lg backdrop-blur-md sm:text-base">
              <IoPulseOutline className="h-5 w-5" />
              {RISK_COPY[status]}
            </div>
            <p className="max-w-xl text-[1.95rem] font-black leading-[0.95] tracking-[-0.05em] text-white sm:text-5xl">
              {statusCopy.heroLabel}
            </p>
            <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
              <span className="inline-flex items-center gap-2 rounded-full bg-black/22 px-3 py-2 text-xs font-bold text-white/90 ring-1 ring-white/15 backdrop-blur-md">
                <IoAlertCircleOutline className="h-4 w-4" />
                {pollutantLabel}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-black/22 px-3 py-2 text-xs font-bold text-white/90 ring-1 ring-white/15 backdrop-blur-md">
                <span className={`h-2.5 w-2.5 rounded-full ${FRESHNESS_DOT_CLASSES[data.measurementFreshness]}`} />
                {FRESHNESS_LABELS[data.measurementFreshness]} · {measurementTime}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-[1.6rem] border border-white/20 bg-white/14 p-4 shadow-[0_18px_44px_rgba(15,23,42,0.22)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/18 ring-1 ring-white/20">
              {weatherIconUrl ? (
                <img src={weatherIconUrl} alt="" className="h-11 w-11 object-contain" aria-hidden="true" />
              ) : (
                <IoCloudOutline className="h-8 w-8 text-white/85" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-2xl font-black leading-none">{weatherLabel}</p>
              <p className="mt-1 truncate text-xs font-semibold text-white/65">
                {getWeatherProviderLabel(data.weather_provider)} · contexto, no AQI
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <MiniMetric
              label="Temp."
              value={formatNullableNumber(data.temperature, '°C', 1)}
              icon={<IoSpeedometerOutline className="h-4 w-4" />}
            />
            <MiniMetric
              label="Humedad"
              value={formatNullableNumber(data.humidity, '%')}
              icon={<IoWaterOutline className="h-4 w-4" />}
            />
            <MiniMetric
              label="Viento"
              value={formatNullableNumber(data.wind.speed, ' km/h', 1)}
              icon={<IoLeafOutline className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>

      {data.degradationReason && (
        <p className="relative z-10 mt-4 rounded-2xl border border-amber-200/35 bg-amber-100/14 px-4 py-3 text-sm font-semibold text-amber-50 backdrop-blur-md">
          {data.degradationReason}
        </p>
      )}
    </motion.section>
  );
}
