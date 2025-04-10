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
                MonterreyRespira es una plataforma diseñada para proporcionar información clara y accesible sobre la calidad del aire en Monterrey y su área metropolitana. Nuestro objetivo es empoderar a los ciudadanos con datos precisos que les permitan tomar decisiones informadas para proteger su salud y contribuir a mejorar la calidad del aire en nuestra comunidad.
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
                MonterreyRespira utiliza datos de diversas fuentes, incluyendo estaciones de monitoreo oficiales, APIs de calidad del aire y plataformas de datos abiertos para ofrecer información actualizada sobre la concentración de contaminantes en el aire.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Nuestra plataforma analiza estos datos y los presenta de manera visualmente comprensible, calculando el Índice de Calidad del Aire (AQI) y proporcionando recomendaciones personalizadas según los niveles de contaminación actual.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                También ofrecemos información sobre los principales contaminantes, sus efectos en la salud y recursos educativos para entender mejor la problemática de la contaminación atmosférica.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-amber-700 dark:text-amber-400">Nuestro Equipo</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                MonterreyRespira es un proyecto colaborativo desarrollado por un equipo multidisciplinario de ingenieros, científicos ambientales, diseñadores y desarrolladores comprometidos con la calidad del aire en Monterrey.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Estamos comprometidos con la mejora continua de esta plataforma y trabajamos constantemente para incorporar nuevas fuentes de datos, mejorar la precisión de nuestras mediciones y expandir nuestras funcionalidades.
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
