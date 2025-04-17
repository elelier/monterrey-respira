import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { useAirQuality } from '../context/AirQualityContext';

export default function PrivacyPolicy() {
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
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-amber-800 dark:text-amber-300">Política de Privacidad</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Última actualización: [Fecha]</p>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-amber-700 dark:text-amber-400">1. Información que recopilamos</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">1.1 Información que recopilamos automáticamente</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-5 space-y-1">
                    <li>Datos de uso del sitio web</li>
                    <li>Información del dispositivo</li>
                    <li>Datos de ubicación (solo para mostrar datos de calidad del aire)</li>
                    <li>Datos de navegación</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">1.2 Información de Google AdSense</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-5 space-y-1">
                    <li>Datos de visualización de anuncios</li>
                    <li>Interacciones con anuncios</li>
                    <li>Datos de geolocalización (para anuncios relevantes)</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-xl font-semibold mb-4 text-amber-700 dark:text-amber-400 mt-6">2. Uso de la información</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">2.1 Uso de datos de usuarios</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-5 space-y-1">
                    <li>Mejorar la experiencia del usuario</li>
                    <li>Proporcionar información relevante sobre calidad del aire</li>
                    <li>Personalizar el contenido del sitio</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">2.2 Uso de datos de AdSense</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-5 space-y-1">
                    <li>Mostrar anuncios relevantes</li>
                    <li>Personalizar la publicidad según el contexto</li>
                    <li>Optimizar la entrega de anuncios</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-xl font-semibold mb-4 text-amber-700 dark:text-amber-400 mt-6">3. Cookies y tecnologías similares</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">3.1 Cookies de AdSense</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-5 space-y-1">
                    <li>Google AdSense utiliza cookies para:</li>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-5 space-y-1">
                      <li>Mostrar anuncios relevantes</li>
                      <li>Medir el rendimiento de los anuncios</li>
                      <li>Personalizar la experiencia publicitaria</li>
                    </ul>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">3.2 Cookies de rendimiento</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-5 space-y-1">
                    <li>Medir el uso del sitio web</li>
                    <li>Mejorar la funcionalidad</li>
                    <li>Optimizar el rendimiento</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-xl font-semibold mb-4 text-amber-700 dark:text-amber-400 mt-6">4. Protección de datos</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">4.1 Medidas de seguridad</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-5 space-y-1">
                    <li>Encriptación de datos</li>
                    <li>Protección contra accesos no autorizados</li>
                    <li>Seguridad del sitio web</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">4.2 Retención de datos</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-5 space-y-1">
                    <li>Datos de uso: 30 días</li>
                    <li>Datos de ubicación: 24 horas</li>
                    <li>Datos de AdSense: según políticas de Google</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-xl font-semibold mb-4 text-amber-700 dark:text-amber-400 mt-6">5. Tus derechos</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">5.1 Derechos de los usuarios</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-5 space-y-1">
                    <li>Acceder a tus datos</li>
                    <li>Corregir datos inexactos</li>
                    <li>Eliminar tus datos</li>
                    <li>Oponerte al procesamiento de datos</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">5.2 Control de anuncios</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-5 space-y-1">
                    <li>Opt-out de anuncios personalizados</li>
                    <li>Configurar preferencias de anuncios</li>
                    <li>Controlar cookies de AdSense</li>
                  </ul>
                </div>
              </div>

              <h2 className="text-xl font-semibold mb-4 text-amber-700 dark:text-amber-400 mt-6">6. Cambios en la Política de Privacidad</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Esta política puede actualizarse periódicamente. Los cambios significativos se comunicarán. Se mantendrá la fecha de última actualización.
              </p>

              <h2 className="text-xl font-semibold mb-4 text-amber-700 dark:text-amber-400 mt-6">7. Contacto</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Si tienes preguntas sobre esta política de privacidad, puedes contactarnos a:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-5 space-y-1">
                <li>[Tu correo electrónico]</li>
                <li>[Tu dirección]</li>
                <li>[Tu teléfono]</li>
              </ul>

              <h2 className="text-xl font-semibold mb-4 text-amber-700 dark:text-amber-400 mt-6">8. Enlaces a recursos externos</h2>
              <div className="space-y-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                >
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block ${getThemeTextColor()} hover:text-white dark:hover:text-white font-medium text-sm transition-colors flex items-center justify-between`}
                  >
                    <span>Política de privacidad de Google AdSense</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                >
                  <a
                    href="https://www.google.com/adsense/localized-terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block ${getThemeTextColor()} hover:text-white dark:hover:text-white font-medium text-sm transition-colors flex items-center justify-between`}
                  >
                    <span>Términos de servicio de Google AdSense</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                >
                  <a
                    href="https://policies.google.com/technologies/cookies"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block ${getThemeTextColor()} hover:text-white dark:hover:text-white font-medium text-sm transition-colors flex items-center justify-between`}
                  >
                    <span>Política de cookies de Google</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </a>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}