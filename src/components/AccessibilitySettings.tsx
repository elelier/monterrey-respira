import { useState } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { IoAccessibility, IoContrast, IoTextOutline, IoEyeOutline, IoCloseOutline } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

export default function AccessibilitySettings() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    colorblindMode,
    toggleColorblindMode,
    highContrastMode,
    toggleHighContrastMode,
    textSize,
    setTextSize
  } = useAccessibility();

  return (
    <div className="fixed right-4 bottom-4 z-50">
      {/* Botón principal de accesibilidad */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        aria-label="Opciones de accesibilidad"
      >
        {isOpen ? (
          <IoCloseOutline className="w-6 h-6" />
        ) : (
          <IoAccessibility className="w-6 h-6" />
        )}
      </button>

      {/* Panel de opciones */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-64 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
              Opciones de accesibilidad
            </h3>

            <div className="space-y-3">
              {/* Modo daltónico */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <IoEyeOutline className="w-5 h-5 mr-2 text-blue-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Modo daltónico
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={colorblindMode}
                    onChange={toggleColorblindMode}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Alto contraste */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <IoContrast className="w-5 h-5 mr-2 text-blue-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Alto contraste
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={highContrastMode}
                    onChange={toggleHighContrastMode}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Tamaño de texto */}
              <div className="pt-2">
                <div className="flex items-center mb-2">
                  <IoTextOutline className="w-5 h-5 mr-2 text-blue-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Tamaño del texto
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setTextSize('normal')}
                    className={`px-2 py-1 text-xs rounded ${
                      textSize === 'normal'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => setTextSize('large')}
                    className={`px-2 py-1 text-xs rounded ${
                      textSize === 'large'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Grande
                  </button>
                  <button
                    onClick={() => setTextSize('extra-large')}
                    className={`px-2 py-1 text-xs rounded ${
                      textSize === 'extra-large'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Muy grande
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Estos ajustes se guardarán para futuras visitas
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
