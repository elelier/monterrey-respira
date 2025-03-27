import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  IoTimeOutline,
  IoThermometerOutline,
  IoWaterOutline,
  IoSpeedometerOutline,
  IoInformationCircleOutline,
  IoCloudOutline,
  IoWarningOutline,
  IoRefreshOutline
} from 'react-icons/io5';
import { AirQualityData } from '../types';
import { getAQIDescription } from '../utils/airQualityUtils';
import { useAirQuality } from '../context/AirQualityContext';

interface AirQualityCardProps {
  data: AirQualityData;
  className?: string;
}

export default function AirQualityCard({ data, className = '' }: AirQualityCardProps) {
  const [dateTime, setDateTime] = useState<string>('');
  const [isSimulated, setIsSimulated] = useState<boolean>(false);
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const { theme, refreshData } = useAirQuality();

  useEffect(() => {
    const timestamp = new Date(data.timestamp);
    const formattedDate = new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: 'numeric',
      minute: 'numeric',
    }).format(timestamp);

    // Capitalize first letter
    const dateStr = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    setDateTime(dateStr);

    // Determinar si los datos son simulados
    // Esta es una forma aproximada de detectar datos simulados basada en patrones
    // Los datos reales suelen tener más variabilidad en los decimales
    const isProbablySimulated =
      (data.pm25 % 1 === 0 && data.pm10 % 1 === 0 && data.o3 % 1 === 0) || // Todos son números enteros exactos
      (Math.round(data.o3) === Math.round(data.aqi * 0.4)) || // Coincide con la fórmula de simulación
      (Math.round(data.no2) === Math.round(data.aqi * 0.3)); // Coincide con la fórmula de simulación

    setIsSimulated(isProbablySimulated);
  }, [data]);

  // Get the status-based color directly from the theme context
  const getBgGradient = () => {
    if (!theme) return 'from-blue-400 to-blue-500';
    return theme.gradient;
  };

  // Get the complementary text color for the status
  const getInfoBgColor = () => {
    if (!theme) return 'bg-white/10';

    // Seleccionar un color de fondo semi-transparente basado en el tema
    switch (theme.primary) {
      case '#4ade80': return 'bg-green-50/20 text-green-50';
      case '#fbbf24': return 'bg-amber-50/20 text-amber-50';
      case '#fb923c': return 'bg-orange-50/20 text-orange-50';
      case '#f87171': return 'bg-red-50/20 text-red-50';
      case '#c084fc': return 'bg-purple-50/20 text-purple-50';
      case '#9f1239': return 'bg-rose-50/20 text-rose-50';
      default: return 'bg-blue-50/20 text-blue-50';
    }
  };

  // Get badge colors based on the theme
  const getStatusIndicatorClass = () => {
    if (!theme) return 'bg-blue-600/80 text-white';

    switch (theme.primary) {
      case '#4ade80': return 'bg-green-600/80 text-white';
      case '#fbbf24': return 'bg-amber-600/80 text-white';
      case '#fb923c': return 'bg-orange-600/80 text-white';
      case '#f87171': return 'bg-red-600/80 text-white';
      case '#c084fc': return 'bg-purple-600/80 text-white';
      case '#9f1239': return 'bg-rose-600/80 text-white';
      default: return 'bg-blue-600/80 text-white';
    }
  };

  const getRefreshButtonClass = () => {
    if (!theme) return 'bg-white/20 hover:bg-white/30';
    return 'bg-white/20 hover:bg-white/30';
  };

  const getStatusText = () => {
    switch (data.status) {
      case 'good':
        return 'Buena';
      case 'moderate':
        return 'Moderada';
      case 'unhealthy-sensitive':
        return 'Insalubre para grupos sensibles';
      case 'unhealthy':
        return 'Insalubre';
      case 'very-unhealthy':
        return 'Muy insalubre';
      case 'hazardous':
        return 'Peligrosa';
      default:
        return 'Desconocida';
    }
  };

  const handleRefresh = () => {
    refreshData();
  };

  return (
    <div
      className={`rounded-xl shadow-lg overflow-hidden ${className}`}
    >
      <div className={`bg-gradient-to-r ${getBgGradient()} p-4 sm:p-6 text-white relative`}>
        {/* Refresh button in top-right corner */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleRefresh}
          className={`absolute top-2 left-2 p-2 rounded-full ${getRefreshButtonClass()} transition-colors z-10`}
          aria-label="Refrescar datos"
        >
          <IoRefreshOutline className="w-5 h-5" />
        </motion.button>

        {/* Indicador de datos simulados/reales */}
        <div className="absolute top-2 right-2">
          {isSimulated ? (
            <div className={`${getStatusIndicatorClass()} text-xs px-2 py-1 rounded-full flex items-center`}>
              <IoWarningOutline className="mr-1" />
              <span className="hidden sm:inline">Datos simulados</span>
              <span className="sm:hidden">Simulados</span>
            </div>
          ) : (
            <div className={`${getStatusIndicatorClass()} text-xs px-2 py-1 rounded-full flex items-center`}>
              <IoCloudOutline className="mr-1" />
              <span className="hidden sm:inline">Datos en vivo</span>
              <span className="sm:hidden">En vivo</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mt-6 sm:mt-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Calidad del Aire</h2>
            <p className="text-sm opacity-90 flex items-center mt-1">
              <IoTimeOutline className="mr-1 flex-shrink-0" />
              <span className="truncate">{dateTime}</span>
            </p>
            <div className="mt-2">
              <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
                {data.location.name}
              </span>
            </div>
          </div>

          <div className="flex items-end justify-between sm:justify-end sm:text-right mt-4 sm:mt-0">
            <div className="flex items-center sm:justify-end">
              <motion.div
                className="text-5xl sm:text-6xl font-bold"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                {data.aqi}
              </motion.div>
              <div className="ml-2 text-right">
                <div className="text-xs font-semibold uppercase tracking-wider opacity-90">Índice</div>
                <div className="text-xs font-semibold uppercase tracking-wider opacity-90">AQI</div>
              </div>
            </div>
            <span className={`ml-auto sm:ml-0 sm:mt-2 inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusIndicatorClass()}`}>
              {getStatusText()}
            </span>
          </div>
        </div>

        <p className="mt-4 text-sm opacity-90">{getAQIDescription(data.status)}</p>

        {/* Information button for mobile */}
        <button
          onClick={() => setIsInfoVisible(!isInfoVisible)}
          className="mt-3 p-2 rounded w-full sm:hidden flex items-center justify-center"
          aria-expanded={isInfoVisible}
          aria-label="Mostrar información adicional"
        >
          <span className="text-xs mr-1">
            {isInfoVisible ? 'Ocultar información' : 'Mostrar información'}
          </span>
          <IoInformationCircleOutline className="w-4 h-4" />
        </button>

        {/* Información sobre datos simulados */}
        <div className={`mt-3 p-2 rounded text-xs flex items-start ${getInfoBgColor()} ${isInfoVisible ? 'block' : 'hidden sm:flex'}`}>
          <IoInformationCircleOutline className="min-w-5 w-5 h-5 mr-1 mt-0.5" />
          <span>
            {isSimulated
              ? "Los datos mostrados son simulados debido a limitaciones en el acceso a APIs públicas de calidad del aire. Los valores son estimaciones aproximadas."
              : "Los datos provienen de APIs públicas en tiempo real. Algunos valores pueden complementarse con estimaciones cuando no están disponibles de las fuentes."}
          </span>
        </div>
      </div>

      <div className="bg-white p-4 dark:bg-slate-800 dark:text-white">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="flex items-center">
            <div className="bg-slate-100 p-2 rounded-full dark:bg-slate-700">
              <IoThermometerOutline className="text-slate-500 w-5 h-5 dark:text-slate-300" />
            </div>
            <div className="ml-3">
              <div className="text-xs text-slate-500 dark:text-slate-400">Temperatura</div>
              <div className="font-semibold">{data.temperature}°C</div>
            </div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="flex items-center">
            <div className="bg-slate-100 p-2 rounded-full dark:bg-slate-700">
              <IoWaterOutline className="text-slate-500 w-5 h-5 dark:text-slate-300" />
            </div>
            <div className="ml-3">
              <div className="text-xs text-slate-500 dark:text-slate-400">Humedad</div>
              <div className="font-semibold">{data.humidity}%</div>
            </div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="flex items-center">
            <div className="bg-slate-100 p-2 rounded-full dark:bg-slate-700">
              <IoSpeedometerOutline className="text-slate-500 w-5 h-5 dark:text-slate-300" />
            </div>
            <div className="ml-3">
              <div className="text-xs text-slate-500 dark:text-slate-400">Viento</div>
              <div className="font-semibold">{data.wind.speed} km/h</div>
            </div>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`p-2 rounded-full bg-gradient-to-r ${getBgGradient()} text-white`}>
              <span className="font-bold text-sm">PM</span>
            </motion.div>
            <div className="ml-3">
              <div className="text-xs text-slate-500 dark:text-slate-400">PM2.5/PM10</div>
              <div className="font-semibold">{data.pm25}/{data.pm10}</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
