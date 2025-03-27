import { useState, useEffect, useRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
  Cell
} from 'recharts';
import { AirQualityData } from '../types';
import { getPollutantInfo } from '../utils/airQualityUtils';
import { motion } from 'framer-motion';
import { IoInformationCircleOutline } from 'react-icons/io5';

interface PollutantsChartProps {
  data: AirQualityData;
  className?: string;
}

// Custom tooltip to show pollutant info
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const pollutantInfo = getPollutantInfo(label);

    return (
      <div className="bg-white p-3 rounded-md shadow-lg border border-gray-200 max-w-xs dark:bg-slate-800 dark:border-slate-700">
        <p className="font-semibold text-gray-900 mb-1 dark:text-white">{pollutantInfo.name}</p>
        <p className="text-sm text-gray-600 mb-2 dark:text-gray-300">{pollutantInfo.description}</p>
        <p className="text-sm font-medium">
          Valor: <span className="text-blue-600 dark:text-blue-400">{payload[0].value} {label === 'co' ? 'ppm' : 'µg/m³'}</span>
        </p>
      </div>
    );
  }

  return null;
};

export default function PollutantsChart({ data, className = '' }: PollutantsChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [chartHeight, setChartHeight] = useState(300);
  const [showLongPollutantInfo, setShowLongPollutantInfo] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Adjust chart height based on screen size
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

    // Initialize
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pollutants = [
    { name: 'pm25', value: data.pm25, fill: '#f87171', fullName: 'PM2.5' },  // red
    { name: 'pm10', value: data.pm10, fill: '#fb923c', fullName: 'PM10' },  // orange
    { name: 'o3', value: data.o3, fill: '#60a5fa', fullName: 'Ozono' },      // blue
    { name: 'no2', value: data.no2, fill: '#fbbf24', fullName: 'NO₂' },    // yellow
    { name: 'so2', value: data.so2, fill: '#a78bfa', fullName: 'SO₂' },    // purple
    { name: 'co', value: data.co / 10, fill: '#4ade80', fullName: 'CO' }, // green (scaled down for visualization)
  ];

  const getBarBackground = (index: number) => {
    return activeIndex === index ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0)';
  };

  const handleBarClick = (data: any, index: number) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden dark:bg-slate-800 ${className}`}>
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-slate-700 flex flex-wrap justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Principales Contaminantes</h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Concentraciones actuales (µg/m³)</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowLongPollutantInfo(!showLongPollutantInfo)}
          className="text-gray-500 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Ver información sobre contaminantes"
        >
          <IoInformationCircleOutline className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Mobile-friendly pollutant legend */}
      <div className="px-4 sm:px-6 py-2 flex flex-wrap gap-2 border-b border-gray-200 dark:border-slate-700">
        {pollutants.map((pollutant, index) => (
          <div
            key={pollutant.name}
            className={`text-xs flex items-center px-2 py-1 rounded ${
              activeIndex === index ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`}
            onClick={() => handleBarClick(null, index)}
          >
            <span
              className="w-3 h-3 rounded-full mr-1"
              style={{ backgroundColor: pollutant.fill }}
            ></span>
            <span>{pollutant.fullName}</span>
          </div>
        ))}
      </div>

      {/* Expanded pollutant information panel */}
      {showLongPollutantInfo && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 bg-gray-50 dark:bg-gray-900/50"
        >
          <h4 className="text-sm font-medium mb-2">Información sobre contaminantes</h4>
          <div className="text-xs space-y-2 text-gray-600 dark:text-gray-300">
            <p><span className="font-semibold">PM2.5 y PM10:</span> Partículas finas y gruesas suspendidas. Pueden penetrar el sistema respiratorio y causar problemas cardiovasculares.</p>
            <p><span className="font-semibold">O₃ (Ozono):</span> Gas que se forma por reacciones químicas entre óxidos de nitrógeno y compuestos orgánicos volátiles. Puede causar problemas respiratorios.</p>
            <p><span className="font-semibold">NO₂:</span> Dióxido de nitrógeno, gas tóxico que se produce en procesos de combustión. Puede causar inflamación de las vías respiratorias.</p>
            <p><span className="font-semibold">SO₂:</span> Dióxido de azufre, se produce principalmente en la quema de combustibles fósiles. Puede causar irritación pulmonar.</p>
            <p><span className="font-semibold">CO:</span> Monóxido de carbono, gas inodoro que se produce por la combustión incompleta. Reduce la capacidad de la sangre para transportar oxígeno.</p>
          </div>
        </motion.div>
      )}

      <div className="p-2 sm:p-4" ref={chartContainerRef} style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={pollutants}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
            barSize={window.innerWidth < 640 ? 24 : 36}
            onMouseMove={(data) => {
              if (data.activeTooltipIndex !== undefined) {
                setActiveIndex(data.activeTooltipIndex);
              }
            }}
            onMouseLeave={() => setActiveIndex(null)}
            onClick={(data) => {
              if (data.activeTooltipIndex !== undefined) {
                handleBarClick(data, data.activeTooltipIndex);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f080" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => value === 'pm25' ? 'PM2.5' : value.toUpperCase()}
              tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickCount={5}
              tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={false}
            />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              isAnimationActive={true}
              animationDuration={1000}
              background={{ fill: '#f3f4f6' }}
              onClick={(data, index) => handleBarClick(data, index)}
            >
              {pollutants.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  fillOpacity={activeIndex === null || activeIndex === index ? 1 : 0.5}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-50 dark:bg-slate-900">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          * CO está escalado (dividido por 10) para mejor visualización comparativa
        </p>
      </div>
    </div>
  );
}
