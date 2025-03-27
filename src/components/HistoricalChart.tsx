import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps
} from 'recharts';
import { IoCalendarOutline, IoInformationCircleOutline, IoOptionsOutline } from 'react-icons/io5';

interface HistoricalData {
  date: string;
  aqi: number;
  pm25: number;
  pm10: number;
}

// Sample data (in a real app, this would come from an API)
const getHistoricalData = (): HistoricalData[] => {
  // Generate the last 7 days of data
  const data: HistoricalData[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    // Create some variation in the data
    const baseAQI = 65 + Math.floor(Math.random() * 30);
    const basePM25 = 20 + Math.floor(Math.random() * 15);
    const basePM10 = 35 + Math.floor(Math.random() * 20);

    // Add day trend - higher during weekdays, lower on weekends
    const dayOfWeek = date.getDay();
    const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.85 : 1.1;

    data.push({
      date: date.toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short' }),
      aqi: Math.floor(baseAQI * weekendFactor),
      pm25: Math.floor(basePM25 * weekendFactor),
      pm10: Math.floor(basePM10 * weekendFactor)
    });
  }

  return data;
};

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 max-w-xs dark:bg-slate-800 dark:border-slate-700">
        <p className="font-semibold text-gray-900 mb-1 dark:text-white">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <p key={`item-${index}`} className="text-sm" style={{ color: entry.color }}>
              <span className="font-medium">{entry.name}: </span>
              <span>{entry.value}</span>
            </p>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

export default function HistoricalChart() {
  const [data, setData] = useState<HistoricalData[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const [chartHeight, setChartHeight] = useState(300);
  const [selectedPollutants, setSelectedPollutants] = useState({
    aqi: true,
    pm25: true,
    pm10: true
  });
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setData(getHistoricalData());
  }, []);

  // Update chart height based on screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setChartHeight(220);
      } else if (width < 768) {
        setChartHeight(260);
      } else {
        setChartHeight(300);
      }
    };

    // Initialize on mount
    handleResize();

    // Add listener for window resize
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleRangeChange = (newRange: 'week' | 'month' | 'year') => {
    setTimeRange(newRange);
    // In a real app, this would fetch new data based on the range
  };

  const togglePollutant = (key: keyof typeof selectedPollutants) => {
    setSelectedPollutants(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden dark:bg-slate-800">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Historial de Calidad del Aire</h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex items-center">
            <IoCalendarOutline className="w-3 h-3 mr-1" />
            {timeRange === 'week' && 'Últimos 7 días'}
            {timeRange === 'month' && 'Último mes'}
            {timeRange === 'year' && 'Último año'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsInfoVisible(!isInfoVisible)}
            className="text-gray-500 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Ver información sobre datos históricos"
          >
            <IoInformationCircleOutline className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOptionsOpen(!isOptionsOpen)}
            className="text-gray-500 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Opciones de gráfico"
          >
            <IoOptionsOutline className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Mobile options panel */}
      {isOptionsOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-gray-900/30 px-4 py-3"
        >
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-2">Rango de tiempo</h4>
            <div className="flex space-x-2 text-sm">
              <button
                onClick={() => handleRangeChange('week')}
                className={`px-3 py-1 rounded-full ${timeRange === 'week' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                7 días
              </button>
              <button
                onClick={() => handleRangeChange('month')}
                className={`px-3 py-1 rounded-full ${timeRange === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                30 días
              </button>
              <button
                onClick={() => handleRangeChange('year')}
                className={`px-3 py-1 rounded-full ${timeRange === 'year' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                1 año
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Contaminantes</h4>
            <div className="flex flex-wrap gap-2 text-sm">
              <button
                onClick={() => togglePollutant('aqi')}
                className={`flex items-center px-3 py-1 rounded-full ${selectedPollutants.aqi ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                <span className={`w-3 h-3 rounded-full mr-1 ${selectedPollutants.aqi ? 'bg-white' : 'bg-blue-500'}`}></span>
                AQI
              </button>
              <button
                onClick={() => togglePollutant('pm25')}
                className={`flex items-center px-3 py-1 rounded-full ${selectedPollutants.pm25 ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                <span className={`w-3 h-3 rounded-full mr-1 ${selectedPollutants.pm25 ? 'bg-white' : 'bg-red-500'}`}></span>
                PM2.5
              </button>
              <button
                onClick={() => togglePollutant('pm10')}
                className={`flex items-center px-3 py-1 rounded-full ${selectedPollutants.pm10 ? 'bg-amber-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                <span className={`w-3 h-3 rounded-full mr-1 ${selectedPollutants.pm10 ? 'bg-white' : 'bg-amber-500'}`}></span>
                PM10
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Info panel */}
      {isInfoVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-gray-900/30 px-4 py-3"
        >
          <p className="text-xs text-gray-600 dark:text-gray-300">
            Este gráfico muestra la tendencia histórica de la calidad del aire en la ubicación seleccionada. Los datos se actualizan diariamente y pueden ser utilizados para identificar patrones y tendencias en la contaminación del aire. Las variaciones pueden estar influenciadas por el tráfico, condiciones climáticas, actividad industrial y eventos especiales.
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
            <span className="font-semibold">Nota:</span> Los datos mostrados son simulados con fines demostrativos. En una implementación real, se obtendría de APIs oficiales.
          </p>
        </motion.div>
      )}

      {/* Chart */}
      <div className="p-4" ref={chartContainerRef} style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 10,
              right: 20,
              left: 0,
              bottom: 5
            }}
            style={{ fontSize: window.innerWidth < 640 ? '10px' : '12px' }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(226, 232, 240, 0.5)" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
              tickFormatter={(value) => window.innerWidth < 640 ? value.split(' ')[0] : value}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              domain={[0, 'dataMax + 20']}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
              style={{ paddingLeft: 10 }}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={window.innerWidth < 640 ? 30 : 36}
              iconSize={window.innerWidth < 640 ? 8 : 10}
              wrapperStyle={{ paddingTop: window.innerWidth < 640 ? 5 : 10 }}
              formatter={(value, entry, index) => {
                return <span className="text-xs">{value}</span>;
              }}
              // No legend on mobile, we'll use buttons instead
              content={window.innerWidth < 640 ? () => null : undefined}
            />
            {selectedPollutants.aqi && (
              <Line
                type="monotone"
                dataKey="aqi"
                name="AQI"
                stroke="#3b82f6"
                strokeWidth={2}
                activeDot={{ r: 6 }}
                dot={{ r: 2 }}
                yAxisId="left"
                connectNulls
              />
            )}
            {selectedPollutants.pm25 && (
              <Line
                type="monotone"
                dataKey="pm25"
                name="PM2.5"
                stroke="#f87171"
                strokeWidth={2}
                activeDot={{ r: 6 }}
                dot={{ r: 2 }}
                yAxisId="left"
                connectNulls
              />
            )}
            {selectedPollutants.pm10 && (
              <Line
                type="monotone"
                dataKey="pm10"
                name="PM10"
                stroke="#f59e0b"
                strokeWidth={2}
                activeDot={{ r: 6 }}
                dot={{ r: 2 }}
                yAxisId="left"
                connectNulls
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Range selector (non-mobile only) */}
      <div className="hidden sm:flex border-t border-gray-200 dark:border-slate-700 px-4 py-2 bg-gray-50 dark:bg-slate-900 justify-between items-center">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleRangeChange('week')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              timeRange === 'week'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            7 días
          </button>
          <button
            onClick={() => handleRangeChange('month')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              timeRange === 'month'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            30 días
          </button>
          <button
            onClick={() => handleRangeChange('year')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              timeRange === 'year'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
            }`}
          >
            1 año
          </button>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
          * Datos simulados con fines de demostración
        </div>
      </div>
    </div>
  );
}
