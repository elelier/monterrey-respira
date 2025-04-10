import { useAirQuality } from '../context/AirQualityContext';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import AirQualityCard from '../components/AirQualityCard';
//import PollutantsChart from '../components/PollutantsChart';
import Recommendations from '../components/Recommendations';
//import HistoricalChart from '../components/HistoricalChart';
//import PollutantsInfo from '../components/PollutantsInfo';
import CitySelector from '../components/CitySelector';
//import StationMap from '../components/StationMap';
//import AirQualityHeatmap from '../components/AirQualityHeatmap';
//import PollutantConcentrationMap from '../components/PollutantConcentrationMap';
//import CityMapPlaceholder from '../components/CityMapPlaceholder';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { IoArrowForwardOutline, IoEarthOutline, IoLeafOutline, IoHelpBuoyOutline } from 'react-icons/io5';

export default function Dashboard() {
  const { airQualityData, loading, error, refreshData, selectedCity, changeCity, theme } = useAirQuality();
  const [useStaticMap, setUseStaticMap] = useState(false);
  const [activeMapView, setActiveMapView] = useState<'standard' | 'heatmap' | 'pollutant'>('standard');

  // Manejar errores en la carga del mapa
  useEffect(() => {
    const handleMapError = (event: ErrorEvent) => {
      // Si hay un error relacionado con Leaflet o mapas, cambiamos al placeholder
      if (event.message.includes('Leaflet') || event.filename?.includes('leaflet')) {
        console.warn('Error con el mapa: ', event.message);
        setUseStaticMap(true);
      }
    };

    window.addEventListener('error', handleMapError);

    return () => {
      window.removeEventListener('error', handleMapError);
    };
  }, []);

  // Obtener estilos de color basados en la calidad del aire
  const getStatusButtonClass = () => {
    if (!theme) return 'bg-blue-500 hover:bg-blue-600 text-white';

    switch (theme.primary) {
      case '#4ade80': return 'bg-green-500 hover:bg-green-600 text-white';
      case '#fbbf24': return 'bg-amber-500 hover:bg-amber-600 text-white';
      case '#fb923c': return 'bg-orange-500 hover:bg-orange-600 text-white';
      case '#f87171': return 'bg-red-500 hover:bg-red-600 text-white';
      case '#c084fc': return 'bg-purple-500 hover:bg-purple-600 text-white';
      case '#9f1239': return 'bg-rose-600 hover:bg-rose-700 text-white';
      default: return 'bg-blue-500 hover:bg-blue-600 text-white';
    }
  };

  const getStatusBorderClass = () => {
    if (!theme) return 'border-blue-500';

    switch (theme.primary) {
      case '#4ade80': return 'border-green-500';
      case '#fbbf24': return 'border-amber-500';
      case '#fb923c': return 'border-orange-500';
      case '#f87171': return 'border-red-500';
      case '#c084fc': return 'border-purple-500';
      case '#9f1239': return 'border-rose-600';
      default: return 'border-blue-500';
    }
  };

  if (loading && !airQualityData) {
    // Definir los colores en orden
    const colors = [
      'green-500',
      'amber-500',
      'orange-500',
      'red-500',
      'purple-500',
      'rose-600',
      'blue-500'
    ];

    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20">
          <motion.div
            className="w-28 h-28 border-8 text-4xl animate-spin border-gray-300 flex items-center justify-center rounded-full"
            animate={{
              borderColor: colors,
              color: colors
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "circInOut",
              times: [0, 0.2, 0.4, 0.6, 0.8, 1]
            }}
          >
            <svg viewBox="0 0 24 24" height="1em" width="1em" className="animate-ping">
              <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </motion.div>
          <p className="mt-4 text-lg">Cargando datos de calidad del aire...</p>
        </div>
      </Layout>
    );
  }

  if (error && !airQualityData) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <button
            onClick={() => refreshData()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      </Layout>
    );
  }

  if (!airQualityData) {
    return null; // Fallback mientras carga
  }

  return (
    <Layout>
      {/* Selector de ciudad */}
      <div className="relative mb-5 sticky top-[65px] z-10 py-5">
      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/70 to-transparent backdrop-blur-md z-[-1] pointer-events-none" />      <CitySelector onCityChange={changeCity} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primera columna */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Tarjeta principal de calidad del aire */}
          <AirQualityCard data={airQualityData} />
          {/* Recomendaciones basadas en la calidad del aire */}
          <Recommendations status={airQualityData.status} />
          

        </div>

        {/* Segunda columna */}
        
      </div>

      {/* CTA para asociaciones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className={`mt-10 rounded-xl p-6 border-2 ${getStatusBorderClass()} bg-white dark:bg-gray-800 shadow-lg`}
      >
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 md:mr-6">
            <h2 className="text-2xl font-bold mb-3">¿Quieres ayudar a mejorar la calidad del aire?</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Conoce las asociaciones y organizaciones que trabajan activamente para mejorar el aire que respiramos en Monterrey y su área metropolitana.
            </p>
          </div>
          <Link
            to="/asociaciones"
            className={`inline-flex items-center px-6 py-3 rounded-md ${getStatusButtonClass()} transition-colors font-medium text-lg`}
          >
            Únete al movimiento <IoArrowForwardOutline className="ml-2" />
          </Link>
        </div>
      </motion.div>

{/* Sección de recursos temáticos según la calidad del aire */}
<div className="mt-10">
        <h2 className="text-xl font-bold mb-6" style={{ color: theme?.text }}>Recursos para cuidar nuestra calidad del aire</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="https://www.who.int/es/news-room/fact-sheets/detail/ambient-(outdoor)-air-quality-and-health" target="_blank">
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow h-full cursor-pointer" style={{ borderColor: theme?.primary }}
            >
              <div className="p-6 flex flex-col items-center text-center h-full">
                <div className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center`} style={{ backgroundColor: theme?.primary }}>
                  <IoEarthOutline className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: theme?.text }}>Monitoreo Ambiental</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Accede a datos en tiempo real y aprende a interpretar los índices de calidad del aire y su impacto en la salud.
                </p>
              </div>
            </motion.div>
          </Link>

          <Link to="http://aire.nl.gob.mx/map_calidad.html" target="_blank">
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow h-full cursor-pointer" style={{ borderColor: theme?.primary }}
            >
              <div className="p-6 flex flex-col items-center text-center h-full">
                <div className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center`} style={{ backgroundColor: theme?.primary }}>
                  <IoLeafOutline className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: theme?.text }}>Acciones Cotidianas</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Descubre qué puedes hacer en tu día a día para contribuir a mejorar la calidad del aire en tu comunidad.
                </p>
              </div>
            </motion.div>
          </Link>

          <Link to="https://www.gob.mx/cofepris/documentos/protegete-de-la-contaminacion-ambiental" target="_blank">
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow h-full cursor-pointer" style={{ borderColor: theme?.primary }}
            >
              <div className="p-6 flex flex-col items-center text-center h-full">
                <div className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center`} style={{ backgroundColor: theme?.primary }}>
                  <IoHelpBuoyOutline className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: theme?.text }}>Protección Personal</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Medidas de protección personal y familiar durante episodios de contaminación elevada del aire.
                </p>
              </div>
            </motion.div>
          </Link>
        </div>
      </div>
      
      {/* Sección de fuentes de datos */}
      <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Fuentes de Datos</h2>

        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>Esta aplicación integra y procesa datos de múltiples fuentes para proporcionar información completa sobre la calidad del aire en Monterrey:</p>

          <ul className="list-disc pl-5 mt-3 space-y-2">
            <li>
              <strong>IQAir (AirVisual):</strong> Proporciona datos en tiempo real de la calidad del aire en todo el mundo.
              <a href="https://www.iqair.com/air-pollution-data-api" target="_blank" rel="noopener noreferrer" className={`ml-1 hover:underline ${getStatusBorderClass().replace('border-', 'text-')}`}>Ver API</a>
            </li>
            <li>
              <strong>Sistema Integral de Monitoreo Ambiental (SIMA):</strong> Red de estaciones de monitoreo que cubre la zona metropolitana de Monterrey.
              <a href="http://aire.nl.gob.mx/" target="_blank" rel="noopener noreferrer" className={`ml-1 hover:underline ${getStatusBorderClass().replace('border-', 'text-')}`}>Ver sitio oficial</a>
            </li>
          </ul>

          <p className={`mt-4 p-3 rounded-lg ${getStatusButtonClass().replace('bg-', 'bg-').replace('hover:bg-', 'bg-').replace('text-white', 'bg-opacity-10 ' + getStatusBorderClass().replace('border-', 'text-'))}`}>
            <strong>Última actualización:</strong> {airQualityData ? new Date(airQualityData.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : 'Cargando...'}
          </p>
        </div>
      </div>
    </Layout>
  );
}
