import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoChevronDownOutline } from 'react-icons/io5';
import { useAirQuality } from '../context/AirQualityContext'; // Import useAirQuality
import PinIcon from '../assets/icons/pin.png';

interface CitySelectorProps {
  onCityChange: (city: { name: string; latitude: number; longitude: number }) => void;
  className?: string;
}

const CitySelector = ({ onCityChange, className = '' }: CitySelectorProps) => {
  const { filteredCities, selectedCity: contextSelectedCity, changeCity } = useAirQuality(); // Get context values
  const locations = useMemo(() => filteredCities || [], [filteredCities]); // Use filteredCities

  const [selectedCityName, setSelectedCityName] = useState<string | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cityRefs = useRef(new Map<string, HTMLDivElement>());


  useEffect(() => {
    if (locations && locations.length > 0) {
      const currentContextCityStillValid = locations.some(city => city.name === contextSelectedCity.name);
      if (!currentContextCityStillValid) {
        setSelectedCityName(locations[0].name);
        onCityChange(locations[0]); // Call onCityChange from props
        changeCity(locations[0]); // Update context's selected city
      } else {
        // If contextSelectedCity is valid, ensure local state reflects it
        setSelectedCityName(contextSelectedCity.name);
      }
    } else {
      setSelectedCityName("No cities available");
      // Optionally call onCityChange with null or a specific indicator if needed
      // onCityChange(null); // Example
    }
  }, [locations, contextSelectedCity, onCityChange, changeCity]);


  // Cierra el dropdown cuando se hace clic fuera
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

  // Desplazar la ciudad seleccionada al top del dropdown
  useEffect(() => {
    if (isOpen && selectedCityName && cityRefs.current.has(selectedCityName)) {
      cityRefs.current.get(selectedCityName)?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedCityName, isOpen]);

  const handleCityChange = (city: { name: string; latitude: number; longitude: number; city_id?: number }) => {
    setSelectedCityName(city.name);
    onCityChange(city); // Call onCityChange from props
    changeCity(city); // Update context's selected city
    setIsOpen(false);
  };

  return (
    <div className={`relative z-20 ${className}`} ref={dropdownRef}>
      <motion.div
        whileTap={{ scale: 0.98 }}
        className="bg-white rounded-lg shadow-md p-3 flex items-center justify-between cursor-pointer dark:bg-slate-800 border border-gray-200 dark:border-gray-700"
        onClick={() => setIsOpen(!isOpen)}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Seleccionar ciudad"
      >
        <div className="flex items-center">
          <div className="bg-purple-100 p-2 rounded-full mr-3 dark:bg-purple-900/30 flex-shrink-0">
            <img src={PinIcon} alt="Pin" className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{selectedCityName || 'Loading cities...'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Zona Metropolitana de Monterrey</p>
          </div>
        </div>
        <IoChevronDownOutline
          className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`}
        />
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
          className="absolute w-full mt-1 bg-white rounded-xl shadow-lg overflow-hidden dark:bg-slate-800 border border-gray-300 dark:border-gray-600"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          role="listbox"
        >
            <div className="p-2 border-b border-gray-100 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Selecciona una ciudad</p>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {locations.map((city) => (
                <motion.div
                  key={city.name} // Assuming city.name is unique, otherwise use city.city_id if available
                  className={`px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors dark:hover:bg-purple-900/10 ${
                    selectedCityName === city.name ? 'bg-purple-100 dark:bg-purple-900/20' : ''
                  }`}
                  onClick={() => handleCityChange(city)}
                  whileTap={{ scale: 0.98 }}
                  role="option"
                  aria-selected={selectedCityName === city.name}
                  ref={(el) => el && cityRefs.current.set(city.name, el)} // Ensure city.name is string
                >
                  <div className="flex items-center">
                    <img
                      src={PinIcon}
                      alt="Pin"
                      className={`h-4 w-4 mr-2 ${selectedCityName === city.name ? 'text-purple-600' : 'text-gray-400'}`}
                    />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{city.name}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                No cities available.
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
