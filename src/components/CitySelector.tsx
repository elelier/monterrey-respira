import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoChevronDownOutline, IoLocateOutline, IoSearchOutline } from 'react-icons/io5';
import { MONTERREY_LOCATIONS_WITH_COORDS } from '../services/apiService';
import { submitOutOfCoverageDemandSignal } from '../services/coreSignalService';
import { CitySelectorOption } from '../types';
import PinIcon from '../assets/icons/pin.png';
import { findNearestSupportedCity, isOutOfCoverage } from '../utils/coverageUtils';

type CityOption = (typeof MONTERREY_LOCATIONS_WITH_COORDS)[number];

type GeolocationStatus = 'idle' | 'loading' | 'success' | 'error';

interface CitySelectorProps {
  onCityChange: (city: CityOption) => void;
  selectedCity?: CityOption;
  cityOptions?: CitySelectorOption[];
  className?: string;
}

const GEOLOCATION_TIMEOUT_MS = 10000;
const GEOLOCATION_SUCCESS_MESSAGE_MS = 3500;
const OUT_OF_COVERAGE_MESSAGE = 'Estás fuera del área cubierta por MtyRespira. Puedes elegir un municipio manualmente.';

function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getGeolocationErrorMessage(error?: GeolocationPositionError) {
  if (!error) {
    return 'No pudimos detectar tu ubicación. Puedes elegir tu municipio manualmente.';
  }

  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'No pudimos detectar tu ubicación. Puedes elegir tu municipio manualmente.';
    case error.POSITION_UNAVAILABLE:
      return 'Tu ubicación no está disponible por ahora. Puedes elegir tu municipio manualmente.';
    case error.TIMEOUT:
      return 'La detección de ubicación tardó demasiado. Puedes elegir tu municipio manualmente.';
    default:
      return 'No pudimos detectar tu ubicación. Puedes elegir tu municipio manualmente.';
  }
}

const CitySelector = ({
  onCityChange,
  selectedCity: controlledSelectedCity,
  cityOptions,
  className = '',
}: CitySelectorProps) => {
  const locations = useMemo(() => MONTERREY_LOCATIONS_WITH_COORDS, []);
  const defaultCityId = locations[0]?.city_id ?? null;
  const resolvedCityOptions = useMemo<CitySelectorOption[]>(
    () => cityOptions ?? locations.map((city) => ({ ...city, availability: 'available' })),
    [cityOptions, locations],
  );

  const [selectedCityId, setSelectedCityId] = useState<number | null>(defaultCityId);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [geolocationStatus, setGeolocationStatus] = useState<GeolocationStatus>('idle');
  const [geolocationMessage, setGeolocationMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const cityRefs = useRef(new Map<number, HTMLDivElement>());

  useEffect(() => {
    if (controlledSelectedCity) {
      setSelectedCityId(controlledSelectedCity.city_id);
    }
  }, [controlledSelectedCity]);

  const selectedCity = useMemo(() => {
    const currentCityId = controlledSelectedCity?.city_id ?? selectedCityId;

    if (currentCityId === null) {
      return resolvedCityOptions[0];
    }
    return resolvedCityOptions.find((city) => city.city_id === currentCityId) ?? resolvedCityOptions[0];
  }, [controlledSelectedCity, resolvedCityOptions, selectedCityId]);

  const filteredCities = useMemo(() => {
    const normalizedQuery = normalizeSearchText(searchQuery);

    if (!normalizedQuery) {
      return resolvedCityOptions;
    }

    return resolvedCityOptions.filter((city) => {
      const normalizedName = normalizeSearchText(city.name);
      const apiName = 'api_name' in city ? String(city.api_name ?? '') : '';
      const normalizedApiName = normalizeSearchText(apiName);

      return normalizedName.includes(normalizedQuery) || normalizedApiName.includes(normalizedQuery);
    });
  }, [resolvedCityOptions, searchQuery]);

  const availableCities = useMemo(
    () => filteredCities.filter((city) => city.availability === 'available'),
    [filteredCities],
  );
  const unavailableCities = useMemo(
    () => filteredCities.filter((city) => city.availability !== 'available'),
    [filteredCities],
  );

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  useEffect(() => {
    if (geolocationStatus !== 'success' || !geolocationMessage) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setGeolocationMessage(null);
      setGeolocationStatus('idle');
    }, GEOLOCATION_SUCCESS_MESSAGE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [geolocationMessage, geolocationStatus]);

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && selectedCity && !searchQuery) {
      cityRefs.current.get(selectedCity.city_id)?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedCity, isOpen, searchQuery]);

  const handleCityChange = (city: CitySelectorOption) => {
    if (city.availability !== 'available') {
      setGeolocationStatus('error');
      setGeolocationMessage('Esta ciudad no tiene datos recientes.');
      return;
    }

    setSelectedCityId(city.city_id);
    onCityChange(city);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleUseLocation = () => {
    setGeolocationMessage(null);

    if (!navigator.geolocation) {
      setGeolocationStatus('error');
      setGeolocationMessage('Tu navegador no permite detectar ubicación. Puedes elegir tu municipio manualmente.');
      setIsOpen(true);
      return;
    }

    setGeolocationStatus('loading');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nearest = findNearestSupportedCity(
          position.coords.latitude,
          position.coords.longitude,
          locations,
        );

        if (!nearest) {
          setGeolocationStatus('error');
          setGeolocationMessage('No pudimos detectar una ciudad con coordenadas disponibles. Puedes elegir tu municipio manualmente.');
          setIsOpen(true);
          return;
        }

        if (isOutOfCoverage(nearest.distanceKm)) {
          setGeolocationStatus('error');
          setGeolocationMessage(OUT_OF_COVERAGE_MESSAGE);
          setIsOpen(true);
          void submitOutOfCoverageDemandSignal({
            nearestSupportedCity: nearest.city.name,
            roundedDistanceKm: nearest.roundedDistanceKm,
            distanceBucket: nearest.distanceBucket,
          }).catch((error: unknown) => {
            console.warn('No se pudo registrar señal anónima fuera de cobertura:', error);
          });
          return;
        }

        const nearestCity = resolvedCityOptions.find((city) => city.city_id === nearest.city.city_id);

        if (!nearestCity || nearestCity.availability !== 'available') {
          setGeolocationStatus('error');
          setGeolocationMessage(`${nearest.city.name} fue detectado, pero no tiene lectura reciente disponible.`);
          setIsOpen(true);
          return;
        }

        handleCityChange(nearestCity);
        setGeolocationStatus('success');
        setGeolocationMessage(`Ubicación detectada: ${nearestCity.name}`);
      },
      (error) => {
        setGeolocationStatus('error');
        setGeolocationMessage(getGeolocationErrorMessage(error));
        setIsOpen(true);
      },
      {
        enableHighAccuracy: false,
        maximumAge: 5 * 60 * 1000,
        timeout: GEOLOCATION_TIMEOUT_MS,
      },
    );
  };

  const renderCityOption = (city: CitySelectorOption) => {
    const isSelected = selectedCity?.city_id === city.city_id;
    const isDisabled = city.availability !== 'available';

    return (
      <motion.div
        key={city.city_id}
        className={`px-4 py-3 transition-colors ${
          isDisabled
            ? 'cursor-not-allowed opacity-60'
            : 'cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/10'
        } ${isSelected ? 'bg-purple-100 dark:bg-purple-900/20' : ''}`}
        onClick={() => handleCityChange(city)}
        whileTap={isDisabled ? undefined : { scale: 0.98 }}
        role="option"
        aria-selected={isSelected}
        aria-disabled={isDisabled}
        ref={(el) => {
          if (el) {
            cityRefs.current.set(city.city_id, el);
          } else {
            cityRefs.current.delete(city.city_id);
          }
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center">
            <img
              src={PinIcon}
              alt="Pin"
              className={`mr-2 h-4 w-4 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`}
            />
            <p className="truncate text-sm font-medium text-gray-900 dark:text-white">{city.name}</p>
          </div>
          {isDisabled && (
            <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600 dark:bg-slate-700 dark:text-gray-300">
              {city.disabledReason ?? 'Esta ciudad no tiene datos recientes'}
            </span>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`relative z-20 ${className}`} ref={dropdownRef}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="flex min-w-0 cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white p-2.5 shadow-md dark:border-gray-700 dark:bg-slate-800 sm:p-3"
          onClick={() => setIsOpen(!isOpen)}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls="city-selector-listbox"
          aria-label="Busca tu municipio"
        >
          <div className="flex min-w-0 items-center">
            <div className="mr-2 flex-shrink-0 rounded-full bg-purple-100 p-1.5 dark:bg-purple-900/30 sm:mr-3 sm:p-2">
              <img src={PinIcon} alt="Pin" className="h-4 w-4 text-purple-600 dark:text-purple-400 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                {selectedCity?.name ?? 'Busca tu municipio'}
              </p>
              <p className="hidden truncate text-xs text-gray-500 dark:text-gray-400 xs:block sm:block">
                {selectedCity?.availability === 'available'
                  ? 'Zona Metropolitana de Monterrey'
                  : 'Esta ciudad no tiene datos recientes'}
              </p>
            </div>
          </div>
          <IoChevronDownOutline
            className={`ml-1 h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-300 sm:h-5 sm:w-5 ${isOpen ? 'rotate-180 transform' : ''}`}
          />
        </motion.div>

        <button
          type="button"
          onClick={handleUseLocation}
          className="inline-flex min-w-[4.5rem] items-center justify-center gap-1 rounded-lg border border-purple-200 bg-white px-2.5 py-2.5 text-xs font-semibold text-purple-700 shadow-md transition hover:bg-purple-50 disabled:cursor-wait disabled:opacity-70 dark:border-purple-900/60 dark:bg-slate-800 dark:text-purple-300 dark:hover:bg-purple-900/20 sm:min-w-[9.5rem] sm:gap-2 sm:px-4 sm:py-3 sm:text-sm"
          disabled={geolocationStatus === 'loading'}
          aria-label="Usar mi ubicación"
        >
          <IoLocateOutline className="h-4 w-4 flex-shrink-0" />
          <span className="sm:hidden">{geolocationStatus === 'loading' ? '...' : 'Ubicación'}</span>
          <span className="hidden sm:inline">
            {geolocationStatus === 'loading' ? 'Detectando...' : 'Usar mi ubicación'}
          </span>
        </button>
      </div>

      <AnimatePresence>
        {geolocationMessage && (
          <motion.p
            className={`pointer-events-none absolute left-0 right-0 top-full z-[1100] mt-2 rounded-lg px-3 py-2 text-xs shadow-lg ${
              geolocationStatus === 'success'
                ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-100'
                : 'bg-amber-50 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
            }`}
            role="status"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {geolocationMessage}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute mt-1 w-full overflow-hidden rounded-xl border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-slate-800"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            role="listbox"
            id="city-selector-listbox"
          >
            <div className="border-b border-gray-100 p-2 dark:border-gray-700">
              <label className="sr-only" htmlFor="city-selector-search">
                Busca tu municipio
              </label>
              <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-slate-900/60">
                <IoSearchOutline className="mr-2 h-4 w-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  id="city-selector-search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Escape') {
                      setIsOpen(false);
                    }
                  }}
                  placeholder="Busca tu municipio"
                  className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
                />
              </div>
              <p className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Selecciona una ciudad con lectura disponible
              </p>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {filteredCities.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  Sin resultados. Puedes elegir tu municipio manualmente.
                </div>
              ) : (
                <>
                  {availableCities.map(renderCityOption)}
                  {unavailableCities.length > 0 && (
                    <div className="border-t border-gray-100 dark:border-gray-700">
                      <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Sin datos recientes
                      </p>
                      {unavailableCities.map(renderCityOption)}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CitySelector;
