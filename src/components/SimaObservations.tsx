import { useEffect, useState } from 'react';
import { fetchRecentSimaObservations, type SimaObservation } from '../services/apiService';

const dateFormat = new Intl.DateTimeFormat('es-MX', {
  timeZone: 'America/Monterrey',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});
const numberFormat = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 6 });

export default function SimaObservations() {
  const [observations, setObservations] = useState<SimaObservation[] | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const refresh = () => {
      void fetchRecentSimaObservations(controller.signal)
        .then((rows) => {
          if (!controller.signal.aborted) setObservations(rows);
        })
        .catch(() => {
          if (!controller.signal.aborted) setObservations([]);
        });
    };

    refresh();
    const interval = window.setInterval(refresh, 5 * 60 * 1000);
    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, []);

  if (!observations?.length) return null;

  return (
    <section aria-labelledby="sima-title" className="rounded-2xl border border-slate-300 p-4 dark:border-slate-700">
      <h2 id="sima-title" className="text-xl font-bold">Mediciones por estación de SIMA</h2>
      <p className="mt-1 text-sm">Concentración del contaminante dominante que reporta cada estación. Hora de Monterrey.</p>
      <div className="mt-3 overflow-x-auto">
        <table aria-labelledby="sima-title" className="w-full text-left text-sm">
          <thead>
            <tr>
              <th scope="col" className="p-2">Estación</th>
              <th scope="col" className="p-2">Contaminante</th>
              <th scope="col" className="p-2">Concentración</th>
              <th scope="col" className="p-2">Medición</th>
            </tr>
          </thead>
          <tbody>
            {observations.map((row) => (
              <tr key={row.station_id} className="border-t border-slate-200 dark:border-slate-700">
                <th scope="row" className="p-2">{row.station_name}, {row.municipality}</th>
                <td className="p-2">{row.pollutant}</td>
                <td className="p-2">{numberFormat.format(row.concentration)} {row.unit}</td>
                <td className="p-2">
                  <time dateTime={row.observed_at}>{dateFormat.format(new Date(row.observed_at))}</time>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <a href="https://aire.nl.gob.mx/icars2020/map_calidad_icars.php" className="mt-3 inline-block text-sm underline">
        Fuente oficial de SIMA
      </a>
    </section>
  );
}
