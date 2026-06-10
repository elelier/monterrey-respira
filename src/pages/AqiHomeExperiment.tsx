import { motion } from 'framer-motion';
import { IoRefreshOutline } from 'react-icons/io5';
import Layout from '../components/Layout';
import CitySelector from '../components/CitySelector';
import AqiHomeV2Prototype from '../components/AqiHomeV2Prototype';
import { useAirQuality } from '../context/AirQualityContext';

export default function AqiHomeExperiment() {
  const {
    airQualityData,
    loading,
    error,
    refreshData,
    selectedCity,
    cityOptions,
    cityRows,
    changeCity,
  } = useAirQuality();

  const selectedRow = cityRows.find((row) => row.city_id === selectedCity.city_id);

  if (loading && !airQualityData) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <div className="h-16 w-16 animate-pulse rounded-full bg-emerald-400 shadow-lg" />
          <p className="mt-4 text-lg font-black text-slate-900 dark:text-white">Cargando AQI v2...</p>
          <p className="mt-1 max-w-sm text-sm text-slate-600 dark:text-slate-300">
            Ruta aislada para probar una presentación alternativa.
          </p>
        </div>
      </Layout>
    );
  }

  if (error && !airQualityData) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-red-800" role="alert">
            {error}
          </div>
          <button
            onClick={() => refreshData()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800"
            type="button"
          >
            <IoRefreshOutline className="h-4 w-4" />
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
      <div className="relative sticky top-14 z-[1000] mb-2 py-1.5 sm:top-16 sm:mb-4 sm:py-3">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[-1] h-full bg-gradient-to-b from-white/95 via-white/85 to-transparent backdrop-blur-md dark:from-slate-950/95 dark:via-slate-950/80" />
        <CitySelector
          onCityChange={changeCity}
          selectedCity={selectedCity}
          cityOptions={cityOptions}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-3 rounded-2xl border border-dashed border-slate-300 bg-white/75 px-4 py-3 text-sm text-slate-700 shadow-sm backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
      >
        <p>
          <span className="font-black">AQI Home v2:</span> ruta aislada. Usa la misma data real y no reemplaza Inicio.
        </p>
      </motion.div>

      {error && (
        <div className="mb-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="status">
          {error}
        </div>
      )}

      <AqiHomeV2Prototype
        data={airQualityData}
        weatherIcon={selectedRow?.weather_icon ?? null}
        onRefresh={refreshData}
      />
    </Layout>
  );
}
