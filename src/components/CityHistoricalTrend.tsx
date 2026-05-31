import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { IoTrendingUpOutline } from 'react-icons/io5';
import { AirQualityDailyHistoryRow, AirQualityHistoryMetric, AirQualityHistoryRow, AirQualityTrend } from '../types';
import { fetchAirQualityHistoryForCity, fetchDailyAirQualityHistoryForCity } from '../services/apiService';
import { useAirQuality } from '../context/AirQualityContext';
import { AQI_THEME_TOKENS } from '../utils/aqiDesignTokens';
import { formatNullableTimestamp, isFiniteNumber } from '../utils/airQualityDisplay';

interface CityHistoricalTrendProps {
  cityId: number;
  cityName: string;
}

type HistoryRange = '24h' | '7d' | '30d' | '6m';
type HistoryRow = AirQualityHistoryRow | AirQualityDailyHistoryRow;

interface ChartPoint {
  timestamp: string;
  label: string;
  value: number;
}

interface PollutantSummaryItem {
  pollutant: string;
  count: number;
  percentage: number;
}

const RANGE_OPTIONS: { label: string; value: HistoryRange }[] = [
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: '6m', value: '6m' },
];

const METRIC_OPTIONS: { label: string; value: AirQualityHistoryMetric; suffix: string }[] = [
  { label: 'AQI', value: 'aqi_us', suffix: ' AQI' },
  { label: 'Temp.', value: 'weather_temperature_c', suffix: ' °C' },
  { label: 'Humedad', value: 'weather_humidity_percent', suffix: '%' },
  { label: 'Viento', value: 'weather_wind_speed_kmh', suffix: ' km/h' },
];

const RANGE_TO_HOURS: Record<Exclude<HistoryRange, '6m'>, number> = {
  '24h': 24,
  '7d': 168,
  '30d': 24 * 31,
};

const SIX_MONTH_DAYS = 183;
const MIN_POINTS_FOR_TREND = 2;
const MOBILE_AXIS_COLOR = '#475569';
const DARK_AXIS_COLOR = '#cbd5e1';
const CHART_FOCUS_CLASS =
  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 focus-visible:ring-offset-2 dark:focus-visible:ring-sky-500 dark:focus-visible:ring-offset-slate-900';
const STABLE_DELTA_BY_METRIC: Record<AirQualityHistoryMetric, number> = {
  aqi_us: 5,
  weather_temperature_c: 1,
  weather_humidity_percent: 3,
  weather_wind_speed_kmh: 5,
};

function isDailyRow(row: HistoryRow): row is AirQualityDailyHistoryRow {
  return 'reading_date' in row;
}

function isWeatherMetric(metric: AirQualityHistoryMetric) {
  return metric !== 'aqi_us';
}

function getMetricConfig(metric: AirQualityHistoryMetric) {
  return METRIC_OPTIONS.find((option) => option.value === metric) ?? METRIC_OPTIONS[0];
}

function getTimestamp(row: HistoryRow, metric: AirQualityHistoryMetric) {
  if (isDailyRow(row)) return row.reading_date;
  return isWeatherMetric(metric) ? (row.weather_timestamp ?? row.reading_timestamp) : row.reading_timestamp;
}

function getPollutant(row: HistoryRow) {
  return isDailyRow(row) ? row.dominant_pollutant_us : row.main_pollutant_us;
}

function getMetricValue(row: HistoryRow, metric: AirQualityHistoryMetric): number | null {
  if (isDailyRow(row)) {
    if (metric === 'weather_temperature_c') return row.avg_weather_temperature_c;
    if (metric === 'weather_humidity_percent') return row.avg_weather_humidity_percent;
    if (metric === 'weather_wind_speed_kmh') return row.avg_weather_wind_speed_kmh;
    return row.avg_aqi_us;
  }

  if (metric === 'weather_temperature_c') return row.weather_temperature_c;
  if (metric === 'weather_humidity_percent') return row.weather_humidity_percent;
  if (metric === 'weather_wind_speed_kmh') return row.weather_wind_speed_kmh;
  return row.aqi_us;
}

function formatPointLabel(timestamp: string, range: HistoryRange) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'N/D';
  if (range === '6m') return date.toLocaleDateString('es-MX', { month: 'short', day: '2-digit' });
  return date.toLocaleString('es-MX', {
    day: range === '24h' ? undefined : '2-digit',
    month: range === '24h' ? undefined : 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toChartPoint(row: HistoryRow, range: HistoryRange, metric: AirQualityHistoryMetric): ChartPoint | null {
  const metricValue = getMetricValue(row, metric);
  if (!isFiniteNumber(metricValue)) return null;
  const timestamp = getTimestamp(row, metric);
  return { timestamp, label: formatPointLabel(timestamp, range), value: Number(metricValue.toFixed(1)) };
}

function calculateTrend(points: ChartPoint[], metric: AirQualityHistoryMetric): AirQualityTrend {
  if (points.length < MIN_POINTS_FOR_TREND) return 'insufficient-data';
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  if (!firstPoint || !lastPoint) return 'insufficient-data';
  const delta = lastPoint.value - firstPoint.value;
  if (Math.abs(delta) <= STABLE_DELTA_BY_METRIC[metric]) return 'stable';
  return delta > 0 ? 'rising' : 'falling';
}

function getTrendLabel(trend: AirQualityTrend) {
  if (trend === 'rising') return 'Subiendo';
  if (trend === 'falling') return 'Bajando';
  if (trend === 'stable') return 'Estable';
  return 'Sin datos suficientes';
}

function getMetricCopy(metric: AirQualityHistoryMetric, range: HistoryRange) {
  if (range === '6m') return metric === 'aqi_us' ? 'promedio diario de AQI' : 'promedio diario de clima';
  return isWeatherMetric(metric) ? 'campos de clima disponibles' : 'mediciones disponibles';
}

function getInsufficientDataCopy(metric: AirQualityHistoryMetric) {
  return isWeatherMetric(metric)
    ? 'Aún no hay suficientes mediciones de clima para graficar esta métrica.'
    : 'Aún no hay suficientes mediciones para graficar esta métrica.';
}

function buildPollutantSummary(rows: HistoryRow[]): PollutantSummaryItem[] {
  const counts = rows.reduce<Map<string, number>>((summary, row) => {
    const pollutant = getPollutant(row);
    if (!pollutant) return summary;
    summary.set(pollutant, (summary.get(pollutant) ?? 0) + 1);
    return summary;
  }, new Map<string, number>());
  const total = Array.from(counts.values()).reduce((sum, count) => sum + count, 0);
  if (total === 0) return [];
  return Array.from(counts.entries())
    .map(([pollutant, count]) => ({ pollutant, count, percentage: Math.round((count / total) * 100) }))
    .sort((left, right) => right.count - left.count);
}

export default function CityHistoricalTrend({ cityId, cityName }: CityHistoricalTrendProps) {
  const { airQualityData } = useAirQuality();
  const [range, setRange] = useState<HistoryRange>('30d');
  const [metric, setMetric] = useState<AirQualityHistoryMetric>('aqi_us');
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [degradedReason, setDegradedReason] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    async function loadHistory() {
      setLoading(true);
      setDegradedReason(null);
      try {
        const historyRows = range === '6m'
          ? await fetchDailyAirQualityHistoryForCity(cityId, SIX_MONTH_DAYS)
          : await fetchAirQualityHistoryForCity(cityId, RANGE_TO_HOURS[range]);
        if (isCurrent) setRows(historyRows);
      } catch {
        if (isCurrent) {
          setRows([]);
          setDegradedReason('Histórico no disponible por ahora. El panel principal sigue usando datos recientes.');
        }
      } finally {
        if (isCurrent) setLoading(false);
      }
    }
    loadHistory();
    return () => {
      isCurrent = false;
    };
  }, [cityId, range]);

  const metricConfig = getMetricConfig(metric);
  const chartPoints = useMemo(
    () => rows.map((row) => toChartPoint(row, range, metric)).filter((point): point is ChartPoint => point !== null),
    [metric, range, rows],
  );
  const trend = useMemo(() => calculateTrend(chartPoints, metric), [chartPoints, metric]);
  const pollutantSummary = useMemo(() => buildPollutantSummary(rows), [rows]);
  const dominantPollutant = pollutantSummary[0];
  const hasEnoughPointsForChart = chartPoints.length >= MIN_POINTS_FOR_TREND;
  const status = airQualityData?.status ?? 'unknown';
  const theme = AQI_THEME_TOKENS[status];
  const axisTick = { fontSize: 11, fill: MOBILE_AXIS_COLOR };
  const chartValueLabel = `${metricConfig.label}${metricConfig.suffix === ' AQI' ? '' : ` (${metricConfig.suffix.trim()})`}`;

  return (
    <section className="rounded-[1.15rem] border border-slate-200 bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-800 sm:rounded-[1.35rem] sm:p-5">
      <div className="mb-2 flex items-center justify-between gap-3 sm:mb-4">
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <IoTrendingUpOutline className="h-5 w-5 shrink-0 sm:h-7 sm:w-7" style={{ color: theme.secondary }} />
          <div className="min-w-0">
            <h2 className="truncate text-[0.94rem] font-bold text-slate-950 dark:text-white sm:text-xl sm:font-black">Tendencia reciente</h2>
            <p className="text-[0.68rem] font-medium text-slate-600 dark:text-slate-300 sm:hidden">
              {metricConfig.label} · {range}
            </p>
          </div>
        </div>
        <span className="hidden w-fit rounded-full border px-3 py-1 text-xs font-semibold sm:inline-flex" style={{ borderColor: `${theme.primary}66`, color: theme.text, backgroundColor: `${theme.primary}18` }}>
          {getTrendLabel(trend)}
        </span>
      </div>

      <div className="mb-2 grid grid-cols-4 rounded-full border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-900/60 sm:mb-3 sm:p-1">
        {RANGE_OPTIONS.map((option) => (
          <button key={option.value} type="button" onClick={() => setRange(option.value)} className={`rounded-full px-3 py-1 text-xs font-semibold transition sm:py-2 sm:text-sm sm:font-black ${CHART_FOCUS_CLASS}`} style={{ backgroundColor: range === option.value ? `${theme.primary}22` : 'transparent', color: range === option.value ? theme.text : undefined, boxShadow: range === option.value ? `inset 0 0 0 1px ${theme.primary}66` : undefined }} aria-pressed={range === option.value}>
            {option.label}
          </button>
        ))}
      </div>

      <div className="mb-3 grid grid-cols-4 rounded-full border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-900/60 sm:mb-4 sm:p-1">
        {METRIC_OPTIONS.map((option) => (
          <button key={option.value} type="button" onClick={() => setMetric(option.value)} className={`rounded-full px-2 py-1 text-[0.68rem] font-semibold transition sm:px-3 sm:py-2 sm:text-sm sm:font-black ${CHART_FOCUS_CLASS}`} style={{ backgroundColor: metric === option.value ? `${theme.primary}22` : 'transparent', color: metric === option.value ? theme.text : undefined, boxShadow: metric === option.value ? `inset 0 0 0 1px ${theme.primary}66` : undefined }} aria-pressed={metric === option.value}>
            {option.label}
          </button>
        ))}
      </div>

      {degradedReason ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="status">{degradedReason}</div>
      ) : !hasEnoughPointsForChart ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 sm:px-4 sm:py-6 sm:text-sm" role="status">
          {loading ? 'Cargando histórico disponible...' : getInsufficientDataCopy(metric)}
        </div>
      ) : (
        <div className="h-44 w-full sm:h-64" style={{ color: theme.secondary }} aria-label={`Gráfica histórica de ${metricConfig.label} para ${cityName}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartPoints} margin={{ top: 12, right: 12, left: 2, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,116,139,0.28)" />
              <XAxis dataKey="label" tick={axisTick} minTickGap={20} tickMargin={10} axisLine={false} tickLine={false} />
              <YAxis tick={axisTick} width={50} domain={['auto', 'auto']} tickMargin={8} axisLine={false} tickLine={false} label={{ value: chartValueLabel, angle: -90, position: 'insideLeft', fill: MOBILE_AXIS_COLOR, fontSize: 10, offset: 6 }} />
              <Tooltip labelFormatter={(_, payload) => {
                const point = payload?.[0]?.payload as ChartPoint | undefined;
                return point ? formatNullableTimestamp(point.timestamp, { dateStyle: 'medium', timeStyle: range === '6m' ? undefined : 'short' }) : 'Medición';
              }} formatter={(value) => [`${value}${metricConfig.suffix}`, metricConfig.label]} contentStyle={{ borderRadius: '0.875rem', borderColor: '#cbd5e1', color: '#0f172a' }} labelStyle={{ color: '#0f172a', fontWeight: 700 }} itemStyle={{ color: '#0f172a' }} />
              <Line type="monotone" dataKey="value" stroke="currentColor" strokeWidth={3} dot={range === '24h'} connectNulls={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <p className="mt-2 text-[0.72rem] font-medium leading-5 text-slate-600 dark:text-slate-300 sm:mt-3 sm:text-sm">Basado en {getMetricCopy(metric, range)}. Los espacios sin punto representan datos no disponibles, no valores estimados.</p>

      <div className="mt-4 hidden rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40 md:block">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Contaminante dominante</p>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
              {dominantPollutant ? `${dominantPollutant.pollutant} fue dominante en ${dominantPollutant.percentage}% de las mediciones.` : 'Sin datos suficientes de contaminante dominante.'}
            </p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{cityName}</p>
        </div>

        {pollutantSummary.length > 0 && (
          <div className="mt-3 h-36 w-full" style={{ color: theme.secondary }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pollutantSummary.slice(0, 5)} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="pollutant" tick={{ fontSize: 11, fill: DARK_AXIS_COLOR }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: DARK_AXIS_COLOR }} width={42} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => [`${value} mediciones`, 'Frecuencia']} contentStyle={{ borderRadius: '0.875rem', borderColor: '#cbd5e1', color: '#0f172a' }} />
                <Bar dataKey="count" fill="currentColor" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  );
}
