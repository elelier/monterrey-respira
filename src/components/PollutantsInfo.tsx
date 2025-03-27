import React from 'react';
import { motion } from 'framer-motion';
import { IoAlertCircleOutline, IoInformationCircleOutline } from 'react-icons/io5';

export default function PollutantsInfo() {
  const pollutants = [
    {
      name: 'PM2.5',
      fullName: 'Partículas finas',
      description: 'Partículas de diámetro de 2.5 micrómetros o menos que pueden penetrar profundamente en los pulmones y hasta entrar en el torrente sanguíneo.',
      sources: 'Vehículos, incendios forestales, quema de leña, emisiones industriales',
      healthEffects: 'Enfermedades respiratorias, cardiovasculares, reducción de la función pulmonar',
      threshold: '0-12 µg/m³ (bueno), 12.1-35.4 µg/m³ (moderado), >35.5 µg/m³ (malo)'
    },
    {
      name: 'PM10',
      fullName: 'Partículas inhalables',
      description: 'Partículas de diámetro de 10 micrómetros o menos que pueden inhalarse y afectar el sistema respiratorio superior.',
      sources: 'Polvo, construcción, industria, actividades agrícolas, transporte',
      healthEffects: 'Irritación de vías respiratorias, agravamiento de asma, bronquitis',
      threshold: '0-54 µg/m³ (bueno), 55-154 µg/m³ (moderado), >155 µg/m³ (malo)'
    },
    {
      name: 'O₃',
      fullName: 'Ozono',
      description: 'Gas que se forma cuando los óxidos de nitrógeno y compuestos orgánicos volátiles reaccionan en presencia de luz solar.',
      sources: 'No se emite directamente, se forma por reacciones químicas entre contaminantes',
      healthEffects: 'Problemas respiratorios, reducción de función pulmonar, asma',
      threshold: '0-54 ppb (bueno), 55-70 ppb (moderado), >71 ppb (malo)'
    },
    {
      name: 'NO₂',
      fullName: 'Dióxido de Nitrógeno',
      description: 'Gas irritante que forma parte de la contaminación urbana.',
      sources: 'Vehículos, plantas eléctricas, calentadores a gas, cocinas',
      healthEffects: 'Irritación pulmonar, susceptibilidad a infecciones respiratorias',
      threshold: '0-53 ppb (bueno), 54-100 ppb (moderado), >101 ppb (malo)'
    },
    {
      name: 'SO₂',
      fullName: 'Dióxido de Azufre',
      description: 'Gas incoloro con olor fuerte que se forma al quemar combustibles con azufre.',
      sources: 'Plantas eléctricas, industrias, refinación de petróleo',
      healthEffects: 'Irritación de ojos, nariz, garganta y pulmones, agravamiento de asma',
      threshold: '0-35 ppb (bueno), 36-75 ppb (moderado), >76 ppb (malo)'
    },
    {
      name: 'CO',
      fullName: 'Monóxido de Carbono',
      description: 'Gas incoloro e inodoro producido por la combustión incompleta.',
      sources: 'Vehículos, estufas, calentadores, incendios',
      healthEffects: 'Reduce la capacidad de la sangre para transportar oxígeno, mareos, dolor de cabeza',
      threshold: '0-4.4 ppm (bueno), 4.5-9.4 ppm (moderado), >9.5 ppm (malo)'
    }
  ];

  // Animación para elementos al aparecer
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden dark:bg-slate-800">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Guía de Contaminantes</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Información detallada sobre los principales contaminantes monitoreados
        </p>
      </div>

      <div className="p-4">
        <motion.div
          className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start dark:bg-blue-900/20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <IoInformationCircleOutline className="text-blue-600 min-w-6 w-6 h-6 mr-2 mt-0.5 dark:text-blue-400" />
          <div>
            <h4 className="font-medium text-blue-800 dark:text-blue-300">¿Qué significan estos valores?</h4>
            <p className="text-sm text-blue-700 mt-1 dark:text-blue-400">
              Los valores de contaminantes se miden en diferentes unidades como µg/m³ (microgramos por metro cúbico),
              ppb (partes por billón) o ppm (partes por millón) dependiendo del contaminante.
              Las concentraciones se comparan con umbrales establecidos para determinar si son seguras.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="space-y-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {pollutants.map((pollutant, index) => (
            <motion.div
              key={pollutant.name}
              className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow dark:border-gray-700"
              variants={item}
            >
              <div className="flex justify-between">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {pollutant.name} <span className="text-gray-500 font-normal text-sm">({pollutant.fullName})</span>
                </h4>
                <div className="bg-gray-100 px-2 py-1 text-xs rounded text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                  {index < 2 ? 'Partícula' : 'Gas'}
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-2 dark:text-gray-400">
                {pollutant.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="text-xs">
                  <span className="block text-gray-500 dark:text-gray-400">Fuentes principales:</span>
                  <span className="text-gray-800 dark:text-gray-300">{pollutant.sources}</span>
                </div>

                <div className="text-xs">
                  <span className="block text-gray-500 dark:text-gray-400">Efectos en la salud:</span>
                  <span className="text-gray-800 dark:text-gray-300">{pollutant.healthEffects}</span>
                </div>

                <div className="text-xs">
                  <span className="block text-gray-500 dark:text-gray-400">Umbrales:</span>
                  <span className="text-gray-800 dark:text-gray-300">{pollutant.threshold}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="bg-yellow-50 p-4 rounded-lg mt-6 flex items-start dark:bg-yellow-900/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <IoAlertCircleOutline className="text-yellow-600 min-w-6 w-6 h-6 mr-2 mt-0.5 dark:text-yellow-400" />
          <div>
            <h4 className="font-medium text-yellow-800 dark:text-yellow-300">Situación en Monterrey</h4>
            <p className="text-sm text-yellow-700 mt-1 dark:text-yellow-400">
              Monterrey enfrenta desafíos significativos de calidad del aire debido a su geografía (valle rodeado de montañas),
              alta actividad industrial, creciente parque vehicular y factores meteorológicos que favorecen la acumulación de contaminantes.
              El PM2.5, PM10 y ozono suelen ser los contaminantes más problemáticos.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
