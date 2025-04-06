import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  IoTimeOutline,
  IoThermometerOutline,
  IoWaterOutline,
  IoSpeedometerOutline,
  IoInformationCircleOutline,
  IoPulseOutline,
  IoRefreshOutline,
  IoHelpCircleOutline,
  IoLocationOutline,
  IoWarningOutline, // Para estados peligrosos
  IoLeafOutline, // Para estado bueno
  IoCloudOutline, // Para moderado
  IoBodyOutline, // Para insalubre GS
  IoSkullOutline, // Para muy insalubre / peligroso
  // Considera iconos más específicos si los tienes
} from 'react-icons/io5';
import { AirQualityData, AirQualityStatus } from '../types'; // Asegúrate que AirQualityStatus esté exportado
import { getAQIDescription, getWeatherIconUrl } from '../utils/airQualityUtils'; // Importa getWeatherIconUrl {{ edit: 1 }}
import { useAirQuality } from '../context/AirQualityContext';
// Importa tu componente Tooltip preferido
// import Tooltip from './Tooltip'; // Ejemplo

interface AirQualityCardProps {
  data: AirQualityData;
  className?: string;
}

export default function AirQualityCard({ data, className = '' }: AirQualityCardProps) {
  const [dateTime, setDateTime] = useState<string>('');
  const { theme, refreshData, selectedCity } = useAirQuality();

  useEffect(() => {
    const timestamp = new Date(data.timestamp);
    // Formato más legible y estándar
    const formattedDate = timestamp.toLocaleTimeString('es-MX', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }) + ' - ' + timestamp.toLocaleDateString('es-MX', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    setDateTime(formattedDate.replace(/^\w/, c => c.toUpperCase())); // Capitaliza inicio
  }, [data]);

  // --- Funciones de Estilo y Contenido ---

  const getStatusStyle = (type: 'gradient' | 'iconColor' | 'bgColor' | 'textColor' | 'ringColor') => {
    // Define colores base para cada estado (ajusta según tu paleta)
    const styles: Record<AirQualityStatus, Record<string, string>> = {
      good: { gradient: 'from-green-400 to-green-600', iconColor: 'text-green-600', bgColor: 'bg-green-500', textColor: 'text-green-700', ringColor: 'ring-green-500' },
      moderate: { gradient: 'from-yellow-400 to-yellow-600', iconColor: 'text-yellow-600', bgColor: 'bg-yellow-500', textColor: 'text-yellow-700', ringColor: 'ring-yellow-500' },
      'unhealthy-sensitive': { gradient: 'from-orange-400 to-orange-600', iconColor: 'text-orange-600', bgColor: 'bg-orange-500', textColor: 'text-orange-700', ringColor: 'ring-orange-500' },
      unhealthy: { gradient: 'from-red-400 to-red-600', iconColor: 'text-red-600', bgColor: 'bg-red-500', textColor: 'text-red-700', ringColor: 'ring-red-500' },
      'very-unhealthy': { gradient: 'from-purple-400 to-purple-600', iconColor: 'text-purple-600', bgColor: 'bg-purple-500', textColor: 'text-purple-700', ringColor: 'ring-purple-500' },
      hazardous: { gradient: 'from-rose-500 to-rose-700', iconColor: 'text-rose-600', bgColor: 'bg-rose-600', textColor: 'text-rose-700', ringColor: 'ring-rose-600' },
      unknown: { gradient: 'from-slate-400 to-slate-600', iconColor: 'text-slate-600', bgColor: 'bg-slate-500', textColor: 'text-slate-700', ringColor: 'ring-slate-500' },
    };
    const currentStatus = data.status || 'unknown';
    const selectedStyle = styles[currentStatus] || styles.unknown;

    // Adapta el color del texto principal para que contraste con el gradiente
    if (type === 'textColor' && ['unhealthy', 'very-unhealthy', 'hazardous'].includes(currentStatus)) {
        return 'text-white'; // Texto blanco en fondos oscuros/intensos
    }
    if (type === 'textColor') {
        return 'text-slate-800'; // Texto oscuro en fondos claros
    }
    // Para el icono y el anillo, usa el color base del estado
    if (type === 'iconColor') return selectedStyle.iconColor + ' dark:text-' + selectedStyle.iconColor.split('-')[1] + '-400'; // Ajuste dark mode
    if (type === 'ringColor') return selectedStyle.ringColor;
    if (type === 'bgColor') return selectedStyle.bgColor;


    return selectedStyle.gradient; // Devuelve el gradiente por defecto
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
        const iconClass = `w-6 h-6 sm:w-7 sm:h-7 ${getStatusStyle('iconColor')}`;
        switch (status) {
          case 'good': return <IoLeafOutline className={iconClass} aria-label="Buena"/>;
          case 'moderate': return <IoCloudOutline className={iconClass} aria-label="Moderada"/>;
          case 'unhealthy-sensitive': return <IoBodyOutline className={iconClass} aria-label="Dañina para Grupos Sensibles"/>;
          case 'unhealthy': return <IoWarningOutline className={iconClass} aria-label="Dañina"/>;
          case 'very-unhealthy': return <IoSkullOutline className={iconClass} aria-label="Muy Dañina"/>; // O IoWarningOutline con color más intenso
          case 'hazardous': return <IoSkullOutline className={`w-6 h-6 sm:w-7 sm:h-7 ${getStatusStyle('iconColor')} animate-pulse`} aria-label="Peligrosa"/>; // Pulso para peligro
          default: return <IoHelpCircleOutline className={iconClass} aria-label="Desconocida"/>;
        }
    };

  const handleRefresh = () => {
    refreshData();
  };

  const aqiInfoText = "El Índice de Calidad del Aire (AQI) indica qué tan limpio o contaminado está el aire. Un valor más alto significa mayor preocupación para la salud.";
  const dataSourceInfoText = "Datos de fuentes como IQAir, actualizados frecuentemente. Pueden existir ligeras variaciones o estimaciones.";

  return (
    <motion.div
      layout
      className={`rounded-xl shadow-lg overflow-hidden bg-white dark:bg-slate-800 ${className} border ${getStatusStyle('ringColor')}/30`} // Borde sutil del color del estado
    >
      {/* === SECCIÓN PRINCIPAL (Estado y AQI) === */}<div className={`relative p-5 sm:p-6 bg-gradient-to-br ${getStatusStyle('gradient')} ${getStatusStyle('textColor')}`}>

        {/* Controles Superiores (Más discretos) */}
        <div className="absolute top-3 right-3 z-10 flex items-center space-x-2">
           {/* <Tooltip content={dataSourceInfoText}> */}
            <div className={`text-[10px] px-2 py-0.5 rounded-full flex items-center bg-black/10 text-white/80 backdrop-blur-sm`}>
              <IoPulseOutline className="w-3 h-3 mr-1 text-green-400" />
              <span>Vivo</span>
            </div>
           {/* </Tooltip> */}
           <motion.button
             whileTap={{ scale: 0.9 }}
             whileHover={{ scale: 1.1, rotate: 45 }}
             onClick={handleRefresh}
             className="p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white/80 hover:text-white transition-all"
             aria-label="Refrescar datos"
           >
             <IoRefreshOutline className="w-4 h-4" />
           </motion.button>
        </div>

        {/* Info Ubicación y Hora */}
        
        <div className="mb-4 text-sm opacity-90 flex items-center justify-between">  {/* flex y justify-between para alinear icono y texto {{ edit: 2 }} */}
            

            <div className="flex items-center gap-1 text-xs opacity-80 mt-0.5 justify-end"> {/* justify-end para alinear a la derecha */}
                <IoTimeOutline className="w-3 h-3 flex-shrink-0"/>
                {dateTime}
            </div>
        </div>
        {/* Contenido Central: Estado + AQI */}
        <div className="text-center flex flex-col items-center justify-center mb-3">
             {/* 1. Icono y Texto del Estado (Lo más importante) */}
            <motion.div
                key={data.status + "-icon"} // Animar cambio de icono/texto
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-center gap-2 mb-2 p-2 rounded-lg bg-white/20 dark:bg-black/20 backdrop-blur-sm`}
            >
                {getStatusIcon(data.status)}
                <span className="text-lg sm:text-xl font-semibold tracking-tight">
                    {getStatusText(data.status)}
                </span>
            </motion.div>

            {/* 2. Número AQI con contexto */}
            <div className="flex items-baseline justify-center gap-2">
                <motion.div
                    key={data.aqi}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 120, damping: 12 }}
                    className="text-6xl sm:text-7xl font-bold"
                    style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.1)' }}
                >
                    {data.aqi}
                </motion.div>
                <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold">AQI</span>
                    <span className="text-xs opacity-80">US</span>
                </div>
                 {/* <Tooltip content={aqiInfoText}> */}
                    <button aria-label="¿Qué es AQI?" className="ml-1 text-white/60 hover:text-white">
                        <IoHelpCircleOutline className="w-4 h-4" />
                    </button>
                 {/* </Tooltip> */}
            </div>

             {/* 3. Recomendación Clara */}
            <p className="mt-3 text-sm sm:text-base max-w-xs mx-auto opacity-95 font-medium leading-snug">
                {getAQIDescription(data.status)}
            </p>
        </div>
      </div>

      {/* === SECCIÓN DE DETALLES (Más integrada) === */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50">
          <h4 className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2 tracking-wider">Detalles Ambientales</h4>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              {/* Temperatura */}
              <DetailItem
                  label="Temperatura"
                  value={`${data.temperature}°C`}
                  iconColorClass={getStatusStyle('iconColor')}
                  weatherIcon={data.weather_icon}
                  useWeatherIconAsMainIcon={true}
              />
              {/* Humedad */}
              <DetailItem
                  icon={<IoWaterOutline />}
                  label="Humedad"
                  value={`${data.humidity}%`}
                  iconColorClass={getStatusStyle('iconColor')}
              />
              {/* Viento */}
              <DetailItem
                  icon={<IoSpeedometerOutline />}
                  label="Viento"
                  value={`${data.wind?.speed ?? 'N/A'} km/h`} // Manejo de nulo
                  iconColorClass={getStatusStyle('iconColor')}
              />
              {/* Partículas PM (Agrupadas) */}
              <DetailItem
                  icon={<span className="text-xs font-bold">PM</span>} // Icono texto simple
                  label="PM₂₅ / PM₁₀"
                  value={`${data.pm25 ?? 'N/A'} / ${data.pm10 ?? 'N/A'} µg/m³`} // Añadir unidad y manejar nulos
                  iconColorClass={getStatusStyle('iconColor')}
              />
          </div>
      </div>
    </motion.div>
  );
}

// --- Componente Auxiliar para Detalles ---
interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconColorClass: string;
  weatherIcon?: string;
  useWeatherIconAsMainIcon?: boolean;
}

function DetailItem({ icon, label, value, iconColorClass, weatherIcon, useWeatherIconAsMainIcon }: DetailItemProps) { // Recibimos la nueva prop {{ edit: 5 }}
    return (
        <motion.div
            whileHover={{ scale: 1.03 }}
            className="flex items-center gap-2 p-1.5 rounded transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50"
        >
            {/* Condicional para el fondo del círculo */}
            {!useWeatherIconAsMainIcon ? ( // Si NO se usa el icono del clima como principal, muestra el círculo
                <div className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full ${iconColorClass} bg-opacity-10 dark:bg-opacity-20 bg-current`}>
                     {/* Ajusta tamaño icono si es necesario */}
                     {useWeatherIconAsMainIcon ? ( // Si se usa el icono del clima como principal
                        weatherIcon && (
                            <img
                                src={getWeatherIconUrl(weatherIcon)}
                                alt="Clima"
                                className="w-6 h-6" // Tamaño del icono principal
                            />
                        )
                     ) : (
                         <span className="w-4 h-4">{icon}</span> // Si no, usa el icono original
                     )}
                </div>
            ) : ( // Si SÍ se usa el icono del clima como principal, NO muestra el círculo
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-transparent"> {/* Fondo transparente */}
                    {weatherIcon && (
                        <img
                            src={getWeatherIconUrl(weatherIcon)}
                            alt="Clima"
                            className="w-6 h-6" // Tamaño del icono principal
                        />
                    )}
                </div>
            )}
            <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 leading-tight flex items-center gap-1"> {/* Flex para alinear icono y texto */}
                    {label}
                    {!useWeatherIconAsMainIcon && weatherIcon && ( // Mostrar icono del clima solo si NO es el principal
                        <img
                            src={getWeatherIconUrl(weatherIcon)}
                            alt="Clima"
                            className="w-4 h-4 inline-block ml-1" // Ajusta tamaño y margen
                        />
                    )}
                </div>
                <div className="font-medium text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-tight">{value}</div>
            </div>
        </motion.div>
    );
}