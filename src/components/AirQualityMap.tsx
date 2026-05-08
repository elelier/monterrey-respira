import 'leaflet/dist/leaflet.css';

import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { useAirQuality } from '../context/AirQualityContext';
import { AirQualityStatus, CityAirQualityData, CitySelectorOption } from '../types';
import { getAirQualityStatus, getAirQualityTheme } from '../utils/airQualityUtils';

const MONTERREY_METRO_CENTER: [number, number] = [25.6866, -100.3161];
const MONTERREY_METRO_ZOOM = 10;

const AQI_LEGEND: { label: string; range: string; status: AirQualityStatus }[] = [
  { label: 'Buena', range: '0-50', status: 'good' },
  { label: 'Moderada', range: '51-100', status: 'moderate' },
  { label: 'Dañina a sensibles', range: '101-150', status: 'unhealthy-sensitive' },
  { label: 'Dañina', range: '151-200', status: 'unhealthy' },
  { label: 'Muy dañina', range: '201-300', status: 'very-unhealthy' },
  { label: 'Peligrosa', range: '301+', status: 'hazardous' },
  { label: 'Sin lectura', range: 'N/D', status: 'unknown' },
];

const STATUS_LABELS: Record<AirQualityStatus, string> = {
  good: 'Buena',
  moderate: 'Moderada',
  'unhealthy-sensitive': 'Dañina para grupos sensibles',
  unhealthy: 'Dañina',
  'very-unhealthy': 'Muy dañina',
  hazardous: 'Peligrosa',
  unknown: 'Sin lectura confiable',
};

function hasValidCoordinates(row: CityAirQualityData) {
  return (
    typeof row.latitude === 'number'
    && Number.isFinite(row.latitude)
    && typeof row.longitude === 'number'
    && Number.isFinite(row.longitude)
  );
}

function formatTimestamp(timestamp: string | null | undefined) {
  if (!timestamp) {
    return 'No disponible';
  }

  const parsedDate = new Date(timestamp);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'No disponible';
  }

  return parsedDate.toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function getPollutantLabel(pollutant: string | null) {
  if (!pollutant) {
    return 'No disponible';
  }

  const normalizedPollutant = pollutant.toLowerCase();

  switch (normalizedPollutant) {
    case 'p2':
    case 'pm25':
      return 'PM2.5';
    case 'p1':
    case 'pm10':
      return 'PM10';
    case 'o3':
      return 'O₃';
    case 'no2':
      return 'NO₂';
    case 'so2':
      return 'SO₂';
    case 'co':
      return 'CO';
    default:
      return pollutant.toUpperCase();
  }
}

function getMarkerRadius(row: CityAirQualityData) {
  if (row.aqi_us === null) {
    return 11;
  }

  return row.aqi_us > 150 ? 15 : 12;
}

function getCityOption(row: CityAirQualityData, cityOptions: CitySelectorOption[]) {
  const matchedOption = cityOptions.find((option) => option.city_id === row.city_id);

  return matchedOption ?? {
    city_id: row.city_id,
    name: row.city_name,
    latitude: row.latitude ?? MONTERREY_METRO_CENTER[0],
    longitude: row.longitude ?? MONTERREY_METRO_CENTER[1],
  };
}

export default function AirQualityMap() {
  const { cityRows, cityOptions, selectedCity, changeCity } = useAirQuality();
  const rowsWithCoordinates = cityRows.filter(hasValidCoordinates);
  const rowsWithoutCoordinates = cityRows.length - rowsWithCoordinates.length;

  if (cityRows.length === 0) {
    return (
      <section
        aria-labelledby="aqi-map-title"
        className="rounded-xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-700 dark:bg-slate-800"
      >
        <h2 id="aqi-map-title" className="text-xl font-bold text-gray-900 dark:text-white">
          Mapa metropolitano AQI
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          El mapa se mostrará cuando la RPC pública devuelva municipios con coordenadas válidas.
        </p>
      </section>
    );
  }

  if (rowsWithCoordinates.length === 0) {
    return (
      <section
        aria-labelledby="aqi-map-title"
        className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-900 shadow-lg"
      >
        <h2 id="aqi-map-title" className="text-xl font-bold">
          Mapa metropolitano AQI
        </h2>
        <p className="mt-2 text-sm">
          La RPC devolvió datos, pero ninguna ciudad incluye latitude/longitude válidas. No se
          muestran ubicaciones estimadas.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="aqi-map-title"
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="p-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 id="aqi-map-title" className="text-xl font-bold text-gray-900 dark:text-white">
              Mapa metropolitano AQI
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Pins generados desde la RPC actual. Haz clic en un municipio para actualizar la
              tarjeta principal.
            </p>
          </div>
          {rowsWithoutCoordinates > 0 && (
            <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {rowsWithoutCoordinates} municipio(s) sin coordenadas en RPC.
            </p>
          )}
        </div>
      </div>

      <div className="h-[360px] w-full md:h-[430px]">
        <MapContainer
          center={MONTERREY_METRO_CENTER}
          className="h-full w-full"
          scrollWheelZoom={false}
          zoom={MONTERREY_METRO_ZOOM}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {rowsWithCoordinates.map((row) => {
            const status = getAirQualityStatus(row.aqi_us);
            const theme = getAirQualityTheme(status);
            const isSelected = selectedCity.city_id === row.city_id;
            const cityOption = getCityOption(row, cityOptions);

            return (
              <CircleMarker
                center={[row.latitude as number, row.longitude as number]}
                eventHandlers={{
                  click: () => changeCity(cityOption),
                }}
                key={row.city_id}
                pathOptions={{
                  color: isSelected ? '#0f172a' : theme.secondary,
                  fillColor: theme.primary,
                  fillOpacity: 0.78,
                  opacity: 0.95,
                  weight: isSelected ? 3 : 2,
                }}
                radius={getMarkerRadius(row)}
              >
                <Popup>
                  <div className="max-w-[220px] text-sm text-slate-800">
                    <p className="text-base font-semibold">{row.city_name}</p>
                    <dl className="mt-2 space-y-1">
                      <div>
                        <dt className="inline font-semibold">AQI: </dt>
                        <dd className="inline">{row.aqi_us ?? 'No disponible'}</dd>
                      </div>
                      <div>
                        <dt className="inline font-semibold">Categoría: </dt>
                        <dd className="inline">{STATUS_LABELS[status]}</dd>
                      </div>
                      <div>
                        <dt className="inline font-semibold">Contaminante: </dt>
                        <dd className="inline">{getPollutantLabel(row.main_pollutant_us)}</dd>
                      </div>
                      <div>
                        <dt className="inline font-semibold">Medición: </dt>
                        <dd className="inline">{formatTimestamp(row.reading_timestamp)}</dd>
                      </div>
                      <div>
                        <dt className="inline font-semibold">Datos actualizados: </dt>
                        <dd className="inline">{formatTimestamp(row.last_successful_update_at)}</dd>
                      </div>
                    </dl>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      <div className="border-t border-slate-200 p-5 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Leyenda AQI US</h3>
        <ul className="mt-3 grid grid-cols-1 gap-2 text-xs text-gray-700 dark:text-gray-300 sm:grid-cols-2 lg:grid-cols-4">
          {AQI_LEGEND.map((item) => {
            const theme = getAirQualityTheme(item.status);

            return (
              <li className="flex items-center gap-2" key={item.status}>
                <span
                  aria-hidden="true"
                  className="h-3 w-3 rounded-full border border-slate-500/30"
                  style={{ backgroundColor: theme.primary }}
                />
                <span>
                  <strong>{item.label}</strong> · {item.range}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
