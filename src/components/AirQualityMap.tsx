import 'leaflet/dist/leaflet.css';

import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { IoChevronForwardOutline, IoLocationSharp } from 'react-icons/io5';
import { useAirQuality } from '../context/AirQualityContext';
import { AirQualityStatus, CityAirQualityData, CitySelectorOption } from '../types';
import { getAirQualityStatus, getAirQualityTheme } from '../utils/airQualityUtils';
import { AQI_STATUS_COPY } from '../utils/aqiDesignTokens';

const MONTERREY_METRO_CENTER: [number, number] = [25.6866, -100.3161];
const MONTERREY_METRO_ZOOM = 10;

const AQI_LEGEND: { shortLabel: string; range: string; status: AirQualityStatus }[] = [
  { shortLabel: AQI_STATUS_COPY.good.shortLabel, range: '0-50', status: 'good' },
  { shortLabel: AQI_STATUS_COPY.moderate.shortLabel, range: '51-100', status: 'moderate' },
  { shortLabel: AQI_STATUS_COPY['unhealthy-sensitive'].shortLabel, range: '101-150', status: 'unhealthy-sensitive' },
  { shortLabel: AQI_STATUS_COPY.unhealthy.shortLabel, range: '151-200', status: 'unhealthy' },
  { shortLabel: AQI_STATUS_COPY['very-unhealthy'].shortLabel, range: '201-300', status: 'very-unhealthy' },
  { shortLabel: AQI_STATUS_COPY.hazardous.shortLabel, range: '301+', status: 'hazardous' },
  { shortLabel: AQI_STATUS_COPY.unknown.shortLabel, range: 'N/D', status: 'unknown' },
];

const STATUS_LABELS: Record<AirQualityStatus, string> = {
  good: AQI_STATUS_COPY.good.label,
  moderate: AQI_STATUS_COPY.moderate.label,
  'unhealthy-sensitive': AQI_STATUS_COPY['unhealthy-sensitive'].label,
  unhealthy: AQI_STATUS_COPY.unhealthy.label,
  'very-unhealthy': AQI_STATUS_COPY['very-unhealthy'].label,
  hazardous: AQI_STATUS_COPY.hazardous.label,
  unknown: AQI_STATUS_COPY.unknown.label,
};

function hasValidCoordinates(row: CityAirQualityData) {
  return (
    typeof row.latitude === 'number'
    && Number.isFinite(row.latitude)
    && typeof row.longitude === 'number'
    && Number.isFinite(row.longitude)
  );
}

function formatTime(timestamp: string | null | undefined) {
  if (!timestamp) {
    return 'N/D';
  }

  const parsedDate = new Date(timestamp);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'N/D';
  }

  return parsedDate.toLocaleString('es-MX', {
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
      return 'O3';
    case 'no2':
      return 'NO2';
    case 'so2':
      return 'SO2';
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
  const selectedRow = rowsWithCoordinates.find((row) => row.city_id === selectedCity.city_id)
    ?? rowsWithCoordinates[0];
  const selectedStatus = getAirQualityStatus(selectedRow?.aqi_us);
  const selectedTheme = getAirQualityTheme(selectedStatus);

  if (cityRows.length === 0) {
    return (
      <section
        aria-labelledby="aqi-map-title"
        className="rounded-[1.35rem] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-800"
      >
        <h2 id="aqi-map-title" className="text-xl font-black text-gray-900 dark:text-white">
          Mapa metropolitano AQI
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          El mapa se mostrara cuando la RPC publica devuelva municipios con coordenadas validas.
        </p>
      </section>
    );
  }

  if (rowsWithCoordinates.length === 0) {
    return (
      <section
        aria-labelledby="aqi-map-title"
        className="rounded-[1.35rem] border border-amber-300 bg-amber-50 p-5 text-amber-900 shadow-[0_12px_30px_rgba(15,23,42,0.08)]"
      >
        <h2 id="aqi-map-title" className="text-xl font-black">
          Mapa metropolitano AQI
        </h2>
        <p className="mt-2 text-sm">
          La RPC devolvio datos, pero ninguna ciudad incluye latitude/longitude validas. No se
          muestran ubicaciones estimadas.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="aqi-map-title"
      className="space-y-4 rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-800 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <IoLocationSharp className="h-8 w-8 shrink-0" style={{ color: selectedTheme.secondary }} />
          <div className="min-w-0">
            <h2 id="aqi-map-title" className="text-xl font-black leading-tight text-slate-950 dark:text-white">
              Mapa metropolitano AQI
            </h2>
            <p className="mt-1 text-sm leading-snug text-slate-600 dark:text-slate-300">
              Toca un municipio para ver sus detalles y actualizar la tarjeta principal.
            </p>
          </div>
        </div>
        <IoChevronForwardOutline className="mt-1 h-7 w-7 shrink-0 text-slate-500" />
      </div>

      {rowsWithoutCoordinates > 0 && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {rowsWithoutCoordinates} municipio(s) sin coordenadas en RPC.
        </p>
      )}

      <div className="h-[210px] w-full overflow-hidden rounded-2xl md:h-[430px]">
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
                <Popup keepInView maxWidth={210} minWidth={150}>
                  <div className="max-w-[170px] text-xs text-slate-800">
                    <p className="text-sm font-semibold leading-tight">{row.city_name}</p>
                    <p className="mt-1 font-semibold">
                      AQI {row.aqi_us ?? 'N/D'} - {STATUS_LABELS[status]}
                    </p>
                    <p className="mt-1">{getPollutantLabel(row.main_pollutant_us)}</p>
                    <p className="mt-1 text-slate-600">
                      Medicion {formatTime(row.reading_timestamp)} - Act.{' '}
                      {formatTime(row.last_successful_update_at)}
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {selectedRow && (
        <article className="hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:block">
          <h3 className="text-lg font-bold leading-tight text-gray-900 dark:text-white">
            {selectedRow.city_name}
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <span
              className="rounded-lg border px-2.5 py-1 text-lg font-bold"
              style={{ borderColor: selectedTheme.primary, color: selectedTheme.text }}
            >
              AQI {selectedRow.aqi_us ?? 'N/D'}
            </span>
            <span
              className="rounded-lg border px-2.5 py-1 text-sm font-semibold"
              style={{ borderColor: selectedTheme.primary, color: selectedTheme.text }}
            >
              {STATUS_LABELS[selectedStatus]}
            </span>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4 text-sm dark:border-slate-700 sm:grid-cols-4">
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Contaminante</dt>
              <dd className="font-semibold text-gray-900 dark:text-white">
                {getPollutantLabel(selectedRow.main_pollutant_us)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Medicion</dt>
              <dd className="font-semibold text-gray-900 dark:text-white">
                {formatTime(selectedRow.reading_timestamp)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Actualizado</dt>
              <dd className="font-semibold text-gray-900 dark:text-white">
                {formatTime(selectedRow.last_successful_update_at)}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500 dark:text-gray-400">Fuente</dt>
              <dd className="font-semibold text-gray-900 dark:text-white">MtyRespira</dd>
            </div>
          </dl>
        </article>
      )}

      <div className="hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:block">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Escala AQI (US)</h3>
        <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4 lg:grid-cols-7">
          {AQI_LEGEND.map((item) => {
            const theme = getAirQualityTheme(item.status);

            return (
              <div key={item.status}>
                <div
                  className="rounded-lg px-2 py-1.5 font-bold text-white"
                  style={{ backgroundColor: theme.primary }}
                >
                  {item.range}
                </div>
                <p className="mt-1 font-medium text-gray-700 dark:text-gray-300">
                  {item.shortLabel}
                </p>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          AQI: Indice de Calidad del Aire bajo escala US EPA.
        </p>
      </div>
    </section>
  );
}
