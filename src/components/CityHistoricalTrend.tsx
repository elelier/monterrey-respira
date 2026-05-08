import { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AirQualityHistoryRow, AirQualityTrend } from '../types';
import { fetchAirQualityHistoryForCity } from '../services/apiService';

interface CityHistoricalTrendProps {
  cityId: number;
  cityName: string;
}

type HistoryRange = 24 | 168;

interface ChartPoint {
  timestamp: string;
  label: string;
  aqi: number;
}

const RANGE_OPTIONS: { label: string; value: HistoryRange }[] = [
  { label: '24h', value: 24 },
  { label: '7d', value: 168 },
];

const MIN_POINTS_FOR_TREND = 2;
const STABLE_DELTA = 5;

function formatPointLabel(timestamp: string, range: HistoryRange) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return 'N/D';
  }

  return date.toLocaleString('es-MX', {
    day: range === 168 ? '2-digit' : undefined,
    month: range === 168 ? 'short' : undefined,
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toChartPoint(row: AirQualityHistoryRow, range: HistoryRange): ChartPoint | null {
  if (row.aqi_us === null) {
    return null;
  }

  return {
    timestamp: row.reading_timestamp,
    label: formatPointLabel(row.reading_timestamp, range),
    aqi: row.aqi_us,
  };
}

function calculateTrend(points: ChartPoint[]): AirQualityTrend {
  if (points.length < MIN_POINTS_FOR_TREND) {
    return 'insufficient-data';
  }

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  if (!firstPoint || !lastPoint) {
    return 'insufficient-data';
  }

  const delta = lastPoint.aqi - firstPoint.aqi;

  if (Math.abs(delta) <= STABLE_DELTA) {
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

export default function CityHistoricalTrend({ cityId, cityName }: CityHistoricalTrendProps) {
  const [range, setRange] = useState<HistoryRange>(24);
  const [rows, setRows] = useState<AirQualityHistoryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [degradedReason, setDegradedReason] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadHistory() {
      setLoading(true);
      setDegradedReason(null);

      try {
        const historyRows = await fetchAirQualityHistoryForCity(cityId, range);

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

  const chartPoints = useMemo(
    () => rows.map((row) => toChartPoint(row, range)).filter((point): point is ChartPoint => point !== null),
    [range, rows],
  );

  const trend = useMemo(() => calculateTrend(chartPoints), [chartPoints]);
  const hasEnoughPointsForChart = chartPoints.length >= MIN_POINTS_FOR_TREND;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md dark:border-slate-700 dark:bg-slate-800 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Tendencia reciente
          </p>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">AQI histórico · {cityName}</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Histórico basado en mediciones disponibles; puede haber huecos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getTrendClassName(trend)}`}
          >
            {getTrendLabel(trend)}
          </span>
          <div className="flex rounded-full bg-slate-100 p-1 dark:bg-slate-900/60">
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

      {degradedReason ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="status">
          {degradedReason}
        </div>
      ) : !hasEnoughPointsForChart ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300" role="status">
          {loading ? 'Cargando histórico disponible...' : 'Aún no hay suficientes mediciones para graficar esta ciudad.'}
        </div>
      ) : (
        <div className="h-56 w-full" aria-label={`Gráfica de AQI histórico para ${cityName}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartPoints} margin={{ top: 10, right: 10, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} minTickGap={24} />
              <YAxis tick={{ fontSize: 11 }} width={40} domain={[0, 'dataMax + 20']} />
              <Tooltip
                labelFormatter={(_, payload) => {
                  const point = payload?.[0]?.payload as ChartPoint | undefined;
                  return point
                    ? new Date(point.timestamp).toLocaleString('es-MX', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : 'Medición';
                }}
                formatter={(value) => [`${value} AQI`, 'AQI US']}
              />
              <Line
                type="monotone"
                dataKey="aqi"
                stroke="currentColor"
                strokeWidth={2}
                dot={chartPoints.length <= 24}
                connectNulls={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
