import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IoTimeOutline,
  IoThermometerOutline,
  IoWaterOutline,
  IoSpeedometerOutline,
  IoHelpCircleOutline,
  IoPulseOutline,
  IoRefreshOutline,
  IoLeafOutline,
  IoCloudOutline,
  IoBodyOutline,
  IoWarningOutline,
  IoSkullOutline,
  IoInformationCircleOutline,
  IoChevronDownOutline
} from 'react-icons/io5';
import { AirQualityData, AirQualityStatus } from '../types';
import { getAQIDescription, getWeatherIconUrl, getHumidityIcon, getWindIcon, getPollutantInfo, getMainPollutantIcon } from '../utils/airQualityUtils'; // ✅ ¡Verifica que getMainPollutantIcon esté en la lista!
import { useAirQuality } from '../context/AirQualityContext';

interface AirQualityCardProps {
  data: AirQualityData;
  className?: string;
}

export default function AirQualityCard({ data, className = '' }: AirQualityCardProps) {
  const [dateTime, setDateTime] = useState<string>('');
  const [showDetails, setShowDetails] = useState<boolean>(true);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  console.log("AirQualityCard is mounting...");
  const { refreshData } = useAirQuality();
  

  useEffect(() => {
    const timestamp = new Date(data.timestamp);
    const formattedDate = timestamp.toLocaleTimeString('es-MX', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }) + ' - ' + timestamp.toLocaleDateString('es-MX', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    setDateTime(formattedDate.replace(/^\w/, c => c.toUpperCase()));
  }, [data]);

  const getStatusStyle = (type: 'gradient' | 'iconColor' | 'bgColor' | 'textColor' | 'ringColor') => {
    const styles: Record<AirQualityStatus, Record<string, string>> = {
      good: { gradient: 'from-green-400 to-green-500', iconColor: 'text-green-600', bgColor: 'bg-green-500', textColor: 'text-green-700', ringColor: 'ring-green-500' },
      moderate: { gradient: 'from-yellow-400 to-yellow-500', iconColor: 'text-yellow-600', bgColor: 'bg-yellow-500', textColor: 'text-yellow-700', ringColor: 'ring-yellow-500' },
      'unhealthy-sensitive': { gradient: 'from-orange-400 to-orange-500', iconColor: 'text-orange-600', bgColor: 'bg-orange-500', textColor: 'text-orange-700', ringColor: 'ring-orange-500' },
      unhealthy: { gradient: 'from-red-400 to-red-500', iconColor: 'text-red-600', bgColor: 'bg-red-500', textColor: 'text-red-700', ringColor: 'ring-red-500' },
      'very-unhealthy': { gradient: 'from-purple-400 to-purple-500', iconColor: 'text-purple-600', bgColor: 'bg-purple-500', textColor: 'text-purple-700', ringColor: 'ring-purple-500' },
      hazardous: { gradient: 'from-rose-500 to-rose-600', iconColor: 'text-rose-600', bgColor: 'bg-rose-600', textColor: 'text-rose-700', ringColor: 'ring-rose-600' },
      unknown: { gradient: 'from-slate-400 to-slate-500', iconColor: 'text-slate-600', bgColor: 'bg-slate-500', textColor: 'text-slate-700', ringColor: 'ring-slate-500' },
    };
    const currentStatus = data.status || 'unknown';
    const selectedStyle = styles[currentStatus] || styles.unknown;

    if (type === 'textColor' && ['unhealthy', 'very-unhealthy', 'hazardous'].includes(currentStatus)) {
        return 'text-white';
    }
    if (type === 'textColor') return 'text-slate-800';
    if (type === 'iconColor') return selectedStyle.iconColor + ' dark:text-' + selectedStyle.iconColor.split('-')[1] + '-400';
    if (type === 'ringColor') return selectedStyle.ringColor;
    if (type === 'bgColor') return selectedStyle.bgColor;

    return selectedStyle.gradient;
  };

  const getStatusText = (status: AirQualityStatus | undefined): string => {
    switch (status) {
      case 'good': return 'Buena';
      case 'moderate': return 'Moderada';
      case 'unhealthy-sensitive': return 'Dañina (Grupos Sensibles)';
      case 'unhealthy': return 'Dañina';
      case 'very-unhealthy': return 'Muy Dañina';
      case 'hazardous': return 'Peligrosa';
      default: return 'Desconocida';
    }
  };

  const getStatusIcon = (status: AirQualityStatus | undefined) => {
    const iconClass = `w-6 h-6 ${getStatusStyle('iconColor')}`;
    switch (status) {
      case 'good': return <IoLeafOutline className={iconClass} aria-label="Buena" />;
      case 'moderate': return <IoCloudOutline className={iconClass} aria-label="Moderada" />;
      case 'unhealthy-sensitive': return <IoBodyOutline className={iconClass} aria-label="Dañina para Grupos Sensibles" />;
      case 'unhealthy': return <IoWarningOutline className={iconClass} aria-label="Dañina" />;
      case 'very-unhealthy': return <IoSkullOutline className={iconClass} aria-label="Muy Dañina" />;
      case 'hazardous': return <IoSkullOutline className={`w-6 h-6 ${getStatusStyle('iconColor')} animate-pulse`} aria-label="Peligrosa" />;
      default: return <IoHelpCircleOutline className={iconClass} aria-label="Desconocida" />;
    }
  };

  const handleRefresh = () => {
    refreshData();
  };

  return (
    <motion.div
      layout
      className={`rounded-2xl shadow-md overflow-hidden bg-white dark:bg-slate-800 ${className} border-2 ${getStatusStyle('ringColor')}/20`}
    >
      <div className={`relative p-4 sm:p-6 bg-gradient-to-br ${getStatusStyle('gradient')} ${getStatusStyle('textColor')}`}>
        {/* Header with controls */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-1 text-xs text-white/90">
            <IoTimeOutline className="w-3 h-3" />
            <span>{dateTime}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.div 
              className="px-2 py-0.5 rounded-full flex items-center bg-white/15 text-white backdrop-blur-sm text-xs"
              animate={{
                opacity: [1, 0.5, 1],
                color: ['#4ADE80', '#FFFFFF', '#4ADE80']
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <motion.div 
                className="w-3 h-3 mr-1"
                animate={{
                  scale: [1, 1.1, 1],
                  color: ['#4ADE80', '#FFFFFF', '#4ADE80']
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </motion.div>
              <span>online</span>
            </motion.div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={handleRefresh}
              className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-all"
              aria-label="Refrescar datos"
            >
              <IoRefreshOutline className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* AQI Information */}
        <div className="text-center flex flex-col items-center justify-center mb-3">
          <motion.div
            key={data.status + "-icon"}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 mb-3 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm cursor-pointer"
          >
            <motion.div
              whileHover={{
                scale: 1.2,
                transition: {
                  duration: 0.2
                }
              }}
              className="w-8 h-8 flex items-center justify-center"
            >
              {getStatusIcon(data.status)}
            </motion.div>
            <span className="text-lg font-semibold text-white">
              {getStatusText(data.status)}
            </span>
          </motion.div>

          <div className="relative flex items-center justify-center mb-2">
            <motion.div
              key={data.aqi}
              initial={{ scale: 1 }}
              animate={{
                scale: [1, 1.15, 1],
                transition: {
                  duration: 6, // 6 segundos para una respiración completa
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              className="text-7xl font-bold text-white"
              style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.15)' }}
            >
              {data.aqi}
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
                    <IoHelpCircleOutline className="w-4 h-4" />
                  </button>
                  
                  <AnimatePresence>
                    {showTooltip && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute z-20 right-0 w-48 p-2 text-xs text-left bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg shadow-lg"
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

          <p className="mt-1 text-sm max-w-xs mx-auto text-white/90 font-medium">
            {getAQIDescription(data.status)}
          </p>
        </div>
      </div>

      {/* Details Section */}
      <div className="bg-slate-50 dark:bg-slate-800/50">
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700/30"
        >
          <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">Detalles Ambientales</h4>
          <motion.div
            animate={{ rotate: showDetails ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <IoChevronDownOutline className="w-4 h-4 text-slate-500 dark:text-slate-400" />
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
                  value={`${data.temperature}°C`}
                  iconColorClass={getStatusStyle('iconColor')}
                  weatherIcon={data.weather_icon}
                  useWeatherIconAsMainIcon={true}
                />
                <DetailItem
                  label="Humedad"
                  value={`${data.humidity}%`}
                  iconColorClass={getStatusStyle('iconColor')}
                  useHumidityIcon={true} // 👈 Indicamos que use el icono de humedad
                  humidityValue={data.humidity} // 👈 Le pasamos el valor de humedad
                />
                <DetailItem
                  label="Viento"
                  value={`${data.wind?.speed ?? 'N/A'} km/h`}
                  iconColorClass={getStatusStyle('iconColor')}
                  useWindIcon={true} // 👈 Indicamos que use el icono de viento
                  windSpeed={data.wind?.speed} // 👈 Pasamos la velocidad del viento
                  windDirection={data.wind?.direction} // 👈 Pasamos la dirección del viento
                />
                <DetailItem
                  useMainPollutantIcon={true}
                  label="Contaminantes"
                  value={data.main_pollutant_us ? getPollutantInfo(data.main_pollutant_us).name : 'N/A'} // ✅ ¡REVISA QUE ESTÉ .name AQUÍ!
                  iconColorClass={getStatusStyle('iconColor')}
                  tooltipText={data.main_pollutant_us ? getPollutantInfo(data.main_pollutant_us).description : "No hay información disponible sobre el contaminante principal."}
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
  weatherIcon?: string;
  useWeatherIconAsMainIcon?: boolean;
  tooltipText?: string;
  useHumidityIcon?: boolean; 
  humidityValue?: number;
  useWindIcon?: boolean;    
  windSpeed?: number;        
  windDirection?: number;       
  useMainPollutantIcon?: boolean;
}

function DetailItem({ icon, label, value, iconColorClass, weatherIcon, useWeatherIconAsMainIcon, tooltipText, useHumidityIcon, humidityValue, useWindIcon, windSpeed, windDirection, useMainPollutantIcon }: DetailItemProps) { // ✅ ¡Asegúrate que useMainPollutantIcon esté AQUÍ en los parámetros!
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-center gap-3 p-2 rounded-lg transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50 relative"
    >
      {!useWeatherIconAsMainIcon && !useHumidityIcon && !useWindIcon && !useMainPollutantIcon ? ( // ✅ ¡Asegúrate que useMainPollutantIcon esté en la CONDICIÓN NEGATIVA!
        <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${iconColorClass} bg-opacity-10 dark:bg-opacity-20 bg-current`}>
          <span className="w-4 h-4 text-white dark:text-white">{icon}</span>
        </div>
      ) : useWeatherIconAsMainIcon ? (
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full">
          {weatherIcon && (
            <img
              src={getWeatherIconUrl(weatherIcon)}
              alt="Clima"
              className="w-8 h-8"
            />
          )}
        </div>
      ) : useHumidityIcon ? (
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full">
          {humidityValue !== undefined && (
            <img
              src={getHumidityIcon(humidityValue)}
              alt="Humedad"
              className="w-8 h-8"
            />
          )}
        </div>
      ) : useWindIcon ? ( // 👈 Nueva condición para iconos de viento
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full">
          {windSpeed !== undefined && windDirection !== undefined && (
            <img
              src={getWindIcon(windSpeed, windDirection).icon} // 👈 Usamos getWindIcon para obtener el icono
              alt="Viento"
              className="w-8 h-8"
              style={{ transform: `rotate(${getWindIcon(windSpeed, windDirection).rotation}deg)` }} // 👈 Aplicamos rotación
            />
          )}
        </div>
      ) : useMainPollutantIcon ? ( // ☢️ ¡BLOQUE PARA EL ICONO RADIOACTIVO!
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full">
          <img
            src={getMainPollutantIcon()} // ✅ ¡Aquí LLAMAMOS a getMainPollutantIcon()!
            alt="Contaminante"
            className="w-8 h-8"
          />
        </div>
      ) : null}
      <div className="flex-1">
        <div className="flex items-center">
          <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">{label}</div>
          {tooltipText && (
            <div className="relative ml-1">
              <button
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <IoInformationCircleOutline className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {showTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute z-10 bottom-full left-0 w-40 p-2 text-xs bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded shadow-lg mb-1"
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