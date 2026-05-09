import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoChevronDownOutline, IoLocateOutline } from 'react-icons/io5';
import { MONTERREY_LOCATIONS_WITH_COORDS } from '../services/apiService';
import { submitOutOfCoverageDemandSignal } from '../services/coreSignalService';
import { CitySelectorOption } from '../types';
import PinIcon from '../assets/icons/pin.png';
import { findNearestSupportedCity, isOutOfCoverage } from '../utils/coverageUtils';

type CityOption = (typeof MONTERREY_LOCATIONS_WITH_COORDS)[number];

interface CitySelectorProps {
  onCityChange: (city: CityOption) => void;
  selectedCity?: CityOption;
  cityOptions?: CitySelectorOption[];
  className?: string;
}

const OUT_OF_COVERAGE_MESSAGE = 'Estás fuera del área cubierta por MtyRespira. Puedes elegir un municipio manualmente.';
const GEOLOCATION_SUCCESS_MESSAGE_MS = 3500;
const GEOLOCATION_WARNING_MESSAGE_MS = 6000;

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
  const [isLocating, setIsLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [locationMessageTone, setLocationMessageTone] = useState<'success' | 'warning'>('success');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cityRefs = useRef(new Map<number, HTMLDivElement>());

  const showLocationMessage = useCallback((message: string, tone: 'success' | 'warning') => {
    setLocationMessage(message);
    setLocationMessageTone(tone);

    window.setTimeout(
      () => setLocationMessage(null),
      tone === 'warning' ? GEOLOCATION_WARNING_MESSAGE_MS : GEOLOCATION_SUCCESS_MESSAGE_MS,
    );
  }, []);

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

  const availableCities = useMemo(
    () => resolvedCityOptions.filter((city) => city.availability === 'available'),
    [resolvedCityOptions],
  );
  const unavailableCities = useMemo(
    () => resolvedCityOptions.filter((city) => city.availability !== 'available'),
    [resolvedCityOptions],
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
    if (isOpen && selectedCity) {
      cityRefs.current.get(selectedCity.city_id)?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedCity, isOpen]);

  const handleCityChange = (city: CitySelectorOption) => {
    if (city.availability !== 'available') {
      return;
    }

    setSelectedCityId(city.city_id);
    onCityChange(city);
    setIsOpen(false);
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      showLocationMessage('Tu navegador no permite usar ubicación automática.', 'warning');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nearest = findNearestSupportedCity(
          position.coords.latitude,
          position.coords.longitude,
          locations,
        );

        if (!nearest) {
          showLocationMessage('No hay municipios configurados para comparar tu ubicación.', 'warning');
          setIsLocating(false);
          return;
        }

        if (isOutOfCoverage(nearest.distanceKm)) {
          showLocationMessage(OUT_OF_COVERAGE_MESSAGE, 'warning');
          void submitOutOfCoverageDemandSignal({
            nearestSupportedCity: nearest.city.name,
            roundedDistanceKm: nearest.roundedDistanceKm,
            distanceBucket: nearest.distanceBucket,
          }).catch((error: unknown) => {
            console.warn('No se pudo registrar señal anónima fuera de cobertura:', error);
          });
          setIsLocating(false);
          return;
        }

        const matchingCity = resolvedCityOptions.find((city) => city.city_id === nearest.city.city_id);

        if (!matchingCity || matchingCity.availability !== 'available') {
          showLocationMessage(
            `${nearest.city.name} fue detectado, pero no tiene lectura reciente disponible.`,
            'warning',
          );
          setIsLocating(false);
          return;
        }

        handleCityChange(matchingCity);
        showLocationMessage(`Ubicación detectada: ${matchingCity.name}`, 'success');
        setIsLocating(false);
      },
      () => {
        showLocationMessage('No pudimos detectar tu ubicación. Puedes elegir un municipio manualmente.', 'warning');
        setIsLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
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
              {city.disabledReason ?? 'Sin datos recientes'}
            </span>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className={`relative z-20 ${className}`} ref={dropdownRef}>
      <div className="flex items-stretch gap-2">
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="flex min-w-0 flex-1 cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-md dark:border-gray-700 dark:bg-slate-800"
          onClick={() => setIsOpen(!isOpen)}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label="Seleccionar ciudad"
        >
          <div className="flex min-w-0 items-center">
            <div className="mr-2 flex-shrink-0 rounded-full bg-purple-100 p-2 dark:bg-purple-900/30 sm:mr-3">
              <img src={PinIcon} alt="Pin" className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                {selectedCity?.name ?? 'Selecciona una ciudad'}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                {selectedCity?.availability === 'available'
                  ? 'Zona Metropolitana de Monterrey'
                  : 'Sin datos recientes'}
              </p>
            </div>
          </div>
          <IoChevronDownOutline
            className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 transform' : ''}`}
          />
        </motion.div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          className="inline-flex min-w-[3rem] shrink-0 items-center justify-center rounded-lg border border-purple-200 bg-white px-3 text-sm font-semibold text-purple-700 shadow-md transition-colors hover:bg-purple-50 disabled:cursor-wait disabled:opacity-70 dark:border-purple-800 dark:bg-slate-800 dark:text-purple-300 dark:hover:bg-purple-900/20 sm:min-w-fit sm:gap-2"
          onClick={handleUseLocation}
          disabled={isLocating}
          type="button"
          aria-label="Usar mi ubicación"
        >
          <IoLocateOutline className={`h-5 w-5 ${isLocating ? 'animate-pulse' : ''}`} />
          <span className="hidden sm:inline">Usar mi ubicación</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {locationMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`pointer-events-none absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[1100] rounded-lg border px-3 py-2 text-xs shadow-lg sm:text-sm ${
              locationMessageTone === 'warning'
                ? 'border-amber-300 bg-amber-50 text-amber-900'
                : 'border-emerald-300 bg-emerald-50 text-emerald-900'
            }`}
            role="status"
          >
            {locationMessage}
          </motion.div>
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
          >
            <div className="border-b border-gray-100 p-2 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Selecciona una ciudad con lectura disponible
              </p>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {availableCities.map(renderCityOption)}
              {unavailableCities.length > 0 && (
                <div className="border-t border-gray-100 dark:border-gray-700">
                  <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Sin datos recientes
                  </p>
                  {unavailableCities.map(renderCityOption)}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CitySelector;
