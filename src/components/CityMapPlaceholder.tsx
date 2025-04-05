import { MONTERREY_LOCATIONS_WITH_COORDS } from '../services/apiService';

interface CityMapPlaceholderProps {
  className?: string;
  selectedCityName?: string;
}

export default function CityMapPlaceholder({ className = '', selectedCityName = 'Monterrey Centro' }: CityMapPlaceholderProps) {
  // Encontrar la ciudad seleccionada de la lista
  const selectedCity = MONTERREY_LOCATIONS_WITH_COORDS.find(city => city.name === selectedCityName) || MONTERREY_LOCATIONS_WITH_COORDS[0];

  // Obtener un color basado en el nombre de la ciudad para darle variedad visual
  const getCityColor = () => {
    const cityIndex = MONTERREY_LOCATIONS_WITH_COORDS.findIndex(city => city.name === selectedCityName);
    const colors = [
      'bg-blue-500', 'bg-indigo-500', 'bg-purple-500',
      'bg-green-500', 'bg-teal-500', 'bg-cyan-500', 'bg-pink-500'
    ];
    return colors[cityIndex % colors.length];
  };

  return (
    <div className={`h-full w-full rounded-xl overflow-hidden shadow-lg ${className}`}>
      <div className="bg-slate-100 h-full relative flex flex-col items-center justify-center p-6 dark:bg-slate-800">
        <div className={`${getCityColor()} text-white p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>

        <h3 className="text-lg font-semibold text-slate-800 mb-2 dark:text-white">
          {selectedCity.name}
        </h3>

        <div className="flex flex-col items-center text-slate-600 text-sm dark:text-slate-300">
          <p className="mb-1">Latitud: {selectedCity.latitude.toFixed(4)}</p>
          <p>Longitud: {selectedCity.longitude.toFixed(4)}</p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Visualizando datos de calidad del aire para esta ubicación
          </p>
        </div>

        {/* Círculos decorativos */}
        <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 opacity-30"></div>
        <div className="absolute bottom-8 left-8 w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 opacity-30"></div>
        <div className="absolute top-1/3 left-6 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 opacity-30"></div>
        <div className="absolute bottom-1/4 right-10 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 opacity-30"></div>

        {/* Información sobre estaciones cercanas */}
        <div className="absolute bottom-4 left-0 right-0 px-6">
          <div className="bg-white dark:bg-slate-700 rounded-lg p-3 shadow-sm text-xs text-slate-600 dark:text-slate-300">
            <p className="text-center font-medium mb-1">Estaciones cercanas en el Área Metropolitana</p>
            <div className="flex justify-center gap-2">
              {MONTERREY_LOCATIONS_WITH_COORDS.filter(city => city.name !== selectedCity.name)
                .slice(0, 3)
                .map(city => (
                  <span key={city.name} className="px-2 py-1 bg-slate-100 dark:bg-slate-600 rounded">
                    {city.name.split(' ')[0]}
                  </span>
                ))
              }
              {MONTERREY_LOCATIONS_WITH_COORDS.length > 4 && (
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-600 rounded">
                  +{MONTERREY_LOCATIONS_WITH_COORDS.length - 4}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
