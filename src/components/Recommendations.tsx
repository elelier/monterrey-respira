import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AirQualityStatus } from '../types';
import leafIcon from '../assets/recomendations-icons/leaf.png';
import checkmarkIcon from '../assets/recomendations-icons/checkmark.png';
import alertIcon from '../assets/recomendations-icons/alert.png';
import { IoChevronDownOutline } from 'react-icons/io5';


interface RecommendationsProps {
  status: AirQualityStatus;
  className?: string;
}

interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  priority: 'high' | 'medium' | 'low';
}

export default function Recommendations({ status, className = '' }: RecommendationsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<'air' | 'health' | null>('air');

  // Determinar el conjunto de recomendaciones basadas en la calidad del aire
  const airRecommendations = getAirRecommendations(status);
  const healthRecommendations = getHealthRecommendations(status);

  // Toggle expandir/colapsar recomendación
  const toggleRecommendation = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Toggle para secciones en móvil
  const toggleSection = (section: 'air' | 'health') => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Determinar las clases CSS de acuerdo al estado
  const getStatusClasses = () => {
    switch (status) {
      case 'good':
        return {
          header: 'bg-gradient-to-r from-green-400 to-green-500',
          body: 'border-green-200 dark:border-green-900/30',
          priorityHigh: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-900/50',
          priorityMedium: 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/30',
          priorityLow: 'bg-green-50/50 text-green-600 border-green-100/50 dark:bg-green-900/10 dark:text-green-300 dark:border-green-900/20',
          icon: 'text-green-500',
          activeTab: 'text-green-600 border-green-500 dark:text-green-400 dark:border-green-400'
        };
      case 'moderate':
        return {
          header: 'bg-gradient-to-r from-amber-400 to-amber-500',
          body: 'border-amber-200 dark:border-amber-900/30',
          priorityHigh: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-900/50',
          priorityMedium: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-900/30',
          priorityLow: 'bg-amber-50/50 text-amber-600 border-amber-100/50 dark:bg-amber-900/10 dark:text-amber-300 dark:border-amber-900/20',
          icon: 'text-amber-500',
          activeTab: 'text-amber-600 border-amber-500 dark:text-amber-400 dark:border-amber-400'
        };
      case 'unhealthy-sensitive':
        return {
          header: 'bg-gradient-to-r from-orange-400 to-orange-500',
          body: 'border-orange-200 dark:border-orange-900/30',
          priorityHigh: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-900/50',
          priorityMedium: 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-900/30',
          priorityLow: 'bg-orange-50/50 text-orange-600 border-orange-100/50 dark:bg-orange-900/10 dark:text-orange-300 dark:border-orange-900/20',
          icon: 'text-orange-500',
          activeTab: 'text-orange-600 border-orange-500 dark:text-orange-400 dark:border-orange-400'
        };
      case 'unhealthy':
        return {
          header: 'bg-gradient-to-r from-red-400 to-red-500',
          body: 'border-red-200 dark:border-red-900/30',
          priorityHigh: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-900/50',
          priorityMedium: 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/30',
          priorityLow: 'bg-red-50/50 text-red-600 border-red-100/50 dark:bg-red-900/10 dark:text-red-300 dark:border-red-900/20',
          icon: 'text-red-500',
          activeTab: 'text-red-600 border-red-500 dark:text-red-400 dark:border-red-400'
        };
      case 'very-unhealthy':
        return {
          header: 'bg-gradient-to-r from-purple-400 to-purple-500',
          body: 'border-purple-200 dark:border-purple-900/30',
          priorityHigh: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-900/50',
          priorityMedium: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-900/30',
          priorityLow: 'bg-purple-50/50 text-purple-600 border-purple-100/50 dark:bg-purple-900/10 dark:text-purple-300 dark:border-purple-900/20',
          icon: 'text-purple-500',
          activeTab: 'text-purple-600 border-purple-500 dark:text-purple-400 dark:border-purple-400'
        };
      case 'hazardous':
        return {
          header: 'bg-gradient-to-r from-rose-500 to-rose-600',
          body: 'border-rose-200 dark:border-rose-900/30',
          priorityHigh: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-900/50',
          priorityMedium: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-900/30',
          priorityLow: 'bg-rose-50/50 text-rose-600 border-rose-100/50 dark:bg-rose-900/10 dark:text-rose-300 dark:border-rose-900/20',
          icon: 'text-rose-500',
          activeTab: 'text-rose-600 border-rose-500 dark:text-rose-400 dark:border-rose-400'
        };
      default:
        return {
          header: 'bg-gradient-to-r from-blue-400 to-blue-500',
          body: 'border-blue-200 dark:border-blue-900/30',
          priorityHigh: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-900/50',
          priorityMedium: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/30',
          priorityLow: 'bg-blue-50/50 text-blue-600 border-blue-100/50 dark:bg-blue-900/10 dark:text-blue-300 dark:border-blue-900/20',
          icon: 'text-blue-500',
          activeTab: 'text-blue-600 border-blue-500 dark:text-blue-400 dark:border-blue-400'
        };
    }
  };

  const statusClasses = getStatusClasses();

  return (
    <div className={`rounded-xl shadow-lg overflow-hidden dark:bg-slate-800 ${className}`}>
      <div className={`${statusClasses.header} text-white p-4 sm:p-5`}>
        <h3 className="text-lg font-semibold mb-1">Recomendaciones</h3>
        <p className="text-sm opacity-90">
          Acciones recomendadas según la calidad del aire actual
        </p>
      </div>

      {/* Tab selector for mobile and desktop */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          <button
            className={`flex items-center justify-between w-1/2 py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
              expandedSection === 'air'
                ? statusClasses.activeTab
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
            onClick={() => toggleSection('air')}
            aria-expanded={expandedSection === 'air'}
          >
            <span className="flex items-center">
              <img src={leafIcon} alt="Leaf Icon" className="w-5 h-5" />
              <span className="ml-2">Aire limpio</span>
            </span>
            <IoChevronDownOutline className={`transition-transform duration-300 ${expandedSection === 'air' ? 'transform rotate-180' : ''}`} />
          </button>
          <button
            className={`flex items-center justify-between w-1/2 py-3 px-4 font-medium text-sm border-b-2 transition-colors ${
              expandedSection === 'health'
                ? statusClasses.activeTab
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
                onClick={() => toggleSection('health')}
            aria-expanded={expandedSection === 'health'}
          >
            <span className="flex items-center">
              <img src={alertIcon} alt="Alert Icon" className="w-5 h-5" />
              <span className="ml-2">Salud</span>
            </span>
            <IoChevronDownOutline className={`transition-transform duration-300 ${expandedSection === 'health' ? 'transform rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800">
        <AnimatePresence>
          {expandedSection === 'air' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 space-y-3"
            >
              {airRecommendations.map((rec) => (
                <motion.div
                  key={rec.id}
                  className={`rounded-lg border overflow-hidden ${
                    rec.priority === 'high'
                      ? statusClasses.priorityHigh
                      : rec.priority === 'medium'
                      ? statusClasses.priorityMedium
                      : statusClasses.priorityLow
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className="flex items-center p-3 cursor-pointer"
                    onClick={() => toggleRecommendation(rec.id)}
                  >
                    <div className={`mr-3 ${statusClasses.icon}`}>
                      {rec.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                    </div>
                    <IoChevronDownOutline
                      className={`transition-transform duration-300 ${
                        expandedId === rec.id ? 'transform rotate-180' : ''
                      }`}
                    />
                  </div>
                  <AnimatePresence>
                    {expandedId === rec.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-3 pb-3 text-sm"
                      >
                        <p>{rec.description}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          )}

          {expandedSection === 'health' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 space-y-3"
            >
              {healthRecommendations.map((rec) => (
                <motion.div
                  key={rec.id}
                  className={`rounded-lg border overflow-hidden ${
                    rec.priority === 'high'
                      ? statusClasses.priorityHigh
                      : rec.priority === 'medium'
                      ? statusClasses.priorityMedium
                      : statusClasses.priorityLow
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div
                    className="flex items-center p-3 cursor-pointer"
                    onClick={() => toggleRecommendation(rec.id)}
                  >
                    <div className={`mr-3 ${statusClasses.icon}`}>
                      {rec.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{rec.title}</h4>
                    </div>
                    <IoChevronDownOutline
                      className={`transition-transform duration-300 ${
                        expandedId === rec.id ? 'transform rotate-180' : ''
                      }`}
                    />
                  </div>
                  <AnimatePresence>
                    {expandedId === rec.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-3 pb-3 text-sm"
                      >
                        <p>{rec.description}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Funciones para obtener recomendaciones según la calidad del aire
function getAirRecommendations(status: AirQualityStatus): RecommendationItem[] {
  // Recomendaciones comunes para cualquier nivel
  const baseRecommendations: RecommendationItem[] = [
    {
      id: 'transport',
      title: 'Usa transporte sostenible',
      description: 'Opta por caminar, usar bicicleta o transporte público cuando sea posible. Si debes usar auto, compártelo.',
      icon: <img src={leafIcon} alt="Leaf Icon" className="w-5 h-5" />,
      priority: 'medium'
    }
  ];

  // Añadir recomendaciones específicas según la calidad del aire
  switch (status) {
    case 'good':
      return [
        ...baseRecommendations,
        {
          id: 'windows',
          title: 'Ventila tu hogar',
          description: 'Aprovecha la buena calidad del aire para ventilar naturalmente tu hogar y renovar el aire interior.',
          icon: <img src={checkmarkIcon} alt="Checkmark Icon" className="w-5 h-5" />,
          priority: 'high'
        },
        {
          id: 'outdoor',
          title: 'Actividades al aire libre',
          description: 'Excelente momento para realizar actividades al aire libre y ejercicio.',
          icon: <img src={checkmarkIcon} alt="Checkmark Icon" className="w-5 h-5" />,
          priority: 'medium'
        }
      ];

    case 'moderate':
      return [
        ...baseRecommendations,
        {
          id: 'sensitive',
          title: 'Precaución para grupos sensibles',
          description: 'Personas con enfermedades respiratorias o cardíacas, niños y adultos mayores deben considerar reducir actividades físicas intensas al aire libre.',
          icon: <img src={alertIcon} alt="Alert Icon" className="w-5 h-5" />,
          priority: 'medium'
        },
        {
          id: 'reduce_driving',
          title: 'Reduce el uso del auto',
          description: 'Considera usar transporte público o compartir viajes para disminuir emisiones.',
          icon: <img src={leafIcon} alt="Leaf Icon" className="w-5 h-5" />,
          priority: 'medium'
        }
      ];

    case 'unhealthy-sensitive':
    case 'unhealthy':
      return [
        ...baseRecommendations,
        {
          id: 'stay_indoors',
          title: 'Limita actividades al aire libre',
          description: 'Reduce el tiempo de exposición al aire exterior, especialmente en zonas de alto tráfico o industriales.',
          icon: <img src={alertIcon} alt="Alert Icon" className="w-5 h-5" />,
          priority: 'high'
        },
        {
          id: 'no_burning',
          title: 'Evita quemar residuos',
          description: 'No quemes basura, hojas o residuos de jardín. Esto contribuye significativamente a la contaminación.',
          icon: <img src={alertIcon} alt="Alert Icon" className="w-5 h-5" />,
          priority: 'high'
        },
        {
          id: 'plan_travel',
          title: 'Planifica desplazamientos',
          description: 'Combina viajes y actividades para reducir el tiempo en exteriores y el uso de vehículos.',
          icon: <img src={leafIcon} alt="Leaf Icon" className="w-5 h-5" />,
          priority: 'medium'
        }
      ];

    case 'very-unhealthy':
    case 'hazardous':
      return [
        {
          id: 'stay_indoors_critical',
          title: 'Permanece en interiores',
          description: 'Evita cualquier actividad al aire libre que no sea absolutamente necesaria.',
          icon: <img src={alertIcon} alt="Alert Icon" className="w-5 h-5" />,
          priority: 'high'
        },
        {
          id: 'air_purifiers',
          title: 'Usa purificadores de aire',
          description: 'Si dispones de purificadores de aire, es el momento de utilizarlos. Mantén puertas y ventanas cerradas.',
          icon: <img src={alertIcon} alt="Alert Icon" className="w-5 h-5" />,
          priority: 'high'
        },
        {
          id: 'no_exercise',
          title: 'Evita ejercicio al aire libre',
          description: 'Suspende cualquier actividad física en espacios exteriores, incluso para personas saludables.',
          icon: <img src={alertIcon} alt="Alert Icon" className="w-5 h-5" />,
          priority: 'high'
        },
        {
          id: 'minimize_driving',
          title: 'Minimiza conducción',
          description: 'Reduce al mínimo indispensable el uso de vehículos para ayudar a disminuir la contaminación.',
          icon: <img src={alertIcon} alt="Alert Icon" className="w-5 h-5" />,
          priority: 'high'
        }
      ];

    default:
      return baseRecommendations;
  }
}

function getHealthRecommendations(status: AirQualityStatus): RecommendationItem[] {
  // Recomendaciones de salud según la calidad del aire
  switch (status) {
    case 'good':
      return [
        {
          id: 'health_exercise',
          title: 'Disfruta actividad física',
          description: 'Ideal para todo tipo de ejercicio al aire libre para todas las personas.',
          icon: <img src={checkmarkIcon} alt="Checkmark Icon" className="w-5 h-5" />,
          priority: 'high'
        },
        {
          id: 'health_ventilate',
          title: 'Ventilación natural',
          description: 'Aprovecha para ventilar tu hogar y espacios cerrados.',
          icon: <img src={checkmarkIcon} alt="Checkmark Icon" className="w-5 h-5" />,
          priority: 'medium'
        }
      ];

    case 'moderate':
      return [
        {
          id: 'health_sensitive',
          title: 'Grupos sensibles: precaución',
          description: 'Personas con asma, EPOC o afecciones cardíacas deben considerar limitar actividad física prolongada al aire libre.',
          icon: <img src={alertIcon} alt="Alert Icon" className="w-5 h-5" />,
          priority: 'medium'
        },
        {
          id: 'health_monitor',
          title: 'Monitorea síntomas',
          description: 'Si perteneces a grupos de riesgo, presta atención a síntomas como tos, dificultad para respirar o fatiga inusual.',
          icon: <img src={alertIcon} alt="Alert Icon" className="w-5 h-5" />,
          priority: 'low'
        }
      ];

    case 'unhealthy-sensitive':
      return [
        {
          id: 'health_reduce_exposure',
          title: 'Reduce exposición prolongada',
          description: 'Personas sensibles deben acortar el tiempo en exteriores. Todos deben evitar actividad física intensa al aire libre.',
          icon: <img src={alertIcon} alt="Alert Icon" className="w-5 h-5" />,
          priority: 'high'
        },
        {
          id: 'health_medications',
          title: 'Medicación preventiva',
          description: 'Si tienes asma o afecciones respiratorias, mantén a mano tus medicamentos de rescate.',
          icon: <img src={alertIcon} alt="Alert Icon" className="w-5 h-5" />,
          priority: 'medium'
        },
        {
          id: 'health_indoor_exercise',
          title: 'Ejercicio en interiores',
          description: 'Considera trasladar tu rutina de ejercicios a espacios cerrados con buena filtración de aire.',
          icon: <img src={alertIcon} alt="Alert Icon" className="w-5 h-5" />,
          priority: 'medium'
        }
      ];

    case 'unhealthy':
      return [
        {
          id: 'health_avoid_outdoor',
          title: 'Evita actividades al aire libre',
          description: 'Todas las personas, incluso las saludables, deben limitar el esfuerzo prolongado al aire libre.',
          icon: <img src={alertIcon} alt="Alert Icon" className="w-5 h-5" />,
          priority: 'high'
        },
        {
          id: 'health_masks',
          title: 'Considera usar mascarilla',
          description: 'En exteriores, el uso de mascarillas N95 o KN95 puede reducir la exposición a partículas contaminantes.',
          icon: <img src={alertIcon} alt="Alert Icon" className="w-5 h-5" />,
          priority: 'high'
        },
        {
          id: 'health_air_filters',
          title: 'Sistemas de filtración',
          description: 'Usa sistemas de aire acondicionado con filtros HEPA o purificadores de aire en interiores.',
          icon: <img src={alertIcon} alt="Alert Icon" className="w-5 h-5" />,
          priority: 'medium'
        }
      ];

    case 'very-unhealthy':
    case 'hazardous':
      return [
        {
          id: 'health_stay_indoors',
          title: 'Permanece en interiores',
          description: 'Evita toda actividad física al aire libre. Mantente en espacios interiores con ventanas y puertas cerradas.',
          icon: <img src={alertIcon} alt="Alert Icon" className="w-5 h-5" />,
          priority: 'high'
        },
        {
          id: 'health_air_purification',
          title: 'Purificación de aire',
          description: 'Usa purificadores de aire con filtros HEPA. Considera crear una "habitación limpia" en tu hogar.',
          icon: <img src={alertIcon} alt="Alert Icon" className="w-5 h-5" />,
          priority: 'high'
        },
        {
          id: 'health_masks_mandatory',
          title: 'Usa mascarilla en exteriores',
          description: 'Si debes salir, usa mascarillas N95 o KN95 correctamente ajustadas para reducir la exposición.',
          icon: <img src={alertIcon} alt="Alert Icon" className="w-5 h-5" />,
          priority: 'high'
        },
        {
          id: 'health_medical_attention',
          title: 'Atención a síntomas',
          description: 'Busca atención médica inmediata si experimentas dificultad para respirar, opresión en el pecho o fatiga inusual.',
          icon: <img src={alertIcon} alt="Alert Icon" className="w-5 h-5" />,
          priority: 'high'
        }
      ];

    default:
      return [
        {
          id: 'health_default',
          title: 'Mantente informado',
          description: 'Consulta regularmente los niveles de calidad del aire y ajusta tus actividades según sea necesario.',
          icon: <img src={checkmarkIcon} alt="Checkmark Icon" className="w-5 h-5" />,
          priority: 'low'
        }
      ];
  }
}
