import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { IoLogoGithub } from 'react-icons/io5';
import DataTrustExplainer from '../components/DataTrustExplainer';

export default function DatosYApis() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-amber-800 dark:text-amber-300">
            Datos, metodología y límites
          </h1>
          <p className="mb-6 text-sm leading-6 text-slate-700 dark:text-slate-300 sm:text-base">
            Esta página explica de dónde salen las lecturas, qué significan los huecos de datos
            y qué no debe interpretarse como una promesa de MtyRespira.
          </p>

          <DataTrustExplainer />

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-amber-700 dark:text-amber-400">Repositorios y Estructura Técnica</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                El proyecto MonterreyRespira separa la experiencia pública y el pipeline ambiental en dos repositorios:
              </p>

              <div className="space-y-6 mt-6">
                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Pipeline de Datos</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Repositorio que contiene el código del pipeline de datos y procesamiento:
                  </p>
                  <a href="https://github.com/elelier/airquality_pipeline" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-medium text-amber-700 dark:text-amber-300">
                    airquality_pipeline →
                  </a>
                  <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300 list-disc pl-5 mt-2">
                    <li>Consulta de proveedores externos</li>
                    <li>Validación antes de guardar lecturas</li>
                    <li>Base de datos Supabase</li>
                    <li>Automatización con GitHub Actions</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Webapp Frontend</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Repositorio que contiene la aplicación web:
                  </p>
                  <a href="https://github.com/elelier/monterrey-respira" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-medium text-amber-700 dark:text-amber-300">
                    monterrey-respira →
                  </a>
                  <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300 list-disc pl-5 mt-2">
                    <li>Interfaz de usuario</li>
                    <li>Visualización de datos</li>
                    <li>Estados de frescura y degradación</li>
                    <li>Documentación técnica</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Estructura General</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Ambos repositorios trabajan en conjunto para proporcionar una solución completa:
                  </p>
                  <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300 list-disc pl-5 mt-2">
                    <li>Separación clara de responsabilidades</li>
                    <li>Desarrollo independiente</li>
                    <li>Despliegue público en Cloudflare Pages</li>
                    <li>Mantenimiento modular</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 text-center">
                <a
                  href="https://github.com/elelier/monterrey-respira"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-md transition-colors duration-300 ease-in-out"
                >
                  <IoLogoGithub className="mr-2 text-xl" />
                  ¡Contribuye en GitHub!
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
