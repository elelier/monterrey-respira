import { Link } from 'react-router-dom';
import {
  IoAlertCircleOutline,
  IoAnalyticsOutline,
  IoCloudOutline,
  IoReaderOutline,
  IoTimeOutline,
} from 'react-icons/io5';

interface DataTrustExplainerProps {
  variant?: 'compact' | 'full';
}

const AQICN_API_URL = 'https://aqicn.org/api/';
const OPEN_METEO_URL = 'https://open-meteo.com/';

const trustPoints = [
  {
    icon: IoAnalyticsOutline,
    title: 'AQI reportado',
    body: 'El AQI viene de WAQI/AQICN, pasa por el pipeline horario y se muestra como lectura disponible.',
  },
  {
    icon: IoCloudOutline,
    title: 'Clima de contexto',
    body: 'Cuando la UI muestra clima, puede venir de Open-Meteo como fuente secundaria; no cambia el AQI.',
  },
  {
    icon: IoTimeOutline,
    title: 'Medición vs actualización',
    body: 'La medición usa reading_timestamp; la actualización del pipeline usa last_successful_update_at.',
  },
  {
    icon: IoAlertCircleOutline,
    title: 'Degradación visible',
    body: 'Con retraso, vieja o sin lectura explica datos demorados, antiguos o no confiables.',
  },
];

const internalLinks = [
  { label: 'Ver datos', to: '/#datos' },
  { label: 'Entender AQI', to: '/datos-y-apis#como-leer-aqi' },
  { label: 'Fuentes y límites', to: '/datos-y-apis#metodologia-y-limites' },
];

export default function DataTrustExplainer({ variant = 'full' }: DataTrustExplainerProps) {
  const isCompact = variant === 'compact';

  return (
    <section
      id="metodologia-y-limites"
      className={isCompact
        ? 'rounded-2xl border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-800 sm:p-6'
        : 'space-y-6'}
      aria-labelledby="metodologia-y-limites-title"
    >
      <div className={isCompact ? 'space-y-3' : 'rounded-2xl bg-white p-5 shadow-lg dark:bg-slate-800 sm:p-6'}>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
          Fuentes y metodología
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2
              id="metodologia-y-limites-title"
              className="text-[1.15rem] font-bold leading-tight text-slate-950 dark:text-white sm:text-2xl"
            >
              Cómo leer MtyRespira sin promesas excesivas
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
              MtyRespira muestra lecturas disponibles para ayudarte a entender el contexto del aire.
              No promete monitoreo en vivo y no sustituye fuentes públicas de referencia ni alertas de emergencia.
            </p>
          </div>

          {isCompact && (
            <Link
              to="/datos-y-apis#metodologia-y-limites"
              className="inline-flex w-fit items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Leer metodología
            </Link>
          )}
        </div>

        {!isCompact && (
          <div className="mt-5 flex flex-wrap gap-3">
            {internalLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="inline-flex rounded-lg border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/30"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className={isCompact ? 'mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4' : 'grid gap-4 sm:grid-cols-2'}>
        {trustPoints.map((point) => {
          const Icon = point.icon;

          return (
            <article
              key={point.title}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40"
            >
              <Icon className="mb-3 h-6 w-6 text-amber-700 dark:text-amber-300" aria-hidden="true" />
              <h3 className="text-sm font-bold text-slate-950 dark:text-white sm:text-base">{point.title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{point.body}</p>
            </article>
          );
        })}
      </div>

      {!isCompact && (
        <div className="grid gap-4">
          <div id="como-leer-aqi" className="scroll-mt-24 rounded-2xl bg-white p-5 shadow-lg dark:bg-slate-800 sm:p-6">
            <IoReaderOutline className="mb-3 h-6 w-6 text-amber-700 dark:text-amber-300" aria-hidden="true" />
            <h3 className="text-lg font-bold text-amber-800 dark:text-amber-300">Qué mide y qué no mide</h3>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
              <li>El AQI visible es una lectura externa procesada y normalizada para consulta pública.</li>
              <li>El contaminante principal se muestra solo cuando la fuente lo reporta; si falta, debe verse como N/D.</li>
              <li>Las gráficas históricas muestran puntos guardados; los huecos no se rellenan ni se suavizan.</li>
              <li>MtyRespira no certifica lecturas oficiales ni reemplaza comunicados de emergencia.</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-lg dark:bg-slate-800 sm:p-6">
            <h3 className="text-lg font-bold text-amber-800 dark:text-amber-300">Cómo leer una medición</h3>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
              <li><strong>Hora de medición:</strong> cuándo fue reportada la lectura ambiental de origen.</li>
              <li><strong>Actualización del pipeline:</strong> cuándo MtyRespira pudo procesar datos correctamente.</li>
              <li><strong>Contexto meteorológico:</strong> si aparece, puede venir de Open-Meteo como fuente secundaria.</li>
              <li><strong>Estados degradados:</strong> con retraso, vieja o sin lectura indican datos demorados, antiguos o incompletos.</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-lg dark:bg-slate-800 sm:p-6">
            <h3 className="text-lg font-bold text-amber-800 dark:text-amber-300">Fuentes, atribución y alcance</h3>
            <div className="mt-3 space-y-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
              <p>
                El flujo público es: proveedor externo, pipeline horario, Supabase y lectura en la app.
                MtyRespira no escribe ni corrige valores ambientales desde el navegador.
              </p>
              <p>
                AQI: World Air Quality Index Project (WAQI/AQICN) y EPA/fuente originadora cuando aplique.
                Clima: Open-Meteo cuando los campos meteorológicos canónicos están disponibles.
              </p>
              <p>
                La opción para reportar problemas o sugerencias queda pendiente hasta tener una ruta de producto
                específica; Core DB no se usa para lecturas ambientales.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <a
                  href={AQICN_API_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-lg border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/30"
                >
                  WAQI/AQICN
                </a>
                <a
                  href={OPEN_METEO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-lg border border-sky-300 px-3 py-2 text-sm font-semibold text-sky-800 transition hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:border-sky-700 dark:text-sky-200 dark:hover:bg-sky-900/30"
                >
                  Open-Meteo
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
