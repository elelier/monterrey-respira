import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { useAirQuality } from '../context/AirQualityContext';

export default function DatosYApis() {
  const { theme } = useAirQuality();

  // Función para obtener el color de texto basado en el tema actual
  const getThemeTextColor = () => {
    if (!theme) return 'text-blue-600';

    switch (theme.primary) {
      case '#4ade80': return 'text-green-600 dark:text-green-400';
      case '#fbbf24': return 'text-amber-600 dark:text-amber-400';
      case '#fb923c': return 'text-orange-600 dark:text-orange-400';
      case '#f87171': return 'text-red-600 dark:text-red-400';
      case '#c084fc': return 'text-purple-600 dark:text-purple-400';
      case '#9f1239': return 'text-rose-600 dark:text-rose-400';
      default: return 'text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-amber-800 dark:text-amber-300">Datos y APIs</h1>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-amber-700 dark:text-amber-400">Nuestras Fuentes de Datos</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                MonterreyRespira integra datos de múltiples fuentes para proporcionar información completa y precisa sobre la calidad del aire en Monterrey y su área metropolitana. A continuación detallamos las principales fuentes utilizadas:
              </p>

              <div className="space-y-6 mt-6">
                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">IQAir (AirVisual)</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Plataforma global que proporciona datos sobre calidad del aire en tiempo real mediante una red de estaciones de monitoreo y sensores distribuidos por todo el mundo.
                  </p>
                  <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300 list-disc pl-5">
                    <li>Ofrece datos precisos sobre PM2.5, PM10, temperatura y humedad.</li>
                    <li>Proporciona el Índice de Calidad del Aire (AQI) según estándares de la EPA.</li>
                    <li>Actualización de datos cada hora.</li>
                  </ul>
                  <a href="https://www.iqair.com/air-pollution-data-api" target="_blank" rel="noopener noreferrer" className={`mt-2 inline-block text-sm font-medium ${getThemeTextColor()}`}>
                    Documentación de la API →
                  </a>
                </div>


                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Sistema Integral de Monitoreo Ambiental (SIMA)</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Red de monitoreo ambiental del Gobierno de Nuevo León que opera estaciones de medición en toda el área metropolitana de Monterrey.
                  </p>
                  <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300 list-disc pl-5">
                    <li>Estaciones distribuidas estratégicamente en diferentes municipios.</li>
                    <li>Monitoreo continuo de PM10, PM2.5, O3, NO2, SO2 y CO.</li>
                    <li>Datos oficiales locales con alta precisión para la región.</li>
                  </ul>
                  <a href="http://aire.nl.gob.mx/" target="_blank" rel="noopener noreferrer" className={`mt-2 inline-block text-sm font-medium ${getThemeTextColor()}`}>
                    Sitio oficial →
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-amber-700 dark:text-amber-400">Metodología de Procesamiento</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                La información recopilada de estas diversas fuentes es procesada mediante algoritmos para ofrecer datos precisos y coherentes:
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>Recolección de datos en tiempo real de múltiples fuentes.</li>
                <li>Verificación y validación de datos para eliminar lecturas erróneas o atípicas.</li>
                <li>Integración de datos de diferentes fuentes para proporcionar una visión completa.</li>
                <li>Generación de recomendaciones basadas en los niveles actuales de contaminación.</li>
                <li>Presentación visual de datos para facilitar su comprensión.</li>
              </ol>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-amber-700 dark:text-amber-400">Notas Importantes</h2>
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg text-amber-800 dark:text-amber-200 mb-4">
                <h3 className="font-semibold mb-2">Datos en Tiempo Real vs. Datos Simulados</h3>
                <p className="text-sm">
                  En algunas ocasiones, cuando no es posible acceder a las APIs en tiempo real debido a limitaciones técnicas o restricciones de acceso, MonterreyRespira puede mostrar datos simulados basados en patrones históricos y tendencias típicas. Estos datos se marcan claramente como "simulados" en la interfaz.
                </p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg text-emerald-800 dark:text-emerald-200">
                <h3 className="font-semibold mb-2">Uso de Datos</h3>
                <p className="text-sm">
                  Todos los datos presentados en MonterreyRespira son de carácter informativo y educativo. Para decisiones críticas relacionadas con la salud, recomendamos consultar fuentes oficiales y profesionales de la salud.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
