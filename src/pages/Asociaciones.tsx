import { useState } from 'react';
import Layout from '../components/Layout';
import { useAirQuality } from '../context/AirQualityContext';
import {
  IoLogoFacebook,
  IoLogoTwitter,
  IoLogoInstagram,
  IoGlobeOutline,
  IoMailOutline,
  IoCallOutline,
  IoArrowForwardOutline,
} from 'react-icons/io5';
import { motion } from 'framer-motion';

interface Asociacion {
  id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
  initials: string;
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

const asociaciones: Asociacion[] = [
  {
    id: 'famm',
    nombre: 'Fondo Ambiental Metropolitano de Monterrey',
    descripcion:
      'Organismo de carácter técnico y apolítico que trabaja en la generación y divulgación de información y propuestas para mejorar el entorno, incluyendo la calidad del aire en Nuevo León.',
    imagen: 'https://ext.same-assets.com/809496781/1621669398.png',
    initials: 'FAMM',
    sitioWeb: 'http://famm.mx/',
    redes: {
      facebook: 'https://www.facebook.com/FAMM.MTY',
      twitter: 'https://twitter.com/FAMM_MTY',
      instagram: 'https://www.instagram.com/FAMM.MTY/',
    },
    contacto: {
      email: 'contacto@famm.mx',
    },
  },
  {
    id: 'occamm',
    nombre: 'Observatorio Ciudadano de Calidad del Aire',
    descripcion:
      'Organización civil dedicada a generar esfuerzos colaborativos y fundamento técnico para mejorar la calidad del aire en Nuevo León.',
    imagen: 'https://ext.same-assets.com/2406198699/849522504.png',
    initials: 'OCCA',
    sitioWeb: 'https://www.observatoriodelaire.com/',
    redes: {
      facebook: 'https://www.facebook.com/observatoriomty',
      twitter: 'https://x.com/observatoriomty',
      instagram: 'https://www.instagram.com/observatoriomty/',
    },
    contacto: {
      email: 'contacto@observatoriodelaire.com',
    },
  },
  {
    id: 'alianza',
    nombre: 'Alianza del Aire Nuevo León',
    descripcion:
      'Movimiento de organizaciones y ciudadanía preocupada por la contaminación del aire en Nuevo León, exigiendo acciones concretas para reducir la contaminación.',
    imagen: 'https://ext.same-assets.com/4226829879/4201505317.png',
    initials: 'AANL',
    sitioWeb: 'https://www.alianzadelaire.org/',
    redes: {
      facebook: 'https://www.facebook.com/alianzadelaire',
      instagram: 'https://www.instagram.com/alianzadelaire',
    },
    contacto: {
      email: 'hola@alianzadelaire.org',
    },
  },
  {
    id: 'reforestacion',
    nombre: 'Reforestación Extrema A.C.',
    descripcion:
      'Asociación civil que busca recuperar la capa vegetal urbana pública con acciones de protección al arbolado existente y sensibilización sobre su importancia para la calidad del aire.',
    imagen: 'https://ext.same-assets.com/2180505901/826141865.jpeg',
    initials: 'RE',
    sitioWeb: 'https://www.facebook.com/reforestacionextrema',
    redes: {
      facebook: 'https://www.facebook.com/reforestacionextrema',
    },
    contacto: {
      email: 'contacto@reforestacionextrema.org',
    },
  },
];

export default function Asociaciones() {
  const { theme } = useAirQuality();
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const getHeaderColorClass = () => {
    if (!theme) return 'bg-gradient-to-r from-blue-600 to-teal-500';

    switch (theme.primary) {
      case '#4ade80':
        return 'bg-gradient-to-r from-green-500 to-green-400';
      case '#fbbf24':
        return 'bg-gradient-to-r from-amber-500 to-amber-400';
      case '#fb923c':
        return 'bg-gradient-to-r from-orange-500 to-orange-400';
      case '#f87171':
        return 'bg-gradient-to-r from-red-500 to-red-400';
      case '#c084fc':
        return 'bg-gradient-to-r from-purple-500 to-purple-400';
      case '#9f1239':
        return 'bg-gradient-to-r from-rose-600 to-rose-500';
      default:
        return 'bg-gradient-to-r from-blue-600 to-teal-500';
    }
  };

  const truncateText = (text: string, maxLength: number) =>
    text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

  const markImageAsBroken = (id: string) => {
    setBrokenImages((current) => ({ ...current, [id]: true }));
  };

  const renderLogo = (asociacion: Asociacion) => (
    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-white bg-slate-100 shadow-md dark:bg-slate-700">
      {brokenImages[asociacion.id] ? (
        <div
          className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-100 to-emerald-100 px-2 text-center text-sm font-black leading-none text-slate-700 dark:from-slate-700 dark:to-slate-600 dark:text-white"
          aria-label={`Identificador visual de ${asociacion.nombre}`}
        >
          {asociacion.initials}
        </div>
      ) : (
        <img
          src={asociacion.imagen}
          alt={`Logo de ${asociacion.nombre}`}
          className="h-full w-full object-contain p-1"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => markImageAsBroken(asociacion.id)}
        />
      )}
    </div>
  );

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <div className={`${getHeaderColorClass()} mb-12 rounded-lg px-8 py-12 text-white shadow-lg`}>
          <h1 className="mb-4 text-3xl font-bold md:text-5xl">¡Únete al movimiento por un aire más limpio!</h1>
          <p className="mb-8 max-w-3xl text-lg md:text-xl">
            Estas organizaciones trabajan activamente para mejorar la calidad del aire en Monterrey y su área metropolitana. Conoce su labor y descubre cómo puedes contribuir a esta importante causa.
          </p>
          <button className="flex items-center rounded-md bg-white px-6 py-3 font-semibold text-blue-600 shadow-md transition-colors hover:bg-opacity-90">
            ¿Cómo puedo ayudar? <IoArrowForwardOutline className="ml-2" />
          </button>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
          {asociaciones.map((asociacion) => (
            <motion.div
              key={asociacion.id}
              className="flex flex-col overflow-hidden rounded-lg bg-white shadow-lg dark:bg-slate-800"
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className={`${getHeaderColorClass()} h-2`} />

              <div className="flex-1 p-6">
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="flex items-center">
                    {renderLogo(asociacion)}
                    <h2 className="ml-4 text-xl font-bold text-gray-900 dark:text-white">{asociacion.nombre}</h2>
                  </div>

                  <div className="mt-2 flex space-x-3 sm:mt-0">
                    {asociacion.redes.facebook && (
                      <motion.a
                        href={asociacion.redes.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-gray-100 p-2 text-gray-500 transition-colors hover:bg-blue-100 hover:text-blue-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-blue-400"
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
                        className="rounded-full bg-gray-100 p-2 text-gray-500 transition-colors hover:bg-blue-100 hover:text-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-blue-400"
                        aria-label={`Twitter/X de ${asociacion.nombre}`}
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
                        className="rounded-full bg-gray-100 p-2 text-gray-500 transition-colors hover:bg-pink-100 hover:text-pink-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-pink-400"
                        aria-label={`Instagram de ${asociacion.nombre}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <IoLogoInstagram size={24} />
                      </motion.a>
                    )}
                  </div>
                </div>

                <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">{asociacion.descripcion}</p>

                <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                  <div className="flex flex-wrap gap-3">
                    {asociacion.contacto.email && (
                      <div className="group relative inline-flex items-center rounded-md bg-gray-50 px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600">
                        <IoMailOutline className="mr-2 text-gray-500 dark:text-gray-400" />
                        <a
                          href={`mailto:${asociacion.contacto.email}`}
                          className="max-w-[150px] truncate text-sm transition-colors hover:text-blue-500"
                          title={asociacion.contacto.email}
                        >
                          {truncateText(asociacion.contacto.email, 15)}
                        </a>
                      </div>
                    )}

                    {asociacion.contacto.telefono && (
                      <div className="group relative inline-flex items-center rounded-md bg-gray-50 px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600">
                        <IoCallOutline className="mr-2 text-gray-500 dark:text-gray-400" />
                        <a
                          href={`tel:${asociacion.contacto.telefono}`}
                          className="max-w-[120px] truncate text-sm transition-colors hover:text-blue-500"
                          title={asociacion.contacto.telefono}
                        >
                          {truncateText(asociacion.contacto.telefono || '', 10)}
                        </a>
                      </div>
                    )}

                    {asociacion.sitioWeb && (
                      <div className="group inline-flex items-center rounded-md bg-gray-50 px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600">
                        <IoGlobeOutline className="mr-2 text-gray-500 dark:text-gray-400" />
                        <a
                          href={asociacion.sitioWeb}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm transition-colors hover:text-blue-500"
                        >
                          Sitio Web <IoArrowForwardOutline className="ml-1 opacity-0 transition-opacity group-hover:opacity-100" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <motion.div
                className={`${getHeaderColorClass()} px-6 py-4 text-white`}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                <a
                  href={asociacion.sitioWeb}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between font-medium text-white"
                >
                  <span>Visitar organización</span>
                  <IoArrowForwardOutline className="ml-2" />
                </a>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <div className="mb-12 rounded-lg bg-green-50 p-8 dark:bg-green-900/20">
          <h2 className="mb-4 text-2xl font-bold text-green-800 dark:text-green-400">¿Cómo puedo contribuir?</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 300 }} className="rounded-lg bg-white p-6 shadow dark:bg-slate-800">
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Infórmate</h3>
              <p className="text-gray-600 dark:text-gray-300">Conoce la situación de la calidad del aire en tu ciudad y comparte información confiable con tu comunidad.</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 300 }} className="rounded-lg bg-white p-6 shadow dark:bg-slate-800">
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Participa en actividades</h3>
              <p className="text-gray-600 dark:text-gray-300">Únete a jornadas de reforestación, talleres de concientización y eventos organizados por estas asociaciones.</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 300 }} className="rounded-lg bg-white p-6 shadow dark:bg-slate-800">
              <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Dona o voluntariza</h3>
              <p className="text-gray-600 dark:text-gray-300">Apoya con recursos económicos o tu tiempo como voluntario para fortalecer estas iniciativas ciudadanas.</p>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
