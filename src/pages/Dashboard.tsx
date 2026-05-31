import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoArrowForwardOutline, IoEarthOutline, IoHelpBuoyOutline, IoLeafOutline } from 'react-icons/io5';
import { useAirQuality } from '../context/AirQualityContext';
import Layout from '../components/Layout';
import AirQualityCard from '../components/AirQualityCard';
import Recommendations from '../components/Recommendations';
import CitySelector from '../components/CitySelector';
import AirQualityMap from '../components/AirQualityMap';
import CityHistoricalTrend from '../components/CityHistoricalTrend';
import DataTrustExplainer from '../components/DataTrustExplainer';
import { hasReliableAqi } from '../utils/airQualityDisplay';

export default function Dashboard() {
  const {
    airQualityData,
    loading,
    error,
    refreshData,
    changeCity,
    theme,
    selectedCity,
    cityOptions,
  } = useAirQuality();

  const getStatusButtonClass = () => {
    if (!theme) return 'bg-blue-500 hover:bg-blue-600 text-white';

    switch (theme.primary) {
      case '#4ade80': return 'bg-green-500 hover:bg-green-600 text-white';
      case '#fbbf24': return 'bg-amber-500 hover:bg-amber-600 text-white';
      case '#fb923c': return 'bg-orange-500 hover:bg-orange-600 text-white';
      case '#f87171': return 'bg-red-500 hover:bg-red-600 text-white';
      case '#c084fc': return 'bg-purple-500 hover:bg-purple-600 text-white';
      case '#9f1239': return 'bg-rose-600 hover:bg-rose-700 text-white';
      case '#64748b': return 'bg-slate-500 hover:bg-slate-600 text-white';
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
      case '#64748b': return 'border-slate-500';
      default: return 'border-blue-500';
    }
  };

  if (loading && !airQualityData) {
    const colors = [
      'green-500',
      'amber-500',
      'orange-500',
      'red-500',
      'purple-500',
      'rose-600',
      'blue-500',
    ];

    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20">
          <motion.div
            className="flex h-28 w-28 animate-spin items-center justify-center rounded-full border-8 border-gray-300 text-4xl"
            animate={{
              borderColor: colors,
              color: colors,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'circInOut',
              times: [0, 0.2, 0.4, 0.6, 0.8, 1],
            }}
          >
            <svg viewBox="0 0 24 24" height="1em" width="1em" className="animate-ping">
              <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" fill="currentColor" stroke="currentColor" strokeWidth="2" />
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
          <div className="relative rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
          <button
            onClick={() => refreshData()}
            className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
            type="button"
          >
            Intentar de nuevo
          </button>
        </div>
      </Layout>
    );
  }

  if (!airQualityData) {
    return null;
  }

  return (
    <Layout>
      <div className="relative sticky top-14 z-[1000] mb-1 py-1.5 sm:top-16 sm:mb-3 sm:py-3">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[-1] h-full bg-gradient-to-b from-white/95 via-white/85 to-transparent backdrop-blur-md dark:from-slate-950/95 dark:via-slate-950/80" />
        <CitySelector
          onCityChange={changeCity}
          selectedCity={selectedCity}
          cityOptions={cityOptions}
        />
      </div>

      {airQualityData.dataQuality === 'degraded'
        && airQualityData.measurementFreshness !== 'stale'
        && airQualityData.degradationReason && (
        <div className="mb-4 hidden rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:block" role="status">
          {airQualityData.degradationReason}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="status">
          {error}
        </div>
      )}

      <div id="datos" className="grid scroll-mt-24 grid-cols-1 gap-2 lg:grid-cols-3 lg:gap-6">
        <div className="flex flex-col gap-2 lg:col-span-2 lg:gap-6">
          <AirQualityCard data={airQualityData} />
          <CityHistoricalTrend cityId={selectedCity.city_id} cityName={selectedCity.name} />
          <Recommendations status={hasReliableAqi(airQualityData) ? airQualityData.status : 'unknown'} />
          <div className="lg:hidden">
            <AirQualityMap />
          </div>
        </div>
      </div>

      <div className="relative z-0 mt-6 hidden lg:block">
        <AirQualityMap />
      </div>

      <div className="mt-8">
        <DataTrustExplainer variant="compact" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className={`mt-8 rounded-2xl border-2 ${getStatusBorderClass()} bg-white p-4 shadow-lg dark:bg-gray-800 sm:mt-10 sm:p-6`}
      >
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="md:mr-6">
            <h2 className="mb-2 text-[1.1rem] font-bold leading-tight sm:mb-3 sm:text-2xl">
              ¿Quieres actuar por un aire más limpio?
            </h2>
            <p className="mb-0 text-sm text-gray-600 dark:text-gray-300 sm:mb-4 sm:text-base">
              Consulta organizaciones, recursos ciudadanos y una campaña externa con opciones para firmar,
              voluntariar o informarte sin compartir datos con MtyRespira.
            </p>
          </div>
          <Link
            to="/asociaciones#desahogate"
            className={`inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors sm:px-6 sm:py-3 sm:text-lg ${getStatusButtonClass()}`}
          >
            Ver formas de participar <IoArrowForwardOutline className="ml-2" />
          </Link>
        </div>
      </motion.div>

      <div className="mt-8">
        <h2 className="mb-4 text-[1.05rem] font-bold sm:mb-6 sm:text-xl" style={{ color: theme?.text }}>
          Recursos para cuidar nuestra calidad del aire
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 sm:gap-6">
          <a
            href="https://www.who.int/es/news-room/fact-sheets/detail/ambient-(outdoor)-air-quality-and-health"
            target="_blank"
            rel="noopener noreferrer"
          >
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="h-full cursor-pointer overflow-hidden rounded-xl bg-white shadow dark:bg-slate-800"
              style={{ borderColor: theme?.primary }}
            >
              <div className="flex h-full flex-col items-center p-4 text-center sm:p-6">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full sm:mb-4 sm:h-16 sm:w-16" style={{ backgroundColor: theme?.primary }}>
                  <IoEarthOutline className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                </div>
                <h3 className="mb-2 text-base font-semibold sm:mb-3 sm:text-lg" style={{ color: theme?.text }}>
                  Entender el AQI
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Lee una guía de salud ambiental para interpretar la contaminación del aire y sus riesgos.
                </p>
              </div>
            </motion.div>
          </a>

          <a
            href="http://aire.nl.gob.mx/map_calidad.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="h-full cursor-pointer overflow-hidden rounded-xl bg-white shadow dark:bg-slate-800"
              style={{ borderColor: theme?.primary }}
            >
              <div className="flex h-full flex-col items-center p-4 text-center sm:p-6">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full sm:mb-4 sm:h-16 sm:w-16" style={{ backgroundColor: theme?.primary }}>
                  <IoLeafOutline className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                </div>
                <h3 className="mb-2 text-base font-semibold sm:mb-3 sm:text-lg" style={{ color: theme?.text }}>
                  Consultar red oficial
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Abre el mapa oficial de calidad del aire de Nuevo León para comparar lecturas públicas.
                </p>
              </div>
            </motion.div>
          </a>

          <a
            href="https://www.gob.mx/cofepris/documentos/protegete-de-la-contaminacion-ambiental"
            target="_blank"
            rel="noopener noreferrer"
          >
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="h-full cursor-pointer overflow-hidden rounded-xl bg-white shadow dark:bg-slate-800"
              style={{ borderColor: theme?.primary }}
            >
              <div className="flex h-full flex-col items-center p-4 text-center sm:p-6">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full sm:mb-4 sm:h-16 sm:w-16" style={{ backgroundColor: theme?.primary }}>
                  <IoHelpBuoyOutline className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                </div>
                <h3 className="mb-2 text-base font-semibold sm:mb-3 sm:text-lg" style={{ color: theme?.text }}>
                  Protegerte en mala calidad
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Revisa medidas personales y familiares para episodios de contaminación elevada.
                </p>
              </div>
            </motion.div>
          </a>
        </div>
      </div>
    </Layout>
  );
}
