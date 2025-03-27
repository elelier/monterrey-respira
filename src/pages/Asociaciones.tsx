import { useState, useRef } from 'react';
import Layout from '../components/Layout';
import { useAirQuality } from '../context/AirQualityContext';
import { IoLogoFacebook, IoLogoTwitter, IoLogoInstagram, IoGlobeOutline, IoMailOutline, IoCallOutline, IoArrowForwardOutline, IoEllipsisHorizontal } from 'react-icons/io5';
import { motion } from 'framer-motion';

// Definimos una interfaz para nuestras asociaciones
interface Asociacion {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  sitioWeb?: string;
  redes: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
  contacto: {
    email?: string;
    telefono?: string;
  };
}

export default function Asociaciones() {
  const { theme } = useAirQuality();

  // Lista de asociaciones relacionadas con la calidad del aire en Monterrey
  const [asociaciones] = useState<Asociacion[]>([
    {
      id: 'famm',
      nombre: 'Fondo Ambiental Metropolitano de Monterrey',
      descripcion: 'Organismo de carácter técnico y apolítico que trabaja en la generación y divulgación de información y propuestas para mejorar el entorno, incluyendo la calidad del aire en Nuevo León.',
      imagen: 'https://ext.same-assets.com/809496781/1621669398.png',
      sitioWeb: 'http://famm.mx/',
      redes: {
        facebook: 'https://www.facebook.com/FAMM.MTY',
        twitter: 'https://twitter.com/FAMM_MTY',
        instagram: 'https://www.instagram.com/FAMM.MTY/',
      },
      contacto: {
        email: 'contacto@famm.mx',
      }
    },
    {
      id: 'occamm',
      nombre: 'Observatorio Ciudadano de Calidad del Aire',
      descripcion: 'Organización civil dedicada a generar esfuerzos colaborativos y fundamento técnico para mejorar la calidad del aire en Nuevo León.',
      imagen: 'https://ext.same-assets.com/2406198699/849522504.png',
      sitioWeb: 'https://www.observatoriodelaire.com/',
      redes: {
        facebook: 'https://www.facebook.com/observatoriomty',
        twitter: 'https://x.com/observatoriomty',
        instagram: 'https://www.instagram.com/observatoriomty/',
      },
      contacto: {
        email: 'contacto@observatoriodelaire.com',
      }
    },
    {
      id: 'alianza',
      nombre: 'Alianza del Aire Nuevo León',
      descripcion: 'Movimiento de organizaciones y ciudadanía preocupada por la contaminación del aire en Nuevo León, exigiendo acciones concretas para reducir la contaminación.',
      imagen: 'https://ext.same-assets.com/4226829879/4201505317.png',
      sitioWeb: 'https://www.alianzadelaire.org/',
      redes: {
        facebook: 'https://www.facebook.com/alianzadelaire',
        instagram: 'https://www.instagram.com/alianzadelaire',
      },
      contacto: {
        email: 'hola@alianzadelaire.org',
      }
    },
    {
      id: 'reforestacion',
      nombre: 'Reforestación Extrema A.C.',
      descripcion: 'Asociación civil que busca recuperar la capa vegetal urbana pública con acciones de protección al arbolado existente y sensibilización sobre su importancia para la calidad del aire.',
      imagen: 'https://ext.same-assets.com/2180505901/826141865.jpeg',
      sitioWeb: 'https://www.facebook.com/reforestacionextrema',
      redes: {
        facebook: 'https://www.facebook.com/reforestacionextrema',
      },
      contacto: {
        email: 'contacto@reforestacionextrema.org',
      }
    }
  ]);

  // Función para obtener el color de header según el tema de calidad del aire
  const getHeaderColorClass = () => {
    if (!theme) return 'bg-gradient-to-r from-blue-600 to-teal-500';

    switch (theme.primary) {
      case '#4ade80': return 'bg-gradient-to-r from-green-500 to-green-400';
      case '#fbbf24': return 'bg-gradient-to-r from-amber-500 to-amber-400';
      case '#fb923c': return 'bg-gradient-to-r from-orange-500 to-orange-400';
      case '#f87171': return 'bg-gradient-to-r from-red-500 to-red-400';
      case '#c084fc': return 'bg-gradient-to-r from-purple-500 to-purple-400';
      case '#9f1239': return 'bg-gradient-to-r from-rose-600 to-rose-500';
      default: return 'bg-gradient-to-r from-blue-600 to-teal-500';
    }
  };

  // Referencia para el tooltip de contacto
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // Función para truncar texto largo con una cantidad máxima de caracteres
  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto">
        <div className={`${getHeaderColorClass()} rounded-lg shadow-lg px-8 py-12 mb-12 text-white`}>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">¡Únete al movimiento por un aire más limpio!</h1>
          <p className="text-lg md:text-xl mb-8 max-w-3xl">
            Estas organizaciones trabajan activamente para mejorar la calidad del aire en Monterrey y su área metropolitana. Conoce su labor y descubre cómo puedes contribuir a esta importante causa.
          </p>
          <button className="bg-white hover:bg-opacity-90 text-blue-600 font-semibold px-6 py-3 rounded-md shadow-md transition-colors flex items-center">
            ¿Cómo puedo ayudar? <IoArrowForwardOutline className="ml-2" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          {asociaciones.map(asociacion => (
            <motion.div
              key={asociacion.id}
              className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden flex flex-col"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Header de color según la calidad del aire */}
              <div className={`${getHeaderColorClass()} h-2`}></div>

              <div className="p-6 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-4">
                  <div className="flex items-center">
                    <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden shadow-md border-2 border-white">
                      <img
                        src={asociacion.imagen}
                        alt={`Logo de ${asociacion.nombre}`}
                        className="h-full w-full object-contain p-1"
                      />
                    </div>
                    <h2 className="ml-4 text-xl font-bold text-gray-900 dark:text-white">{asociacion.nombre}</h2>
                  </div>

                  {/* Iconos de redes sociales más grandes e interactivos */}
                  <div className="flex space-x-3 mt-2 sm:mt-0">
                    {asociacion.redes.facebook && (
                      <motion.a
                        href={asociacion.redes.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-100 hover:bg-blue-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-500 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 p-2 rounded-full transition-colors"
                        aria-label={`Facebook de ${asociacion.nombre}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <IoLogoFacebook size={24} />
                      </motion.a>
                    )}
                    {asociacion.redes.twitter && (
                      <motion.a
                        href={asociacion.redes.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-100 hover:bg-blue-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-500 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400 p-2 rounded-full transition-colors"
                        aria-label={`Twitter de ${asociacion.nombre}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <IoLogoTwitter size={24} />
                      </motion.a>
                    )}
                    {asociacion.redes.instagram && (
                      <motion.a
                        href={asociacion.redes.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-100 hover:bg-pink-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-500 hover:text-pink-600 dark:text-gray-300 dark:hover:text-pink-400 p-2 rounded-full transition-colors"
                        aria-label={`Instagram de ${asociacion.nombre}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <IoLogoInstagram size={24} />
                      </motion.a>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">{asociacion.descripcion}</p>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex flex-wrap gap-3">
                    {/* Correo electrónico con truncamiento y tooltip */}
                    {asociacion.contacto.email && (
                      <div className="inline-flex items-center bg-gray-50 hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 transition-colors group relative">
                        <IoMailOutline className="mr-2 text-gray-500 dark:text-gray-400" />
                        <a
                          href={`mailto:${asociacion.contacto.email}`}
                          className="text-sm hover:text-blue-500 transition-colors truncate max-w-[150px]"
                          title={asociacion.contacto.email}
                        >
                          {truncateText(asociacion.contacto.email, 15)}
                        </a>
                      </div>
                    )}

                    {/* Teléfono con truncamiento y tooltip */}
                    {asociacion.contacto.telefono && (
                      <div className="inline-flex items-center bg-gray-50 hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 transition-colors group relative">
                        <IoCallOutline className="mr-2 text-gray-500 dark:text-gray-400" />
                        <a
                          href={`tel:${asociacion.contacto.telefono}`}
                          className="text-sm hover:text-blue-500 transition-colors truncate max-w-[120px]"
                          title={asociacion.contacto.telefono}
                        >
                          {truncateText(asociacion.contacto.telefono || "", 10)}
                        </a>
                      </div>
                    )}

                    {/* Sitio web con botón interactivo */}
                    {asociacion.sitioWeb && (
                      <div className="inline-flex items-center bg-gray-50 hover:bg-gray-100 dark:bg-slate-700 dark:hover:bg-slate-600 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 transition-colors group">
                        <IoGlobeOutline className="mr-2 text-gray-500 dark:text-gray-400" />
                        <a
                          href={asociacion.sitioWeb}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm hover:text-blue-500 transition-colors flex items-center"
                        >
                          Sitio Web <IoArrowForwardOutline className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Botón de acción principal */}
              <motion.div
                className={`${getHeaderColorClass()} px-6 py-4 text-white`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 500 }}
              >
                <a
                  href={asociacion.sitioWeb}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium flex items-center justify-between text-white"
                >
                  <span>Visitar organización</span>
                  <IoArrowForwardOutline className="ml-2" />
                </a>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-green-800 dark:text-green-400 mb-4">¿Cómo puedo contribuir?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow"
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Infórmate</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Conoce la situación de la calidad del aire en tu ciudad y comparte información confiable con tu comunidad.
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow"
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Participa en actividades</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Únete a jornadas de reforestación, talleres de concientización y eventos organizados por estas asociaciones.
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow"
            >
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Dona o voluntariza</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Apoya con recursos económicos o tu tiempo como voluntario para fortalecer estas iniciativas ciudadanas.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
