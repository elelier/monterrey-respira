import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AirQualityDailyHistoryRow,
  AirQualityHistoryMetric,
  AirQualityHistoryRow,
  AirQualityTrend,
} from '../types';
import {
  fetchAirQualityHistoryForCity,
  fetchDailyAirQualityHistoryForCity,
} from '../services/apiService';

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
  { label: 'AQI US', value: 'aqi_us', suffix: ' AQI' },
  { label: 'Temperatura', value: 'temperature_c', suffix: '°C' },
  { label: 'Humedad', value: 'humidity_percent', suffix: '%' },
];

const RANGE_TO_HOURS: Record<Exclude<HistoryRange, '6m'>, number> = {
  '24h': 24,
  '7d': 168,
  '30d': 24 * 31,
};

const SIX_MONTH_DAYS = 183;
const MIN_POINTS_FOR_TREND = 2;
const STABLE_DELTA_BY_METRIC: Record<AirQualityHistoryMetric, number> = {
  aqi_us: 5,
  temperature_c: 1,
  humidity_percent: 3,
};

function isDailyRow(row: HistoryRow): row is AirQualityDailyHistoryRow {
  return 'reading_date' in row;
}

function getMetricConfig(metric: AirQualityHistoryMetric) {
  const config = METRIC_OPTIONS.find((option) => option.value === metric);
  return config ?? METRIC_OPTIONS[0];
}

function getTimestamp(row: HistoryRow) {
  return isDailyRow(row) ? row.reading_date : row.reading_timestamp;
}

function getPollutant(row: HistoryRow) {
  return isDailyRow(row) ? row.dominant_pollutant_us : row.main_pollutant_us;
}

function getMetricValue(row: HistoryRow, metric: AirQualityHistoryMetric): number | null {
  if (isDailyRow(row)) {
    switch (metric) {
      case 'temperature_c':
        return row.avg_temperature_c;
      case 'humidity_percent':
        return row.avg_humidity_percent;
      default:
        return row.avg_aqi_us;
    }
  }

  switch (metric) {
    case 'temperature_c':
      return row.temperature_c;
    case 'humidity_percent':
      return row.humidity_percent;
    default:
      return row.aqi_us;
  }
}

function formatPointLabel(timestamp: string, range: HistoryRange) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return 'N/D';
  }

  if (range === '6m') {
    return date.toLocaleDateString('es-MX', { month: 'short', day: '2-digit' });
  }

  return date.toLocaleString('es-MX', {
    day: range === '24h' ? undefined : '2-digit',
    month: range === '24h' ? undefined : 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toChartPoint(
  row: HistoryRow,
  range: HistoryRange,
  metric: AirQualityHistoryMetric,
): ChartPoint | null {
  const metricValue = getMetricValue(row, metric);

  if (metricValue === null) {
    return null;
  }

  const timestamp = getTimestamp(row);

  return {
    timestamp,
    label: formatPointLabel(timestamp, range),
    value: Number(metricValue.toFixed(1)),
  };
}

function calculateTrend(points: ChartPoint[], metric: AirQualityHistoryMetric): AirQualityTrend {
  if (points.length < MIN_POINTS_FOR_TREND) {
    return 'insufficient-data';
  }

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  if (!firstPoint || !lastPoint) {
    return 'insufficient-data';
  }

  const delta = lastPoint.value - firstPoint.value;

  if (Math.abs(delta) <= STABLE_DELTA_BY_METRIC[metric]) {
    return 'stable';
  }

  return delta > 0 ? 'rising' : 'falling';
}

function getTrendLabel(trend: AirQualityTrend) {
  switch (trend) {
    case 'rising':
      return 'Subiendo';
    case 'falling':
      return 'Bajando';
    case 'stable':
      return 'Estable';
    default:
      return 'Sin datos suficientes';
  }
}

function getTrendClassName(trend: AirQualityTrend) {
  switch (trend) {
    case 'rising':
      return 'border-orange-200 bg-orange-50 text-orange-700';
    case 'falling':
      return 'border-green-200 bg-green-50 text-green-700';
    case 'stable':
      return 'border-blue-200 bg-blue-50 text-blue-700';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-600';
  }
}

function getMetricCopy(metric: AirQualityHistoryMetric, range: HistoryRange) {
  if (range === '6m') {
    return metric === 'aqi_us' ? 'promedio diario de AQI' : 'promedio diario';
  }

  return 'mediciones disponibles';
}

function buildPollutantSummary(rows: HistoryRow[]): PollutantSummaryItem[] {
  const counts = rows.reduce<Map<string, number>>((summary, row) => {
    const pollutant = getPollutant(row);

    if (!pollutant) {
      return summary;
    }

    summary.set(pollutant, (summary.get(pollutant) ?? 0) + 1);
    return summary;
  }, new Map<string, number>());

  const total = Array.from(counts.values()).reduce((sum, count) => sum + count, 0);

  if (total === 0) {
    return [];
  }

  return Array.from(counts.entries())
    .map(([pollutant, count]) => ({
      pollutant,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((left, right) => right.count - left.count);
}

export default function CityHistoricalTrend({ cityId, cityName }: CityHistoricalTrendProps) {
  const [range, setRange] = useState<HistoryRange>('24h');
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

        if (!isCurrent) {
          return;
        }

        setRows(historyRows);
      } catch {
        if (!isCurrent) {
          return;
        }

        setRows([]);
        setDegradedReason('Histórico no disponible por ahora. El panel principal sigue usando datos recientes.');
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      isCurrent = false;
    };
  }, [cityId, range]);

  const metricConfig = getMetricConfig(metric);

  const chartPoints = useMemo(
    () => rows
      .map((row) => toChartPoint(row, range, metric))
      .filter((point): point is ChartPoint => point !== null),
    [metric, range, rows],
  );

  const trend = useMemo(() => calculateTrend(chartPoints, metric), [chartPoints, metric]);
  const pollutantSummary = useMemo(() => buildPollutantSummary(rows), [rows]);
  const dominantPollutant = pollutantSummary[0];
  const hasEnoughPointsForChart = chartPoints.length >= MIN_POINTS_FOR_TREND;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md dark:border-slate-700 dark:bg-slate-800 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Tendencia reciente
          </p>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Histórico · {cityName}
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Histórico basado en mediciones disponibles; puede haber huecos.
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            WAQI/AQICN expone AQI y contaminante dominante; no concentraciones historicas por particula en esta integracion.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
          <span
            className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${getTrendClassName(trend)}`}
          >
            {getTrendLabel(trend)}
          </span>
          <div className="flex w-fit rounded-full bg-slate-100 p-1 dark:bg-slate-900/60">
            {RANGE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRange(option.value)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  range === option.value
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
                aria-pressed={range === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {METRIC_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setMetric(option.value)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              metric === option.value
                ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                : 'border-slate-200 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300'
            }`}
            aria-pressed={metric === option.value}
          >
            {option.label}
          </button>
        ))}
      </div>

      {degradedReason ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="status">
          {degradedReason}
        </div>
      ) : !hasEnoughPointsForChart ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300" role="status">
          {loading ? 'Cargando histórico disponible...' : 'Aún no hay suficientes mediciones para graficar esta métrica.'}
        </div>
      ) : (
        <div className="h-56 w-full" aria-label={`Gráfica histórica de ${metricConfig.label} para ${cityName}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartPoints} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} minTickGap={24} />
              <YAxis tick={{ fontSize: 11 }} width={40} domain={['auto', 'auto']} />
              <Tooltip
                labelFormatter={(_, payload) => {
                  const point = payload?.[0]?.payload as ChartPoint | undefined;
                  return point
                    ? new Date(point.timestamp).toLocaleString('es-MX', {
                        dateStyle: 'medium',
                        timeStyle: range === '6m' ? undefined : 'short',
                      })
                    : 'Medición';
                }}
                formatter={(value) => [`${value}${metricConfig.suffix}`, metricConfig.label]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="currentColor"
                strokeWidth={2}
                dot={range === '24h'}
                connectNulls={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Contaminante dominante
            </p>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
              {dominantPollutant
                ? `${dominantPollutant.pollutant} fue dominante en ${dominantPollutant.percentage}% de las mediciones.`
                : 'Sin datos suficientes de contaminante dominante.'}
            </p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Basado en {getMetricCopy(metric, range)}.
          </p>
        </div>

        {pollutantSummary.length > 0 && (
          <div className="mt-3 h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pollutantSummary.slice(0, 5)} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <XAxis dataKey="pollutant" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={36} allowDecimals={false} />
                <Tooltip formatter={(value) => [`${value} mediciones`, 'Frecuencia']} />
                <Bar dataKey="count" fill="currentColor" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </section>
  );
}
