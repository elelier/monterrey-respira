import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { IoLogoGithub } from 'react-icons/io5';

export default function AcercaDe() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-amber-800 dark:text-amber-300">Acerca de MonterreyRespira</h1>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-amber-700 dark:text-amber-400">Nuestra Misión</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                MonterreyRespira es una plataforma diseñada para proporcionar información clara y accesible sobre la calidad del aire en Monterrey y su área metropolitana. Nuestro objetivo es ayudar a la ciudadanía a leer mediciones disponibles y entender cuándo un dato puede estar retrasado o no disponible.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Creemos que la transparencia y el acceso a la información son fundamentales para fomentar la conciencia ambiental y promover acciones tanto individuales como colectivas que contribuyan a un aire más limpio para todos.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-amber-700 dark:text-amber-400">¿Cómo funciona?</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                MonterreyRespira consume lecturas normalizadas desde Supabase. El AQI proviene de WAQI/AQICN y los campos meteorológicos se presentan como contexto cuando vienen en la lectura reportada.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                La plataforma presenta el Índice de Calidad del Aire (AQI), contaminante dominante cuando existe y recomendaciones generales según el estado reportado.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                También ofrecemos información sobre los principales contaminantes, sus efectos en la salud y recursos educativos para entender mejor la problemática de la contaminación atmosférica. MtyRespira no reemplaza avisos de emergencia.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-amber-700 dark:text-amber-400">Nuestro Equipo</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                MonterreyRespira es un proyecto desarrollado por elelier para hacer más legibles las lecturas ambientales disponibles de Monterrey.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                La mejora continua se enfoca en claridad pública, trazabilidad de datos y estados honestos cuando los proveedores externos se retrasan o no entregan campos.
              </p>
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
        </motion.div>
      </div>
    </Layout>
  );  
}
