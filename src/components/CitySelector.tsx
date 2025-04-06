import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoChevronDownOutline } from 'react-icons/io5';
import { MONTERREY_LOCATIONS_WITH_COORDS } from '../services/apiService';
import PinIcon from '../assets/icons/pin.png';

interface CitySelectorProps {
  onCityChange: (city: { name: string; latitude: number; longitude: number }) => void;
  className?: string;
}

const CitySelector = ({ onCityChange, className = '' }: CitySelectorProps) => {
  const [selectedCity, setSelectedCity] = useState(MONTERREY_LOCATIONS_WITH_COORDS[0].name);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const cityRefs = useRef(new Map<string, HTMLDivElement>());

  // Memoización de la lista de ciudades
  const locations = useMemo(() => MONTERREY_LOCATIONS_WITH_COORDS, []);

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
    if (isOpen && cityRefs.current.has(selectedCity)) {
      cityRefs.current.get(selectedCity)?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedCity, isOpen]);

  const handleCityChange = (city: { name: string; latitude: number; longitude: number }) => {
    setSelectedCity(city.name);
    onCityChange(city);
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
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{selectedCity}</p>
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
                  key={city.name}
                  className={`px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors dark:hover:bg-purple-900/10 ${
                    selectedCity === city.name ? 'bg-purple-100 dark:bg-purple-900/20' : ''
                  }`}
                  onClick={() => handleCityChange(city)}
                  whileTap={{ scale: 0.98 }}
                  role="option"
                  aria-selected={selectedCity === city.name}
                  ref={(el) => el && cityRefs.current.set(city.name, el)}
                >
                  <div className="flex items-center">
                    <img
                      src={PinIcon}
                      alt="Pin"
                      className={`h-4 w-4 mr-2 ${selectedCity === city.name ? 'text-purple-600' : 'text-gray-400'}`}
                    />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{city.name}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CitySelector;
