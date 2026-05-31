import { Link } from 'react-router-dom';
import { IoAlertCircleOutline, IoAnalyticsOutline, IoCloudOutline, IoTimeOutline } from 'react-icons/io5';

interface DataTrustExplainerProps {
  variant?: 'compact' | 'full';
}

const AQICN_API_URL = 'https://aqicn.org/api/';
const OPEN_METEO_URL = 'https://open-meteo.com/';

const trustPoints = [
  {
    icon: IoAnalyticsOutline,
    title: 'AQI reportado',
    body: 'El AQI viene de WAQI/AQICN y pasa por el pipeline antes de llegar a la app.',
  },
  {
    icon: IoCloudOutline,
    title: 'Clima disponible',
    body: 'El contexto de clima viene de Open-Meteo cuando hay datos disponibles para la lectura.',
  },
  {
    icon: IoTimeOutline,
    title: 'Histórico sin relleno',
    body: 'Las gráficas muestran puntos guardados. Si falta una medición, no se inventa ni se rellena.',
  },
  {
    icon: IoAlertCircleOutline,
    title: 'Límites claros',
    body: 'MtyRespira no reemplaza avisos de emergencia ni fuentes públicas de referencia.',
  },
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
          Confianza de datos
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2
              id="metodologia-y-limites-title"
              className="text-[1.15rem] font-bold leading-tight text-slate-950 dark:text-white sm:text-2xl"
            >
              Metodología y límites
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
          <div className="rounded-2xl bg-white p-5 shadow-lg dark:bg-slate-800 sm:p-6">
            <h3 className="text-lg font-bold text-amber-800 dark:text-amber-300">Cómo leer una medición</h3>
            <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
              <li>La hora de medición indica cuándo fue reportada la lectura ambiental.</li>
              <li>La actualización del pipeline indica cuándo MtyRespira pudo procesar datos.</li>
              <li>Si un dato externo se retrasa, falta o llega con campos ausentes, la app debe mostrarlo como no disponible o degradado.</li>
              <li>El histórico usa mediciones guardadas; no calcula valores para huecos ni suaviza datos faltantes.</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-lg dark:bg-slate-800 sm:p-6">
            <h3 className="text-lg font-bold text-amber-800 dark:text-amber-300">Fuentes y alcance</h3>
            <div className="mt-3 space-y-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
              <p>
                El flujo público es: proveedor externo, pipeline horario, Supabase y lectura en la app.
                MtyRespira no escribe ni corrige valores ambientales desde el navegador.
              </p>
              <p>
                AQI: WAQI/AQICN. Clima: Open-Meteo cuando está disponible. Los proveedores externos pueden retrasarse,
                omitir campos o degradar su servicio.
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <a
                  href={AQICN_API_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-lg border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-50 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/30"
                >
                  WAQI/AQICN
                </a>
                <a
                  href={OPEN_METEO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-lg border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-50 dark:border-amber-700 dark:text-amber-200 dark:hover:bg-amber-900/30"
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
