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

const focusRingClass =
  'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 focus-visible:ring-offset-2 dark:focus-visible:ring-sky-500 dark:focus-visible:ring-offset-slate-900';

export default function Asociaciones() {
  const { theme } = useAirQuality();

  const getAccentBarClass = () => {
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

  const renderLogo = (asociacion: Asociacion) => (
    <div
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-gradient-to-br from-sky-100 via-white to-emerald-100 px-2 text-center text-sm font-black leading-none text-slate-800 shadow-md ring-1 ring-slate-300 dark:border-slate-600 dark:from-slate-700 dark:via-slate-800 dark:to-slate-700 dark:text-white dark:ring-slate-600"
      aria-label={`Identificador visual de ${asociacion.nombre}`}
      title={asociacion.nombre}
    >
      {asociacion.initials}
    </div>
  );

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 px-6 py-10 text-white shadow-lg ring-1 ring-white/10 sm:px-8 sm:py-12">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-sky-200">
            Acción ciudadana
          </p>
          <h1 className="mb-4 text-3xl font-black leading-tight md:text-5xl">
            Participa por un aire más limpio
          </h1>
          <p className="mb-8 max-w-3xl text-base leading-7 text-slate-100 md:text-xl md:leading-8">
            Explora organizaciones, recursos ciudadanos y una campaña externa para pasar de consultar
            datos a tomar acción informada por la calidad del aire en Nuevo León.
          </p>
          <a
            href="#desahogate"
            className={`inline-flex items-center rounded-md bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-md transition-colors hover:bg-slate-100 sm:px-6 sm:text-base ${focusRingClass}`}
          >
            Ver campaña ciudadana <IoArrowForwardOutline className="ml-2" />
          </a>
        </div>

        <motion.section
          id="desahogate"
          className="mb-12 scroll-mt-24 overflow-hidden rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-50 via-white to-sky-50 p-6 shadow-lg dark:border-amber-700/70 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-3xl">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-amber-800 dark:text-amber-200">
                Acción ciudadana externa
              </p>
              <h2 className="mb-3 text-2xl font-black leading-tight text-slate-950 dark:text-white md:text-3xl">
                Desahógate: Consulta Pública por el aire limpio en Nuevo León
              </h2>
              <p className="text-sm leading-6 text-slate-700 dark:text-slate-200 md:text-base">
                Consulta puntos para firmar, voluntariado, documentos y preguntas frecuentes publicados por
                la campaña ciudadana. MtyRespira solo referencia este recurso para facilitar participación informada.
              </p>
            </div>
            <a
              href="https://linktr.ee/sisepuedenuevoleon"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex shrink-0 items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 ${focusRingClass}`}
            >
              Abrir opciones de participación <IoArrowForwardOutline className="ml-2" />
            </a>
          </div>
          <p className="mt-4 rounded-lg bg-white/70 p-3 text-xs leading-5 text-slate-600 dark:bg-slate-900/60 dark:text-slate-300">
            Referencia ciudadana externa. MtyRespira no procesa firmas ni datos personales de esta campaña
            y no afirma afiliación formal con sus organizadores.
          </p>
        </motion.section>

        <div className="mb-12 rounded-2xl border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-950/40 sm:p-8">
          <h2 className="mb-4 text-2xl font-black text-green-900 dark:text-green-100">
            Tres formas claras de contribuir
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 300 }} className="rounded-lg bg-white p-6 shadow ring-1 ring-green-100 dark:bg-slate-800 dark:ring-slate-700">
              <h3 className="mb-2 text-lg font-semibold text-gray-950 dark:text-white">Infórmate</h3>
              <p className="text-gray-700 dark:text-gray-200">Consulta lecturas disponibles, revisa fuentes oficiales y comparte información verificable con tu comunidad.</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 300 }} className="rounded-lg bg-white p-6 shadow ring-1 ring-green-100 dark:bg-slate-800 dark:ring-slate-700">
              <h3 className="mb-2 text-lg font-semibold text-gray-950 dark:text-white">Participa</h3>
              <p className="text-gray-700 dark:text-gray-200">Revisa campañas, eventos o convocatorias publicadas por organizaciones y colectivos ciudadanos.</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} transition={{ type: 'spring', stiffness: 300 }} className="rounded-lg bg-white p-6 shadow ring-1 ring-green-100 dark:bg-slate-800 dark:ring-slate-700">
              <h3 className="mb-2 text-lg font-semibold text-gray-950 dark:text-white">Conecta</h3>
              <p className="text-gray-700 dark:text-gray-200">Visita los canales públicos de cada organización para conocer necesidades, voluntariado o donativos.</p>
            </motion.div>
          </div>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          {asociaciones.map((asociacion) => (
            <motion.div
              key={asociacion.id}
              className="flex h-full min-h-[25rem] flex-col overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className={`${getAccentBarClass()} h-2`} />

              <div className="flex flex-1 flex-col p-6">
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="flex min-w-0 items-center gap-4">
                    {renderLogo(asociacion)}
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold leading-tight text-gray-950 dark:text-white">{asociacion.nombre}</h2>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">
                        Referencia pública
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 space-x-3 sm:mt-0">
                    {asociacion.redes.facebook && (
                      <motion.a
                        href={asociacion.redes.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`rounded-full bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-blue-100 hover:text-blue-700 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-blue-300 ${focusRingClass}`}
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
                        className={`rounded-full bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-blue-100 hover:text-blue-700 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-blue-300 ${focusRingClass}`}
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
                        className={`rounded-full bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-pink-100 hover:text-pink-700 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:hover:text-pink-300 ${focusRingClass}`}
                        aria-label={`Instagram de ${asociacion.nombre}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <IoLogoInstagram size={24} />
                      </motion.a>
                    )}
                  </div>
                </div>

                <p className="mb-6 flex-1 text-sm leading-6 text-gray-700 dark:text-gray-200">{asociacion.descripcion}</p>

                <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                  <div className="flex flex-wrap gap-3">
                    {asociacion.contacto.email && (
                      <div className="group relative inline-flex items-center rounded-md bg-gray-50 px-3 py-2 text-gray-800 transition-colors hover:bg-gray-100 dark:bg-slate-700 dark:text-gray-100 dark:hover:bg-slate-600">
                        <IoMailOutline className="mr-2 text-gray-600 dark:text-gray-300" />
                        <a
                          href={`mailto:${asociacion.contacto.email}`}
                          className={`max-w-[150px] truncate text-sm transition-colors hover:text-blue-700 dark:hover:text-blue-300 ${focusRingClass}`}
                          title={asociacion.contacto.email}
                        >
                          {truncateText(asociacion.contacto.email, 15)}
                        </a>
                      </div>
                    )}

                    {asociacion.contacto.telefono && (
                      <div className="group relative inline-flex items-center rounded-md bg-gray-50 px-3 py-2 text-gray-800 transition-colors hover:bg-gray-100 dark:bg-slate-700 dark:text-gray-100 dark:hover:bg-slate-600">
                        <IoCallOutline className="mr-2 text-gray-600 dark:text-gray-300" />
                        <a
                          href={`tel:${asociacion.contacto.telefono}`}
                          className={`max-w-[120px] truncate text-sm transition-colors hover:text-blue-700 dark:hover:text-blue-300 ${focusRingClass}`}
                          title={asociacion.contacto.telefono}
                        >
                          {truncateText(asociacion.contacto.telefono || '', 10)}
                        </a>
                      </div>
                    )}

                    {asociacion.sitioWeb && (
                      <div className="group inline-flex items-center rounded-md bg-gray-50 px-3 py-2 text-gray-800 transition-colors hover:bg-gray-100 dark:bg-slate-700 dark:text-gray-100 dark:hover:bg-slate-600">
                        <IoGlobeOutline className="mr-2 text-gray-600 dark:text-gray-300" />
                        <a
                          href={asociacion.sitioWeb}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center text-sm transition-colors hover:text-blue-700 dark:hover:text-blue-300 ${focusRingClass}`}
                        >
                          Sitio oficial <IoArrowForwardOutline className="ml-1 opacity-0 transition-opacity group-hover:opacity-100" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {asociacion.sitioWeb && (
                <motion.div
                  className="bg-slate-950 px-6 py-4 text-white dark:bg-white dark:text-slate-950"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  <a
                    href={asociacion.sitioWeb}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between font-bold ${focusRingClass}`}
                  >
                    <span>Conocer su trabajo</span>
                    <IoArrowForwardOutline className="ml-2" />
                  </a>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        <p className="mb-12 rounded-xl border border-slate-300 bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          Los identificadores de organizaciones se muestran como iniciales propias de MtyRespira para evitar
          imágenes rotas o dependencias externas. Si se alojan logotipos oficiales en el futuro, deberá existir
          permiso o una fuente pública verificable antes de agregarlos al repositorio.
        </p>
      </div>
    </Layout>
  );
}
